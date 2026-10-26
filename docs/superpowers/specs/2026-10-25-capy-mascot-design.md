# Linh vật Capy đi lại khắp trang CMS

Ngày: 2026-10-25
Bản mẫu đã duyệt (chỉ để xem hành vi, không dùng làm mã nguồn): https://claude.ai/artifact/Pf89iBskvvXJwTJeL3Qfka

## Mục đích

Nhân viên vận hành ngồi với CMS cả ngày. Capy là nhân vật capybara áo xanh của FlexPay, chạy lặng lẽ
trên màn hình cho vui, không cản việc. Người dùng bật/tắt được. Phải luôn an toàn với dữ liệu tiền:
Capy chỉ là hiệu ứng nhìn thấy, không bao giờ đổi nội dung hay giá trị trong trang.

## Mục tiêu

- Capy đi, chạy, nhảy bậc, ngồi nghỉ, ngủ gật, chụp ảnh, vẫy chào trên **toàn bộ trang** sau đăng nhập, không chỉ một bảng.
- Hoạt cảnh kiểu Shimeji: mỗi hành động là một chuỗi khung hình do họa sĩ vẽ, không phải một ảnh tĩnh.
- Bật/tắt dễ trong hai lần bấm. Trạng thái nhớ theo trình duyệt của từng người.
- Kéo thả được: nắm Capy kéo đi, thả thì rơi xuống mép gần nhất bên dưới, choáng rồi đứng dậy.
- Rê chuột vào Capy: vẫy tay và chào theo buổi trong ngày, kèm tên người đăng nhập.

## Không làm

- Không thu chữ, không bóc chữ, không sửa ô nhập hay giá trị nào trong trang. (Đã cắt khỏi phạm vi.)
- Không có chúc mừng UAT/GOLIVE, banner hay pháo giấy. (Đã cắt khỏi phạm vi.)
- Không chạy trên màn hình dưới 768px, không đi vào màn đăng nhập, OTP, xác nhận giao dịch.
- Không âm thanh. Không lưu hay gửi dữ liệu người dùng đi đâu.

## Điều tuyệt đối không được xảy ra (anti-goal)

Capy che số tiền, số tài khoản hay nút hành động rồi người dùng bấm nhầm; Capy chặn click vào nội dung;
Capy làm chậm trang hoặc ăn CPU khi đang tắt.

## Hành vi

**Trạng thái và chuyển động.** Có ba nhóm: đứng (thở, chớp mắt, thỉnh thoảng rút điện thoại ra xem),
di chuyển (đi, chạy, nhảy bậc) và hoạt cảnh (ngồi nghỉ, ngủ gật, selfie, vẫy chào, lộn nhào khi bị thả).
Đi và chạy dùng pose nhìn ngang, quay người bằng khung quay, cất điện thoại trước khi đi và rút ra khi dừng.
Chạy khi quãng dài (trên khoảng 260px), đi khi ngắn. Hành động tiếp theo chọn ngẫu nhiên có trọng số
sau 2 đến 4,5 giây đứng chờ. Danh sách chuỗi khung khai ở một nơi, thêm khung mới chỉ cần thêm tên.

**Nền đứng được.** Lớp phủ cố định phủ cả viewport. Đáy viewport luôn là nền, để Capy không bao giờ
rơi mất. Ngoài ra Capy đứng và đi trên mép trên của thẻ, hàng bảng, nút và ô nhập đang nằm trong
khung nhìn. Các phần tử này nhận biết tự động theo danh sách selector, có thể thêm nhãn
`data-capy="platform"` để chỉ định. Khi mép đang đứng cuộn khuất, Capy rơi xuống nền bên dưới.

**Vùng cấm.** Capy không tự đi vào, thả vào thì tự dịch ra, và không đứng chồng lên: số tiền, số tài
khoản, số điện thoại, nút hành động (hoàn tiền, đóng băng, duyệt), ô đang được gõ, hộp thoại. Vùng cấm
nhận biết bằng nhãn `data-capy="no"` và danh sách mặc định (xem "Giao diện bật/tắt" bên dưới về
nơi khai). Có hộp thoại mở hoặc người dùng đang gõ thì Capy ngồi xuống ở góc dưới.

