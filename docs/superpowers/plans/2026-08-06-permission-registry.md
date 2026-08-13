# Access Registry — Implementation Plan

> **Điều chỉnh sau triển khai (2026-08-06):** mọi module áp dụng deny-by-default.
> Các bước bên dưới nói module chưa phát hành được “tạm cho qua” đã bị thay thế;
> tài khoản chỉ có quyền `FEE` chỉ được thấy và truy cập các màn thuộc `FEE`.
> Route/sidebar cho phép khi có một trong các action chuẩn của module; trường
> `view` cấp screen đã được thay bằng action `view` trong `actions`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gộp ba cơ chế phân quyền đang chồng nhau (route guard, sidebar, nút hành động) về một registry tập trung, để đổi quyền một màn hoặc một nút chỉ phải sửa một dòng.

**Architecture:** `src/app/permissions/` khai báo mã quyền có kiểu (`EWALLET:${Module}:${Action}`), một hàm thuần `grants()` quyết định mọi phép so khớp, và một `SCREENS` registry mô tả 14 màn kèm quyền cho từng nút. Sidebar, route guard và component `<Can>` đều đọc từ registry. `routes.ts` dùng chung hằng path của registry nên không thể lệch.

**Tech Stack:** React 19 + TypeScript strict, Redux Toolkit (`state.auth.profile.permissions`), react-router-dom v6, Vitest + jsdom + Testing Library, antd (`ItemType` cho sidebar).

**Spec:** `docs/superpowers/specs/2026-08-06-permission-registry-design.md`

## Global Constraints

- Không dùng `any`, không `@ts-ignore`, không `as` tuỳ tiện (`.claude/rules/01-typescript.md`).
- Dùng `as const` object + union type, **không** dùng `enum`.
- Named export bắt buộc, trừ Page/Layout đang default export sẵn thì giữ nguyên.
- Import bằng alias: `@/app/permissions`, `@constants/*`, `@hooks/*`, `@components/*`. **Không** tạo alias mới (`vitest.config.ts` phải khai lại thủ công, dễ quên).
- Component < 200 dòng, function < 50 dòng, file < 300 dòng.
- Test đặt trong thư mục `test/` cạnh file nguồn (quy ước đang dùng: `src/app/hooks/test/useAllRoles.test.tsx`).
- Chạy test: `npx vitest run <path>`. Chạy typecheck: `npm run typecheck`.
- **Cấm import `@/routes` trong test** — đã đo, treo quá 5 giây trong jsdom.
- Comment tiếng Việt, chỉ khi giải thích *tại sao*, không comment lại điều code đã nói.
- Mỗi task kết thúc bằng một commit. Hook pre-commit chạy `eslint --max-warnings=0 --fix` và `tsc --noEmit`; đừng dùng `--no-verify`.
- **Chỉ `git add` đúng file của task.** Repo đang có 45 file staged sẵn không liên quan — `git commit` trần sẽ nuốt hết chúng.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/app/permissions/modules.ts` | `MODULE`, `ACTION`, `PermissionCode`, `SUPER_ADMIN_PERMISSION` |
| `src/app/permissions/access.ts` | `buildPermissionCode`, `grants` — hàm thuần, không React |
| `src/app/permissions/registry.ts` | `ScreenAccess`, `SCREENS` (14 màn), `ScreenId`, `ScreenActionId`, `findScreenByPath` |
| `src/app/permissions/useAccess.ts` | `useAccess`, `useScreenAccess` |
| `src/app/permissions/useRouteAccess.ts` | `useRouteAccess` — guard theo `location.pathname` |
| `src/app/permissions/Can.tsx` | `<Can screen action>` — không đủ quyền thì không render |
| `src/app/permissions/index.ts` | barrel, export tường minh (không `export *`) |
| `src/app/permissions/test/*` | test cho từng file trên |
| `src/routes.ts` | sửa: dùng `SCREENS.<id>.path` |
| `src/components/layout/components/Navigation.tsx` | sửa: `permission` → `screen` |
| `src/app/hooks/useNavigation.ts` | sửa: lọc qua `grants` |
| `src/components/layout/AppLayout.tsx` | sửa: dùng `useRouteAccess` |
| `src/app/hooks/usePermission.ts` | **xoá** |
| `src/app/hooks/usePermissionCheck.ts` | **xoá** |

---

## Task 1: Mã quyền có kiểu + hàm `grants`

**Files:**
- Create: `src/app/permissions/modules.ts`
- Create: `src/app/permissions/access.ts`
- Test: `src/app/permissions/test/access.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  - `MODULE`, `type Module`, `ACTION`, `type Action`
  - `type PermissionCode = \`EWALLET:${Module}:${Action}\``
  - `SUPER_ADMIN_PERMISSION: PermissionCode`
  - `RELEASED_MODULES: ReadonlySet<Module>`
  - `buildPermissionCode(module: Module, action: Action): PermissionCode`
  - `grants(granted: readonly string[], required: PermissionCode): boolean`

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/permissions/test/access.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ACTION, MODULE, SUPER_ADMIN_PERMISSION } from '../modules'
import { buildPermissionCode, grants } from '../access'

describe('buildPermissionCode', () => {
  it('ghép đúng định dạng EWALLET:MODULE:ACTION', () => {
    expect(buildPermissionCode(MODULE.ROLE, ACTION.DELETE)).toBe(
      'EWALLET:ROLE:DELETE'
    )
  })
})

describe('grants', () => {
  it('super-admin đi qua mọi quyền', () => {
    expect(grants([SUPER_ADMIN_PERMISSION], 'EWALLET:ROLE:DELETE')).toBe(true)
    expect(grants([SUPER_ADMIN_PERMISSION], 'EWALLET:USER:CREATE')).toBe(true)
  })

  it('MODULE:FULL bao trùm mọi action của module đó', () => {
    expect(grants(['EWALLET:ROLE:FULL'], 'EWALLET:ROLE:DELETE')).toBe(true)
    expect(grants(['EWALLET:ROLE:FULL'], 'EWALLET:ROLE:VIEW')).toBe(true)
  })

  it('MODULE:FULL không bao trùm module khác', () => {
    expect(grants(['EWALLET:ROLE:FULL'], 'EWALLET:USER:CREATE')).toBe(false)
  })

  it('khớp chính xác thì cho qua', () => {
    expect(grants(['EWALLET:USER:CREATE'], 'EWALLET:USER:CREATE')).toBe(true)
  })

  it('thiếu quyền thì chặn', () => {
    expect(grants(['EWALLET:USER:VIEW'], 'EWALLET:USER:CREATE')).toBe(false)
  })

  it('mảng quyền rỗng thì chặn, không phải cho qua', () => {
    expect(grants([], 'EWALLET:USER:VIEW')).toBe(false)
  })

  it('không khớp mờ theo hậu tố như cơ chế cũ', () => {
    expect(grants(['SOMETHING:ELSE:USER:VIEW'], 'EWALLET:USER:VIEW')).toBe(
      false
    )
    expect(grants(['EWALLET:USER:VIEW_ALL'], 'EWALLET:USER:VIEW')).toBe(false)
  })

  it('module BE chưa phát hành thì tạm cho qua', () => {
    expect(grants([], 'EWALLET:FEE:UPDATE')).toBe(true)
    expect(grants([], 'EWALLET:WALLET:VIEW')).toBe(true)
    expect(grants([], 'EWALLET:TRANSACTION:VIEW')).toBe(true)
    expect(grants([], 'EWALLET:MERCHANT:CREATE')).toBe(true)
  })

  it('module đã phát hành thì không được hưởng ưu đãi đó', () => {
    expect(grants([], 'EWALLET:ROLE:VIEW')).toBe(false)
    expect(grants([], 'EWALLET:PERMISSION:VIEW')).toBe(false)
    expect(grants([], 'EWALLET:ADMIN:FULL')).toBe(false)
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/app/permissions/test/access.test.ts`
Expected: FAIL — `Failed to resolve import "../modules"`

- [ ] **Step 3: Viết `modules.ts`**

```ts
/**
 * Mã quyền do BE cấp có dạng EWALLET:<MODULE>:<ACTION>.
 * Toàn bộ chuỗi quyền của dự án phải sinh ra từ file này.
 */
