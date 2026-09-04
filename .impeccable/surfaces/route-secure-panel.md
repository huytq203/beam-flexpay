---
version: 1
slug: "route-secure-panel"
primary_target: "route:/secure-panel"
related_targets: []
---

# Trang khởi động `/secure-panel`

Mode: Operate. Nhân sự CMS đã đăng nhập cần tới đúng màn hình được cấp quyền mà không rơi vào 403. Màn này chạy trên layout riêng, **không header, không sidebar** — chính nó là điều hướng; sidebar chỉ xuất hiện sau khi đã vào phân hệ. Chỉ hiển thị màn hình được cấp quyền; không số liệu nghiệp vụ, không dữ liệu nhạy cảm.

## Direction contract

THESIS: Bản đồ tuyến của mạng lưới FlexPay — năm phân hệ là năm tuyến, mỗi màn hình là một ga. Từ chối lưới card icon-tiêu đề-mô tả và mọi hero KPI.

OWN-WORLD: Nền signage sáng, mực gần đen. Năm màu tuyến bão hoà (đỏ son, cobalt, lá, hổ phách, tím) dùng làm dải đùn 3D đổ bóng thật; teal thương hiệu chỉ dành cho ga trung chuyển "bạn đang ở đây" và vòng focus. Nhãn ga kiểu bảng men: grotesk Archivo, chữ hoa, tracking rộng. Không kính mờ, không gradient.

STORY: Người trực nhận ra ca của mình, thấy đúng phạm vi quyền mình có, chọn tuyến, đi thẳng tới ga.

FIRST VIEWPORT: Full-bleed 100dvh. Thanh nổi mỏng trên cùng: logo trái, tài khoản phải. Cột trái ~38%: lời chào tên riêng cỡ lớn, giờ vào ca và thời tiết thật, bên dưới là chú giải năm tuyến — chú giải CHÍNH LÀ menu, mỗi tuyến bung danh sách ga. Phải ~62%: mô hình mạng lưới 3D (three.js) cao trọn màn hình, nghiêng như mô hình đặt trên bàn, các tuyến cắt nhau ở cao độ khác nhau. Ga là link thật, bấm được ở cả chú giải lẫn mô hình.

FORM: "Bản đồ tuyến FlexPay", ứng viên grounded #5, seed `53fc0af9`.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

### Raises (hiến từ challenger bị loại)

- **ikeda-datamatics** — Mật độ là dũng khí: mọi ga được cấp quyền hiện tên ngay từ đầu, không giấu sau hover, không nền trang trí rỗng.
- **cloud-quarry** — Khối 3D phải có logic dựng thấy được: dải đùn thật, đổ bóng thật, giao cắt ở cao độ thật.
- **drawcord-cape** — Một thao tác biến đổi cả mặt phẳng: chọn một tuyến thì toàn bản đồ tái cấu trúc, tuyến còn lại lùi về xám và hạ thấp.
- **busytown-cross-section** — Không gì vô danh: mọi nút trên bản đồ đeo nhãn in, không affordance chỉ-icon.

## Motion thesis

- **Focal moment:** GSAP kéo camera vào mô hình, năm tuyến mọc ra từ ga trung chuyển theo thứ tự, đĩa ga bật lên, một xung sáng chạy hết mỗi tuyến đúng một lần.
- **Continuity:** lời chào → chú giải tuyến → mô hình, toàn chuỗi kết thúc trong ~1.2s.
- **Signature interaction:** trỏ vào một tuyến (chuột, bàn phím, hoặc raycast trên canvas) thì tuyến đó nâng lên và giữ màu, bốn tuyến kia hạ xuống và mất màu, camera dịch nhẹ về phía nó.
- **Sàn an toàn:** chuyển động không bao giờ chạm `opacity` của dải tuyến và ga — danh mục là điều hướng duy nhất của màn, nên nó chỉ trượt vào bằng `transform`. Chuỗi chạy dở, đứng hẳn hay không chạy đều không được phép giấu menu. Khoá bằng test `src/pages/home/test/usePortalMotion.test.tsx`.
- **Budget:** không loop nền, không scroll animation. `prefers-reduced-motion` hoặc WebGL không khả dụng → dựng bản đồ SVG tĩnh từ cùng một layout, giữ nguyên mọi link.

## Đã chốt

- **Archivo tải qua Google Fonts, không self-host** (người dùng quyết ngày 04/09/2026). Dự án đã tải IBM Plex Sans và Inter từ cùng nguồn, nên giữ Archivo ở đó là nhất quán và không thêm file nhị phân vào repo. Rủi ro đã biết và được chấp nhận: mạng chặn `fonts.googleapis.com` thì toàn bộ CMS mất mặt chữ, không riêng màn này — đây là vấn đề cấp dự án, không phải của màn khởi động.

## Còn tồn đọng

- Chưa có ảnh chụp ở viewport 390x844 thật. Harness không đổi được kích thước cửa sổ, popup bị chặn, không có device emulation. Nhánh khổ hẹp mới chỉ được đọc từ mã nguồn (`lg:` trong `TransitPortal.tsx`, `showLabels={false}` trong `NetworkDiagram.tsx`), chưa được kiểm bằng mắt trên viewport thật.
- Trạng thái câm của mô hình 3D (tween màu về `--portal-dim`) chưa có ảnh chứng minh: cửa sổ dưới automation bị tiết chế `requestAnimationFrame` nên tween không chạy kịp lúc chụp. Phần chú giải 2D đã có ảnh (`.impeccable/review/desktop-line-focused.jpg`).