**Click xuyên qua.** Chỉ hộp của Capy (khoảng 54x78px) bắt chuột để kéo thả và rê chuột. Mọi nơi khác
trên lớp phủ cho chuột đi xuyên qua.

**Lời chào có tên.** Rê chuột vào Capy (chỉ chuột, không cảm ứng) thì vẫy tay và hiện bong bóng
khoảng 2,7 giây, nghỉ 6 giây giữa hai lần. Câu chào chọn ngẫu nhiên trong ba mẫu: "Chào buổi {sáng,
trưa, chiều, tối}, {tên}!", "Chào {tên}!", "{tên} ơi, làm việc vui nhé!". Tên lấy từ
`profile.fullName` trong auth slice (nếu trống thì `profile.email`), gọi bằng **chữ cuối của họ tên**
(Trần Huy thành "Huy"). Không chào khi Capy đang nhảy, rơi, bị nắm hay choáng. Bấm vào Capy cũng chào.

## Giao diện bật/tắt

- Nút nhỏ ở header cạnh avatar. Bấm mở menu: công tắc Bật/Tắt, và "Chỉ đứng yên" (Capy không đi lại, **được lưu**).
- Bấm vào chính Capy: menu nhỏ Chào / Ngủ / Ẩn. "Ẩn" **giống hệt Tắt**: được lưu, Capy vẫy chào rồi biến mất, bật lại ở nút header.
- Tắt: Capy vẫy "Bye Bye" rồi mờ dần, dừng hẳn vòng vẽ và bộ đếm giờ (không tốn CPU).
- Nhớ theo trình duyệt (`localStorage`), khóa `capy:<username>` với `username` lấy từ `profile.username` (claim
  `preferred_username`), ổn định giữa các lần đăng nhập. Lưu hai giá trị: bật/tắt và "chỉ đứng yên". Chỉ lưu
  tuỳ chọn giao diện, không lưu token hay dữ liệu nhạy cảm.
- Công tắc tổng ở cấu hình môi trường: biến build-time `VITE_CAPY_ENABLED`, đọc qua
  `src/app/configs/env.ts`. Thiếu biến hoặc khác `true` thì tính năng **không tồn tại** với mọi người
  (chưa phát hành). Đổi giá trị cần dựng lại và triển khai lại bản FE, không phải công tắc chạy thời gian
  thực. Khi tính năng đã bật toàn hệ thống, "mặc định bật cho người dùng mới" mới có nghĩa.
- Chạy trên mọi route sau đăng nhập, trừ các route trong danh sách chặn (xem "Phạm vi").
- Capy gắn trong `AppLayout`, nên màn đăng nhập và các màn dùng `AuthLayout` không có Capy. Xác nhận
  giao dịch là hộp thoại trong màn, nên được bảo vệ bằng quy tắc "có hộp thoại mở thì Capy ngồi ở góc",
  không chặn theo route.
- Tự tắt: người dùng bật "giảm chuyển động" của hệ điều hành và màn hình dưới 768px.
- Tạm dừng vòng vẽ khi tab bị ẩn.

## Cấu trúc trong dự án

Thư mục mới `src/components/capy/`, tuân thủ giới hạn 300 dòng mỗi file và quy ước tên của repo:

- `Capy.tsx`: component gốc, gắn một lần trong `AppLayout`, vẽ canvas, nhận chuột.
- `CapyToggle.tsx`: nút và menu ở header (dùng wrapper trong `components/ui`, không import `antd` trực tiếp).
- `engine/`: máy trạng thái (hành động, chuyển động, rơi), chọn nền đứng, vùng cấm, trình phát khung hình.
- `frames/`: danh sách chuỗi khung và manifest; ảnh WebP đã xử lý nằm ở `public/images/capy/`.
- `hooks/useCapySettings.ts`: đọc/ghi tuỳ chọn bật/tắt, điều kiện tự tắt.
- `test/`: kiểm thử engine và công tắc.

Hằng và chuỗi hiển thị (câu chào, nhãn menu) đi qua i18n `vi` và `en` của dự án. Ảnh khung hình tải
**lười**, chỉ khi người dùng bật Capy, khoảng 300KB.

## Phạm vi

- **Mọi màn sau đăng nhập đều có Capy** (quyết định của chủ sản phẩm, thay cho danh sách màn cho phép ban đầu).
  Chỉ chặn route đăng nhập và route từ chối truy cập (`CAPY_BLOCKED_PATHS` trong `capyRoutes.ts`).
