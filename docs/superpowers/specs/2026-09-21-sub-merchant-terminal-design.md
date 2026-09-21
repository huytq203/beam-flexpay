# Thiết kế UI quản lý Sub-merchant và Terminal

Ngày: 2026-09-21  
Trạng thái: Chờ duyệt triển khai

## 1. Mục tiêu và phạm vi

Xây dựng đầy đủ UI quản trị Sub-merchant và Terminal trong FlexPay CMS, kế thừa thiết kế và hành vi của các màn danh sách Merchant/Bank Account hiện có. Giai đoạn này chỉ sử dụng fixture cục bộ, chưa gọi API.

Phạm vi gồm:

- Sidebar group `Quản lý sub-merchant`.
- Danh sách, thêm mới, cập nhật, chi tiết và khóa/mở khóa Sub-merchant.
- Danh sách, thêm mới, cập nhật, chi tiết và khóa/mở khóa Terminal.
- Route, screen registry, header title và phân quyền cho toàn bộ luồng.
- Loading, error, empty và success cho hai màn danh sách.

Không thuộc phạm vi:

- API/RTK Query, upload thật, xuất Excel thật hoặc dữ liệu ledger thời gian thực.
- Chỉnh sửa trực tiếp ngân hàng, key, hình thức thanh toán và thông báo trong form Sub-merchant. Các cấu hình này chỉ hiển thị nguồn kế thừa/riêng và điều hướng sang module tương ứng.
- Terminal override cấu hình thanh toán; Terminal kế thừa từ Sub-merchant cha.

## 2. Kiến trúc điều hướng

### Sidebar

Tạo group mới trong khu vực `Nhóm quản lý cổng ĐVCNTT`:

- Group title: `Quản lý sub-merchant`
  - `Danh sách sub-merchant`
  - `Quản lý Terminal`

Group dùng icon cửa hàng/điểm bán từ hệ icon hiện có. Hai child dùng icon phân biệt chi nhánh và thiết bị, không tạo SVG riêng khi thư viện đã có icon phù hợp.

### Routes

Sub-merchant:

- `/secure-panel/merchant/sub-merchant`
- `/secure-panel/merchant/sub-merchant/create`
- `/secure-panel/merchant/sub-merchant/edit/:id`
- `/secure-panel/merchant/sub-merchant/detail/:id`

Terminal:

- `/secure-panel/merchant/terminal`
- `/secure-panel/merchant/terminal/create`
- `/secure-panel/merchant/terminal/edit/:id`
- `/secure-panel/merchant/terminal/detail/:id`

Các route dùng lazy import như module Merchant hiện tại. `headerTitle.json` có tiêu đề tương ứng cho list/create/edit/detail.

### Screen registry và quyền

Thêm hai screen:

- `MERCHANT_SUB_MERCHANT`
- `MERCHANT_TERMINAL`

Giai đoạn fixture dùng họ quyền `MERCHANT_*` hiện có:

- `view`: xem danh sách/chi tiết.
- `create`: thêm mới.
- `edit`/`update`: cập nhật và khóa/mở khóa.
- `full`: toàn quyền.

Mọi CTA và icon action được bọc bằng `Can`; route và sidebar dùng cùng registry để tránh sai lệch quyền.

## 3. Nguyên tắc UI

Mode: `Operate`.

- Danh sách bám pattern Bank Account: filter card riêng, list card riêng, tiêu đề có icon/ngữ cảnh, tổng bản ghi và CTA.
- Form thêm/sửa/chi tiết là page route riêng; khóa/mở khóa dùng modal vì là thao tác gián đoạn cần xác nhận.
- Action trong bảng là icon-only, có tooltip và `aria-label`.
- Bảng `size="small"`, cuộn ngang ở viewport hẹp và giữ cột thao tác bên phải.
- Dùng token, wrapper form/table/button/dialog/tag/tooltip hiện có.
- Responsive: filter và form một cột trên mobile, hai cột ở desktop; các vùng read-only không giả dạng input có thể sửa.
- Copy dùng thuật ngữ thống nhất: `Sub-merchant`, `Merchant cha`, `Terminal`, `Kế thừa từ Master`, `Tạm ngưng theo cấp cha`.

## 4. Module Sub-merchant

### Dữ liệu fixture

`SubMerchantRow` gồm:

