# Thiết kế: Màn Tài khoản ngân hàng (ĐVCNTT)

**Ngày:** 2026-09-03
**Phạm vi:** `src/pages/merchant-management/merchant-management/bank-account/` — dựng mới màn danh sách tài khoản ngân hàng nhận quyết toán, kèm 3 modal (Thêm mới · Cập nhật · Khóa/Mở khóa). Cộng 4 file khai báo ở tầng app (`routes.ts`, `permissions/registry.ts`, `Navigation.tsx`, `headerTitle.json`).
**Mục tiêu:** dựng **UI thuần** khớp mockup và khớp design system hiện tại. Dữ liệu là mock tĩnh; không đấu API trong phase này.
**Tham chiếu UI:** `~/Downloads/Website quản trị ví điện tử/Quản trị Merchant.dc.html`
- màn `bankAccounts` — dòng 856–917
- modal `isBankModal` (2.6.8 / 2.6.9) — dòng 1087
- modal `isBankLockModal` — dòng 1128–1142
- tiêu đề modal — dòng 1465, 1472

---

## 1. Bối cảnh

Thư mục `src/pages/merchant-management/merchant-management/` vừa được tách theo nhóm màn ĐVCNTT của mockup:

```
merchant-management/
├── merchant/          ← màn danh sách merchant (đã có, routes.ts đã trỏ đúng)
├── bank-account/      ← RỖNG — phạm vi tài liệu này
├── connect-key/       ← rỗng, phase sau
├── noti-config/       ← rỗng, phase sau
└── payment-method/    ← rỗng, phase sau
```

Màn tham chiếu gần nhất về kiến trúc là `business-wallet-account/` (list + search + table 4 trạng thái + columns factory + `Can`). Màn tham chiếu gần nhất về modal-có-form là `src/components/freeze/UnfreezeRequestDialog.tsx`.

## 2. Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| 1 | **Dữ liệu mock tĩnh**, không gọi API | Yêu cầu là dựng UI. Hook `useBankAccount` trả đúng shape của `useBusinessWallet` để sau này thay ruột bằng RTK Query mà không đụng component nào. |
| 2 | **Màn độc lập**: route + entry quyền + mục sidebar + tiêu đề header | Mockup đặt `bankAccounts` là một screen riêng trong nhóm ĐVCNTT (dòng 1396). |
| 3 | **Modal** cho cả Thêm mới, Cập nhật, Khóa — không dùng page | Mockup vẽ dạng modal. Form 9 field, vừa một modal 720px. Khác với `business-wallet` (5 section / 16 field / 4 upload) nên chọn page. |
| 4 | **Giữ nguyên section I "Phạm vi áp dụng"** (Master + Sub override) | Bám mockup 100%. Dự án chưa có khái niệm sub-merchant ở đâu — hai select đổ từ danh sách mock, khi có dữ liệu thật chỉ đổi nguồn options. |
| 5 | **Số tài khoản masked + nút mắt gated bằng quyền** | Mockup ghi rõ "Số TK hiển thị che (masked), chỉ vai trò có quyền xem đầy đủ (NĐ 13/2023)". Khớp `05-security.md` §"Dữ liệu nhạy cảm trên UI". |
| 6 | **Viết `BankAccountNumberCell` riêng, KHÔNG dùng `MaskText`** | Wrapper `src/components/ui/mask-text-component/index.tsx` hiện render `{value}` đầy đủ — phần che và nút mắt đều bị comment. Sửa nó sẽ đổi hành vi các màn đang dùng. Cell mới cục bộ, không rủi ro lan. |
| 7 | **Section trong modal là khung nhẹ** (divider + badge số La Mã + nhãn uppercase), không tái dùng `BusinessWalletFormSection` | Component đó bọc `CardComponent` có viền — hợp với page, nặng khi lồng trong modal. Mockup vẽ divider mảnh. |
| 8 | **Không thêm cột `#` (STT)** | Mockup không có. Bảng đã có 7 cột + thao tác, thêm STT làm chật. |
| 9 | Toàn bộ chuỗi hiển thị viết **tiếng Việt trực tiếp**, không tạo namespace i18n mới | Đúng tiền lệ `business-wallet-account/`. |

## 3. Khai báo ở tầng app

### 3.1 `src/app/permissions/registry.ts`

