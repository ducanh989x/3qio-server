# Hiệu năng và điều hướng · v2.9.0

## Điều khiển
- `movementIntent()` dùng chung SOLO/ONLINE; chuẩn hóa đường chéo, giữ biên độ analog và không tự tăng tốc.
- WASD/mũi tên ưu tiên di chuyển, thả hết phím thì dừng dù con trỏ cũ đang xa. Di chuột thực sự hoặc click canvas mới trở lại chế độ chạy theo chuột. Chuột vẫn ngắm khi dùng bàn phím. Phím vật lý KeyW/A/S/D không phụ thuộc bộ gõ tiếng Việt.
- Góc ngắm tính từ vị trí nhân vật trên màn hình (`W/2 + player.x - camera.x`), không giả định nhân vật luôn đúng giữa màn hình khi camera đang bám.
- Joystick: vùng chết 4px/35px, biên độ remap liên tục đến 1 ở mép; không nội suy chậm lệnh. Mỗi joystick/chém/chạy sở hữu pointer riêng, không giành ngón; hủy capture/thả tay xóa đúng nút. Chỉ đọc layout joystick lúc bắt đầu/resize, không mỗi lần move.
- Menu/mất focus/ẩn tab xóa phím/nút còn giữ; ONLINE gửi stop ngay thay vì chờ timeout 350ms. Đổi giữa bàn phím/chuột và touch cập nhật giao diện tương ứng trên thiết bị lai.
- Camera dùng `1-exp(-12*dt)`, nhất quán qua nhiều FPS, không thêm quán tính vào tốc độ nhân vật. SOLO chia khung chậm thành bước ≤25ms, tổng catch-up tối đa 100ms; không còn bỏ mọi thời gian vượt 35ms. ONLINE cập nhật hình ảnh một lần/khung, không chạy thêm mô phỏng máy chủ. Mất tab không tích lũy cú nhảy dài.

## Render và allocation
- 120 stats loại/phẩm được memoize/freeze, giữ nguyên mọi giá trị, không chia sẻ đồ/túi/ID cá nhân. Không tạo bản stats mới cho mỗi lần hỏi reach/ATK/ASPD.
- Trang trí nặng được raster cache LRU tối đa 64 sprite 160×192, khoảng 7,5 MiB pixel thô (chưa tính overhead trình duyệt). Cỏ/đá nhỏ vẫn vẽ trực tiếp; quốc kỳ động không cache vào trang trí. LRU có thể tái dùng khi di chuyển, không tăng vô hạn khi đi quanh map. Không cache nhân vật/biểu cảm/vũ khí.
- Minimap 10Hz thay vì mỗi khung, gradient viền chỉ tạo lại lúc resize/DPR đổi. DPR tối đa 1,75 touch / 2 desktop, hạ theo ngân sách khoảng 3 triệu pixel nếu có thể, không xuống dưới 1; DOM/chữ không bị hạ độ phân giải. HUD touch không dùng backdrop blur.
- HUD có khóa dữ liệu theo những gì đang hiển thị; leaderboard chỉ dựng lại nếu top5 đổi. Snapshot không cập nhật HUD trùng với tick 10Hz; vẫn cập nhật ngay khi vào phòng/đổi cấp/phe/sống-chết. Không giảm tần số mô phỏng server, quan sát AI hay kiểm tra va chạm.

## ONLINE
- Không đổi giao thức 7 hoặc trường input. Input đổi được gửi sớm ở nhịp tối đa khoảng 62,5Hz; idle heartbeat khoảng 30Hz. Không xếp thêm input khi WebSocket bufferedAmount ≥4KiB; vẫn dưới giới hạn 100 message/s trong trường hợp thông thường. Nút kỹ năng/lướt/chém đánh dấu input dirty, không tích lũy dùng skill tự động khi hết cooldown.
- Vị trí hiển thị có ngoại suy ngắn dựa trên vận tốc quan sát, tối đa 80ms cho đối thủ; phản hồi hướng di chuyển của chính mình tối đa 100ms và luôn sửa theo snapshot. Không phải rollback hoặc tái mô phỏng input có ack. Khi mạng lag vẫn có thể có hiệu chỉnh; không thể loại bỏ ping bằng render.
- Dừng ngoại suy sau giới hạn, không chạy mãi khi mất gói. Bước nhảy >250, đổi trạng thái sống/chết/respawn và clash reset dự đoán; clamp theo biên/hitbox. Góc xoay idle đi đường ngắn qua ±π; đòn chém/clash dùng góc máy chủ.
- Client không cộng/trừ EXP, HP, stamina hoặc xác nhận hit để dự đoán hình ảnh. Equip tại cờ vẫn dựa tọa độ netX/netY và validation server. Phản hồi bảo hộ/capture/vùng an toàn cũng dùng netX/netY khi ONLINE, không báo an toàn sớm chỉ vì hình ảnh dự đoán vừa chạm cờ. Tốc độ/chi phí sprint, dash, damage/blocks, rương/loot/EXP/nations, robot và BOT chiến thuật giữ nguyên.

## Kiểm thử và số đo
`npm test` thêm smooth.test.cjs: input, deadzone, camera 20/30/60/120Hz, chia dt, cache 120 stats. smooth.browser.js dùng CDP touch thật 3 ngón đồng thời chạy/chém/joystick, release/cancel, menu, chuyển input lai. smooth-network.browser.cjs trì hoãn snapshot 150ms: hiển thị dự đoán bị giới hạn, stop menu, teleport, input rate và không trừ XP ở client. balance.browser.js vẫn kiểm tra 486 tổ hợp hình vẽ/hitbox.

Bài microbenchmark `tests/performance.browser.js`, Chromium sandbox, viewport 1280×800, 17 actor, 1.350 orb, 100 render sau warm-up:
| Chỉ số | v2.8 trước tối ưu | Sau tối ưu |
|---|---:|---:|
| Render median | 3,0ms | 2,6ms |
| Render p95 | 18,5ms | 14,9ms |
| DOM mutations / 30 HUD update không đổi | 780 | 0 |
| 100.000 truy vấn stats | 18,4ms | 3,3ms |

Đây là một lần đo mẫu, không phải cam kết FPS trên điện thoại hoặc benchmark production/128 người. CPU/GPU, browser, nhiệt độ máy, ping và hosting vẫn ảnh hưởng kết quả. Preview là bản thử, không phải hosting 24/7.