- `id`, `code`, `name`.
- `parentMerchantId`, `parentMerchantCode`, `parentMerchantName`.
- `phone`, `email`, `address`, `businessField`.
- `taxCode`, `legalRepresentative` kế thừa read-only từ Master.
- `terminalCount`, `availableBalance`, `collectedToday`, `pendingSettlement`.
- `settlementMode`, `holdbackDays`, `autoApprovalThreshold`, `minimumWithdrawal`, `dailyWithdrawalLimit`.
- `isDefault`, `phoneInherited`, `addressInherited`.
- `configurationSources` cho bank/key/payment/notification (`INHERITED` hoặc `OVERRIDDEN`).
- `status`: `ACTIVE`, `LOCKED`, `SUSPENDED_BY_PARENT`.
- `createdAt`, `updatedAt`, `lastLockReason`.

Fixture bao phủ Sub mặc định, Sub hoạt động, Sub bị khóa độc lập và Sub tạm ngưng do Merchant cha.

### Danh sách

Filter:

- Từ khóa theo tên/mã Sub.
- Merchant cha.
- Trạng thái.
- Khoảng ngày tạo.
- Xóa bộ lọc và Tìm kiếm.

Header actions:

- `Xuất Excel` chỉ mô phỏng UI, disabled khi danh sách rỗng.
- `Thêm Sub-merchant` điều hướng sang route create.

Columns:

- Sub-merchant: tên, mã và nhãn `Mặc định` khi có.
- Merchant cha: tên và mã.
- Liên hệ: điện thoại và email.
- Số dư doanh thu, căn phải và dùng tabular numerals.
- Terminal.
- Thời gian tạo.
- Trạng thái.
- Thao tác: xem, sửa, khóa/mở khóa.

Danh sách có phân trang 10/20/50 và đủ bốn trạng thái. Empty state phân biệt chưa có dữ liệu với không có kết quả lọc.

### Thêm mới và cập nhật

Form gồm các nhóm:

1. Đơn vị chủ quản
   - Merchant cha searchable, bắt buộc.
   - Sub-merchant ID read-only ở edit; create hiển thị `Hệ thống tự sinh`.
2. Thông tin điểm bán
   - Tên Sub-merchant.
   - Điện thoại và checkbox `Kế thừa từ Master`.
   - Địa chỉ hoạt động và checkbox kế thừa.
   - Lĩnh vực kinh doanh.
3. Pháp lý kế thừa
   - Mã số thuế và người đại diện read-only.
   - Callout giải thích Sub cùng pháp nhân với Master.
4. Cấu hình vận hành
   - Tóm tắt nguồn cấu hình ngân hàng, key, hình thức thanh toán và thông báo.
   - Mặc định kế thừa; cung cấp link điều hướng, không nhúng form cấu hình vào đây.

Validation dùng Zod: Merchant cha/tên/lĩnh vực bắt buộc, tên trim và giới hạn 255, điện thoại hợp lệ, địa chỉ bắt buộc nếu không kế thừa.

Create sinh ID fixture và balance bằng 0. Edit không cho đổi Merchant cha, Sub ID, tax code và đại diện pháp luật.

### Chi tiết

Header hiển thị tên, mã, Merchant cha, badge trạng thái và các action Sửa, Lịch sử giao dịch, Khóa/Mở khóa theo quyền.

Metrics:

- Số dư doanh thu khả dụng.
- Thu hộ hôm nay.
- Chờ quyết toán.
- Số Terminal.

Các section:

- Thông tin chung và pháp lý kế thừa.
- Thông số tích hợp đã che; không hiển thị secret thật trong fixture.
- Tài khoản ngân hàng đã che.
- Trạng thái cấu hình thông báo.
- Cấu hình quyết toán read-only.

### Khóa/mở khóa

Modal hiển thị rõ tên/mã Sub, số dư hiện tại và textarea lý do tối thiểu 10 ký tự.

- Khóa: cảnh báo gián đoạn thanh toán/rút tiền, CTA danger.
- Mở khóa: hiển thị lý do khóa trước; nếu trạng thái là `SUSPENDED_BY_PARENT`, không cho mở riêng và hướng dẫn mở Merchant cha trước.

Xác nhận chỉ cập nhật fixture local và đóng modal.

## 5. Module Terminal

### Dữ liệu fixture

`TerminalRow` gồm:

- `id`, `tid`, `name`, `type` (`STATIC_QR`, `DYNAMIC_QR`, `POS`, `SOFTPOS`).
- `parentMerchantCode`, `parentMerchantName`.
- `subMerchantId`, `subMerchantCode`, `subMerchantName`.
- `address`, `phone`, `note`.
- `inheritedPaymentMethods`, `inheritedLimitLabel`.
- `status`: `ACTIVE`, `LOCKED`, `SUSPENDED_BY_SUB`.
- `createdAt`, `updatedAt`, `lastLockReason`.

