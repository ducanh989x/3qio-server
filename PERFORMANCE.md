# Hiệu năng và điều hướng · v2.15.0

## ONLINE v2.15 (protocol10 không đổi)
- Client xin `transport: rows-v1` khi join; server chỉ gửi `actorRows` nếu client đồng ý. `actorFields` gửi một lần ở welcome, thứ tự field/value giữ nguyên dữ liệu làm tròn và nullable. Client v2.15 tự dùng object cũ nếu backend2.14 không hỗ trợ; client2.14 vẫn nhận object từ server2.15. Không đổi input/gameplay. Tàng hình lọc theo người xem **trước** cả object/rows, inventory chỉ của chính socket; không gửi vị trí/HP người ẩn tới đối thủ.
- Input đổi gửi tối đa khoảng30Hz; skill/dash/pulse ưu tiên khoảng16ms. Input không đổi (kể cả giữ một hướng) heartbeat100ms thay vì mỗi33ms. Stop/menu/blur/hidden vẫn gửi ngay, stale-input server350ms giữ nguyên. Pulse không nhân đôi, không mất vì so sánh gói giống nhau; client backpressure4KiB giữ nguyên. Không giảm tốc mô phỏng/kiểm tra hit/cost.
- Đối thủ có tối đa4 mẫu vị trí, nội suy theo server elapsed với buffer mục tiêu60–100ms thích ứng jitter. Đồng hồ phát hình chạy liên tục, điều chỉnh tốc độ nhẹ khi gói đến dồn, không nhảy theo từng lần nhận; bị giới hạn trong cửa sổ lịch sử/ngoại suy. Ngoại suy sau mẫu cuối tối đa80ms, không chạy mãi khi nghẽn. Snapshot cũ/trùng bỏ qua; actor mới/reveal/teleport/clash/đổi sống/chết reset lịch sử. Chỉ thay vị trí hiển thị, không tính hit/damage/HP/EXP/safety bằng vị trí đó. Tự điều khiển vẫn dùng dự đoán cũ≤100ms, không thêm buffer60–100ms vào nhân vật mình.
- Server bỏ gửi snapshot mới khi socket đang có>32KiB chưa thoát (cũ512KiB), giữ ngưỡng ngắt>2MB. Không thể xóa dữ liệu TCP đã xếp hàng nhưng tránh chất thêm hàng dài; trở lại gửi trạng thái đầy đủ hiện tại khi thông. Không delta-chain, không cần ack để hồi phục sau frame bị bỏ.
- Round actor/tuple tài nguyên một lần/phòng/đợt, tái dùng giữa người xem, vẫn lọc tài nguyên bằng tọa độ thô để giữ đúng ranh giới. Rương vẫn toàn bản đồ5Hz, radar10Hz; actor15Hz/physics30Hz/AI/loot không đổi.
- Vòng hút EXP dùng broad phase hình chữ nhật trước khi gọi hypot, cache radius/tọa độ theo actor và refresh ngay sau pickup/levelup/đổi kích thước. Không đổi kết quả hút/nhặt, thứ tự tranh ngọc, delay, cap EXP hoặc luật Tàng hình. Test so từng orb và tiến độ với vòng cũ qua5 cấp (1/10/19/20/21), ranh giới±1e−8, levelup sát biên, nhiều actor, orb có delay/ẩn/chết.
- Compile9 script VM một lần khi mở process, mỗi phòng chạy trong context riêng; không chia sẻ actor/inventory/brain/state hoặc object luật giữa phòng. HUD ping/count chỉ viết DOM khi chữ thay đổi.

### Kiểm tra v2.15 / giới hạn số đo
- `online-performance.test.cjs`: legacy/rows có cùng giá trị, ranh giới resource, stealth/latejoin, inventory riêng, skip socket nghẽn, code cache không chia sẻ state; nội suy hữu hạn/20–120Hz/≤80ms.
- `online-performance.browser.cjs`: trình duyệt thật, input idle10 gói/1,15s và giữ hướng12 gói/1,12s trong một lượt đo (cũ khoảng30Hz); Q đúng một pulse, menu stop trước350ms, jitter có thứ tự0–110ms/bỏ một số snapshot, lịch sử≤4, teleport snap, không tự trừ EXP. Chạy thật với backend2.14 từ ZIP cũ và frontend2.15 để kiểm tra fallback.
- Mẫu12 actor: object8.141bytes → rows2.621bytes, giảm khoảng68% **phần actor của snapshot**, không phải68% toàn bộ mạng (orbs/resources/headers vẫn có). Tỉ lệ thay đổi theo số actor/tên/trạng thái.
- Microbenchmark riêng vòng hút EXP trong VM,24 actor/1.350 orb khởi tạo, warm-up rồi100 lần: trung bình7,41ms →2,36ms; lần đầu hypot32.256 →70. Đây không phải toàn bộ tick server/FPS/Render; kết quả sẽ khác theo mật độ ngọc/actor và máy.
- Tạo12 phòng tuần tự trong sandbox: warm-up/đầu vào khác nhau có dao động; trước khoảng8,7–20,4ms, sau6,4–14,4ms. Không coi là benchmark Render hoặc bảo đảm đầy128 người.
- Không thể loại bỏ RTT, nghẽn Internet, Render Free sleep/cold start hoặc giới hạn CPU/GPU/nhiệt độ điện thoại. Nội suy đổi một phần độ trễ hình ảnh đối thủ lấy chuyển động đều; không phải rollback/lag compensation/đồng bộ không ping. Chưa triển khai production. Để được gói rows mới, cập nhật server2.15; chỉ đổi HTML5 cũng dùng được với server2.14 nhưng chưa giảm byte phía server.

## Nền tảng v2.9 (lịch sử)
Phần dưới mô tả bản tối ưu cũ; số nhịp input/giao thức cũ được thay bằng v2.15 ở trên.

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