export const MODULE = {
  ADMIN: 'ADMIN',
  PERMISSION: 'PERMISSION',
  ROLE: 'ROLE',
  USER: 'USER',
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

/** Gõ sai một ký tự là lỗi biên dịch, không phải lỗi lúc chạy. */
export type PermissionCode = `EWALLET:${Module}:${Action}`

/** Có quyền này thì bỏ qua mọi phép kiểm tra khác. */
export const SUPER_ADMIN_PERMISSION = 'EWALLET:ADMIN:FULL' satisfies PermissionCode

/**
 * Module mà BE đã phát hành quyền. Module ngoài danh sách này tạm thời không bị
 * chặn; khi BE bổ sung quyền, thêm module vào đây là siết ngay toàn hệ thống.
 */
export const RELEASED_MODULES: ReadonlySet<Module> = new Set([
  MODULE.ADMIN,
  MODULE.PERMISSION,
  MODULE.ROLE,
  MODULE.USER
])
```

- [ ] **Step 4: Viết `access.ts`**

```ts
import {
  ACTION,
  RELEASED_MODULES,
  SUPER_ADMIN_PERMISSION,
  type Action,
  type Module,
  type PermissionCode
} from './modules'

export const buildPermissionCode = (
  module: Module,
  action: Action
): PermissionCode => `EWALLET:${module}:${action}`

const moduleOf = (code: PermissionCode): Module =>
  code.split(':')[1] as Module

/**
 * Thứ tự đánh giá cố ý: super-admin trước, rồi tới module chưa phát hành,
 * rồi mới tới quyền cụ thể. So khớp chính xác — cơ chế cũ dùng endsWith
 * nên 'EWALLET:USER:VIEW_ALL' từng khớp nhầm 'EWALLET:USER:VIEW'.
 */
export const grants = (
  granted: readonly string[],
  required: PermissionCode
): boolean => {
  if (granted.includes(SUPER_ADMIN_PERMISSION)) return true

  const module = moduleOf(required)
  if (!RELEASED_MODULES.has(module)) return true

  if (granted.includes(buildPermissionCode(module, ACTION.FULL))) return true

  return granted.includes(required)
}
```

`as Module` ở `moduleOf` là assertion duy nhất được phép trong toàn hệ thống: `PermissionCode` là template literal nên phần tử thứ hai sau khi tách luôn là `Module`. Ghi comment ngay tại đó.

- [ ] **Step 5: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/app/permissions/test/access.test.ts`
Expected: PASS — 10 test.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: không lỗi.

- [ ] **Step 7: Commit**

```bash
git add src/app/permissions/modules.ts src/app/permissions/access.ts src/app/permissions/test/access.test.ts
git commit -m "feat(permissions): thêm mã quyền có kiểu và hàm grants"
```

---

## Task 2: Registry 14 màn

**Files:**
- Create: `src/app/permissions/registry.ts`
- Test: `src/app/permissions/test/registry.test.ts`

**Interfaces:**
- Consumes: `MODULE`, `ACTION`, `type Module`, `type Action` từ `./modules`
- Produces:
  - `interface ScreenAccess { path, aliasPaths?, module, view, actions }`
  - `SCREENS` (14 entry), `type ScreenId`, `type ScreenActionId<S>`
  - `findScreenByPath(pathname: string): ScreenAccess | undefined`

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/permissions/test/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { navigationItems } from '@components/layout/components/Navigation'
import { ROLEMANAGEMENT_V2 } from '@constants/routersConstant'
import { SCREENS, findScreenByPath, type ScreenId } from '../registry'
import { MODULE, ACTION } from '../modules'

const screens = Object.values(SCREENS)

describe('SCREENS', () => {
  it('không có hai màn trùng path', () => {
    const paths = screens.map((screen) => screen.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('mọi path và aliasPath đều nằm dưới /secure-panel/', () => {
    for (const screen of screens) {
      expect(screen.path.startsWith('/secure-panel/')).toBe(true)
      for (const alias of screen.aliasPaths ?? []) {
        expect(alias.startsWith('/secure-panel/')).toBe(true)
      }
    }
  })

  it('màn quản lý tài khoản gắn đúng module USER', () => {
    expect(SCREENS.USER_ACCOUNT.module).toBe(MODULE.USER)
    expect(SCREENS.USER_ACCOUNT.path).toBe(
      `${ROLEMANAGEMENT_V2}/user-account`
    )
    expect(SCREENS.USER_ACCOUNT.actions.assignRoles).toBe(ACTION.UPDATE)
  })

  it('màn duyệt eKYC yêu cầu quyền super-admin', () => {
    expect(SCREENS.CONFIRM_EKYC.module).toBe(MODULE.ADMIN)
    expect(SCREENS.CONFIRM_EKYC.view).toBe(ACTION.FULL)
  })
})

describe('sidebar khớp registry', () => {
  it('mỗi item con của sidebar trỏ tới một màn có thật, đúng path', () => {
    for (const group of navigationItems) {
      const children = group.children ?? []
      for (const child of children) {
        const screenId = child.screen as ScreenId
        expect(SCREENS[screenId]).toBeDefined()
        expect(`/${String(group.key)}/${String(child.key)}`).toBe(
          SCREENS[screenId].path
        )
      }
    }
  })
})

describe('findScreenByPath', () => {
  it('khớp chính xác', () => {
    expect(findScreenByPath(SCREENS.USER_ACCOUNT.path)).toBe(
      SCREENS.USER_ACCOUNT
    )
  })

  it('route con thừa hưởng màn cha', () => {
    expect(findScreenByPath(`${SCREENS.FEE_POLICY.path}/edit/abc-123`)).toBe(
      SCREENS.FEE_POLICY
    )
  })

  it('khớp theo tiền tố dài nhất, không lấy nhầm màn ngắn hơn', () => {
    expect(
      findScreenByPath(`${SCREENS.SYSTEM_LEDGER.path}/xyz`)
    ).toBe(SCREENS.SYSTEM_LEDGER)
  })

  it('không khớp nửa chừng một đoạn path', () => {
    expect(findScreenByPath(`${SCREENS.USER_ACCOUNT.path}-khac`)).toBeUndefined()
  })

  it('aliasPath cũng khớp về đúng màn', () => {
    expect(
      findScreenByPath('/secure-panel/wallet-administration/transaction-wallet')
    ).toBe(SCREENS.TRANSACTION_WALLET)
  })

  it('path lạ trả về undefined', () => {
    expect(findScreenByPath('/secure-panel/forbidden')).toBeUndefined()
    expect(findScreenByPath('/')).toBeUndefined()
  })
})
```

Test `sidebar khớp registry` sẽ fail cho tới Task 5 (lúc đó `Navigation.tsx` mới có trường `screen`). Cố ý: nó là chốt chặn lệch. Ở Task 2 chỉ cần các test còn lại pass, test này được `it.skip` tạm với comment `// bật lại ở Task 5`.

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/app/permissions/test/registry.test.ts`
Expected: FAIL — `Failed to resolve import "../registry"`

- [ ] **Step 3: Viết `registry.ts`**

```ts
import {
  FEEMANAGEMENT_V4,
  MERCHANT,
  ROLEMANAGEMENT_V2,
  TRANSACTIONMANAGEMENT,
  WALLETADMINISTRATION
} from '@constants/routersConstant'
import { ACTION, MODULE, type Action, type Module } from './modules'

export interface ScreenAccess {
  /** Path gốc; route con khớp theo tiền tố. `routes.ts` dùng lại hằng này. */
  readonly path: string
  /** Path trùng lặp cùng trỏ về màn này. */
  readonly aliasPaths?: readonly string[]
  readonly module: Module
  /** Quyền tối thiểu để mở màn. */
  readonly view: Action
  /** Quyền cho từng nút/hành động trên màn. */
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
  // routes.ts:161 đấu chéo: path /permission-management render component
  // RoleManagement. Quyền gắn theo màn thực tế hiển thị, không theo tên path.
  ROLE_MANAGEMENT: {
    path: `${ROLEMANAGEMENT_V2}/permission-management`,
    module: MODULE.ROLE,
    view: ACTION.VIEW,
    actions: {
      create: ACTION.CREATE,
      edit: ACTION.UPDATE,
      delete: ACTION.DELETE,
      assignPermissions: ACTION.UPDATE,
      viewPermissions: ACTION.VIEW,
      viewMembers: ACTION.VIEW
    }
  },
  PERMISSION_MANAGEMENT: {
    path: `${ROLEMANAGEMENT_V2}/role-management`,
    module: MODULE.PERMISSION,
    view: ACTION.VIEW,
    actions: {
      create: ACTION.CREATE,
      edit: ACTION.UPDATE,
      delete: ACTION.DELETE
    }
  },
  TRANSACTION_WALLET: {
    path: `${TRANSACTIONMANAGEMENT}/transaction-wallet`,
    aliasPaths: [`${WALLETADMINISTRATION}/transaction-wallet`],
    module: MODULE.TRANSACTION,
    view: ACTION.VIEW,
    actions: { viewDetail: ACTION.VIEW }
  },
  FROZEN_TRANSACTIONS: {
    path: `${TRANSACTIONMANAGEMENT}/frozen-transactions`,
    module: MODULE.TRANSACTION,
    view: ACTION.VIEW,
    actions: {}
  },
  SYSTEM_LEDGER: {
    path: `${TRANSACTIONMANAGEMENT}/system-ledger`,
    module: MODULE.TRANSACTION,
    view: ACTION.VIEW,
    actions: { viewDetail: ACTION.VIEW }
  },
  WITHDRAW_HISTORY: {
    path: `${TRANSACTIONMANAGEMENT}/withdraw-history`,
    module: MODULE.TRANSACTION,
    view: ACTION.VIEW,
    actions: {}
  },
  EWALLET_MANAGEMENT: {
    path: `${WALLETADMINISTRATION}/e-walletManagement`,
    module: MODULE.WALLET,
    view: ACTION.VIEW,
    actions: {
      viewDetail: ACTION.VIEW,
      lock: ACTION.UPDATE,
      unlock: ACTION.UPDATE,
      freeze: ACTION.UPDATE,
      cancel: ACTION.DELETE
    }
  },
  CONFIRM_EKYC: {
    path: `${WALLETADMINISTRATION}/confirm-eKYC`,
    module: MODULE.ADMIN,
    view: ACTION.FULL,
    actions: { approve: ACTION.FULL }
  },
  MERCHANT_DASHBOARD: {
    path: `${MERCHANT}/dashboard-merchant`,
    module: MODULE.MERCHANT,
    view: ACTION.VIEW,
    actions: {}
  },
  MERCHANT_MANAGEMENT: {
    path: `${MERCHANT}/merchant-management`,
    module: MODULE.MERCHANT,
    view: ACTION.VIEW,
    actions: {
      create: ACTION.CREATE,
      edit: ACTION.UPDATE,
      viewDetail: ACTION.VIEW
    }
  },
  MERCHANT_ORDER: {
    path: `${MERCHANT}/merchant-order`,
    module: MODULE.MERCHANT,
    view: ACTION.VIEW,
    actions: { viewQr: ACTION.VIEW }
  },
  FEE_POLICY: {
    path: `${FEEMANAGEMENT_V4}/fee-managementV4`,
    module: MODULE.FEE,
    view: ACTION.VIEW,
    actions: {
      create: ACTION.CREATE,
      edit: ACTION.UPDATE,
      approve: ACTION.UPDATE,
      toggleActive: ACTION.UPDATE
    }
  },
  FEE_ASSIGNMENT: {
    path: `${FEEMANAGEMENT_V4}/fee-assignmentV4`,
    module: MODULE.FEE,
    view: ACTION.VIEW,
    actions: {
      create: ACTION.CREATE,
      edit: ACTION.UPDATE,
      approve: ACTION.UPDATE,
      toggleActive: ACTION.UPDATE
    }
  }
} as const satisfies Record<string, ScreenAccess>

export type ScreenId = keyof typeof SCREENS
export type ScreenActionId<S extends ScreenId> =
  keyof (typeof SCREENS)[S]['actions']

/** Khớp nguyên đoạn path, tránh '/user-account' nuốt '/user-account-khac'. */
const matchesPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

/** Tiền tố dài nhất thắng, để route con không rơi vào màn cha khác. */
export const findScreenByPath = (
  pathname: string
): ScreenAccess | undefined => {
  let matched: ScreenAccess | undefined
  let matchedLength = -1

  for (const screen of Object.values(SCREENS) as ScreenAccess[]) {
    const candidates = [screen.path, ...(screen.aliasPaths ?? [])]
    for (const candidate of candidates) {
      if (matchesPrefix(pathname, candidate) && candidate.length > matchedLength) {
        matched = screen
        matchedLength = candidate.length
      }
    }
  }

  return matched
}
```

- [ ] **Step 4: Tạm skip test sidebar**

Trong `registry.test.ts`, đổi `describe('sidebar khớp registry', ...)` thành `describe.skip(...)` và thêm comment `// bật lại ở Task 5 khi Navigation.tsx có trường screen`.

- [ ] **Step 5: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/app/permissions/test/registry.test.ts`
Expected: PASS (nhóm sidebar hiện skip).

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: không lỗi.

- [ ] **Step 7: Commit**

```bash
git add src/app/permissions/registry.ts src/app/permissions/test/registry.test.ts
git commit -m "feat(permissions): khai báo registry 14 màn"
```

---

## Task 3: Hook `useAccess` / `useScreenAccess` và component `<Can>`

**Files:**
- Create: `src/app/permissions/useAccess.ts`
- Create: `src/app/permissions/Can.tsx`
- Create: `src/app/permissions/index.ts`
- Test: `src/app/permissions/test/useAccess.test.tsx`
- Test: `src/app/permissions/test/Can.test.tsx`

**Interfaces:**
- Consumes: `grants`, `buildPermissionCode` (Task 1); `SCREENS`, `ScreenId`, `ScreenActionId` (Task 2)
- Produces:
  - `useAccess(): { has, hasAny, hasAll }` với `has(code: PermissionCode): boolean`
  - `useScreenAccess<S extends ScreenId>(screen: S): { canView: boolean; can: (action: ScreenActionId<S>) => boolean }`
  - `<Can screen={ScreenId} action={ScreenActionId} />`

Ghi chú cho người thực hiện: quyền nằm ở `state.auth.profile.permissions` (`string[]`), lấy qua `useAppSelector` từ `@hooks/hook`. Test bơm quyền bằng cách `dispatch(savePermissions([...]))` trên store tạo bởi `createAppStore()`.

- [ ] **Step 1: Viết test thất bại cho hook**

Tạo `src/app/permissions/test/useAccess.test.tsx`:

```tsx
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { useAccess, useScreenAccess } from '../useAccess'

const wrapperWith = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useAccess', () => {
  it('has trả đúng theo quyền được cấp', () => {
    const { result } = renderHook(() => useAccess(), {
      wrapper: wrapperWith(['EWALLET:USER:CREATE'])
    })

    expect(result.current.has('EWALLET:USER:CREATE')).toBe(true)
    expect(result.current.has('EWALLET:USER:UPDATE')).toBe(false)
  })

  it('hasAny cần một quyền, hasAll cần đủ mọi quyền', () => {
    const { result } = renderHook(() => useAccess(), {
      wrapper: wrapperWith(['EWALLET:ROLE:VIEW'])
    })

    expect(
      result.current.hasAny(['EWALLET:ROLE:VIEW', 'EWALLET:ROLE:DELETE'])
    ).toBe(true)
    expect(
      result.current.hasAll(['EWALLET:ROLE:VIEW', 'EWALLET:ROLE:DELETE'])
    ).toBe(false)
  })
})

describe('useScreenAccess', () => {
  it('USER:VIEW mở được màn nhưng không thấy nút tạo', () => {
    const { result } = renderHook(() => useScreenAccess('USER_ACCOUNT'), {
      wrapper: wrapperWith(['EWALLET:USER:VIEW'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('create')).toBe(false)
    expect(result.current.can('assignRoles')).toBe(false)
  })

  it('USER:FULL mở được mọi hành động của màn', () => {
    const { result } = renderHook(() => useScreenAccess('USER_ACCOUNT'), {
      wrapper: wrapperWith(['EWALLET:USER:FULL'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('create')).toBe(true)
    expect(result.current.can('resetPassword')).toBe(true)
  })

  it('không quyền thì không mở được màn đã phát hành', () => {
    const { result } = renderHook(() => useScreenAccess('ROLE_MANAGEMENT'), {
      wrapper: wrapperWith([])
    })

    expect(result.current.canView).toBe(false)
    expect(result.current.can('delete')).toBe(false)
  })

  it('màn thuộc module chưa phát hành vẫn dùng được', () => {
    const { result } = renderHook(() => useScreenAccess('FEE_POLICY'), {
      wrapper: wrapperWith([])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('approve')).toBe(true)
  })

  it('super-admin đi qua mọi màn', () => {
    const { result } = renderHook(() => useScreenAccess('CONFIRM_EKYC'), {
      wrapper: wrapperWith(['EWALLET:ADMIN:FULL'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('approve')).toBe(true)
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/app/permissions/test/useAccess.test.tsx`
Expected: FAIL — `Failed to resolve import "../useAccess"`

- [ ] **Step 3: Viết `useAccess.ts`**

```ts
import { useCallback, useMemo } from 'react'
import { useAppSelector } from '@hooks/hook'
import { buildPermissionCode, grants } from './access'
import type { PermissionCode } from './modules'
import { SCREENS, type ScreenActionId, type ScreenId } from './registry'

export interface AccessApi {
  has: (code: PermissionCode) => boolean
  hasAny: (codes: readonly PermissionCode[]) => boolean
  hasAll: (codes: readonly PermissionCode[]) => boolean
}

export const useAccess = (): AccessApi => {
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )

  const has = useCallback(
    (code: PermissionCode) => grants(permissions, code),
    [permissions]
  )

  return useMemo(
    () => ({
      has,
      hasAny: (codes) => codes.some(has),
      hasAll: (codes) => codes.every(has)
    }),
    [has]
  )
}

export interface ScreenAccessApi<S extends ScreenId> {
  canView: boolean
  can: (action: ScreenActionId<S>) => boolean
}

export const useScreenAccess = <S extends ScreenId>(
  screen: S
): ScreenAccessApi<S> => {
  const { has } = useAccess()
  const config = SCREENS[screen]

  const can = useCallback(
    (action: ScreenActionId<S>) => {
      const required = (
        config.actions as Readonly<Record<string, Action>>
      )[action as string]
      return required === undefined
        ? false
        : has(buildPermissionCode(config.module, required))
    },
    [config, has]
  )

  return useMemo(
    () => ({
      canView: has(buildPermissionCode(config.module, config.view)),
      can
    }),
    [can, config, has]
  )
}
```

Nhớ `import type { Action } from './modules'` cùng dòng import `PermissionCode`.

- [ ] **Step 4: Chạy test hook để chắc chắn nó pass**

Run: `npx vitest run src/app/permissions/test/useAccess.test.tsx`
Expected: PASS — 7 test.

- [ ] **Step 5: Viết test thất bại cho `<Can>`**

Tạo `src/app/permissions/test/Can.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { Can } from '../Can'

const renderWithPermissions = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <Can screen='ROLE_MANAGEMENT' action='delete'>
        <button type='button'>Xoá</button>
      </Can>
    </Provider>
  )
}

describe('Can', () => {
  it('đủ quyền thì hiện children', () => {
    renderWithPermissions(['EWALLET:ROLE:DELETE'])
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeInTheDocument()
  })

  it('thiếu quyền thì không render gì', () => {
    renderWithPermissions(['EWALLET:ROLE:VIEW'])
    expect(screen.queryByRole('button', { name: 'Xoá' })).toBeNull()
  })

  it('super-admin luôn thấy', () => {
    renderWithPermissions(['EWALLET:ADMIN:FULL'])
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/app/permissions/test/Can.test.tsx`
Expected: FAIL — `Failed to resolve import "../Can"`

- [ ] **Step 7: Viết `Can.tsx`**

```tsx
import type { ReactElement, ReactNode } from 'react'
import { useScreenAccess } from './useAccess'
import type { ScreenActionId, ScreenId } from './registry'

interface CanProps<S extends ScreenId> {
  screen: S
  action: ScreenActionId<S>
  children: ReactNode
}

/** Thiếu quyền thì không render gì — quyết định #3 của spec là ẩn, không disable. */
export const Can = <S extends ScreenId>({
  screen,
  action,
  children
}: CanProps<S>): ReactElement | null => {
  const { can } = useScreenAccess(screen)
  return can(action) ? <>{children}</> : null
}
```

- [ ] **Step 8: Viết `index.ts`**

```ts
export { ACTION, MODULE, RELEASED_MODULES, SUPER_ADMIN_PERMISSION } from './modules'
export type { Action, Module, PermissionCode } from './modules'
export { buildPermissionCode, grants } from './access'
export { SCREENS, findScreenByPath } from './registry'
export type { ScreenAccess, ScreenActionId, ScreenId } from './registry'
export { useAccess, useScreenAccess } from './useAccess'
export type { AccessApi, ScreenAccessApi } from './useAccess'
export { Can } from './Can'
```

Không dùng `export *` (`.claude/rules/06-naming-structure.md`).

- [ ] **Step 9: Chạy toàn bộ test của thư mục**

Run: `npx vitest run src/app/permissions`
Expected: PASS.

- [ ] **Step 10: Typecheck và commit**

```bash
npm run typecheck
git add src/app/permissions/useAccess.ts src/app/permissions/Can.tsx src/app/permissions/index.ts src/app/permissions/test/useAccess.test.tsx src/app/permissions/test/Can.test.tsx
git commit -m "feat(permissions): thêm useAccess, useScreenAccess và component Can"
```

---

## Task 4: Route guard `useRouteAccess` + đấu vào `AppLayout`

**Files:**
- Create: `src/app/permissions/useRouteAccess.ts`
- Test: `src/app/permissions/test/useRouteAccess.test.tsx`
- Modify: `src/app/permissions/index.ts` (thêm export)
- Modify: `src/components/layout/AppLayout.tsx:32,145` (đổi `usePermission` → `useRouteAccess`)
- Delete: `src/app/hooks/usePermission.ts`

**Interfaces:**
- Consumes: `grants`, `buildPermissionCode` (Task 1); `findScreenByPath` (Task 2)
- Produces: `useRouteAccess(): boolean` — `true` nghĩa là được vào

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/permissions/test/useRouteAccess.test.tsx`:

```tsx
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { SCREENS } from '../registry'
import { useRouteAccess } from '../useRouteAccess'

const wrapperWith = (permissions: string[], route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  )
}

const accessTo = (permissions: string[], route: string): boolean => {
  const { result } = renderHook(() => useRouteAccess(), {
    wrapper: wrapperWith(permissions, route)
  })
  return result.current
}

describe('useRouteAccess', () => {
  it('đủ quyền VIEW thì vào được', () => {
    expect(accessTo(['EWALLET:USER:VIEW'], SCREENS.USER_ACCOUNT.path)).toBe(
      true
    )
  })

  it('thiếu quyền thì bị chặn', () => {
    expect(accessTo(['EWALLET:ROLE:VIEW'], SCREENS.USER_ACCOUNT.path)).toBe(
      false
    )
  })

  it('token chưa có quyền nào cũng bị chặn, không phải cho qua như cơ chế cũ', () => {
    expect(accessTo([], SCREENS.USER_ACCOUNT.path)).toBe(false)
  })

  it('route con thừa hưởng quyền của màn cha', () => {
    expect(
      accessTo(['EWALLET:USER:VIEW'], `${SCREENS.USER_ACCOUNT.path}/123`)
    ).toBe(true)
  })

  it('path không nằm trong registry thì cho qua', () => {
    expect(accessTo([], '/secure-panel/forbidden')).toBe(true)
    expect(accessTo([], '/')).toBe(true)
  })

  it('màn thuộc module BE chưa phát hành thì cho qua', () => {
    expect(accessTo([], SCREENS.FEE_POLICY.path)).toBe(true)
  })

  it('super-admin vào được mọi màn', () => {
    expect(
      accessTo(['EWALLET:ADMIN:FULL'], SCREENS.CONFIRM_EKYC.path)
    ).toBe(true)
  })

  it('màn eKYC chặn người không phải super-admin', () => {
    expect(accessTo(['EWALLET:USER:FULL'], SCREENS.CONFIRM_EKYC.path)).toBe(
      false
    )
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/app/permissions/test/useRouteAccess.test.tsx`
Expected: FAIL — `Failed to resolve import "../useRouteAccess"`

- [ ] **Step 3: Viết `useRouteAccess.ts`**

```ts
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@hooks/hook'
import { buildPermissionCode, grants } from './access'
import { findScreenByPath } from './registry'

/**
 * Path không có trong registry thì cho qua (trang lỗi, redirect gốc).
 * Ngược hẳn cơ chế cũ ở usePermission.ts: nơi đó path CÓ trong mapping mà
 * thiếu quyền vẫn lọt vì hàm trả true khi không tìm thấy kết quả khớp.
 */
export const useRouteAccess = (): boolean => {
  const { pathname } = useLocation()
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )

  return useMemo(() => {
    const screen = findScreenByPath(pathname)
    if (!screen) return true

    return grants(permissions, buildPermissionCode(screen.module, screen.view))
  }, [pathname, permissions])
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/app/permissions/test/useRouteAccess.test.tsx`
Expected: PASS — 8 test.

- [ ] **Step 5: Export thêm trong `index.ts`**

Thêm dòng:

```ts
export { useRouteAccess } from './useRouteAccess'
```

- [ ] **Step 6: Đấu vào `AppLayout.tsx`**

Đổi import ở dòng 32:

```ts
// cũ
import usePermission from '@hooks/usePermission'
// mới
import { useRouteAccess } from '@/app/permissions'
```

Đổi dòng 145:

```ts
// cũ
const isAccess = usePermission()
// mới
const isAccess = useRouteAccess()
```

`useEffect` redirect ở dòng 176-183 giữ nguyên.

- [ ] **Step 7: Xoá hook cũ**

```bash
git rm src/app/hooks/usePermission.ts
```

- [ ] **Step 8: Kiểm tra không còn ai import hook cũ**

Run: `grep -rn "usePermission'" src || echo "sạch"`
Expected: in ra `sạch`.

- [ ] **Step 9: Typecheck, chạy toàn bộ test, commit**

```bash
npm run typecheck
npx vitest run
git add src/app/permissions/useRouteAccess.ts src/app/permissions/index.ts src/app/permissions/test/useRouteAccess.test.tsx src/components/layout/AppLayout.tsx src/app/hooks/usePermission.ts
git commit -m "feat(permissions): route guard đọc registry, bỏ usePermission cũ"
```

---

## Task 5: Sidebar đọc registry

**Files:**
- Modify: `src/components/layout/components/Navigation.tsx` (bỏ `permission`, thêm `screen`)
- Modify: `src/app/hooks/useNavigation.ts` (viết lại phần lọc)
- Modify: `src/app/permissions/test/registry.test.ts` (bỏ `.skip`)
- Test: `src/app/hooks/test/useNavigation.test.tsx`

**Interfaces:**
- Consumes: `grants`, `buildPermissionCode` (Task 1); `SCREENS`, `ScreenId` (Task 2)
- Produces: `ItemTypeCustom` với trường `screen?: ScreenId` thay cho `permission?: string | string[]`

- [ ] **Step 1: Viết test thất bại**

Tạo `src/app/hooks/test/useNavigation.test.tsx`:

```tsx
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { _ROLEMANAGEMENT_V2 } from '@constants/routersConstant'
import useNavigationEw from '../useNavigation'

const wrapperWith = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const childKeysOf = (permissions: string[], groupKey: string): string[] => {
  const { result } = renderHook(() => useNavigationEw(), {
    wrapper: wrapperWith(permissions)
  })
  const group = result.current[0].find((item) => item.key === groupKey)
  return (group?.children ?? []).map((child) => String(child.key))
}

const groupKeysOf = (permissions: string[]): string[] => {
  const { result } = renderHook(() => useNavigationEw(), {
    wrapper: wrapperWith(permissions)
  })
  return result.current[0].map((item) => String(item.key))
}

describe('useNavigationEw', () => {
  it('chỉ giữ menu con mà user có quyền xem', () => {
    expect(childKeysOf(['EWALLET:USER:VIEW'], _ROLEMANAGEMENT_V2)).toEqual([
      'user-account'
    ])
  })

  it('có ROLE:VIEW thì thấy thêm màn quản lý nhóm quyền', () => {
    const keys = childKeysOf(
      ['EWALLET:USER:VIEW', 'EWALLET:ROLE:VIEW'],
      _ROLEMANAGEMENT_V2
    )
    expect(keys).toEqual(['user-account', 'permission-management'])
  })

  it('ẩn hẳn menu cha khi không còn menu con nào', () => {
    expect(groupKeysOf([])).not.toContain(_ROLEMANAGEMENT_V2)
  })

  it('menu của module BE chưa phát hành vẫn hiện', () => {
    expect(groupKeysOf([])).toContain('secure-panel/fee-v4')
  })

  it('super-admin thấy toàn bộ menu', () => {
    expect(groupKeysOf(['EWALLET:ADMIN:FULL'])).toContain(_ROLEMANAGEMENT_V2)
    expect(
      childKeysOf(['EWALLET:ADMIN:FULL'], _ROLEMANAGEMENT_V2)
    ).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/app/hooks/test/useNavigation.test.tsx`
Expected: FAIL — hiện tại `useNavigationEw` lọc theo `permission` nên `['EWALLET:USER:VIEW']` không khớp `['ROLE:FULL','ROLE:VIEW',...]`, menu cha bị ẩn sạch.

- [ ] **Step 3: Sửa `Navigation.tsx`**

Đổi khai báo type ở đầu file:

```ts
import type { ScreenId } from '@/app/permissions'

export type ItemTypeCustom = ItemType & {
  link?: string
  screen?: ScreenId
  children?: ItemTypeCustom[]
}
```

Rồi ở từng item con, thay dòng `permission: [...]` bằng `screen`:

| Item `key` | Thay bằng |
|---|---|
| `fee-managementV4` | `screen: 'FEE_POLICY'` |
| `fee-assignmentV4` | `screen: 'FEE_ASSIGNMENT'` |
| `user-account` | `screen: 'USER_ACCOUNT'` |
| `permission-management` | `screen: 'ROLE_MANAGEMENT'` |
| `role-management` | `screen: 'PERMISSION_MANAGEMENT'` |
| `e-walletManagement` | `screen: 'EWALLET_MANAGEMENT'` |
| `confirm-eKYC` | `screen: 'CONFIRM_EKYC'` |
| `transaction-wallet` | `screen: 'TRANSACTION_WALLET'` |
| `frozen-transactions` | `screen: 'FROZEN_TRANSACTIONS'` |
| `system-ledger` | `screen: 'SYSTEM_LEDGER'` |
| `withdraw-history` | `screen: 'WITHDRAW_HISTORY'` |
| `dashboard-merchant` | `screen: 'MERCHANT_DASHBOARD'` |
| `merchant-management` | `screen: 'MERCHANT_MANAGEMENT'` |
| `merchant-order` | `screen: 'MERCHANT_ORDER'` |

Chú ý cặp đấu chéo: `key: 'permission-management'` → `'ROLE_MANAGEMENT'`, `key: 'role-management'` → `'PERMISSION_MANAGEMENT'`. Đúng theo `routes.ts:161-179`.

Xoá luôn khối `refund-management` đang comment ở dòng 202-213 (dead code, `.claude/rules/06-naming-structure.md` cấm giữ).

- [ ] **Step 4: Viết lại `useNavigation.ts`**

Thay toàn bộ nội dung file:

```ts
import {
  navigationItems,
  type ItemTypeCustom
} from '@components/layout/components/Navigation'
import { buildPermissionCode, grants, SCREENS } from '@/app/permissions'
import { useAppSelector } from './hook'
import { useMemo } from 'react'

/** Item không khai `screen` được coi là công khai. */
const isVisible = (
  item: ItemTypeCustom,
  permissions: readonly string[]
): boolean => {
  if (!item.screen) return true

  const screen = SCREENS[item.screen]
  return grants(permissions, buildPermissionCode(screen.module, screen.view))
}

/** Menu cha không còn con nào thì ẩn cả cha. */
const filterNavigation = (
  items: readonly ItemTypeCustom[],
  permissions: readonly string[]
): ItemTypeCustom[] =>
  items.reduce<ItemTypeCustom[]>((visible, item) => {
    if (!item.children?.length) {
      if (isVisible(item, permissions)) visible.push(item)
      return visible
    }

    const children = item.children.filter((child) =>
      isVisible(child, permissions)
    )
    if (children.length > 0) visible.push({ ...item, children })

    return visible
  }, [])

const useNavigationEw = (): [ItemTypeCustom[]] => {
  const permissions = useAppSelector(
    (state) => state.auth.profile.permissions
  )

  const navigation = useMemo(
    () => filterNavigation(navigationItems, permissions),
    [permissions]
  )

  return [navigation]
}

export default useNavigationEw
```

Hook cũ trả `[navigation, getNavigation]` nhưng `SideBar.tsx:33` chỉ lấy phần tử đầu và phải `as [ItemTypeCustom[], unknown]` để ép kiểu. Trả một phần tử thì bỏ được assertion đó.

- [ ] **Step 5: Dọn `SideBar.tsx`**

Dòng 33 đổi thành:

```ts
const [navigation] = useNavigationEw()
```

Xoá `as [ItemTypeCustom[], unknown]`. Nếu `ItemTypeCustom` không còn được dùng chỗ nào khác trong file thì bỏ luôn import ở dòng 19 — kiểm tra bằng `grep -n "ItemTypeCustom" src/components/layout/SideBar.tsx` trước khi xoá.

- [ ] **Step 6: Bật lại test sidebar trong `registry.test.ts`**

Đổi `describe.skip('sidebar khớp registry', ...)` về `describe(...)`, xoá comment `// bật lại ở Task 5`.

- [ ] **Step 7: Chạy test**

Run: `npx vitest run src/app/hooks/test/useNavigation.test.tsx src/app/permissions/test/registry.test.ts`
Expected: PASS cả hai file, gồm cả nhóm `sidebar khớp registry`.

- [ ] **Step 8: Typecheck và commit**

```bash
npm run typecheck
git add src/components/layout/components/Navigation.tsx src/app/hooks/useNavigation.ts src/components/layout/SideBar.tsx src/app/hooks/test/useNavigation.test.tsx src/app/permissions/test/registry.test.ts
git commit -m "feat(permissions): sidebar lọc menu theo registry"
```

---

## Task 6: `routes.ts` dùng chung hằng path của registry

**Files:**
- Modify: `src/routes.ts:82-183` (nhánh `feeManagementV4`, `roleManagementV2`), `:185-234` (`walletAdministration`), `:236-303` (`merchantManagement`), `:305-385` (`transactionManagement`)

**Interfaces:**
- Consumes: `SCREENS` (Task 2)
- Produces: không có API mới

Mục đích: xoá bản sao thứ hai của chuỗi path, để đổi path chỉ phải sửa registry.

- [ ] **Step 1: Thêm import**

```ts
import { SCREENS } from '@/app/permissions'
```

- [ ] **Step 2: Thay chuỗi ghép tay bằng hằng registry**

Ví dụ nhánh fee (dòng 91-108):

```ts
// cũ
path: FEEMANAGEMENT_V4 + '/fee-managementV4',
...
path: FEEMANAGEMENT_V4 + '/fee-managementV4/:mode',
...
path: FEEMANAGEMENT_V4 + '/fee-managementV4/:mode/:id',

// mới
path: SCREENS.FEE_POLICY.path,
...
path: `${SCREENS.FEE_POLICY.path}/:mode`,
...
path: `${SCREENS.FEE_POLICY.path}/:mode/:id`,
```

Áp dụng cùng cách cho toàn bộ 14 màn:

| Route hiện tại | Thay bằng |
|---|---|
| `FEEMANAGEMENT_V4 + '/fee-assignmentV4'` (+ `/create`, `/:mode/:id`) | `SCREENS.FEE_ASSIGNMENT.path` |
| `ROLEMANAGEMENT_V2 + '/user-account'` | `SCREENS.USER_ACCOUNT.path` |
| `ROLEMANAGEMENT_V2 + '/permission-management'` | `SCREENS.ROLE_MANAGEMENT.path` |
| `ROLEMANAGEMENT_V2 + '/role-management'` | `SCREENS.PERMISSION_MANAGEMENT.path` |
| `WALLETADMINISTRATION + '/e-walletManagement'` (+ `/:id`) | `SCREENS.EWALLET_MANAGEMENT.path` |
| `WALLETADMINISTRATION + '/confirm-eKYC'` | `SCREENS.CONFIRM_EKYC.path` |
| `WALLETADMINISTRATION + '/transaction-wallet'` | `SCREENS.TRANSACTION_WALLET.aliasPaths[0]` |
| `MERCHANT + '/dashboard-merchant'` | `SCREENS.MERCHANT_DASHBOARD.path` |
| `MERCHANT + '/merchant-management'` (+ `/create`, `/create/:id`, `/detail/:id`, `/:id`) | `SCREENS.MERCHANT_MANAGEMENT.path` |
| `MERCHANT + '/merchant-order'` (+ `/qr/:id`) | `SCREENS.MERCHANT_ORDER.path` |
| `TRANSACTIONMANAGEMENT + '/transaction-wallet'` (+ `/:id`) | `SCREENS.TRANSACTION_WALLET.path` |
| `TRANSACTIONMANAGEMENT + '/frozen-transactions'` | `SCREENS.FROZEN_TRANSACTIONS.path` |
| `TRANSACTIONMANAGEMENT + '/system-ledger'` (+ `/:id`) | `SCREENS.SYSTEM_LEDGER.path` |
| `TRANSACTIONMANAGEMENT + '/withdraw-history'` | `SCREENS.WITHDRAW_HISTORY.path` |

Route `TRANSACTIONMANAGEMENT + '/refund-management'` (dòng 345) không có trên sidebar và không có trong registry — **giữ nguyên chuỗi ghép tay**, đừng tự thêm vào registry.

Các hằng `FEEMANAGEMENT_V4`, `ROLEMANAGEMENT_V2`, `WALLETADMINISTRATION`, `MERCHANT`, `TRANSACTIONMANAGEMENT` vẫn dùng cho `path` của route cha nên giữ nguyên import.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: không lỗi. `aliasPaths[0]` truy cập được vì `as const satisfies` giữ tuple readonly.

- [ ] **Step 4: Chạy app kiểm tra thủ công**

Run: `npm run dev`
Kiểm: đăng nhập, bấm qua từng mục sidebar, xác nhận URL không đổi so với trước và trang render đúng.

- [ ] **Step 5: Commit**

```bash
git add src/routes.ts
git commit -m "refactor(routes): dùng chung hằng path từ permissions registry"
```

---

## Task 7: Nút hành động màn Quản lý tài khoản Admin

**Files:**
- Modify: `src/pages/role-management-V2/user-management/UserManagement.tsx:17-25`
- Modify: `src/pages/role-management-V2/user-management/columns/UserManagement.column.tsx:130-165`
- Modify: `src/pages/role-management-V2/user-management/constants/userAccount.ts` (xoá `CREATE_ADMIN_USER_PERMISSION`)
- Test: `src/pages/role-management-V2/user-management/columns/test/UserManagement.column.test.tsx`

**Interfaces:**
- Consumes: `Can`, `useScreenAccess` (Task 3)
- Produces: không có API mới

Cột hiện render ba nút qua `openModal`: `viewDetail` (dòng 138), `assignRoles` (dòng 147), `resetPassword` (dòng 156).

- [ ] **Step 1: Viết test thất bại**

Tạo `src/pages/role-management-V2/user-management/columns/test/UserManagement.column.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { UserInfor } from '@type/userManagement'
import { getUserManagementColumn } from '../UserManagement.column'

const user = {
  id: '1',
  username: 'nguyenvana',
  firstName: 'Nguyen',
  lastName: 'Van A',
  email: 'a@example.com',
  emailVerified: true,
  enabled: true
} as unknown as UserInfor

const renderColumns = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <Table
        rowKey='id'
        dataSource={[user]}
        pagination={false}
        columns={getUserManagementColumn({ openModal: vi.fn() })}
      />
    </Provider>
  )
}

describe('cột thao tác của Quản lý tài khoản Admin', () => {
  it('chỉ có VIEW thì chỉ thấy nút xem chi tiết', () => {
    renderColumns(['EWALLET:USER:VIEW'])

    expect(screen.getByLabelText('Xem chi tiết')).toBeInTheDocument()
    expect(screen.queryByLabelText('Gán nhóm quyền')).toBeNull()
    expect(screen.queryByLabelText('Đặt lại mật khẩu')).toBeNull()
  })

  it('có UPDATE thì thấy đủ ba nút', () => {
    renderColumns(['EWALLET:USER:VIEW', 'EWALLET:USER:UPDATE'])

    expect(screen.getByLabelText('Xem chi tiết')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Đặt lại mật khẩu')).toBeInTheDocument()
  })

  it('super-admin thấy đủ ba nút', () => {
    renderColumns(['EWALLET:ADMIN:FULL'])

    expect(screen.getByLabelText('Gán nhóm quyền')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/pages/role-management-V2/user-management/columns/test/UserManagement.column.test.tsx`
Expected: FAIL — cả ba nút đều hiện với mọi bộ quyền, và có thể thiếu `aria-label`.

- [ ] **Step 3: Bọc nút bằng `<Can>` trong file cột**

Thêm import:

```tsx
import { Can } from '@/app/permissions'
```

Bọc từng nút, đồng thời thêm `aria-label` (`.claude/rules/02-components.md` yêu cầu a11y):

```tsx
<Can screen='USER_ACCOUNT' action='viewDetail'>
  <ButtonComponent
    aria-label='Xem chi tiết'
    ...
    onClick={() => openModal('viewDetail', record)}
  />
</Can>
<Can screen='USER_ACCOUNT' action='assignRoles'>
  <ButtonComponent
    aria-label='Gán nhóm quyền'
    ...
    onClick={() => openModal('assignRoles', record)}
  />
</Can>
<Can screen='USER_ACCOUNT' action='resetPassword'>
  <ButtonComponent
    aria-label='Đặt lại mật khẩu'
    ...
    onClick={() => openModal('resetPassword', record)}
  />
</Can>
```

Giữ nguyên `TooltipComponent` bao ngoài nếu đang có — `<Can>` đặt **ngoài cùng** để khi ẩn thì tooltip cũng biến mất.

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/pages/role-management-V2/user-management/columns/test/UserManagement.column.test.tsx`
Expected: PASS — 3 test.

- [ ] **Step 5: Đổi `UserManagement.tsx` sang `useScreenAccess`**

```tsx
// cũ (dòng 17-26)
import usePermissionCheck from '@hooks/usePermissionCheck'
import {
  CREATE_ADMIN_USER_FORM_ID,
  CREATE_ADMIN_USER_PERMISSION
} from './constants/userAccount'
...
const { hasPermission } = usePermissionCheck()
const canCreateUser = hasPermission(CREATE_ADMIN_USER_PERMISSION)

// mới
import { useScreenAccess } from '@/app/permissions'
import { CREATE_ADMIN_USER_FORM_ID } from './constants/userAccount'
...
const { can } = useScreenAccess('USER_ACCOUNT')
const canCreateUser = can('create')
```

Phần truyền `canAdd={canCreateUser}` xuống `FormSearchUser` giữ nguyên.

- [ ] **Step 6: Xoá constant thừa**

Trong `src/pages/role-management-V2/user-management/constants/userAccount.ts`, xoá dòng:

```ts
export const CREATE_ADMIN_USER_PERMISSION = 'EWALLET:USER:CREATE';
```

- [ ] **Step 7: Kiểm tra không còn tham chiếu**

Run: `grep -rn "CREATE_ADMIN_USER_PERMISSION" src || echo "sạch"`
Expected: in ra `sạch`.

- [ ] **Step 8: Typecheck, chạy test màn, commit**

```bash
npm run typecheck
npx vitest run src/pages/role-management-V2/user-management
git add src/pages/role-management-V2/user-management
git commit -m "feat(permissions): gắn quyền cho nút màn quản lý tài khoản admin"
```

---

## Task 8: Nút hành động màn Nhóm quyền và màn Quyền

**Files:**
- Modify: `src/pages/role-management-V2/role-management/RoleManagement.tsx:95`
- Modify: `src/pages/role-management-V2/role-management/columns/RoleManagement.column.tsx:53,62,71,80,89`
- Modify: `src/pages/role-management-V2/role-management/components/FormSearchRole.tsx:15,18,59`
- Modify: `src/pages/role-management-V2/permission-management/PermissionManagement.tsx:61-63`
- Modify: `src/pages/role-management-V2/permission-management/components/FormSearchPermission.tsx`
- Modify: `src/pages/role-management-V2/permission-management/columns/PermissionManagement.column.tsx:59,68`
- Test: `src/pages/role-management-V2/role-management/columns/test/RoleManagement.column.test.tsx`
- Test: `src/pages/role-management-V2/permission-management/columns/test/PermissionManagement.column.test.tsx`

**Interfaces:**
- Consumes: `Can`, `useScreenAccess` (Task 3)
- Produces: không có API mới

Ánh xạ (chú ý đấu chéo thư mục): thư mục `role-management/` → `SCREENS.ROLE_MANAGEMENT`; thư mục `permission-management/` → `SCREENS.PERMISSION_MANAGEMENT`.

- [ ] **Step 1: Viết test thất bại cho cột Role**

Tạo `src/pages/role-management-V2/role-management/columns/test/RoleManagement.column.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { DataRoleItem } from '@type/roleManagement'
import { getRoleManagementColumn } from '../RoleManagement.column'

const role = {
  id: '1',
  name: 'ROLE_ADMIN',
  description: 'Quản trị'
} as unknown as DataRoleItem

const renderColumns = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <Table
        rowKey='id'
        dataSource={[role]}
        pagination={false}
        columns={getRoleManagementColumn({ openModal: vi.fn() })}
      />
    </Provider>
  )
}

describe('cột thao tác của màn Nhóm quyền', () => {
  it('chỉ có VIEW thì ẩn sửa, xoá và gán quyền', () => {
    renderColumns(['EWALLET:ROLE:VIEW'])

    expect(screen.getByLabelText('Xem quyền của nhóm')).toBeInTheDocument()
    expect(screen.getByLabelText('Xem thành viên')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sửa nhóm quyền')).toBeNull()
    expect(screen.queryByLabelText('Xoá nhóm quyền')).toBeNull()
    expect(screen.queryByLabelText('Gán quyền')).toBeNull()
  })

  it('có UPDATE thì hiện sửa và gán quyền, vẫn ẩn xoá', () => {
    renderColumns(['EWALLET:ROLE:VIEW', 'EWALLET:ROLE:UPDATE'])

    expect(screen.getByLabelText('Sửa nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán quyền')).toBeInTheDocument()
    expect(screen.queryByLabelText('Xoá nhóm quyền')).toBeNull()
  })

  it('ROLE:FULL thì hiện đủ năm nút', () => {
    renderColumns(['EWALLET:ROLE:FULL'])

    expect(screen.getByLabelText('Xoá nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán quyền')).toBeInTheDocument()
  })
})
```

Chữ ký thật: `getRoleManagementColumn({ openModal, currentUserRoles? }: Props)` — `currentUserRoles` không bắt buộc nên test không cần truyền.

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/pages/role-management-V2/role-management/columns/test/RoleManagement.column.test.tsx`
Expected: FAIL — mọi nút đều hiện.

- [ ] **Step 3: Bọc `<Can>` cho cột Role**

`import { Can } from '@/app/permissions'`, rồi bọc kèm `aria-label`:

| Dòng | `openModal(...)` | Bọc bằng | `aria-label` |
|---|---|---|---|
| 53 | `'edit'` | `<Can screen='ROLE_MANAGEMENT' action='edit'>` | `Sửa nhóm quyền` |
| 62 | `'viewPermissions'` | `action='viewPermissions'` | `Xem quyền của nhóm` |
| 71 | `'viewMembers'` | `action='viewMembers'` | `Xem thành viên` |
| 80 | `'delete'` | `action='delete'` | `Xoá nhóm quyền` |
| 89 | `'assignPermissions'` | `action='assignPermissions'` | `Gán quyền` |

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/pages/role-management-V2/role-management/columns/test/RoleManagement.column.test.tsx`
Expected: PASS — 3 test.

- [ ] **Step 5: Nút "Thêm mới" của màn Role**

`FormSearchRole` hiện **chưa có** prop `canAdd` — chỉ có `onSearch`, `roleOptions`, `onAdd`. Thêm prop mới theo đúng khuôn `FormSearchUser.tsx:25,28,77`:

```tsx
// FormSearchRole.tsx — interface Props (dòng 15)
  onAdd: () => void
  canAdd: boolean

// tham số (dòng 18)
const FormSearchRole = ({ onSearch, roleOptions, onAdd, canAdd }: Props) => {

// nút thêm mới (dòng 59) — bọc điều kiện
{canAdd && (
  <ButtonComponent ... onClick={onAdd} />
)}
```

Trong `RoleManagement.tsx`:

```tsx
import { useScreenAccess } from '@/app/permissions'
...
const { can } = useScreenAccess('ROLE_MANAGEMENT')
```

Dòng 95 thêm `canAdd={can('create')}` vào `<FormSearchRole ... />`.

Lưu ý: dòng 81 và khối `ButtonComponent` quanh dòng 100 nằm **trong comment**, không phải code sống. Xoá luôn hai khối comment đó (dead code).

- [ ] **Step 6: Viết test thất bại cho cột Permission**

Tạo `src/pages/role-management-V2/permission-management/columns/test/PermissionManagement.column.test.tsx`, cùng khuôn với Step 1 nhưng:
- import `getPermissionManagementColumns` (số nhiều) từ `../PermissionManagement.column`; chữ ký `({ openModal }: Props)`
- dữ liệu mẫu: `{ id: '1', name: 'EWALLET:USER:VIEW', description: 'Xem user' }`
- quyền dùng module `PERMISSION`

```tsx
describe('cột thao tác của màn Quyền', () => {
  it('chỉ có VIEW thì ẩn cả sửa lẫn xoá', () => {
    renderColumns(['EWALLET:PERMISSION:VIEW'])

    expect(screen.queryByLabelText('Sửa quyền')).toBeNull()
    expect(screen.queryByLabelText('Xoá quyền')).toBeNull()
  })

  it('có UPDATE thì hiện sửa, vẫn ẩn xoá', () => {
    renderColumns(['EWALLET:PERMISSION:UPDATE'])

    expect(screen.getByLabelText('Sửa quyền')).toBeInTheDocument()
    expect(screen.queryByLabelText('Xoá quyền')).toBeNull()
  })

  it('PERMISSION:FULL thì hiện cả hai', () => {
    renderColumns(['EWALLET:PERMISSION:FULL'])

    expect(screen.getByLabelText('Sửa quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Xoá quyền')).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/pages/role-management-V2/permission-management/columns/test/PermissionManagement.column.test.tsx`
Expected: FAIL.

- [ ] **Step 8: Bọc `<Can>` cho cột Permission và nút thêm mới**

- Dòng 59 (`openModal('edit', record)`) → `<Can screen='PERMISSION_MANAGEMENT' action='edit'>`, `aria-label='Sửa quyền'`
- Dòng 68 (`openModal('delete', record)`) → `action='delete'`, `aria-label='Xoá quyền'`
- `FormSearchPermission.tsx` — thêm prop `canAdd: boolean` và bọc nút thêm mới bằng `{canAdd && (...)}`, y như Step 5 làm với `FormSearchRole`
- `PermissionManagement.tsx` — `const { can } = useScreenAccess('PERMISSION_MANAGEMENT')`, thêm `canAdd={can('create')}` vào `<FormSearchPermission />` ở dòng 61-63

- [ ] **Step 9: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/pages/role-management-V2`
Expected: PASS toàn bộ.

- [ ] **Step 10: Typecheck và commit**

```bash
npm run typecheck
git add src/pages/role-management-V2/role-management src/pages/role-management-V2/permission-management
git commit -m "feat(permissions): gắn quyền cho nút màn nhóm quyền và màn quyền"
```

---

## Task 9: Nút hành động màn Phí và gỡ `usePermissionCheck`

**Files:**
- Modify: `src/pages/fee-management-v4/fee-management/FeeManagement.tsx:16,22-27`
- Modify: `src/pages/fee-management-v4/fee-management/columns/FeeManagement.column.tsx:107-135`
- Modify: `src/pages/fee-management-v4/fee-assignment/columns/FeeAssignmentManagement.column.tsx:26,31,102,114,117`
- Modify: `src/pages/fee-management-v4/fee-assignment/hook/useHandleFeeAssignment.tsx:77,140,141`
- Delete: `src/app/hooks/usePermissionCheck.ts`
- Test: `src/pages/fee-management-v4/fee-management/columns/test/FeeManagement.column.test.tsx`

**Interfaces:**
- Consumes: `Can`, `useScreenAccess` (Task 3)
- Produces: không có API mới

Hiện `FeeManagement.tsx:23` tự ghép mảng `['EWALLET:FEE:UPDATE', 'FEE:UPDATE', 'ADMIN:FULL']` rồi truyền `canApprove` xuống cột. Thay bằng registry; module `FEE` chưa phát hành nên kết quả vẫn là hiện nút — hành vi không đổi, chỉ bớt chuỗi viết tay.

- [ ] **Step 1: Viết test thất bại**

Tạo `src/pages/fee-management-v4/fee-management/columns/test/FeeManagement.column.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { FeePolicy } from '../../types/FeeManagement.type'
import { getColumnFeePolicy } from '../FeeManagement.column'

const policy = {
  id: 'fee-1',
  name: 'Phí chuyển tiền',
  status: 'ACTIVE'
} as unknown as FeePolicy

const renderColumns = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Table
          rowKey='id'
          dataSource={[policy]}
          pagination={false}
          columns={getColumnFeePolicy({
            navigate: vi.fn(),
            handleActive: vi.fn(),
            handleInactive: vi.fn(),
            isLoadingPatchActivateFee: false,
            isLoadingPatchDeactivateFee: false,
            loadingId: ''
          })}
        />
      </MemoryRouter>
    </Provider>
  )
}

describe('cột thao tác của màn Chính sách phí', () => {
  it('module FEE chưa phát hành nên vẫn hiện nút dù không có quyền', () => {
    renderColumns([])
    expect(screen.getByLabelText('Sửa chính sách')).toBeInTheDocument()
  })

  it('super-admin vẫn thấy nút', () => {
    renderColumns(['EWALLET:ADMIN:FULL'])
    expect(screen.getByLabelText('Sửa chính sách')).toBeInTheDocument()
  })
})
```

Chú ý: prop `canApprove` đã bị bỏ khỏi chữ ký ở Step 3, nên test không truyền nữa.

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/pages/fee-management-v4/fee-management/columns/test/FeeManagement.column.test.tsx`
Expected: FAIL — chữ ký hiện tại còn bắt buộc `canApprove`, và nút chưa có `aria-label`.

- [ ] **Step 3: Sửa cột phí**

- Bỏ `canApprove: boolean` khỏi `interface Props` (dòng 24) và khỏi tham số huỷ cấu trúc (dòng 33).
- Nút sửa (dòng 107): thêm `aria-label='Sửa chính sách'`, bọc `<Can screen='FEE_POLICY' action='edit'>`.
- Khối `{canApprove && <FeePolicyApprovalAction policy={record} />}` (dòng 117-119) đổi thành:

```tsx
<Can screen='FEE_POLICY' action='approve'>
  <FeePolicyApprovalAction policy={record} />
</Can>
```

- Nút kích hoạt/huỷ kích hoạt (dòng 121): thêm `aria-label={isActive ? 'Hủy kích hoạt' : 'Kích hoạt'}`, bọc `<Can screen='FEE_POLICY' action='toggleActive'>`.

- [ ] **Step 4: Sửa `FeeManagement.tsx`**

Xoá import `usePermissionCheck` (dòng 16), xoá cả khối `const canApprove = hasAnyPermission([...])` (dòng 22-27) và hai lần truyền `canApprove` trong `useMemo` (dòng 37, 46) cùng mục tương ứng trong mảng dependency.

- [ ] **Step 5: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/pages/fee-management-v4`
Expected: PASS.

- [ ] **Step 6: Làm tương tự cho màn Gán phí**

`FeeAssignmentManagement.column.tsx` đang gộp cả ba nút sau **một** cờ `canUpdate` (dòng 102, 114, 117) — cờ này do `useHandleFeeAssignment.tsx:77` tính bằng `hasAnyPermission(['FEE:UPDATE', 'FEE:FULL', 'ADMIN:FULL'])`. Tách ra cho từng nút:

```tsx
// cũ
{canUpdate && (<TooltipComponent title='Cập nhật'>…</TooltipComponent>)}
{canUpdate && (<FeeAssignmentApprovalAction assignment={record} />)}
{canUpdate && (<TooltipComponent title={…}>…</TooltipComponent>)}

// mới
<Can screen='FEE_ASSIGNMENT' action='edit'>
  <TooltipComponent title='Cập nhật'>
    <ButtonComponent aria-label='Cập nhật gán phí' … />
  </TooltipComponent>
</Can>
<Can screen='FEE_ASSIGNMENT' action='approve'>
  <FeeAssignmentApprovalAction assignment={record} />
</Can>
<Can screen='FEE_ASSIGNMENT' action='toggleActive'>
  <TooltipComponent title={record.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}>
    <ButtonComponent
      aria-label={record.status === 'ACTIVE' ? 'Khóa gán phí' : 'Mở khóa gán phí'}
      …
    />
  </TooltipComponent>
</Can>
```

Rồi dọn cờ cũ:
- `FeeAssignmentManagement.column.tsx`: xoá `canUpdate?: boolean` khỏi `interface Props` (dòng 26) và khỏi tham số huỷ cấu trúc (dòng 31).
- `useHandleFeeAssignment.tsx`: xoá dòng 77 (`const canUpdate = hasAnyPermission([...])`), xoá `canUpdate` khỏi object trả về (dòng 140) và khỏi mảng dependency (dòng 141), xoá import `usePermissionCheck`.
- Tìm nơi truyền `canUpdate` xuống cột trong `FeeAssignmentManagement.tsx` và xoá luôn: `grep -n "canUpdate" src/pages/fee-management-v4/fee-assignment/FeeAssignmentManagement.tsx`.

- [ ] **Step 7: Gỡ `usePermissionCheck`**

```bash
grep -rn "usePermissionCheck" src
```

Expected: chỉ còn chính file hook. Ba nơi từng dùng — `UserManagement.tsx` (Task 7), `FeeManagement.tsx` (Step 4), `useHandleFeeAssignment.tsx` (Step 6) — đều đã chuyển. Nếu `grep` còn chỉ ra chỗ khác, chuyển sang `useAccess`/`useScreenAccess` trước rồi mới xoá.

```bash
git rm src/app/hooks/usePermissionCheck.ts
```

- [ ] **Step 8: Kiểm tra sạch chuỗi quyền viết tay**

Run: `grep -rn "EWALLET:" src --include=*.ts --include=*.tsx | grep -v "src/app/permissions" | grep -v ".test."`
Expected: không có kết quả. Nếu còn, chuyển nốt sang registry.

- [ ] **Step 9: Typecheck, chạy toàn bộ test, commit**

```bash
npm run typecheck
npx vitest run
git add src/pages/fee-management-v4 src/app/hooks/usePermissionCheck.ts
git commit -m "feat(permissions): gắn quyền cho màn phí và gán phí, gỡ usePermissionCheck"
```

---

## Task 10: Nút hành động màn Ví điện tử và Merchant

**Files:**
- Modify: `src/pages/wallet-administration/e-walletManagement/columns/Column.tsx:240-285`
- Modify: `src/pages/merchant-management/merchanr-management/MerchantManagement.tsx`
- Test: `src/pages/wallet-administration/e-walletManagement/columns/test/Column.test.tsx`

**Interfaces:**
- Consumes: `useScreenAccess` (Task 3)
- Produces: không có API mới

Màn ví dùng `DropDownComponent` với `items: MenuProps['items']` — đây là **mảng dữ liệu, không phải JSX**, nên `<Can>` không dùng được. Lọc mảng bằng `can()`.

- [ ] **Step 1: Viết test thất bại**

Tạo `src/pages/wallet-administration/e-walletManagement/columns/test/Column.test.tsx`. Vì menu nằm trong dropdown antd (chỉ render khi mở), test gọi thẳng hàm dựng cột và kiểm tra mảng `items`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { useWalletRowActions } from '../Column'

const wrapperWith = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const labelsFor = (permissions: string[]): string[] => {
  const { result } = renderHook(() => useWalletRowActions(vi.fn()), {
    wrapper: wrapperWith(permissions)
  })
  const record = {
    id: '1',
    status: 'ACTIVE',
    ownerType: 'USER',
    balance: 1000
  }
  return result
    .current(record as Parameters<typeof result.current>[0])
    .map((item) => String(item?.key))
}

describe('menu thao tác của màn Ví điện tử', () => {
  it('module WALLET chưa phát hành nên giữ đủ menu', () => {
    expect(labelsFor([])).toEqual(['1', '2', '3', '5'])
  })
})
```

Nếu việc tách hook `useWalletRowActions` làm file cột vượt 300 dòng hoặc phá cấu trúc hiện tại, thay bằng cách đơn giản hơn: nhận `can` như một prop của hàm dựng cột và test hàm đó trực tiếp, không cần hook. Chọn phương án nào cũng được, miễn `Column.tsx` giữ dưới 300 dòng.

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npx vitest run src/pages/wallet-administration/e-walletManagement/columns/test/Column.test.tsx`
Expected: FAIL — chưa có export tương ứng.

- [ ] **Step 3: Lọc menu theo quyền**

Trong `Column.tsx`, mỗi mục menu gắn thêm điều kiện rồi lọc:

```ts
const items: MenuProps['items'] = [
  can('viewDetail') && { key: '1', label: 'Xem chi tiết', onClick: ... },
  can('lock') && { key: '2', label: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản', ... },
  can('freeze') && { key: '3', label: 'Đóng băng số dư', ... },
  can('cancel') && { key: '5', label: 'Hủy ví', danger: true }
].filter(Boolean) as MenuProps['items']
```

Thay `as MenuProps['items']` bằng type guard để khỏi vi phạm rule cấm `as`:

```ts
const isMenuItem = <T,>(item: T | false): item is T => item !== false
// ...
].filter(isMenuItem)
```

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `npx vitest run src/pages/wallet-administration`
Expected: PASS.

- [ ] **Step 5: Màn Merchant**

Mở `src/pages/merchant-management/merchanr-management/MerchantManagement.tsx`, tìm nút thêm mới và các nút trong cột, bọc bằng `<Can screen='MERCHANT_MANAGEMENT' action='create' | 'edit' | 'viewDetail'>` kèm `aria-label`. Cách làm y hệt Task 7 Step 3.

- [ ] **Step 6: Typecheck, chạy toàn bộ test, commit**

```bash
npm run typecheck
npx vitest run
git add src/pages/wallet-administration src/pages/merchant-management
git commit -m "feat(permissions): gắn quyền cho màn ví điện tử và merchant"
```

---

## Task 11: Rà soát cuối và tài liệu

**Files:**
- Create: `src/app/permissions/README.md`
- Modify: `docs/superpowers/specs/2026-08-06-permission-registry-design.md` (đánh dấu đã hoàn thành)

- [ ] **Step 1: Kiểm tra không còn cơ chế cũ**

```bash
grep -rn "usePermission\b\|usePermissionCheck\|MappingRouterPermission" src || echo "sạch"
grep -rn "EWALLET:" src --include=*.ts --include=*.tsx | grep -v "src/app/permissions" | grep -v ".test." || echo "sạch"
```

Expected: cả hai in ra `sạch`.

- [ ] **Step 2: Chạy toàn bộ kiểm tra**

```bash
npm run typecheck
npm run lint
npx vitest run
```

Expected: cả ba pass, không cảnh báo.

- [ ] **Step 3: Viết `src/app/permissions/README.md`**

```markdown
# Phân quyền

Mọi quyền của FE khai báo tại đây. Không viết chuỗi `EWALLET:...` ở nơi khác.

## Thêm màn mới

1. Thêm entry vào `SCREENS` trong `registry.ts`: `path`, `module`, `view`, `actions`.
2. `routes.ts` dùng `SCREENS.<id>.path` cho route của màn.
3. Sidebar (`Navigation.tsx`) trỏ `screen: '<id>'`.

## Đổi quyền của một nút

Sửa đúng một dòng trong `actions` của màn đó. Không đụng tới màn hay component.

## Khi BE phát hành quyền cho module mới

Thêm module vào `RELEASED_MODULES` trong `modules.ts`. Trước đó module không bị
chặn; sau đó bị chặn theo đúng `view`/`actions` đã khai.

## Dùng trong component

```tsx
const { canView, can } = useScreenAccess('USER_ACCOUNT')

<Can screen='USER_ACCOUNT' action='create'>
  <ButtonComponent aria-label='Thêm tài khoản' ... />
</Can>
```

Thiếu quyền thì `<Can>` không render gì (quyết định thiết kế: ẩn, không disable).
```

- [ ] **Step 4: Kiểm thử thủ công**

Run: `npm run dev`

Lần lượt xác nhận:
1. Đăng nhập bằng tài khoản chỉ có `EWALLET:USER:VIEW` → sidebar chỉ còn mục Quản lý tài khoản; nút Thêm mới, Gán nhóm quyền, Đặt lại mật khẩu đều ẩn.
2. Gõ tay URL `/secure-panel/role-v2/role-management` → bị đẩy về `/secure-panel/forbidden`.
3. Đăng nhập super-admin → thấy đủ sidebar và mọi nút.
4. Menu Phí / Ví / Giao dịch / Merchant vẫn hiện với mọi tài khoản (module chưa phát hành).

- [ ] **Step 5: Đánh dấu spec đã xong**

Thêm dòng ngay dưới tiêu đề spec:

```markdown
> **Trạng thái:** đã hiện thực hoá — xem `docs/superpowers/plans/2026-08-06-permission-registry.md`.
```

- [ ] **Step 6: Commit**

```bash
git add src/app/permissions/README.md docs/superpowers/specs/2026-08-06-permission-registry-design.md
git commit -m "docs(permissions): hướng dẫn dùng registry và chốt trạng thái spec"
```