Fixture bao phủ nhiều loại Terminal, khóa thủ công và tạm ngưng cascade.

### Danh sách

Filter:

- Từ khóa theo Terminal ID/tên.
- Merchant cha.
- Sub-merchant.
- Loại Terminal.
- Trạng thái.

Columns:

- Terminal ID.
- Tên Terminal.
- Sub-merchant và Merchant cha.
- Loại.
- Địa điểm.
- Trạng thái.
- Cập nhật.
- Thao tác icon: xem, sửa, khóa/mở khóa.

CTA `Thêm Terminal`, phân trang và bốn trạng thái theo cùng list shell.

### Thêm mới và cập nhật

Form gồm:

- Merchant cha.
- Sub-merchant cha phụ thuộc Merchant và chỉ nhận Sub đang hoạt động.
- Terminal ID read-only; create hiển thị `Hệ thống tự sinh`.
- Tên Terminal.
- Loại Terminal.
- Địa chỉ, điện thoại và ghi chú.
- Khối read-only tóm tắt hình thức thanh toán/hạn mức kế thừa từ Sub.

Edit khóa TID, Merchant cha và Sub-merchant cha. Terminal `SUSPENDED_BY_SUB` không được sửa; UI hiển thị lý do và link sang chi tiết Sub.

### Chi tiết

Hiển thị header định danh/trạng thái, thông tin vị trí/liên hệ, quan hệ Master → Sub → Terminal, cấu hình thanh toán kế thừa và lịch sử cập nhật fixture. Có action Sửa và Khóa/Mở khóa theo quyền.

### Khóa/mở khóa

Modal yêu cầu lý do tối thiểu 10 ký tự.

- `ACTIVE` có thể khóa.
- `LOCKED` có thể mở khóa.
- `SUSPENDED_BY_SUB` không thể mở riêng; tooltip/modal giải thích phải mở Sub-merchant cha.

## 6. Cấu trúc code

```text
src/pages/merchant-management/sub-merchant-management/
  shared/
  sub-merchant/
    components/
    constants/
    hooks/
    pages/
    schemas/
    test/
    types/
    utils/
  terminal/
    components/
    constants/
    hooks/
    pages/
    schemas/
    test/
    types/
    utils/
```

`shared` chỉ chứa list shell/table state và các primitive thực sự dùng chung giữa hai module. Logic nghiệp vụ, schema, columns và dialogs ở trong module tương ứng.

Các function/component lớn được tách theo trách nhiệm; tránh component cấu hình tổng quát nhận hàng chục props.

## 7. State và hành vi fixture

- Hook giữ fixture records, filter, page và override list state.
- Filter reset page về 1.
- Create/edit/toggle cập nhật state cục bộ, không giả lập delay và không gọi network.
- `retry` bỏ error override và trở về success/empty.
- Route detail/edit không tìm thấy ID hiển thị trạng thái not-found có action quay lại danh sách.
- Dialog/route đóng hoặc rời form không tự lưu dữ liệu.

## 8. Kiểm thử và xác minh

Focused tests:

- Registry, routes, sidebar group và header titles.
- List filter, empty/error/retry và permission visibility.
- Zod validation create/edit.
- Trường pháp lý/quan hệ cha read-only đúng ngữ cảnh.
- Sub khóa độc lập và cascade không bị trộn lẫn.
- Terminal cascade không cho mở khóa riêng.
- Icon actions có accessible name và mở đúng route/modal.
- Không render secret/key/tài khoản đầy đủ ở detail fixture.

Verification cuối:

- Focused Vitest cho toàn module.
- Targeted ESLint.
- Typecheck và production build; nếu bị chặn bởi lỗi ngoài phạm vi, ghi rõ bằng chứng và không sửa file ngoài module.
- Desktop/mobile visual review trên route đã xác thực; nếu không có session đăng nhập, ghi nhận blocker thay vì thêm auth bypass.

## 9. Tiêu chí hoàn thành

- Sidebar group và mọi route truy cập đúng theo quyền.
- Hai module có đầy đủ list/create/edit/detail/status flow bằng fixture local.
- UI đồng nhất với Bank Account và Merchant Gateway hiện có.
- Không có API call, secret thật hoặc thay đổi ngoài phạm vi.
- Focused tests, targeted lint và diff check xanh; typecheck/build được xác minh trong điều kiện worktree hiện tại.
