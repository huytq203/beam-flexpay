# Màn Danh sách User Merchant: thao tác "Gửi lại liên kết kích hoạt"

Ngày: 2026-10-01
Spec tổng (kèm phần backend identity): `flexpay.identity/docs/superpowers/specs/2026-10-01-merchant-reissue-account-design.md`

## Vấn đề

User Merchant ở trạng thái `PENDING` (đã tạo nhưng chưa đặt mật khẩu và kích hoạt) không có
thao tác nào trên màn Danh sách User. Nếu email kích hoạt không tới, hoặc tài khoản đăng nhập
chưa được cấp đủ, admin không có cách yêu cầu gửi lại. Backend merchant đã có
`POST /merchant-users/{id}/resend-activation` (quyền `MERCHANT_USER:CREATE`) nhưng FE chưa dùng.

## Hành vi

- Hàng User `PENDING` có thêm nút icon thư **"Gửi lại liên kết kích hoạt User {tên}"**, chỉ hiện
  khi có quyền `MERCHANT_USER` + `resendActivation` (ánh xạ sang `PERMISSION.MERCHANT_USER_CREATE`).
- Bấm nút mở hộp thoại xác nhận "Xác nhận gửi lại liên kết kích hoạt" nêu tên và email User.
  Nút xác nhận gọi `POST /merchant-users/{id}/resend-activation`.
- Thành công: thông báo "Đã tiếp nhận yêu cầu gửi lại liên kết kích hoạt..." và đóng hộp thoại.
  Nội dung nói đúng bản chất bất đồng bộ (yêu cầu được xử lý nền, liên kết cũ hết hiệu lực khi
  liên kết mới được gửi), không khẳng định email đã tới.
- Lỗi do User không còn `PENDING` (`detail = 'Activation can only be resent for a pending user'`):
  thông báo "Trạng thái User đã thay đổi..." kèm gợi ý làm mới danh sách, giữ hộp thoại mở.
  Lỗi khác: thông báo chung "Không thể gửi lại liên kết kích hoạt. Vui lòng thử lại."
- User `ACTIVE` giữ nguyên "Đặt lại mật khẩu"; khoá/mở khoá không đổi.

## Kiểm thử

Nút chỉ hiện cho `PENDING` khi có quyền tạo; không hiện khi thiếu quyền; luồng xác nhận gọi
đúng endpoint và báo thành công; lỗi "không còn PENDING" hiện đúng nguyên nhân. Toàn bộ test,
`yarn typecheck`, ESLint của các file đã sửa, Prettier và kiểm tra số dòng của tính năng đều xanh.
