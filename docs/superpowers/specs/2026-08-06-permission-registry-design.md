# Thiết kế: Hệ thống phân quyền generic (Access Registry)

**Ngày:** 2026-08-06
**Phạm vi:** sidebar, route guard, nút hành động trong table/màn hình
**Mục tiêu:** đổi quyền của một màn hoặc một nút = sửa đúng **một dòng** trong registry.

---

## 1. Bối cảnh

Hệ thống đang có **ba cơ chế phân quyền chồng nhau, lệch nhau**:

| Tầng | File | Cách so khớp | Vấn đề |
|---|---|---|---|
| Route guard | `src/app/hooks/usePermission.ts:145` | mapping path → 1 string (`'ROLE:FULL'`), so khớp `endsWith` / `includes` | Không khớp mapping thì **mặc định cho qua** (`return true` ở dòng 177); mảng quyền rỗng cũng cho qua (dòng 152). Mapping trỏ tới route cũ (`ROLEMANAGEMENT`, `FEEMANAGEMENT`, `PERSONALWALLET`) không còn tồn tại trong `routes.ts` |
| Sidebar | `src/app/hooks/useNavigation.ts:16` + `src/components/layout/components/Navigation.tsx` | mảng string 6 phần tử/menu | Lặp `['X:FULL','X:VIEW','X:CREATE','X:UPDATE','X:DELETE','ADMIN:FULL']` ở 12 chỗ (~70 dòng). So khớp mờ bằng `endsWith`/`includes` nên `'ROLE:VIEW'` khớp nhầm cả chuỗi lạ |
| Nút / màn hình | `src/app/hooks/usePermissionCheck.ts:34` | `EWALLET:<MODULE>:FULL` hoặc khớp chính xác | Chỉ nhận `'admin*'`, **không nhận `EWALLET:ADMIN:FULL`**. Mỗi màn tự khai constant riêng: `CREATE_ADMIN_USER_PERMISSION` (`user-management/constants/userAccount.ts`), mảng inline trong `FeeManagement.tsx:23` |

Hệ quả: đổi một quyền phải sửa ít nhất 3 file; quyền viết dạng chuỗi tự do nên gõ sai không ai biết cho tới lúc chạy.

### Quyền do BE cung cấp

```
EWALLET:ADMIN:FULL
EWALLET:PERMISSION:{VIEW,CREATE,UPDATE,DELETE,FULL}
EWALLET:ROLE:{VIEW,CREATE,UPDATE,DELETE,FULL}
EWALLET:USER:{VIEW,CREATE,UPDATE,FULL}          // không có DELETE
```

Sidebar hiện có thêm 4 module **chưa tồn tại ở BE**: `FEE`, `WALLET`, `TRANSACTION`, `MERCHANT`.

---

## 2. Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| 1 | `EWALLET:ADMIN:FULL` = **super-admin**, bỏ qua mọi check | Đúng với cách `Navigation.tsx` đang dùng (liệt kê `ADMIN:FULL` ở mọi menu). Viết một lần trong lõi thay vì lặp 12 chỗ |
| 2 | Module chưa có ở BE vẫn **khai trước** trong registry, đánh dấu chưa phát hành → tạm thời cho qua | Hành vi hôm nay không đổi. BE ra quyền → thêm module vào `RELEASED_MODULES`, siết ngay, không sửa màn nào |
| 3 | Không đủ quyền cho nút → **ẩn hoàn toàn** | Giao diện gọn, không lộ nghiệp vụ user không được phép |
| 4 | Vào URL không có quyền → **redirect `/secure-panel/forbidden`** | Giữ cơ chế `AppLayout` đang có, chỉ đổi nguồn quyết định sang registry |
| 5 | Nguồn sự thật = **Access Registry tập trung** tại `src/app/permissions/` | Sidebar / route / nút cùng đọc một chỗ |

---

## 3. Kiến trúc

```
src/app/permissions/
├── modules.ts      # MODULE, ACTION, PermissionCode, RELEASED_MODULES
├── access.ts       # grants() — hàm thuần, không React
├── registry.ts     # SCREENS — khai báo từng màn
├── useAccess.ts    # useAccess, useScreenAccess
├── useRouteAccess.ts
├── Can.tsx         # component ẩn/hiện theo quyền
├── index.ts        # barrel, export tường minh
└── test/
```

### 3.1 `modules.ts` — mã quyền có kiểu