- Để bù cho việc không còn đánh dấu từng màn, vùng cấm có **tự nhận biết theo nội dung** (`engine/sensitive.ts`):
  ô chứa số tiền (có phân cách nghìn hoặc đơn vị VND), dãy từ 9 chữ số trở lên (tài khoản, điện thoại, giấy tờ),
  và ô bảng có nút thao tác. Cộng với nhãn `data-capy="no"` đặt tay. Đây là lưới an toàn heuristic: nó không
  thay thế được việc đánh dấu tay những thứ nhạy cảm mà nội dung không lộ ra (ví dụ số ngắn hơn 9 chữ số).
- Màn có dữ liệu nhạy cảm không nhận ra được bằng nội dung thì đánh dấu `data-capy="no"` khi gặp.

## Hình ảnh

Bộ khung do họa sĩ cung cấp (15 nhóm hoạt cảnh), gồm: đứng 3 khung, đi 8, chạy 5, quay người 3, rút điện thoại 4,
nhảy 2 (khung 1 và 3), tiếp đất 1 (khung 4), ngồi nghỉ 4, đẩy ô tìm kiếm 4, selfie 5, mừng 5 (chỉ dùng khung 4, 5
cho "Bye Bye"), gật gù 4, vẫy tay 4, nằm ngủ 3. Các khung đã xử lý (PNG nền trong, kèm điểm neo và hệ số tỉ lệ
theo nhóm) và tập lệnh cắt ảnh hiện nằm ở thư mục làm việc của phiên này; **bước đầu của kế hoạch là đưa chúng
vào repo**: ảnh vào `public/images/capy/`, tập lệnh vào `scripts/capy/`, kèm manifest. Đã cắt nền, căn chân, thu về cùng tỉ lệ đầu, bỏ các
đạo cụ vẽ kèm (khối xám, thanh tìm kiếm, số thứ tự, bong bóng). Hạn chế đã biết: ảnh nhỏ (khoảng 100px
cao) nên hơi mềm trên màn hình độ phân giải cao; chỉ có hướng phải, đi sang trái là lật ngang nên logo
trên áo bị ngược; hai khung ngã số 5 và 6 của nhóm 6 bị lỗi, **không dùng**. Khi họa sĩ gửi khung mới
hoặc bản độ phân giải cao hơn chỉ cần thay file và cập nhật danh sách khung.

## Ràng buộc kỹ thuật

- Chỉ làm việc trên `main` sau khi `git fetch` và kéo bản mới nhất; có thay đổi chưa commit thì stash rồi pop.
- Không thêm thư viện mới (vẽ bằng canvas 2D thuần).
- Không có `any`, không đọc `import.meta.env` ngoài `src/app/configs/env.ts`.
- Mọi file `.ts` và `.tsx` tối đa 300 dòng sau khi chạy Prettier. Chạy Prettier `--write` và `--check`,
  ESLint, TypeScript, test liên quan, và `node scripts/check-feature-lines.mjs src/components/capy`.
- Có kiểm thử cho: chọn nền đứng, vùng cấm, công tắc bật/tắt và tự tắt, câu chào có tên, rơi xuống nền gần nhất.

## Giao cho người xây dựng quyết

- Danh sách selector tự nhận biết nền đứng, và vị trí khai vùng cấm mặc định. **Cần chốt cùng nhóm sản phẩm**:
  những cột nào thật sự là "nhạy cảm" trên mỗi màn.
- Cấu trúc nội bộ của engine (khi nào dùng ref, khi nào dùng state), cách đo lại vị trí khi cuộn.
- Có đồng bộ nhãn `data-capy="no"` vào wrapper bảng hay không, hay chỉ dùng danh sách trong `src/components/capy`.

## Quyết định của tôi, bạn xem lại

- Mặc định cho người dùng mới: **bật**, vì tắt thì không ai thấy. Có thể đổi bằng một cờ.
- Gọi bằng tên riêng (chữ cuối của họ tên) chứ không phải họ tên đầy đủ.
- Lần đầu chỉ mở trên **một vài màn ít dữ liệu nhạy cảm** rồi mở rộng sau khi vùng cấm đủ. Nếu bạn
  muốn mở toàn hệ thống ngay thì nói.