Thêm entry sau `MERCHANT_MANAGEMENT`:

```ts
MERCHANT_BANK_ACCOUNT: {
  path: `${MERCHANT}/bank-account`,
  module: MODULE.MERCHANT,
  actions: {
    ...DEFAULT_SCREEN_ACTIONS,
    viewDetail: ACTION.VIEW,
    viewFullNumber: ACTION.VIEW,
    lock: ACTION.UPDATE,
    unlock: ACTION.UPDATE
  }
}
```

`viewFullNumber` là action điều khiển nút mắt ở cột Số tài khoản. Không hardcode chuỗi `EWALLET:...` ở đâu ngoài file này.

### 3.2 `src/routes.ts`

Một route con trong `merchantManagement.children[0].children`:

```ts
{
  path: SCREENS.MERCHANT_BANK_ACCOUNT.path,
  element: page(
    () => import('@pages/merchant-management/merchant-management/bank-account/pages/BankAccount')
  )
}
```

### 3.3 `src/components/layout/components/Navigation.tsx`

Thêm vào `merchantManagement.children` (nhóm "Quản lý ĐVCNTT"), sau `merchant-management`:

```ts
{
  key: 'bank-account',
  screen: 'MERCHANT_BANK_ACCOUNT',
  link: `${MERCHANT}/bank-account`,
  icon: <BankIcon size={size} weight={weight} color={COlOR} />,
  label: 'Tài khoản ngân hàng'
}
```

`Navigation.tsx` import icon thẳng từ `@phosphor-icons/react` (không qua barrel) — thêm `BankIcon` vào danh sách import sẵn có ở đầu file. Không thêm thư viện mới, `@phosphor-icons/react` đã là dependency.

Icon dùng trong bảng và modal lấy từ `@components/icons`, đều đã export sẵn: `EditOutlined`, `LockFilled`, `LockKeyOpenIcon`, `EyeOutlined`, `EyeFilled`, `WarningIcon`, `PlusOutlined`, `BankFilled`. Lưu ý icon antd (`*Outlined` / `*Filled`) không nhận prop `size`/`weight`/`color` như icon Phosphor — chỉnh cỡ bằng `className`.

### 3.4 `src/app/languages/vi/headerTitle.json`

```json
"/secure-panel/merchant/bank-account": "Tài khoản ngân hàng"
```

## 4. Mô hình dữ liệu

Nguồn sự thật là Zod (`01-typescript.md` §"Zod là nguồn sự thật type cho data có I/O"), union viết bằng `as const` object.

```ts
export const BankAccountScope   = { MASTER: 'MASTER', SUB: 'SUB' } as const
export const WithdrawMode       = { MANUAL: 'MANUAL', AUTO: 'AUTO' } as const
export const WithdrawCycle      = { T0:'T+0', T1:'T+1', T2:'T+2', T3:'T+3' } as const
export const BankAccountStatus  = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const
export const BankLinkStatus     = {
  LINKED: 'LINKED', PENDING: 'PENDING', FAILED: 'FAILED'
} as const
```

`BankAccountRow`:

| Field | Kiểu | Ghi chú |
|---|---|---|
| `id` | `string` | rowKey |
| `scope` | `BankAccountScope` | tag Master / Sub |
| `merchantName` · `merchantCode` | `string` | "Highlands Coffee" · "MC000142" |
| `bankCode` · `bankName` | `string` | "VCB" · "Vietcombank" |
| `accountNumber` | `string` | số đầy đủ, cell tự che |
| `accountName` | `string` | có thể là `"(Kế thừa Master)"` |
| `branchName` | `string \| undefined` | |
| `withdrawMode` | `WithdrawMode` | |
| `withdrawCycle` | `WithdrawCycle \| undefined` | chỉ có khi `AUTO` |
| `minAmount` · `maxAmount` | `number \| undefined` | |
| `status` | `BankAccountStatus` | Đang dùng / Ngừng |
| `linkStatus` | `BankLinkStatus` | Đã liên kết / Chờ xác minh / Liên kết thất bại |

Mockup chỉ vẽ hai giá trị trạng thái ("Đang dùng" / "Ngừng") và không có giá trị "Đã khóa" riêng, nên **khóa = chuyển `status` sang `INACTIVE`**, mở khóa = về `ACTIVE`. Nút thao tác trên mỗi dòng đổi theo `status`: `ACTIVE` → nút Khóa (icon `LockFilled`, tone danger); `INACTIVE` → nút Mở khóa (icon `LockKeyOpenIcon`).

