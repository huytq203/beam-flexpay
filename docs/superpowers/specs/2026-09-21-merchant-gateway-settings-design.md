# Merchant gateway settings UI

## Mục tiêu

Mở rộng phân hệ Quản lý ĐVCNTT bằng ba màn hình cấu hình cổng thanh toán:

- Key kết nối
- Hình thức thanh toán
- Thông báo

Vòng triển khai này chỉ hoàn thiện frontend. Dữ liệu dùng fixture cục bộ có kiểu dữ liệu rõ ràng; không gọi API và không mô phỏng độ trễ mạng. Cấu trúc hook giữ ranh giới dữ liệu để về sau thay fixture bằng RTK Query mà không đổi component hiển thị.

## Kiến trúc điều hướng và phân quyền

Ba màn hình là ba route con độc lập của `/merchant`:

- `/merchant/key-connection`
- `/merchant/payment-method`
- `/merchant/notification`

Mỗi route có một khai báo trong permission registry và một mục sidebar thuộc nhóm Quản lý ĐVCNTT. Vòng này tái sử dụng họ quyền `MERCHANT_VIEW`, `MERCHANT_CREATE`, `MERCHANT_UPDATE`, `MERCHANT_DELETE`, `MERCHANT_FULL`; không tạo mã quyền backend mới.

Quyền `view` điều khiển khả năng mở route và hiện menu. Các nút tạo, sửa, bật/tắt hoặc xóa được bọc bằng `Can` với action tương ứng. UI không chỉ ẩn nút: handler thao tác cũng không được gắn khi thiếu quyền.

## Cấu trúc mã nguồn

Mỗi màn hình nằm trong thư mục riêng dưới `src/pages/merchant-management/merchant-gateway/`, gồm:

- `pages/`: page composition mỏng.
- `components/`: toolbar, bảng/trạng thái và dialog riêng cho nghiệp vụ.
- `hooks/`: lọc, phân trang và CRUD cục bộ.
- `types/`: kiểu dữ liệu miền.
- `constants/`: fixture và option tĩnh.
- `schemas/`: Zod schema cho form.
- `test/`: test hành vi chính.

Phần dùng chung chỉ được trích khi thật sự chung cho cả ba màn:

- `MerchantGatewayPage`: khung title, mô tả, số bản ghi và nút tạo.
- `MerchantGatewayToolbar`: vùng tìm kiếm và các filter slot.
- `MerchantGatewayTableState`: chuẩn hóa bốn trạng thái loading, error, empty và success quanh `TableComponent`.

Các field, cột, validation và dialog mang ý nghĩa nghiệp vụ vẫn ở trong từng màn, tránh một component cấu hình tổng quát khó đọc.

## Thiết kế giao diện

Thiết kế kế thừa shell và token hiện tại của CMS. Mockup là nguồn sự thật cho nội dung, thứ bậc và tác vụ; component có sẵn của project là nguồn sự thật cho hình thức và hành vi.

Mỗi màn gồm hai surface phẳng:

1. Thanh tìm kiếm/lọc trong `CardComponent` viền mảnh, không shadow.
2. Danh sách trong `CardComponent` viền mảnh, có header tên màn, mô tả ngắn, tổng bản ghi và CTA.

Các control dùng wrapper sẵn có: `Input`, `SelectInput`, `ButtonComponent`, `TableComponent`, `TagComponent`, `Switch`, `DialogModal`/`ModalComponent`, `CopyableText`, `TooltipComponent`. Chỉ tạo component UI dùng chung mới khi wrapper hiện có không đáp ứng yêu cầu.

Giao diện ưu tiên mật độ vận hành: typography và spacing theo CMS, nhãn rõ nghĩa, số liệu monospace/tabular khi phù hợp, bảng cuộn ngang ở viewport hẹp, filter xuống dòng tự nhiên. Không thêm gradient, glass, card lồng card, icon-only action không có accessible label hoặc hiệu ứng trang trí ngoài hệ thống.

