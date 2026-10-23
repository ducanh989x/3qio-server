# EXP & binh khí bổ sung · v2.17 / protocol11

## EXP theo cấp đích
Gọi `B(L)=150+60*(L-1)+15*(L-1)^2` với L là cấp hiện tại.
- Lên Lv2–9: giữ nguyên B(L).
- Lên Lv10–20: `ceil(B(L)*(50+3*(cấp_đích-10))/40)`.
- ×1,25 ở mốc lên10, thêm ×0,075 mỗi mốc, tới ×2 ở mốc lên20; tính bằng phân số rồi ceil để tránh lỗi float tại biên.

| Cấp đích | EXP cần từ cấp trước |
|---|---:|
|2|150|
|3|225|
|4|330|
|5|465|
|6|630|
|7|825|
|8|1050|
|9|1305|
|10|1988|
|11|2525|
|12|3150|
|13|3872|
|14|4697|
|15|5631|
|16|6681|
|17|7855|
|18|9158|
|19|10598|
|20|12180|

Tổng Lv1→20:73.315 (cũ44.745). Reserve Lv20/21 vẫn4060. EXP không mở Lv21; cần7 ngọc rồng. Không tăng ATK/ASPD theo cấp. Giá trị ngọc EXP thường, thưởng trực tiếp24+16*cấp đối thủ và tỉ lệ rơi20% lifetime EXP không đổi. BOT sinh cấp cao có lifetime nền theo bảng mới nên phần20% của BOT cũng phản ánh nền mới; chạy không giảm lifetime, không hạ cấp. Nhặt lượng lớn có thể vượt nhiều cấp và vẫn bảo toàn lifetime.

## Trang bị
Starter profile0: **Gà cao su lè lưỡi**, Trắng18 ATK/1.10 ASPD như starter cũ; không nằm trong pool rương. Mọi lần chơi/respawn mới đều khởi đầu bằng gà. Gà vàng, mào đỏ, mắt lồi, chân và lưỡi hồng; đồ vui không phải binh khí Diễn Nghĩa.

Các profile1–19 giữ nguyên tên, thuộc tính và họ skill. Profile20–26 là bổ sung gameplay, không gán võ tướng/lịch sử. Không đổi thứ tự20 cấp tướng hoặc robot21.

| ID | Món | Tầm gốc | Skill Cam/Đỏ |
|---|---|---:|---|
|20|Đại Chùy|74|Bổ sơn|
|21|Song kiếm|62|Song hồi|
|22|Liềm|94|Nguyệt trảm|
|23|Tảng đá lớn|60|Hộ thể|
|24|Chảo chiến|58|Hoành tảo|
|25|Cá mặn|76|Liên kích|
|26|Ghế gỗ|72|Bổ sơn|

27 profile ×6 phẩm=162 stats cache bất biến. Tầm mới khai báo riêng, không lấy số thứ tự ID để kéo dài vô hạn. ATK≤53, DPS thường<60/s, skill tấn công≤72; ASPD/ATK chỉ theo loại/phẩm. Tảng đá cận chiến, không ném/đạn/AOE. Kỹ năng dùng các họ cũ, không thêm nút, buff hoặc tài nguyên mới.

Rương chọn đều26 loại không phải starter, vẫn một vũ khí mỗi rương,6 phẩm theo bảng cũ. HP/tỉ lệ cấp/lịch60s/đợt bảo đảm/dragon probabilities không đổi. Giữ luật tự cầm phẩm cao hơn, rare còn lại vào24-slot bag, không nhân đôi, không vứt rare cũ khi đầy, đổi tại cờ và giữ cooldown.

## Collider và xem thử
Cán/đầu chùy/đá/chảo/ghế/cá/gà và hai lưỡi Song kiếm dùng các capsule thành phần theo cùng transform/phẩm/cấp/strikePose với renderer. Compound contact so độ hở sau bề rộng từng phần, không dùng đầu dày để tăng bề rộng cán mảnh. Kiểm tra phần vũ khí trước sát thương, hitSet chung: Song kiếm hoặc Song hồi không gây hai hit lên cùng mục tiêu trong một đòn. Cờ/đồng đội/stealth/shield/clash32-unit giữ nguyên.

Danh mục có nút **7 vũ khí mới & đồ dị**, hình từng món và XEM SKILL Trắng/Cam/Đỏ. Dummy dùng tướng Lv3, không coi profile20–26 là cấp tướng21–27, không biến thành robot/đọc HEROES ngoài biên. Xem thử không thay player/XP/equipment/cooldown và không gửi skill thật, kể cả ONLINE. Túi/vật rơi dùng cùng renderer.

## Triển khai
**Cả backend và HTML5 phải lên v2.17/protocol11.** Server từ chối1–10 trước khi tạo phòng. Client chuyển thông báo backend cũ sang hướng dẫn2.17, không khuyên nhầm2.14. Cập nhật Render trước, kiểm tra `/api/status` version2.17.0/rulesVersion11 rồi thay HTML5 itch.io. Deploy reset phòng RAM. Bot chưa triển khai production thay người sở hữu.

## Kiểm tra
`npm test`: gates chính xác/cộng dồn, collider thành phần, render162 biến thể, loot26 loại, giới hạn damage/DPS, hitSet, socket11, bag private/forgery/respawn gà và hồi quy.
`tests/odd-weapons.browser.cjs`: desktop/touch,7 catalog/demo không gửi lệnh, gà,hai trình duyệt nhận ID mới, ảnh túi/đổi đồ tại cờ, shield22 từ server và Song kiếm một hit.
