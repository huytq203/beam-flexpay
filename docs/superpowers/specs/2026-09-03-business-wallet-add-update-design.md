# Thiết kế: Thêm mới & Cập nhật ví doanh nghiệp

**Ngày:** 2026-09-03
**Phạm vi:** `src/pages/merchant-management/business-wallet-account/` — bổ sung hai màn `create` / `edit` cho module ví doanh nghiệp (mục 2.5.1 và 2.5.2 của đặc tả), cộng một file endpoint mới trong `src/app/services/`.
**Mục tiêu:** dựng đủ luồng nhập liệu hồ sơ ví doanh nghiệp (form + validate + phân quyền + 4 trạng thái) trước khi backend cung cấp endpoint ghi, với toàn bộ phần tạm thời gom vào một điểm duy nhất.
**Tham chiếu UI:** `~/Downloads/Website quản trị ví điện tử/Quản trị Merchant.dc.html`, màn `walletAdd` (dòng 696) và `walletUpdate` (dòng 776).

---

## 1. Bối cảnh

Module `business-wallet-account/` hiện chỉ có màn danh sách:

| File | Vai trò |
|---|---|
| `pages/BusinessWallet.tsx` | Màn list, route đã khai trong `routes.ts` |
| `hooks/useBusinessWallet.ts` | Gọi `useGetAccountQuery` với `walletType: 'BUSINESS'` |
| `components/BusinessWalletSearch.tsx` · `BusinessWalletTableState.tsx` | Bộ lọc + bảng |
| `columns/business-wallet.columns.tsx` | Mảng cột tĩnh, **chưa có cột Thao tác** |
| `schemas/business-wallet.schema.ts` | Chỉ có `businessWalletSearchSchema` |

Không có màn thêm mới, không có màn cập nhật, không có entry point nào dẫn tới chúng.

## 2. Đối chiếu OpenAPI (đã fetch từ môi trường dev ngày 2026-09-03)

Nguồn: `https://api.dev.ewallet.flexpay.vn/wallet-core/api-docs` và `/user-wallet/api-docs`.

| Đường dẫn | Method có trong spec |
|---|---|
| `/api/v1/admin/wallet/accounts` | `get` |
| `/api/v1/admin/wallet/accounts/{id}` | `get` |
| `/api/v1/admin/wallet/accounts/{lock,unlock,freeze,unfreeze,freeze-transaction,unfreeze-transaction}` | `post` |
| `/api/v1/admin/wallet/accounts/{users,merchants}` | `get` |

**Kết luận: wallet-core không có endpoint tạo hoặc cập nhật tài khoản ví.** Các `post` hiện có đều là thao tác trạng thái trên ví đã tồn tại. Spec `user-wallet` cũng không có endpoint đăng ký doanh nghiệp / KYB (chỉ có `enable` / `disable` user-wallet).

Hệ quả thứ hai, quan trọng cho màn Cập nhật: `GET /wallet/accounts/{id}` trả `ContentAccountWallet` gồm `id`, `ownerId`, `ownerUsername`, `glCode`, `currency`, các số dư, `status`, `enabled`, `lockedReason`, mốc thời gian, `linkedBanks`. **Không có** mã số thuế, địa chỉ trụ sở, người đại diện pháp luật, người quản lý ví, hay hồ sơ đính kèm.

## 3. Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| 1 | Dựng UI trước, phần ghi đi qua **một lớp adapter đặt sẵn** `apiBusinessWallet.api.ts` | Endpoint chưa tồn tại. Gom chỗ tạm vào một file để khi BE ra contract chỉ sửa một điểm. |
| 2 | **Full page** cho cả Thêm mới và Cập nhật, không dùng modal | Form có 5 section / 16 field bắt buộc / 4 upload / 1 textarea. Demo vẽ sẵn dạng page có header sticky. Repo đã có tiền lệ `CreateMerchant.tsx`, `AddFeePolicy.tsx`, `FeeAssignAdd.tsx`. Page cho phép deep-link, F5 không mất route, đủ chỗ cho vùng upload. |
| 3 | **Bỏ nút "Lưu nháp"** ở phase này | Draft là trạng thái nghiệp vụ thuộc backend ("hồ sơ đủ 100% mới chuyển Chờ duyệt"). Lưu client-side đồng nghĩa đẩy MST / CCCD / email vào `localStorage` — PII, trái tinh thần `05-security.md`. Thêm lại khi BE có status `DRAFT`. |
| 4 | Route dùng dạng `/edit/:id`, không phải `/:id/edit` | Khớp convention wildcard đang dùng trong `headerTitle.json` (`.../create/*`, `.../detail/*`). |
| 5 | Không sửa `registry.ts` | `create` và `edit` đã có sẵn trong `DEFAULT_SCREEN_ACTIONS` của `SCREENS.BUSINESS_WALLET_ACCOUNT`. |

## 4. Route

Thêm hai entry vào nhánh `merchantManagement` trong `src/routes.ts`, lazy qua helper `page()`:

| Path | Component | Mode |
|---|---|---|
| `${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/create` | `pages/BusinessWalletForm` | Thêm mới |
| `${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/edit/:id` | `pages/BusinessWalletForm` | Cập nhật |