## Ba màn hình

### Key kết nối

Danh sách hiển thị cấp áp dụng, Client ID, Secret Key đã che, số IP whitelist, Webhook/IPN URL, trạng thái và thời điểm cập nhật. Toolbar tìm theo Client ID/tên merchant, lọc cấp áp dụng và trạng thái.

Dialog thêm/sửa gồm cấp Master/Sub, Client ID, Secret masked, IP whitelist và Webhook URL. Secret chỉ là dữ liệu mẫu và luôn che trên danh sách. Các thao tác sao chép dùng `CopyableText`; không đưa secret thật vào clipboard trong fixture.

### Hình thức thanh toán

Danh sách hiển thị merchant/cấp áp dụng, phương thức, kênh, hạn mức tối thiểu–tối đa, phí hiển thị tham khảo, trạng thái và cập nhật. Toolbar tìm kiếm và lọc phương thức/trạng thái.

Dialog thêm/sửa cho phép chọn phạm vi merchant, phương thức, kênh, hạn mức và trạng thái. Các trường tiền dùng `InputNumberComponent` và hiển thị đầy đủ theo locale Việt Nam.

### Thông báo

Danh sách hiển thị merchant/cấp áp dụng, loại sự kiện, kênh gửi, đích nhận đã rút gọn, trạng thái và cập nhật. Toolbar tìm theo merchant/đích nhận, lọc sự kiện/kênh/trạng thái.

Dialog thêm/sửa gồm phạm vi, sự kiện, kênh, email/số điện thoại/webhook đích và trạng thái. Validation phụ thuộc kênh: email đúng định dạng, SMS là số điện thoại hợp lệ, webhook là URL HTTPS.

## Trạng thái và tương tác

Mỗi màn có đủ bốn trạng thái:

- Loading: skeleton/bảng loading ổn định chiều cao.
- Error: thông báo trong vùng nội dung và nút thử lại.
- Empty: phân biệt chưa có dữ liệu với không có kết quả lọc; có CTA phù hợp khi có quyền tạo.
- Success: bảng, tổng bản ghi và phân trang đồng bộ.

Thêm/sửa cập nhật state cục bộ và hiện message thành công. Bật/tắt hoặc xóa yêu cầu dialog xác nhận nếu có bán kính ảnh hưởng. Đóng dialog không lưu sẽ bỏ draft. Search/filter reset về trang đầu. Các nút submit có trạng thái disabled/submitting để tránh thao tác lặp.

## Responsive và accessibility

- Desktop giữ mật độ bảng của CMS; không ép cột quan trọng xuống quá hẹp.
- Tablet/mobile cho toolbar wrap và bảng cuộn ngang; dialog chuyển thành chiều rộng gần viewport.
- Mọi input có label; error liên kết với field; dialog quản lý focus bằng wrapper Ant Design.
- Action icon có `aria-label`/tooltip; trạng thái không chỉ truyền đạt bằng màu.
- Secret và đích nhận nhạy cảm được masked mặc định.

## Kiểm thử và xác minh

Test tập trung vào hành vi có rủi ro:

- Registry có đủ ba screen và route khớp sidebar.
- Thiếu quyền thì không thấy action tương ứng.
- Search/filter và phân trang trả đúng dữ liệu.
- Bốn trạng thái danh sách render đúng.
- Dialog validate trường bắt buộc và validation phụ thuộc kênh.
- Thêm/sửa/bật-tắt cập nhật fixture state đúng.

Sau khi triển khai: chạy test liên quan, typecheck, lint và build. Giao diện được kiểm tra một lượt desktop + mobile, sửa theo một batch, xác nhận tối đa thêm một lượt theo giới hạn của Impeccable.

## Ngoài phạm vi

- Kết nối API/RTK Query và cache tag.
- Sinh hoặc quay vòng API key thật.
- Gửi email, SMS hoặc webhook thật.
- Thêm mã quyền mới ở backend.
- Audit log backend hoặc đồng bộ thời gian thực.
