# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

CMS này không có một "người dùng chính" duy nhất — cả bốn nhóm dưới đây đều ngồi trong hệ thống nhiều giờ mỗi ngày, với nhịp làm việc và mức rủi ro rất khác nhau. Mọi thiết kế sau này phải phục vụ được cả bốn, không được tối ưu cho một nhóm mà làm hỏng nhóm khác.

- **Vận hành back-office** — xử lý hàng đợi hằng ngày: duyệt eKYC, tra soát giao dịch ví, xử lý giao dịch đóng băng, lịch sử rút tiền. Khối lượng lớn, thao tác lặp lại, áp lực thời gian. Tốc độ quét và throughput là thứ họ cần.
- **Rủi ro & tuân thủ** — điều tra giao dịch bất thường, đóng/mở băng tài khoản, đối soát sổ cái hệ thống, xuất dấu vết kiểm toán. Họ cần truy nguyên và bằng chứng, không cần tốc độ.
- **Đội merchant / đối tác** — onboard merchant, quản lý hồ sơ merchant, đơn hàng và QR, theo dõi dashboard tổng quan merchant.
- **Quản trị hệ thống** — cấu hình chính sách phí và gán phí, quản lý tài khoản admin, vai trò và nhóm quyền. Ít thao tác nhưng mỗi thao tác có bán kính ảnh hưởng lớn: sai một chính sách phí là sai trên toàn hệ thống.

## Product Purpose

Bảng điều khiển quản trị nội bộ cho nền tảng ví điện tử **FlexPay**, do công ty **BEAM** vận hành. Đây là nơi duy nhất nhân sự BEAM can thiệp vào hệ thống ví: xét duyệt danh tính người dùng, tra soát và can thiệp giao dịch tiền thật, cấu hình biểu phí, quản trị merchant, và phân quyền cho chính đội ngũ nội bộ.

Thành công không đo bằng mức độ gắn kết hay thời gian ở lại — mà đo bằng việc một ca vận hành đóng hết hàng đợi mà không sai sót, và mọi thao tác chạm vào tiền hoặc danh tính đều để lại dấu vết truy nguyên được.

## Positioning

Là công cụ nội bộ, không cạnh tranh trên thị trường. Điều làm nó khác một bảng admin CRUD thông thường: nó hợp nhất **năm miền nghiệp vụ có mức rủi ro khác hẳn nhau** — ví cá nhân, giao dịch/sổ cái, merchant, phí, và phân quyền — vào một mặt bằng duy nhất, dưới cùng một hệ RBAC. Người dùng chuyển giữa việc duyệt một hồ sơ eKYC và việc sửa một chính sách phí ảnh hưởng toàn hệ thống chỉ bằng một cú click trên sidebar. Thiết kế phải làm rõ ranh giới rủi ro đó, không được san phẳng nó.

## Operating Context

Năm nhóm nghiệp vụ hiện có, đúng theo `src/routes.ts` và `src/components/layout/components/Navigation.tsx`:

| Nhóm | Màn hình |
|---|---|
| **Quản lý giao dịch** (`/secure-panel/transaction-management`) | Quản lý giao dịch + chi tiết, Giao dịch đóng băng, Sổ cái hệ thống + chi tiết, Lịch sử rút tiền |
| **Quản trị ví cá nhân** (`/secure-panel/wallet-administration`) | Quản lý ví điện tử + chi tiết người dùng, Duyệt eKYC |
| **Tài khoản & phân quyền** (`/secure-panel/role-v2`) | Quản lý tài khoản admin, Quản lý nhóm quyền, Quản lý quyền |
| **Merchant** (`/secure-panel/merchant`) | Tổng quan (dashboard), Danh sách merchant + tạo/sửa/chi tiết, Đơn hàng + QR đơn hàng |
| **Phí** (`/secure-panel/fee-v4`) | Quản lý chính sách phí + tạo/sửa, Quản lý gán phí + tạo/sửa |

Ngoài ra: luồng xác thực (`/secure-panel/auth` — đăng nhập, quên mật khẩu, đặt lại mật khẩu, xác thực token), trang 403, và modal hồ sơ / đổi mật khẩu nhân viên gọi qua sự kiện `window.events`.

Phiên làm việc tự hết hạn khi không hoạt động (`initInactivityTracker` trong `src/app/configs/fetchBaseQueryCustom.ts`) — người dùng bị đá ra giữa chừng là tình huống thường gặp, không phải ngoại lệ.

Có route `refund-management` (Quản lý hoàn tiền) nhưng mục menu đã bị comment out — chức năng tồn tại trong code, chưa mở cho người dùng.

## Capabilities and Constraints

**Ràng buộc nghiệp vụ bắt buộc — mọi thiết kế sau này không được phá vỡ:**

1. **Lưu vết & kiểm toán.** Mọi thao tác nhạy cảm (duyệt eKYC, đóng/mở băng, sửa phí, đổi quyền) phải truy được ai làm và lúc nào. Không thiết kế luồng làm mờ trách nhiệm — không thao tác hàng loạt vô danh, không xác nhận ngầm.
2. **Chính xác tiền tệ tuyệt đối.** Số dư, sổ cái, đối soát phải khớp tuyệt đối. Không làm tròn, không rút gọn (`1.2tr`, `~50k`), không cắt bớt chữ số vì lý do thẩm mỹ hay vì hẹp màn hình.
3. **Dữ liệu eKYC là dữ liệu nhạy cảm.** CCCD, ảnh chân dung, thông tin cá nhân có quy định về hiển thị, che bớt và ai được xem. Không phơi trên màn hình chung hay khu vực người khác nhìn được.
4. **RBAC nghiêm ngặt.** Mọi màn hình, nút, và cột dữ liệu phải tôn trọng hệ quyền hiện có (`WALLET:*`, `TRANSACTION:*`, `ROLE:*`, `MERCHANT:*`, `FEE:*`, `ADMIN:FULL`). Không hiển thị thứ người dùng không được phép — kể cả ở dạng bị vô hiệu hóa.