Một component phục vụ cả hai mode, phân biệt bằng `useParams<{ id: string }>()`. Segment tĩnh `create` được react-router v7 ưu tiên hơn segment động nên không xung đột nếu sau này thêm route `/:id`.

## 5. Cấu trúc file

```
src/pages/merchant-management/business-wallet-account/
├── pages/
│   ├── BusinessWallet.tsx              (sửa: thêm nút "Thêm mới ví doanh nghiệp")
│   └── BusinessWalletForm.tsx          (mới) page dùng chung add/edit
├── components/
│   ├── BusinessWalletSearch.tsx        (giữ nguyên)
│   ├── BusinessWalletTableState.tsx    (sửa: nhận onEdit, dùng columns factory)
│   ├── BusinessWalletFormSection.tsx   (mới) khung card có số La Mã
│   ├── AccountInfoSection.tsx          (mới) section II
│   ├── BusinessIdentitySection.tsx     (mới) section III
│   ├── WalletManagerSection.tsx        (mới) section IV
│   ├── LegalDocsSection.tsx            (mới) section V
│   └── ClassificationSection.tsx       (mới) section VI
├── hooks/
│   ├── useBusinessWallet.ts            (giữ nguyên)
│   └── useBusinessWalletForm.ts        (mới) form + prefill + submit
├── schemas/
│   ├── business-wallet.schema.ts       (mở rộng: businessWalletFormSchema)
│   └── test/business-wallet.schema.test.ts   (mới)
├── columns/business-wallet.columns.tsx (sửa: đổi thành factory + cột Thao tác)
├── types/business-wallet.type.ts       (giữ nguyên)
└── test/
    ├── BusinessWallet.test.tsx         (bổ sung ca kiểm quyền nút Thêm mới)
    └── BusinessWalletForm.test.tsx     (mới)
```

Năm section đặt phẳng trong `components/`, không lồng thư mục `sections/` — theo `06-naming-structure.md` ("Flat > nested").

Ngân sách dòng: `BusinessWalletForm.tsx` khoảng 150 dòng (header + 5 thẻ section), mỗi section 40–70 dòng, hook khoảng 80 dòng. Đều dưới hạn của `RULE.md`.

## 6. Schema Zod

Bổ sung `businessWalletFormSchema` vào `schemas/business-wallet.schema.ts`, `type BusinessWalletFormValues = z.infer<typeof businessWalletFormSchema>` là nguồn type duy nhất cho form.

| Field | Section | Validate |
|---|---|---|
| `email` | II | `z.email()`, bắt buộc. **Disabled ở mode edit** — định danh đăng nhập, không cho sửa |
| `contactPhone` | II | `/^0\d{9,10}$/` |
| `businessName` | III | 1–255 ký tự |
| `taxCode` | III | `/^\d{10}(\d{3})?$/` — 10 hoặc 13 số |
| `headOfficeAddress` | III | textarea, 1–500 ký tự |
| `legalRepName` | III | 1–255 ký tự |
| `legalRepIdNumber` | III | `/^(\d{9}\|\d{12})$/` |
| `managerName` | IV | 1–255 ký tự |
| `managerPosition` | IV | 1–255 ký tự |
| `managerIdNumber` | IV | `/^(\d{9}\|\d{12})$/` |
| `managerIdExpiry` | IV | ngày, phải sau hôm nay |
| `otpPhone` | IV | `/^0\d{9,10}$/` |
| `businessLicense` | V | `min(1)` — PDF/JPG/PNG, ≤ 5MB |
| `authorizationLetter` | V | optional; **`superRefine`: bắt buộc khi `managerIdNumber !== legalRepIdNumber`** (quản lý ví khác người đại diện) |
| `idCardFront` | V | `min(1)` — JPG/PNG, ≤ 5MB |
| `idCardBack` | V | `min(1)` — JPG/PNG, ≤ 5MB |
| `isInternalWallet` | VI | boolean, mặc định `false` |

Toàn bộ field dựng bằng wrapper sẵn có: `FormInput`, `FormTextArea`, `FormDatePicker`, `FormUploadCombined`, `FormSwitch` từ `@components/form`. Không viết field mới, không import `antd` trong `pages/`.

## 7. Lớp API tạm thời

File mới `src/app/services/apiBusinessWallet.api.ts`, `injectEndpoints` vào `apiWalletCore` (không tạo `createApi` mới vì cùng base URL):

| Endpoint | Method + URL | Tag |
|---|---|---|
| `postBusinessWallet` | `POST /wallet/accounts` | `invalidatesTags: ['Wallet']` |
| `putBusinessWallet` | `PUT /wallet/accounts/{id}` | `invalidatesTags: ['Wallet']` |

Payload khai type tường minh `BusinessWalletPayload`, derive từ `BusinessWalletFormValues` bằng `Omit` cho bốn field file (form giữ `UploadFile[]`, payload gửi định danh file do BE quy định).

**Hai hạn chế phải chấp nhận ở phase này, ghi rõ bằng comment `TODO(BE)` ngay trong file:**

