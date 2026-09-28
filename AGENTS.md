# Quy chuẩn frontend FlexPay CMS

Áp dụng cho mọi màn hình hoặc tính năng frontend được tạo mới hoặc chỉnh sửa sau
này. Lấy `src/pages/merchant-management/merchant-access/` làm mẫu về cách chia
trách nhiệm giữa các file. Tuân theo `DESIGN.md`, component wrapper hiện có,
`.prettierrc` và cách tổ chức API của repository.

## Cấu trúc tính năng

Đặt code của một tính năng trong một thư mục riêng dưới `src/pages/`. Tạo thư
mục con theo trách nhiệm khi có code tương ứng:

```text
feature/
  pages/       Trang nối dữ liệu, trạng thái giao diện và các component
  components/  Bộ lọc, form, modal, dialog, drawer và phần giao diện dùng lại
  columns/     Cấu hình cột bảng, gồm cột số thứ tự có header #
  hooks/       Hook truy vấn, lọc, phân trang và logic dùng lại
  dto/         Hàm chuyển dữ liệu API sang kiểu dùng trong giao diện
  types/       Kiểu dữ liệu của tính năng
  schemas/     Schema form và kiểm tra dữ liệu
  constants/   Hằng số và nhãn dùng chung
  utils/       Hàm thuần, không chứa React hook
  test/        Test và fixture chỉ dùng cho test
```

Không tạo thư mục rỗng. Tên file phải thể hiện đúng phần việc, như
`MerchantUserFilters.tsx`, `merchantUser.columns.tsx`,
`useMerchantUserListData.ts`. Page không chứa cấu hình cột dài, form/modal lớn,
dữ liệu mẫu hoặc logic truy vấn và lọc có thể đặt trong hook.

## Format bắt buộc

- Mọi file code mới hoặc đã sửa phải được format bằng Prettier theo
  `.prettierrc` của repository. Không format thủ công theo quy tắc riêng.
- Sau khi sửa xong, chạy `npx -y prettier@3.6.2 --write <các-file-đã-sửa>` và
  `npx -y prettier@3.6.2 --check <các-file-đã-sửa>`. Lệnh `--check` phải thành
  công trước khi báo hoàn tất.
- Nếu còn sửa code sau lần format cuối, chạy lại cả `--write`, `--check` và kiểm
  tra số dòng.

## Giới hạn file

- Mọi file `.ts` và `.tsx` trong tính năng, kể cả test, có **tối đa 300 dòng sau
  khi chạy Prettier**. 300 dòng được phép; 301 dòng phải tách file.
- Tách theo trách nhiệm, không rút ngắn code hoặc bỏ format để đạt giới hạn.
- Khi sửa một tính năng có file vượt giới hạn, tách file đó trong phạm vi công
  việc trước khi báo hoàn tất.
- Sau khi format, kiểm tra lại số dòng. Dùng
  `node scripts/check-feature-lines.mjs <đường-dẫn-thư-mục-tính-năng>`; lệnh
  phải thành công.

## Dữ liệu và UI

- Dữ liệu hiển thị và thao tác phải đi qua service/API thật của dự án. Không đặt
  mock data hoặc store giả trong mã chạy thực tế. Fixture và MSW chỉ đặt trong
  test.
- Dùng hook RTK Query hiện có hoặc bổ sung endpoint vào service phù hợp; xử lý
  loading, empty, error và thông báo thành công/thất bại.
- Dùng component wrapper và token thiết kế sẵn có. Các màn danh sách cùng loại
  phải đồng nhất vị trí bộ lọc, card danh sách, nút thêm mới, bảng, phân trang
  và dialog.
- Cấu hình cột nằm trong `columns/`; bảng danh sách có cột `#` tính đúng theo
  trang và kích thước trang.

## Kiểm tra trước khi hoàn tất

Chạy Prettier `--write` và `--check`, ESLint và test liên quan. Chạy kiểm tra
TypeScript; nếu repo có lỗi không liên quan đã tồn tại, nêu rõ lỗi đó. Kiểm tra
số dòng sau format bằng script trên và không báo hoàn tất khi file thuộc tính
năng còn vượt 300 dòng.