Mock 6 dòng lấy đúng dữ liệu mockup: Highlands Coffee/VCB/••••4821/Tự động T+1, HLC Nguyễn Huệ/TCB/••••7734/Thủ công, Pharmacity/BIDV/••••1092/T+2, HLC Landmark 81/VCB/••••4821/(Kế thừa Master), Con Cưng/ACB/••••5567/Thủ công/Ngừng+Chờ xác minh, GS25/MB Bank/••••3341/T+1/Liên kết thất bại.

## 5. Màn danh sách — `pages/BankAccount.tsx`

Khung giống `BusinessWallet.tsx`: `<main>` chứa 2 `CardComponent` — card lọc và card danh sách.

**Header card danh sách:** icon + `<h2>` "Tài khoản ngân hàng" + phụ đề "Tài khoản nhận quyết toán / rút tiền theo cấp Master & Sub · Số TK hiển thị che (masked), chỉ vai trò có quyền xem đầy đủ (NĐ 13/2023)" + badge đếm bản ghi + nút `＋ Thêm mới tài khoản` bọc `<Can screen='MERCHANT_BANK_ACCOUNT' action='create'>`.

**Bộ lọc — `BankAccountSearch.tsx`:** 1 input + 3 select, `grid-cols-1 md:grid-cols-4`.

| Field | Loại | Options |
|---|---|---|
| `keyword` | `FormInput` | placeholder "Tìm theo tên chủ TK / số TK / ngân hàng…" |
| `scope` | `FormSelect` | Tất cả · Master · Sub |
| `status` | `FormSelect` | Tất cả · Đang dùng · Ngừng |
| `linkStatus` | `FormSelect` | Tất cả · Đã liên kết · Chờ xác minh · Liên kết thất bại |

Nút "Xóa bộ lọc" + "Tìm kiếm" như `BusinessWalletSearch`.

**Bảng — `columns/bank-account.columns.tsx`** (factory nhận `{ onEdit, onLock }`):

| Cột | Width | Nội dung |
|---|---|---|
| Cấp áp dụng | 210 | tag Master/Sub + tên merchant + mã (mã dùng `TypographyText copyable`) |
| Ngân hàng | 150 | `bankName` |
| Số tài khoản | 150 | `<BankAccountNumberCell />` |
| Chủ tài khoản | 190 | `accountName`, `TooltipComponent` khi tràn |
| Hình thức rút | 130 | tag "Tự động T+1" / "Thủ công" |
| Trạng thái | 118 | `StatusBadge` — `success-status` Đang dùng · `normal-status` Ngừng |
| Liên kết | 138 | `StatusBadge` — `success-status` Đã liên kết · `warning-status` Chờ xác minh · `danger-status` Liên kết thất bại |
| Thao tác | 90 | nút Sửa (`Can action='edit'`) · nút Khóa/Mở khóa (`Can action='lock'`) |

**`BankAccountNumberCell.tsx`:** mặc định `••••` + 4 số cuối, font `tabular-nums`. Nút mắt chỉ render trong `<Can screen='MERCHANT_BANK_ACCOUNT' action='viewFullNumber'>`; bấm thì `useState` toggle sang số đầy đủ. `aria-label` mô tả rõ, không log giá trị ra console.

**Bốn trạng thái — `BankAccountTableState.tsx`:** sao chép cấu trúc `BusinessWalletTableState` (SkeletonTable · khối lỗi có nút Thử lại · `Empty` có nút Làm mới · `Table`).

## 6. Modal Thêm mới / Cập nhật — `BankAccountFormDialog.tsx`

`DialogModal` width 720 (`{ xs: '95%', md: 720 }`), `destroyOnHidden`, footer tùy biến với `form` id trỏ tới `<form>` bên trong — đúng pattern `UnfreezeRequestDialog`.

Tiêu đề đổi theo mode: `Thêm mới tài khoản ngân hàng` / `Cập nhật tài khoản ngân hàng`.
Nút submit: `Thêm mới` / `Lưu thay đổi`.