**Ràng buộc phạm vi:**

- **Mobile là chức năng đầy đủ, không phải bản rút gọn.** Nhân sự thật sự mở CMS này trên điện thoại. Mọi màn hình — kể cả bảng dữ liệu lớn và form cấu hình phí — phải dùng được trên viewport nhỏ. Đây là quyết định đã chốt, không phải mong muốn.

**Ràng buộc kỹ thuật:**

- React 19.2.8 + Vite 8, TypeScript, react-router-dom 7 (`createBrowserRouter`, mọi trang lazy-load qua `Suspense`).
- Redux Toolkit + RTK Query cho toàn bộ tầng dữ liệu; một số endpoint sinh từ OpenAPI (`yarn api`).
- **Hai hệ UI cùng tồn tại:** antd 5 (46 file đang import trực tiếp) và Tailwind 4 + bộ component shadcn tự adapt trong `src/components/ui/`. Layout đã chuyển sang shadcn (commit `f45273f`); phần còn lại chưa. Đây là hiện trạng chuyển đổi dở dang, không phải lựa chọn thiết kế.
- Xác thực JWT với access token + refresh token, lưu qua `js-cookie`; hết hạn phiên do không hoạt động.
- Build production đóng gói PWA (`vite-plugin-pwa`, `registerType: 'autoUpdate'`), phục vụ qua nginx trong Docker; CI qua GitLab CI / Jenkins / buildspec.
- Toàn bộ dữ liệu đến từ backend qua nhiều base URL tách biệt (`VITE_API_URL`, `VITE_API_LOGIN`, `VITE_API_WALLETCORE`, `VITE_FEE_API_URL`, `VITE_API_MERCHANT`).

**Chưa chốt — không được tự bịa ra:**

- **Tiếng Anh chưa cần thiết ở thời điểm này.** i18n khởi động cứng với `lng: 'vi'`; file `en/translation.json` tồn tại nhưng phần lớn nhãn menu đang hardcode tiếng Việt. Công việc sau này không phải gánh chi phí song ngữ, nhưng cũng đừng chủ động xóa hạ tầng i18n.
- Chưa có chuẩn accessibility nào được xác lập cho sản phẩm này.

## Brand Commitments

- **BEAM** là công ty vận hành. **FlexPay** là tên sản phẩm nền tảng ví. CMS này quản trị FlexPay và mang nhận diện BEAM.
- Tên `flexpay` trong `package.json` và host `ewallet.flexpay.vn` là tên kỹ thuật của sản phẩm, không phải tên công ty.
- Tiêu đề trình duyệt hiện tại: "Ewallet CMS".
- Asset nhận diện có sẵn: `public/images/BEAM.png` (dùng làm favicon và apple-touch-icon), `public/images/logo.png`, `public/images/short_logo.svg`.
- Ngôn ngữ giao diện: tiếng Việt.
- **Chưa có ràng buộc thị giác nào được chốt** — chưa pin màu, font, hay tham chiếu phong cách nào. Màu `rgb(43,217,208)` hardcode trong `Navigation.tsx` là di sản code, không phải cam kết thương hiệu.

## Evidence on Hand

**Có thật trong repo:**

- Asset nhận diện: `public/images/BEAM.png`, `logo.png`, `short_logo.svg`, `public/icons.svg`.
- Tài liệu thiết kế nội bộ: `docs/superpowers/specs/2026-07-24-shadcn-layout-migration-design.md` và `docs/superpowers/plans/2026-07-24-shadcn-layout-migration.md` — ghi lại quyết định chuyển layout từ antd sang shadcn, viết bằng tiếng Việt.
- Dữ liệu nghiệp vụ thật đến từ backend runtime, không có fixture trong repo.

**Không có — công việc sau này không được bịa ra:**

- Không có testimonial, case study, số liệu công khai, benchmark hiệu năng, hay bất kỳ tuyên bố marketing nào.
- Không có giấy phép, chứng nhận tuân thủ, hay tuyên bố pháp lý nào được xác nhận trong phạm vi cuộc phỏng vấn này. Không tự gán nhãn "được cấp phép", "đạt chuẩn", hay tương tự.
- Không có ảnh chụp màn hình sản phẩm hay dữ liệu mẫu đã được duyệt để dùng công khai.

## Product Principles

1. **Dấu vết đi trước thẩm mỹ.** Nếu một lựa chọn thiết kế làm mờ ai đã làm gì, lựa chọn đó sai — dù nó gọn hơn.
2. **Con số tiền là sự thật nguyên vẹn.** Không rút gọn, không làm tròn, không cắt bớt. Khi hẹp chỗ, hy sinh thứ khác chứ không hy sinh chữ số.
3. **Quyền quyết định cái được thấy.** Giao diện phản ánh đúng những gì người dùng được phép làm — không nhiều hơn, kể cả ở dạng xám mờ.
4. **Bán kính rủi ro phải nhìn thấy được.** Duyệt một hồ sơ và sửa một chính sách phí toàn hệ thống không được trông giống nhau và không được cách nhau đúng một cú click vô thức.
5. **Một mặt bằng chức năng trên mọi kích thước màn hình.** Điện thoại không phải phiên bản rút gọn — nó phải làm được mọi thứ desktop làm được.