```ts
export const MODULE = {
  ADMIN: 'ADMIN',
  PERMISSION: 'PERMISSION',
  ROLE: 'ROLE',
  USER: 'USER',
  // Chưa có ở BE — khai trước để không phải sửa màn khi BE bổ sung
  FEE: 'FEE',
  WALLET: 'WALLET',
  TRANSACTION: 'TRANSACTION',
  MERCHANT: 'MERCHANT'
} as const
export type Module = (typeof MODULE)[keyof typeof MODULE]

export const ACTION = {
  VIEW: 'VIEW',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  FULL: 'FULL'
} as const
export type Action = (typeof ACTION)[keyof typeof ACTION]

/** Mã quyền hợp lệ duy nhất trong toàn dự án. Gõ sai → lỗi biên dịch. */
export type PermissionCode = `EWALLET:${Module}:${Action}`

export const SUPER_ADMIN_PERMISSION = 'EWALLET:ADMIN:FULL' satisfies PermissionCode

/** Module BE đã phát hành quyền. Thêm vào đây để siết quyền module đó. */
export const RELEASED_MODULES: ReadonlySet<Module> = new Set([
  MODULE.ADMIN,
  MODULE.PERMISSION,
  MODULE.ROLE,
  MODULE.USER
])
```

Dùng `as const` object + union type theo `.claude/rules/01-typescript.md`, không dùng `enum`.

### 3.2 `access.ts` — logic so khớp, một chỗ duy nhất

```ts
export const buildPermissionCode = (module: Module, action: Action): PermissionCode =>
  `EWALLET:${module}:${action}`

export const grants = (granted: readonly string[], required: PermissionCode): boolean
```

Thứ tự đánh giá của `grants`:

1. Có `EWALLET:ADMIN:FULL` trong `granted` → `true` (super-admin).
2. Module của `required` **không** nằm trong `RELEASED_MODULES` → `true` (chưa phát hành, không chặn).
3. Có `EWALLET:<module>:FULL` → `true`.
4. Khớp chính xác `required` → `true`.
5. Còn lại → `false`. **Mảng `granted` rỗng cũng trả `false`** cho module đã phát hành.

So khớp **chính xác**, bỏ hẳn `endsWith` / `includes` của cơ chế cũ.

### 3.3 `registry.ts` — khai báo màn hình

```ts
export interface ScreenAccess {
  /** Path khớp với routes.ts. Route con khớp theo tiền tố. */
  readonly path: string
  /** Path trùng lặp cùng trỏ về màn này (xem ghi chú bảng bên dưới). */
  readonly aliasPaths?: readonly string[]
  readonly module: Module
  /** Quyền tối thiểu để mở màn. Mặc định VIEW. */
  readonly view: Action
  /** Quyền cho từng hành động trên màn. */
  readonly actions: Readonly<Record<string, Action>>
}

export const SCREENS = {
  USER_ACCOUNT: {
    path: `${ROLEMANAGEMENT_V2}/user-account`,
    module: MODULE.USER,
    view: ACTION.VIEW,
    actions: {
      create: ACTION.CREATE,
      viewDetail: ACTION.VIEW,
      assignRoles: ACTION.UPDATE,
      resetPassword: ACTION.UPDATE
    }
  },
  // ... các màn còn lại
} as const satisfies Record<string, ScreenAccess>

export type ScreenId = keyof typeof SCREENS
export type ScreenActionId<S extends ScreenId> = keyof (typeof SCREENS)[S]['actions']
```

`satisfies` giữ được literal type của từng entry (để suy ra tên action) đồng thời kiểm tra cấu trúc.

**Chống lệch path bằng thiết kế, không bằng test.** `routes.ts` sẽ dùng `SCREENS.<id>.path` thay cho chuỗi ghép tay, ví dụ `path: SCREENS.FEE_POLICY.path + '/:mode'`. Registry chỉ phụ thuộc `routersConstant.ts` nên vẫn nhẹ. Lý do không viết test đối chiếu: đã đo thực tế, `import('@/routes')` trong vitest/jsdom treo quá 5 giây (routes.ts kéo theo cả cây layout), trong khi `import('@components/layout/components/Navigation')` chỉ mất ~1,5 giây.

#### Bảng màn hình đầy đủ (14 màn)

