# Cắt khung hình Capy

Hai tập lệnh Python (cần Pillow) dùng để tạo ảnh trong `public/images/capy/` từ bảng 15 hoạt cảnh của họa sĩ.
Chúng là bản chép nguyên từ lúc dựng bản mẫu, đường dẫn đầu vào còn trỏ vào thư mục làm việc cũ, nên cần sửa
lại đường dẫn trước khi chạy lại.

- `build-frames.py`: tách từng khung khỏi nền đen, bỏ đạo cụ (khối xám, thanh tìm kiếm, số thứ tự, bong bóng),
  căn điểm neo, xuất `frames.json`.
- `build-scales.py`: đo chiều cao đầu (đỉnh nón đến cổ áo) của từng nhóm và tính hệ số tỉ lệ `s`.

Kết quả đã được chép vào `src/components/capy/frames/manifest.ts`. Hai khung ngã số 5 và 6 của nhóm nhảy bị lỗi
nên không dùng. Khi họa sĩ gửi khung mới: thay ảnh, cập nhật manifest và `animations.ts`.
