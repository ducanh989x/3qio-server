# HUD gọn & thoát trận · v2.10.0

## Khi chơi
- Giữ panel nhỏ: cấp/tướng/phe, vũ khí đang cầm, HP/thể lực; giữ thanh EXP và nút pause 44px.
- Giữ túi để đổi đồ tại cờ; chỉ hiện skill khi vũ khí có skill, nhưng vẫn hiển thị hồi chiêu. Chỉ hiện tiến độ ngọc rồng khi đã có ít nhất một viên.
- Minimap thu nhỏ ở góc phải trên; ẩn trên màn hình touch ngang rất thấp để nhường chiến trường/nút điều khiển. Không bỏ dữ liệu minimap hoặc cờ.
- Ẩn top banner, leaderboard thường trực, thống kê thời gian/hạ gục, tên riêng trong HUD, chỉ số ATK/ASPD chi tiết, hướng dẫn dài, nút quốc gia/tiến hóa/âm thanh/hướng dẫn trên HUD và thanh room/ping/leave. Không xóa ID cũ hoặc data gameplay; menu cung cấp các chức năng này.
- Thông báo tiến hóa/gia nhập còn 2s, bỏ nhãn trang trí, thu chữ nhỏ hơn. Bảo hộ, tiến độ đứng cờ, popup túi và feedback giao chiến vẫn hoạt động.
- CSS compact ở cuối loot.css, body.compact-ui + in-match điều khiển HUD. Không vẽ HUD sau thoát/lobby. Leaderboard ẩn không được dựng lại mỗi update; menu dựng top5 bằng textContent khi mở.

## Menu pause
- SOLO: tạm dừng thật. ONLINE: dừng input nhưng server vẫn chạy, cảnh báo rõ nhân vật có thể bị đánh ngoài vòng cờ.
- Tiếp tục và THOÁT TRẬN nằm đầu menu, không cần cuộn trên các viewport đã kiểm tra. Không dùng confirm/alert/prompt của trình duyệt.
- Có Hướng dẫn, Võ tướng, Quốc gia, Âm thanh; ONLINE có Mời bạn và mã phòng/số người/ping. Thông tin trận/trang bị và top5 mở rộng bằng details.
- Thông tin chi tiết là ảnh chụp lúc mở menu; server vẫn cập nhật gameplay. Nếu chết khi đang xem ONLINE, chuyển sang bảng chết có Thoát trận.
- Nickname và bảng xếp hạng đưa vào DOM bằng textContent, không nội suy HTML từ người dùng.
- Space/Enter trên nút menu giữ thao tác bàn phím chuẩn, không tạo lệnh chém. Mở/đóng menu xóa phím và capture owner cũ để không tiếp tục di chuyển ngoài ý muốn.

## Thoát và vòng đời
`exitMatch()` dùng chung: ONLINE gọi net.leave() để đóng WebSocket thật; SOLO về lobby trực tiếp. `finishMatch()` xóa bag, trang bị/ngọc/EXP phiên, input, hiệu ứng, resources/actor local, timer/camera/cache HUD rồi tạo actor Lv1 khúc gỗ. Không xóa tài khoản/dữ liệu lâu dài vì game chưa có lưu tiến độ.

ONLINE: xóa entities, hủy timeout, socket cũ bị gỡ handler close; guard socket ngăn snapshot cũ vào lượt mới. Server xóa riêng actor vừa rời, không reset room hoặc rương của người còn lại. Rejoin là guest ID/lượt mới; không hồi phục đồ cũ. Chết cũng có nút thoát; x đóng bảng chết SOLO về lobby sạch.

Không đổi luật combat, AI, drop, XP, sprint/dash hoặc giao thức 7. **Client HTML5 v2.10.0 dùng được với Render v2.9.0 hiện có**, không cần restart/cập nhật backend chỉ để nhận hai thay đổi UI này. Chỉ thay ZIP browser trên itch.io; gói itch-online đã gắn cùng WSS của người dùng.

## Kiểm thử
- clean-hud.browser.js: HUD cần/không cần, nút theo trang bị/ngọc, pause/resume Space, thoát SOLO/reset/restart, nickname không tạo HTML, 390×844/320×568/844×390/568×320, nút thoát 44px trong viewport, minimap không kéo thành cột.
- clean-hud-network.browser.cjs: socket thật hai người desktop/touch, server tiếp tục khi pause, input dừng ngay, exit xóa actor nhưng giữ room/chests của người khác, rejoin sạch và death exit.
- Các browser test cũ đi qua Pause → chức năng tương ứng, không force-click các nút HUD đã ẩn.