| ScreenId | Path | Module | Actions |
|---|---|---|---|
| `USER_ACCOUNT` | `/secure-panel/role-v2/user-account` | USER | create, viewDetail, assignRoles, resetPassword |
| `ROLE_MANAGEMENT` | `/secure-panel/role-v2/permission-management` | ROLE | create, edit(U), delete(D), assignPermissions(U), viewPermissions(V), viewMembers(V) |
| `PERMISSION_MANAGEMENT` | `/secure-panel/role-v2/role-management` | PERMISSION | create, edit(U), delete(D) |
| `TRANSACTION_WALLET` | `/secure-panel/transaction-management/transaction-wallet` | TRANSACTION | viewDetail(V) |
| `FROZEN_TRANSACTIONS` | `/secure-panel/transaction-management/frozen-transactions` | TRANSACTION | — |
| `SYSTEM_LEDGER` | `/secure-panel/transaction-management/system-ledger` | TRANSACTION | viewDetail(V) |
| `WITHDRAW_HISTORY` | `/secure-panel/transaction-management/withdraw-history` | TRANSACTION | — |
| `EWALLET_MANAGEMENT` | `/secure-panel/wallet-administration/e-walletManagement` | WALLET | viewDetail(V), lock(U), unlock(U), freeze(U), cancel(D) |
| `CONFIRM_EKYC` | `/secure-panel/wallet-administration/confirm-eKYC` | ADMIN | approve(FULL) |
| `MERCHANT_DASHBOARD` | `/secure-panel/merchant/dashboard-merchant` | MERCHANT | — |
| `MERCHANT_MANAGEMENT` | `/secure-panel/merchant/merchant-management` | MERCHANT | create, edit(U), viewDetail(V) |
| `MERCHANT_ORDER` | `/secure-panel/merchant/merchant-order` | MERCHANT | viewQr(V) |
| `FEE_POLICY` | `/secure-panel/fee-v4/fee-managementV4` | FEE | create, edit(U), approve(U), toggleActive(U) |
| `FEE_ASSIGNMENT` | `/secure-panel/fee-v4/fee-assignmentV4` | FEE | create, edit(U), approve(U), toggleActive(U) |

Ghi chú:

- **`ROLE_MANAGEMENT` và `PERMISSION_MANAGEMENT` đấu chéo path.** `routes.ts:161-179`: path `/permission-management` render component `PermissionManagement` export từ thư mục `role-management/`, còn `/role-management` render từ thư mục `permission-management/`. Registry gắn quyền **theo màn thực tế hiển thị**, không theo tên path. Không sửa `routes.ts` trong phạm vi này.
- Module `USER` không có `DELETE` ở BE nên màn `USER_ACCOUNT` không khai action xoá, dù `ModalType` có sẵn `'delete' | 'lock' | 'unlock'` — cột hiện chỉ render `viewDetail / assignRoles / resetPassword`.
- Màn `CONFIRM_EKYC` dùng module `ADMIN`, `view: FULL` theo mô tả BE ("Toàn quyền xem hồ sơ KYC đã xác minh"). Vì `ADMIN:FULL` đồng thời là super-admin nên chỉ super-admin mở được màn này — đúng ý đồ, không mâu thuẫn.
- `routes.ts:314` còn route trùng `/secure-panel/wallet-administration/transaction-wallet` render cùng component với màn `TRANSACTION_WALLET` nhưng không xuất hiện trên sidebar. Khai vào `aliasPaths` của `TRANSACTION_WALLET` để guard không bỏ sót đường vòng này.

### 3.4 Hooks & component

```ts
// useAccess.ts
export const useAccess = (): {
  has: (code: PermissionCode) => boolean
  hasAny: (codes: readonly PermissionCode[]) => boolean
  hasAll: (codes: readonly PermissionCode[]) => boolean
}

export const useScreenAccess = <S extends ScreenId>(screen: S): {
  canView: boolean
  can: (action: ScreenActionId<S>) => boolean
}
```

`can('creat')` → lỗi biên dịch vì `'creat'` không thuộc `ScreenActionId<'USER_ACCOUNT'>`.

```tsx
// Can.tsx — không đủ quyền thì không render (quyết định #3)
<Can screen='ROLE_MANAGEMENT' action='delete'>
  <ButtonComponent ... />
</Can>
```

`Can` chỉ nhận `children`, `screen`, `action`, không nhận fallback — thống nhất một hành vi ẩn.

### 3.5 Route guard

