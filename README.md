### CameraHCC-WD-1.0

Repository này hiện bao gồm một trang web tĩnh **Web Link Scanner** để quét link do người dùng cung cấp và hiển thị:
- Nội dung tóm tắt trang (title/description/snippet).
- Điểm an toàn ước tính theo heuristic.
- Các dấu hiệu rủi ro và khuyến nghị sử dụng an toàn.

## Chạy ứng dụng

Vì đây là web tĩnh, bạn chỉ cần mở file `index.html` trực tiếp hoặc chạy server local:

```bash
python3 -m http.server 8000
```

Sau đó truy cập: `http://localhost:8000`

## Tính năng chính

- Nhập URL bất kỳ để quét nhanh.
- Chuẩn hóa URL tự động (tự thêm `https://` nếu thiếu).
- Đánh giá an toàn bằng các tiêu chí:
  - Có dùng HTTPS hay không.
  - Tên miền/path có từ khóa đáng ngờ.
  - Dùng IP thay vì domain.
  - URL quá dài, cấu trúc path bất thường, có ký tự `@`.
- Hiển thị khuyến nghị khi truy cập link lạ.

## Lưu ý

- Điểm an toàn chỉ mang tính tham khảo, không thay thế công cụ bảo mật chuyên sâu.
- Nên kiểm tra thêm bằng VirusTotal hoặc Google Safe Browsing trước khi đăng nhập/nhập dữ liệu nhạy cảm.