Body là `grid grid-cols-1 gap-4 md:grid-cols-2`. Ba section dùng chung `BankAccountFormSection` (props `step: 'I' | 'II' | 'III'`, `title`), render: divider trên + badge vuông bo 7px nền `bg-primary` chữ `text-primary-foreground` + nhãn uppercase `tracking-[0.05em]`, `col-span-full`.

**I. Phạm vi áp dụng**
- `masterMerchantId` — `FormSelect` `showSearch`, bắt buộc. Options mock: Highlands Coffee · MC000142, Pharmacity · MC000151, Con Cưng · MC000163, GS25 Việt Nam · MC000160.
- `subMerchantId` — `FormSelect` `allowClear`, tùy chọn, placeholder "Để trống = kế thừa cấu hình Master".
- Banner mint `col-span-full`: nền `bg-primary/10`, chữ `text-secondary-foreground`, nội dung "Cấu hình áp cho Master và mặc định kế thừa xuống toàn bộ Sub. Chỉ chọn Sub khi muốn thiết lập riêng (override)."

**II. Tài khoản nhận quyết toán**
- `bankCode` — `FormSelect` `showSearch`, bắt buộc. Options mock: Vietcombank (VCB), Techcombank (TCB), BIDV, ACB, MB Bank (MB).
- `accountNumber` — `FormInput`, bắt buộc, placeholder "Chỉ nhập số", helper "Độ dài 6–20 số."
- `accountName` — `FormInput` `col-span-full`, bắt buộc, placeholder "TỰ ĐỘNG VIẾT HOA", `onChange` tự `toUpperCase()`, helper "Phải khớp pháp nhân/chủ ví đã xác thực (KYB/eKYC)."
- `branchName` — `FormInput`, tùy chọn, placeholder "Chi nhánh ngân hàng (nếu có)".

**III. Cấu hình rút tiền**
- `withdrawMode` — 2 card radio `col-span-full`, `flex gap-3`, mỗi card `flex-1`: "Thủ công / Merchant tự tạo lệnh rút" và "Tự động theo chu kỳ / Hệ thống tạo lệnh rút T+n". Card được chọn: viền `border-primary`, nền `bg-primary/10`.
- `withdrawCycle` — `FormSelect` T+0…T+3. Bắt buộc và chỉ enable khi `withdrawMode === 'AUTO'`; khi `MANUAL` thì `disabled` và reset về `undefined`.
- `minAmount` / `maxAmount` — 2 `FormInputNumber` nằm chung một ô nhãn "Hạn mức rút mỗi lệnh (min / max)", format nghìn bằng dấu phẩy như `UnfreezeRequestDialog`.
- Banner vàng `col-span-full`: nền `bg-warning/10` viền `border-warning`, "Thay đổi/thêm tài khoản yêu cầu **xác thực nhạy cảm (OTP/mật khẩu)** và ghi Audit Log (maker–checker)."

**Validate (`bankAccountFormSchema`):**

| Field | Luật | Thông báo |
|---|---|---|
| `masterMerchantId` | bắt buộc | "Vui lòng chọn Master Merchant" |
| `bankCode` | bắt buộc | "Vui lòng chọn ngân hàng" |
| `accountNumber` | `/^\d{6,20}$/` | "Số tài khoản gồm 6–20 chữ số" |
| `accountName` | trim, 1–255 | "Vui lòng nhập tên chủ tài khoản" |
| `withdrawCycle` | bắt buộc **khi** `withdrawMode === 'AUTO'` (`superRefine`) | "Vui lòng chọn chu kỳ rút tự động" |
| `minAmount` / `maxAmount` | `> 0`, và `max >= min` khi cả hai có (`superRefine`, gắn lỗi vào `maxAmount`) | "Hạn mức tối đa phải lớn hơn hạn mức tối thiểu" |

Mode Cập nhật: `defaultValues` lấy từ row đang chọn. Modal `destroyOnHidden` nên form tự sạch mỗi lần đóng.

## 7. Modal Khóa / Mở khóa — `BankAccountLockDialog.tsx`

`DialogModal` width 520, `mode='DELETE'` khi khóa và `mode='CONFIRM'` khi mở khóa.