```ts
// useRouteAccess.ts
export const useRouteAccess = (): boolean
```

- Khớp `location.pathname` với `path` + `aliasPaths` của `SCREENS` theo **tiền tố dài nhất** (để `/fee-managementV4/edit/:id` thừa hưởng quyền của màn cha).
- Có màn khớp → trả `grants(permissions, EWALLET:<module>:<view>)`.
- Không màn nào khớp (`/`, `/secure-panel/forbidden`, `/test`) → cho qua.
- `AppLayout` dùng kết quả này thay cho `usePermission`; giữ nguyên redirect tới `FORBIDDENERROR` kèm `state.forbiddenFrom`.

Khác biệt so với hiện tại: màn **có** trong registry mà thiếu quyền thì **chặn**, kể cả khi mảng quyền rỗng.

### 3.6 Sidebar

`Navigation.tsx` bỏ trường `permission`, thay bằng `screen`:

```tsx
{
  key: 'user-account',
  screen: 'USER_ACCOUNT',      // thay cho mảng 6 string
  icon: <UsersThreeIcon ... />,
  label: i18n.t('navigation.admin-and-permission-management')
}
```

`useNavigation` lọc menu bằng `grants` theo `screen`; menu cha không còn con nào thì ẩn cả cha. Xoá ~70 dòng string lặp.

---

## 4. Kế hoạch di trú

| Bước | Việc | Xoá |
|---|---|---|
| 1 | Dựng `src/app/permissions/` + test | — |
| 1b | `routes.ts` dùng `SCREENS.<id>.path` thay chuỗi ghép tay | chuỗi path lặp trong `routes.ts` |
| 2 | Đấu sidebar | trường `permission` trong `Navigation.tsx`, logic so khớp trong `useNavigation.ts` |
| 3 | Đấu route guard | `src/app/hooks/usePermission.ts` (cả `MappingRouterPermission`) |
| 4 | Đấu nút của 3 màn identity | `CREATE_ADMIN_USER_PERMISSION` trong `constants/userAccount.ts` |
| 5 | Đấu nút các màn còn lại | mảng inline trong `FeeManagement.tsx:23` |
| 6 | Gỡ hook cũ | `src/app/hooks/usePermissionCheck.ts` |

Sau bước 6 không còn chuỗi quyền viết tay nào ngoài `src/app/permissions/`.

---

## 5. Kiểm thử

| File | Nội dung |
|---|---|
| `access.test.ts` | Ma trận: super-admin / `MODULE:FULL` / khớp chính xác / thiếu quyền / module chưa phát hành / mảng rỗng / chuỗi rác không khớp mờ |
| `registry.test.ts` | `path` không trùng nhau giữa các màn; mọi `path`/`aliasPaths` bắt đầu bằng `/secure-panel/`; mỗi sidebar item trong `navigationItems` trỏ tới `ScreenId` có thật và `'/' + parentKey + '/' + childKey` khớp `path` của màn đó |
| `useScreenAccess.test.tsx` | `canView` / `can()` theo từng bộ quyền |
| `useRouteAccess.test.tsx` | Khớp tiền tố, path lạ cho qua, thiếu quyền trả `false` |
| `useNavigation.test.tsx` | Lọc menu con; ẩn menu cha khi không còn con |
| `Can.test.tsx` | Có quyền → render children; không quyền → không render gì |

Lệch giữa registry và `routes.ts` được chặn bằng thiết kế (§3.3, dùng chung hằng path). `registry.test.ts` chặn nốt lệch còn lại giữa registry và sidebar.

---

## 6. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Siết chặt hơn hiện tại → user đang dùng được bỗng bị chặn | Chỉ 4 module đã phát hành bị siết. Module chưa phát hành giữ nguyên hành vi cho qua |
| Path trong registry lệch `routes.ts` khi ai đó đổi route | `routes.ts` dùng chung hằng `SCREENS.<id>.path`, không còn hai bản chuỗi để lệch |
| Sidebar trỏ sai `ScreenId` hoặc key sinh ra path khác registry | `registry.test.ts` đối chiếu `navigationItems` với `SCREENS` |
| BE đổi format mã quyền | Chỉ `buildPermissionCode` và `grants` biết format; đổi 2 hàm là xong |
| `routes.ts` đấu chéo hai màn role/permission | Ghi rõ trong registry theo component thực tế; sửa route tách thành việc riêng |