- Công tắc tổng và danh sách sự kiện của bản mẫu: bỏ phần sự kiện, giữ công tắc tổng.
- Hành động "đẩy ô tìm kiếm" trong bản mẫu chỉ làm trên màn có ô tìm kiếm đánh dấu `data-capy="pushable"`,
  để hoãn sang đợt sau nếu phức tạp. Các hoạt cảnh còn lại đều nằm trong đợt đầu.

## Đã làm khác kế hoạch ban đầu

- Công tắc tổng là biến build-time `VITE_CAPY_ENABLED=true`; mặc định không có biến thì Capy không tồn tại.
- Hành động "đẩy ô tìm kiếm" chưa làm (hoãn sang đợt sau như đã ghi). Các khung đẩy vẫn nằm trong bộ ảnh nhưng chưa dùng.
- Capy đi không băng qua vùng cấm: gặp vùng cấm giữa đường thì dừng sát trước nó (`limitTravel`).
- Tắt Capy (công tắc hoặc "Ẩn") thì Capy vẫy chào tạm biệt rồi mờ dần trong khoảng 1,7 giây.
- Gộp các vùng cấm liền nhau thành một dải trước khi đẩy Capy ra ngoài (nếu không Capy kẹt giữa hai ô liền kề).
- Capy mờ đi (độ trong suốt 0,35) khi đang chồng lên vùng cấm, ví dụ lúc nhảy ngang qua một hàng bảng.

## Độ linh động và bảng cài đặt

- Nút Capy ở header mở **bảng cài đặt** gồm: bật/tắt, chỉ đứng yên, **Tốc độ** (chậm, vừa, nhanh),
  **Độ hiếu động** (ít, vừa, nhiều) và **Ngủ khi không ai động vào** (sau 3, 5, 10, 15 phút hoặc không ngủ).
  Lưu theo từng người cùng khóa `capy:<username>`; giá trị hỏng rơi về mặc định.
- Mặc định: tốc độ vừa (đi 55 px/giây, chạy 140 px/giây), hiếu động vừa (nghỉ 6 đến 12 giây giữa hai hành động,
  chủ yếu ngồi nghỉ và chụp ảnh), ngủ sau 5 phút.
- Không động vào trang (chuột, phím, cuộn, chạm) đủ lâu thì Capy gật gù rồi ngủ 1 đến 2 phút, sau đó dậy và
  làm việc bình thường. Có người động vào thì đếm lại từ đầu. Người dùng chọn "Ngủ" trong menu của Capy cũng
  được giấc ngủ 1 đến 2 phút.
- Số cụ thể của từng mức nằm ở một file duy nhất: `src/components/capy/engine/tuning.ts`.

## Vùng cấm: tạm tắt

Vì hiện không có tương tác nào chạm vào chữ trên trang, vùng cấm đang **tắt** (`SAFETY.forbiddenZones = false`
trong `engine/tuning.ts`): Capy không né, không mờ đi và không dừng trước ô số tiền, số tài khoản hay nút
thao tác. Mã né vùng cấm (`zones.ts`, `sensitive.ts`, nhãn `data-capy="no"` trên ba màn quản lý tài khoản và quyền)
vẫn còn nguyên; bật lại bằng cách đổi công tắc thành `true`. Hộp thoại mở thì Capy vẫn ngồi ở góc, độc lập với
công tắc này. Phần "Vùng cấm" ở trên mô tả hành vi khi công tắc bật.

## Sân khấu: chỉ đi dọc đáy khung màn hình

Capy chỉ đi lại dọc đáy khung màn hình (`STAGE.pagePlatforms = false` trong `engine/tuning.ts`), không đứng
trên mép thẻ, hàng bảng, nút hay ô nhập ("bậc thang"), và hành động nhảy bậc đã bỏ khỏi danh sách. Kéo Capy lên
giữa trang rồi thả thì Capy rơi xuống đáy (lộn nhào nếu rơi cao). Phần mô tả "Nền đứng được" ở trên chỉ áp dụng khi
công tắc bật. Đi dọc cạnh trái, phải hoặc trên của khung màn hình cần khung hình leo tường và treo trần mà bộ ảnh
hiện chưa có.

