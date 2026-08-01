---
target: màn 403 Forbidden
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-01T18-21-08Z
slug: src-pages-error-forbiddenerror-tsx
---
# Critique — Màn 403 Forbidden

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Trạng thái chặn rõ nhưng không nói chức năng/quyền cụ thể bị thiếu. |
| 2 | Match System / Real World | 3/4 | Tiếng Việt rõ; “HTTP 403” còn kỹ thuật và “Danh tính” dễ lẫn eKYC. |
| 3 | User Control and Freedom | 2/4 | Nút Back không đảm bảo đưa về một màn CMS an toàn. |
| 4 | Consistency and Standards | 2/4 | Dùng component sẵn có nhưng visual drama và màu raw lệch DESIGN.md. |
| 5 | Error Prevention | 2/4 | Chặn đúng và xác nhận không đổi dữ liệu; đường phục hồi chưa chắc chắn. |
| 6 | Recognition Rather Than Recall | 2/4 | Người dùng phải nhớ thao tác vừa làm và tự suy ra quyền cần xin. |
| 7 | Flexibility and Efficiency | 2/4 | Chưa có landing page theo role hoặc yêu cầu cấp quyền có thể hành động. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Tập trung, ít lựa chọn; hai mã 403 và nhiều lớp thông báo tạo nhiễu. |
| 9 | Error Recovery | 2/4 | Có hướng dẫn chung nhưng thiếu module, capability và đầu mối xử lý. |
| 10 | Help and Documentation | 1/4 | Chỉ có câu “liên hệ quản trị viên”, chưa có hành động cụ thể. |
| **Total** | | **22/40** | **Đạt mức cơ bản; cần nâng mạnh khả năng phục hồi.** |

## Design Specificity Verdict

Màn hình có tính riêng cho FlexPay ở mô hình “phiên đăng nhập → quyền truy cập → tài nguyên được bảo vệ” và câu trấn an rằng dữ liệu chưa thay đổi. Tuy nhiên, mã 403 khổ lớn lặp hai lần, badge HTTP và hiệu ứng reveal vẫn gần với template SaaS error chung hơn là một công cụ vận hành tài chính.

Detector trả `[]`: không có finding cơ học trong `ForbiddenError.tsx` hay `AccessCheckpoint.tsx`. Không có false positive. Browser automation không khả dụng nên không có overlay hoặc xác minh render trực tiếp.

## Overall Impression

Màn hình giải thích ranh giới bảo mật tốt và có cảm giác được thiết kế, nhưng điểm kết thúc còn yếu: người dùng hiểu mình bị chặn mà chưa biết chính xác cần xin quyền gì hoặc nên quay về đâu. Cơ hội lớn nhất là biến 403 từ “trang giải thích” thành “trạm phục hồi công việc”.

## What's Working

- Tuyến ba bước biến lỗi cụt thành mô hình dễ hiểu: tài khoản hợp lệ, quyền bị chặn, tài nguyên được bảo vệ.
- Copy “không có thay đổi nào được thực hiện” phù hợp với hệ thống tài chính và giảm lo lắng.
- Nền tảng a11y tốt: focus heading, reduced-motion, icon trang trí ẩn, trạng thái không phụ thuộc chỉ vào màu.

## Priority Issues

### [P1] “Xem quyền của tôi” chưa giúp chẩn đoán hoặc xin quyền

- **Why it matters:** modal profile chỉ cho thấy role chung; người dùng vẫn không biết capability nào thiếu để báo quản trị viên.
- **Fix:** đổi nhãn thành “Xem vai trò của tôi”, hoặc tốt hơn hiển thị module/action bị chặn và tạo tóm tắt yêu cầu cấp quyền có thể copy.
- **Suggested command:** `$impeccable clarify` + `$impeccable harden`.

### [P1] Lối thoát chính chưa đảm bảo an toàn

- **Why it matters:** `navigate(-1)` có thể rời CMS; fallback `/` có thể đưa người đã đăng nhập qua login. Middleware đã lưu `forbiddenFrom` nhưng page chưa dùng.
- **Fix:** điều hướng tới last-authorized route đã validate hoặc trang đầu tiên user có quyền; giữ browser Back làm hành động phụ.
- **Suggested command:** `$impeccable harden`.

### [P2] “Danh tính · Đã xác thực” sai ngữ cảnh domain

- **Why it matters:** trong FlexPay, “danh tính” dễ được hiểu là eKYC, trong khi hệ thống chỉ biết phiên đăng nhập còn hợp lệ.
- **Fix:** dùng “Phiên đăng nhập · Còn hiệu lực” hoặc “Tài khoản · Đã đăng nhập”.
- **Suggested command:** `$impeccable clarify`.

### [P2] Visual drama lấn át nhiệm vụ Operate

- **Why it matters:** badge, hai mã 403, heading và animation cùng nói một điều; teal bị dùng trang trí thay vì chỉ đường.
- **Fix:** giữ một error marker, hạ mã 403 nền, đưa recovery lên ưu tiên, dùng semantic tokens và typography theo DESIGN.md.
- **Suggested command:** `$impeccable distill`.

### [P2] Checkpoint chưa có semantic sequence

- **Why it matters:** generic div/span không diễn đạt rõ chuỗi ba trạng thái cho screen reader.
- **Fix:** dùng `<ol>/<li>` và summary ẩn; tăng touch target mobile lên tối thiểu 44px.
- **Suggested command:** `$impeccable audit`.

## Persona Red Flags

- **Alex — power user:** bị chặn giữa ca xử lý nhưng không có module/capability cụ thể, phải tự đọc role và nhắn quản trị viên thủ công.
- **Sam — keyboard/screen-reader:** focus heading tốt, nhưng checkpoint không phải semantic list nên quan hệ ba trạng thái chưa được thông báo rõ.
- **Lan — back-office operator:** cần quay về queue an toàn và gửi yêu cầu quyền chính xác; Back hiện có thể rời CMS, còn “Danh tính” dễ lẫn eKYC.

## Cognitive Load

Mức trung bình, thất bại 2/8 tiêu chí: hierarchy bị mã 403 lặp lấn át recovery; working memory buộc user nhớ chức năng vừa thao tác và tự suy ra quyền thiếu. Các tiêu chí single focus, chunking, grouping, minimal choices và progressive disclosure đều đạt.

## Minor Observations

- Connector line trông như tiến trình, trong khi authorization là chuỗi quyết định không thể tiếp tục từ đây.
- Màu và font size hardcode bỏ qua semantic token đã ghi trong DESIGN.md.
- Responsive row-to-stack hợp lý theo source, nhưng chưa xác minh viewport thấp, zoom và contrast trên browser thật.

## Questions to Consider

- Màn này có nên trả lời “chức năng nào bị chặn, thiếu quyền gì, ai có thể cấp” trước khi nói “HTTP 403” không?
- Primary action nên là Back hay “Về màn làm việc gần nhất” được chọn từ route user có quyền?
- User cần xem danh sách role, hay cần một gói yêu cầu cấp quyền có thể copy và gửi ngay?
- Một ranh giới bảo mật yên tĩnh, vận hành hơn có đáng tin hơn visual 403 kịch tính không?