- Banner đỏ đầu modal: nền `bg-danger/10` viền `border-danger/30`, icon ổ khóa, tiêu đề "Khóa tài khoản ngân hàng nhận quyết toán", mô tả "Tài khoản bị khóa sẽ ngừng nhận quyết toán / rút tiền cho tới khi mở lại · Yêu cầu xác thực nhạy cảm & ghi Audit Log."
- Hai ô tóm tắt `flex gap-3` (xuống 1 cột ở mobile): "Ngân hàng · Chủ TK" → `Vietcombank · NGUYEN VAN HAI`; "Số tài khoản · Cấp" → `••••4821 · Master`. Ô tóm tắt **luôn masked**, không có nút mắt.
- `reason` — `FormTextArea` bắt buộc, `rows={4}`, placeholder "Bắt buộc — nêu lý do khóa tài khoản (tối thiểu 10 ký tự)…", validate `.trim().min(10)`.
- Banner vàng cuối: "Thao tác yêu cầu **xác thực nhạy cảm (OTP / mật khẩu)** trước khi áp dụng."

Mở khóa dùng lại đúng component này: đổi tiêu đề thành "Xác nhận mở khóa tài khoản ngân hàng", banner sang tông xanh, nhãn field thành "Lý do mở khóa".

## 8. Hook

| Hook | Trách nhiệm | Trần dòng |
|---|---|---|
| `useBankAccount.ts` | mock rows + lọc client-side + phân trang (`usePagination`) + state `dialog: { kind: 'form' \| 'lock', mode, row } \| null`. Trả đúng shape `useBusinessWallet` (`rows, totalElements, page, size, isLoading, isFetching, isError, handleSearch, handlePageChange, refetch`). Giả `isLoading` 400ms lần mount đầu. | < 80 |
| `useBankAccountForm.ts` | `useForm` + `zodResolver` + `defaultValues` theo mode + reset `withdrawCycle` khi đổi sang `MANUAL` + `submit` (mock: đóng modal, `useMessage` báo thành công) | < 80 |
| `useBankAccountLock.ts` | `useForm` cho `reason` + `submit` mock | < 50 |

Vì chưa có API, `submit` **không** gọi mutation nào; chỉ `onSuccess()` và hiện message. Điểm này ghi comment rõ để lần cắm API biết sửa ở đâu.

## 9. Test

| File | Nội dung |
|---|---|
| `schemas/test/bank-account.schema.test.ts` | số TK 5 số / 21 số / có chữ → lỗi; `withdrawCycle` bắt buộc khi AUTO, bỏ qua khi MANUAL; `maxAmount < minAmount` → lỗi; `reason` 9 ký tự → lỗi |
| `test/BankAccount.test.tsx` | render đủ 6 dòng mock; lọc theo scope thu hẹp danh sách; bấm "Thêm mới" mở modal; thiếu quyền `create` thì nút không render; số TK hiển thị masked mặc định |
| `test/BankAccountFormDialog.test.tsx` | chọn "Thủ công" thì select chu kỳ bị disable; submit thiếu số TK hiện lỗi |

Dựng store bằng `renderWithProviders` trong `src/test/render.tsx`.

## 10. Ràng buộc

- Cấm `any`, `@ts-ignore`, `@ts-expect-error`.
- Component < 200 dòng · function < 50 · file < 300 · hook < 80.
- Không import `antd` trực tiếp trong `src/pages/` — chỉ qua `@components/index` và `@components/form`. Ngoại lệ đã có tiền lệ: `Empty` trong `BusinessWalletTableState.tsx`; nếu cần `Empty` thì theo đúng tiền lệ đó.
- Import bằng alias, không relative dài.
- Thiếu quyền = **ẩn hoàn toàn**, không disable.
- Không hardcode mã màu; dùng token Tailwind của dự án (`primary`, `danger`, `warning`, `muted`, `border`, `foreground`, `muted-foreground`) và class trạng thái trong `src/styles/_status.css`.
- Số tiền: `tabular-nums`, căn phải, không rút gọn.
- Không thêm thư viện mới.
- Không log số tài khoản đầy đủ ra console.

## 11. Ngoài phạm vi

- Đấu API thật (BE hiện chỉ có `GET`/`POST` `/merchant-bank-accounts`, thiếu update và khóa).
- Luồng xác thực OTP thật — banner chỉ là thông báo tĩnh theo mockup.
- Audit log, maker–checker.
- Ba màn còn lại của nhóm ĐVCNTT: `connect-key/`, `noti-config/`, `payment-method/`.
