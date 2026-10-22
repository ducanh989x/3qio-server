# 3Q.io v2.9.0 — Một website, mở là chơi chung

## Cách đơn giản nhất: Render Blueprint
1. Tải **3qio-web-v2.9.0.zip**, giải nén. Tạo repository GitHub rồi upload **nội dung** vào gốc repository: phải thấy ngay `render.yaml`, `Dockerfile`, `package.json`, `server/`, `scripts/`, `public/`. Không upload nguyên ZIP, không đặt mọi file trong thư mục con. Không cần itch.io.
2. Vào Render → **New → Blueprint**, kết nối repository đó. Render đọc sẵn `render.yaml`: Docker, một web service, một instance, health check `/api/status`. Kiểm tra cấu hình và gói **Free** rồi tự xác nhận triển khai. Không cần nhập Build/Start Command, API key, WSS hoặc cấu hình cổng.
3. Chờ **Live**, mở địa chỉ HTTPS do Render cấp. Website này chính là game. Chia sẻ địa chỉ đó cho mọi người: nhập tên → **CHƠI ONLINE** → tự ghép vào phòng công khai còn chỗ. Có thể chọn **CHƠI CÙNG BẠN** và mã riêng hoặc mở liên kết `?room=MA-PHONG`.

Địa chỉ `/api/status` cần báo `version:2.9.0`, `rulesVersion:7`, `matchmaking:true`, `multiplayer:true`. WebSocket tự dùng cùng host, đường dẫn `/ws`, HTTPS tự chọn WSS. `public/multiplayer-config.js` để trống URL. Không cần xây ZIP HTML5 hoặc cấu hình endpoint riêng.

**Giới hạn:** gói Free có thể ngủ khi không hoạt động và mất thời gian khởi động lại; không phải cam kết 24/7. Muốn hoạt động ổn định hơn hãy tự cân nhắc gói không ngủ và kiểm tra phí. Không tự tăng số instance: phòng lưu trong bộ nhớ, nhiều instance chưa chia sẻ phòng. Deploy/khởi động lại/mất kết nối sẽ mất lượt; không có tài khoản/lưu tiến trình. Mã phòng là cách hẹn gặp, không phải mật khẩu. Tối đa 8 phòng × 16 người, thêm 8 BOT/phòng; đây là trần thiết kế prototype, không phải bảo đảm hiệu năng ở 128 người.

## Nếu không thấy Blueprint
Chọn **New → Web Service**, kết nối cùng repository và chọn runtime **Docker**. Dockerfile có sẵn mọi lệnh; health check `/api/status`, một instance. Chờ Live rồi dùng chính địa chỉ web đó, không cần itch.io. Nếu Render yêu cầu thanh toán/xác minh, chủ tài khoản tự thực hiện; không gửi thông tin đó cho bot.

## Chạy trên máy chủ của bạn
Node.js 20+: `npm ci --omit=dev` rồi `npm start`; mở cổng 3002 (hoặc biến PORT). Gói đã có `public/` và font. Khi dùng mã nguồn chưa có public/: `node scripts/prepare-public.cjs`. Hoặc Docker: `docker build -t 3qio .` rồi `docker run -p 3002:3002 3qio`.

Hạ tầng công khai cần HTTPS/WSS và cho WebSocket upgrade `/ws`. Không dùng Bash.tv preview làm hosting 24/7. Bot chuẩn bị được mã và gói triển khai, nhưng chưa xuất bản hosting khi chưa có quyền truy cập và xác nhận của chủ tài khoản.