1. Cả hai URL **chưa tồn tại** trên wallet-core. Bấm Lưu sẽ nhận 404; `fetchBaseQueryCustom` đã xử lý notification lỗi tập trung nên **không bắt lại và không hiện notification trùng** ở tầng màn hình.
2. Mode edit prefill từ `useGetAccountByIdQuery(id)` nhưng response không chứa hồ sơ doanh nghiệp, nên **chỉ map được `ownerUsername` → `businessName`**; các field còn lại để rỗng cho tới khi BE có API hồ sơ.

Khi backend chốt contract, phạm vi sửa giới hạn trong file này cộng hàm mapping trong `useBusinessWalletForm.ts`.

## 8. Phân quyền

Không thêm entry mới vào `registry.ts`.

| Điểm | Cách chặn |
|---|---|
| Nút "Thêm mới ví doanh nghiệp" trên màn list | `<Can screen='BUSINESS_WALLET_ACCOUNT' action='create'>` |
| Nút "Sửa" trong cột Thao tác | `<Can screen='BUSINESS_WALLET_ACCOUNT' action='edit'>` |
| Truy cập thẳng bằng URL | `useScreenAccess('BUSINESS_WALLET_ACCOUNT')` trong `BusinessWalletForm`; thiếu quyền → `<Navigate to={FORBIDDENERROR} replace />` |

Thiếu quyền là **ẩn hoàn toàn**, không disable — theo `02-components.md`.

`columns/business-wallet.columns.tsx` đổi từ mảng export sẵn thành factory `createBusinessWalletColumns({ onEdit })` để truyền handler và gắn cột Thao tác. Ẩn/hiện nút do `Can` quyết định bên trong cell.

## 9. Bốn trạng thái

Chỉ mode edit có fetch:

| Trạng thái | Hiển thị |
|---|---|
| loading | Skeleton khung 5 section |
| error | `ErrorState` + nút "Thử lại" gọi `refetch()` |
| empty (id không tồn tại) | Thông báo tiếng Việt + link về màn danh sách |
| data | Form đã prefill, `email` disabled |

Mode add không gọi API nên không áp dụng.

## 10. Tiêu đề header

**Không làm đa ngôn ngữ ở phase này.** `en/headerTitle.json` không tồn tại và `i18n.ts` chỉ nạp `headerTitle` vào resource `vi`, nên không có gì để đồng bộ sang bản `en/`.

Vẫn phải thêm hai dòng vào `src/app/languages/vi/headerTitle.json`, vì đây là **bảng tra tiêu đề header theo pathname**, không phải bản dịch:

```
"/secure-panel/merchant/business-wallet-account/create": "Thêm mới ví doanh nghiệp",
"/secure-panel/merchant/business-wallet-account/edit/*": "Cập nhật ví doanh nghiệp"
```

Thiếu hai dòng này thì `getHeaderTitleKey()` (`AppLayout.tsx:37`) trả về nguyên pathname, `Header.tsx:21` gọi `t()` trên key không tồn tại và header hiển thị chuỗi thô `header-title./secure-panel/merchant/business-wallet-account/create`.

Dạng wildcard `edit/*` là bắt buộc cho màn Cập nhật: hàm trên thay **segment cuối** bằng `*`, nên `.../edit/<uuid>` khớp đúng `.../edit/*`. Đây cũng là lý do route dùng `/edit/:id` thay vì `/:id/edit` (quyết định #4).

Chuỗi trong màn hình viết thẳng tiếng Việt như các màn hiện có, không tạo namespace i18n mới. Thông báo lỗi dùng message đã biên soạn, không đổ raw response ra UI.

## 11. Kiểm thử

| File | Ca kiểm |
|---|---|
| `schemas/test/business-wallet.schema.test.ts` | MST nhận 10 và 13 số, từ chối 11 số; CCCD nhận 9 và 12 số; SĐT `^0\d{9,10}$`; **giấy ủy quyền bắt buộc khi `managerIdNumber !== legalRepIdNumber`, không bắt buộc khi bằng nhau**; `managerIdExpiry` quá khứ bị từ chối |
| `test/BusinessWalletForm.test.tsx` | Mode add: submit form rỗng hiện đủ lỗi bắt buộc. Mode edit (MSW mock `GET /wallet/accounts/{id}`): prefill `businessName`, `email` ở trạng thái disabled. Thiếu quyền: redirect `FORBIDDENERROR` |
| `test/BusinessWallet.test.tsx` | Nút "Thêm mới" hiện khi có quyền `create`, không render khi không có |

Dựng store sạch bằng `createAppStore()` trong mỗi test để tránh rò cache RTK Query.

## 12. Ngoài phạm vi

- Nút "Lưu nháp" và trạng thái `DRAFT` — chờ backend (quyết định #3).
- Endpoint upload file thật; phase này giữ file trong state form theo cơ chế của `FormUploadCombined`.
- Màn chi tiết ví doanh nghiệp (2.5 "Số dư & quyết toán") và các màn `bankAccounts` / `keys` / `subs` / `users` trong cùng file demo.
- Re-KYB khi đổi mã số thuế — demo chỉ ghi chú bằng text, chưa có luồng.
