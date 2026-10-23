# Vũ khí & kỹ năng v2.14.0 · protocol10

## Một nút, mười một kiểu
Mỗi mẫu vũ khí Cam/Đỏ có **một** skill cố định; không thêm tám nút vào HUD. Q trên desktop hoặc nút skill touch. Trắng–tím không có skill. Tên skill là sáng tạo gameplay, không khẳng định xuất hiện trong nguyên tác. Vũ khí chính vẫn giữ loại đã tham chiếu Tam Quốc Diễn Nghĩa.

| Kiểu | Cơ chế thật | Một số mẫu |
|---|---|---|
| Xuyên trận | Đâm thẳng, extension tối đa2,2, 0,32s | Thương lính, Thiết thương Thái Sử Từ, thương Triệu Vân |
| Phá phong | Đâm chéo từ −0,32 đến+0,32 rad, extension tối đa1,9, 0,36s; không lao nhân vật | Chu Thương, Mã Siêu |
| Xà ảnh | Mũi mâu lượn hai bên ±0,34rad, extension tối đa2,0, 0,40s | Trương Phi |
| Bổ sơn | Cung hẹp75°, extension đỉnh1,45, 0,44s | Đại phủ Từ Hoảng, đại đao Liêu Hóa |
| Nguyệt trảm | Cung240°, extension1,35, 0,36s | Đại đao Trương Liêu/Hoàng Trung, Yển nguyệt đao |
| Song hồi | Quét tới rồi thu về, extension tối đa1,22, 0,44s | Thiết tiên Hoàng Cái, đại đao Tào Hồng/Cam Ninh |
| Hoành tảo | Quét360°, extension1,3, 0,32s | Phương thiên họa kích |
| Liên kích | ASPD×1,30 trong3s; vẫn phải chém, không tự đánh | Thiết kiếm |

Tấn công dùng cùng `strikePose` trong combat.js cho bản vẽ, thân/rương trúng và blade-contact. Mỗi skill tấn công **tối đa một hit trên mỗi mục tiêu**, kể cả Song hồi có hai lượt quét. Cam×1,20 / Đỏ×1,35 ATK; max thường53/skill72, HP/XP/level/ASPD thường không đổi. Cam hồi12s/Đỏ10s, không tốn KN hoặc thể lực. Skill tấn công không thêm choáng, đạn, sát thương hiệu ứng, bất tử, dịch chuyển hoặc hồi máu; hồi máu chỉ từ skill Hồi xuân. Đòn đang vung phải kết thúc trước skill tấn công; giữ chém không ngắt skill chậm. Bị CHẶN hủy đòn và FX tấn công, giữ hồi chiêu; không hủy buff Liên kích đã trả giá. Luật cờ/đồng đội, sprint/dash, robot và loot2.11 giữ nguyên.

## Hỗ trợ v2.14: không gây sát thương
- **Tàng hình**: đoản đao Khăn Vàng (profile1); Cam4s/Đỏ5s, CD18/16s. Không phát sinh swing/damage. Bản thân/đồng quốc gia (không phải trung gian) thấy bóng mờ; đối thủ không được nhận actor/HP/vị trí trong snapshot, kể cả người mới vào. BOT không nhìn/đuổi mục tiêu ẩn. Vẫn trúng lưỡi khi đoán đúng vị trí, không miễn sát thương. Đánh kể cả hụt, trúng đòn hợp lệ hoặc vào mọi vòng cờ sẽ hiện hình; không cast trong cờ, không mất CD nếu không hợp lệ. Khi ẩn không hút EXP/tự nhặt đồ để tránh lộ vị trí qua ngọc; không sinh bụi/vệt chạy mới. Hết ẩn hoạt động bình thường.
- **Hồi xuân**: đại đao Quan Bình (profile6); hồi ngay round(25% maxHP), cap maxHP; CD20/18s Cam/Đỏ. Chỉ hồi bản thân, không revive, không gây damage/buff ATK. Đầy máu/chết/đang vung không tiêu CD. FX vòng xanh/dấu cộng0,6s.
- **Hộ thể**: đại đao Hàn Đương (profile8); lá chắn floor(20% maxHP),4s, CD18/16s. Damage hợp lệ trừ chắn trước rồi phần dư vào HP. Vẫn đẩy lùi và reset thời gian hồi máu tự nhiên; không làm sai luật cờ/đồng đội. Hết thời gian/hết HP chắn xóa. Không stack/refresh miễn phí. FX lục giác xanh có thanh năng lượng.
- Đổi đồ/chết/tái xuất/hóa robot xóa trạng thái hỗ trợ, giữ CD đang trả (trừ tái xuất mở lượt mới). Không thêm nút vào HUD. Skill hiện tại có đếm ẨN/CHẮN/ĐẦY MÁU, mô tả và CD riêng trong túi/danh mục. XEM SKILL là actor riêng, heal demo bắt đầu nửa máu, không gửi lệnh skill/equip của người chơi.
- Ba profile trên thay bớt skill trùng; vẫn đủ8 kiểu v2.13 ở các profile khác, tổng11. Tên/khả năng hỗ trợ là sáng tạo gameplay, không phải khẳng định nguyên tác.

## Hình và âm
- Tám kiểu FX riêng: mũi khí/đốt hướng, chevron, xà ảnh, bổ nặng/tia vỡ, nguyệt cung nhiều lớp, hai đường hồi, vòng kích, vòng tốc độ. Màu theo20 profile, Đỏ có viền/tia mạnh hơn.
- Hiệu ứng chỉ minh họa; vệt đầu lưỡi tính từ chính transform vật lý. Không lấy vùng glow làm hitbox. Không tạo actor/projectile hay particle tồn tại thêm.
- FX tấn công/Hồi xuân tối đa0,6s; Liên kích3s, Hộ thể4s, bóng Tàng hình4/5s theo timer. Touch dùng6 mẫu vệt và5 tia so với desktop10/9. Không shadow blur nặng; prefers-reduced-motion dừng xoay vòng/tia trang trí, vẫn thể hiện chuyển động đánh thật. Chỉ phát âm khi người chơi đã bật tiếng; ONLINE âm kích hoạt theo snapshot xác nhận của chính mình, không spam mỗi frame.
- 20 profile giữ tầm/size/loại/chỉ số cũ. Phân biệt7 đầu đại đao (bản vát, cong nguyệt, mũi xiên, bản quạt, dài hẹp, vuốt cong, bản lớn),5 đầu thương (lá, tam giác, hình thoi, kim, lá liễu), thiết tiên chia đốt, đại phủ, xà mâu, yển nguyệt đao, họa kích hai nguyệt.20 màu viền/tua/cán, Cam/Đỏ có hoàn thiện/gem khác. Không thêm vũ khí sci-fi vào đồ thường.
- Túi có thumbnail Canvas từng món. Danh mục Pause → Võ tướng → chọn tướng có Trắng/Cam/Đỏ và **XEM SKILL**. Hoạt ảnh dùng actor demo riêng, không gửi lệnh đánh/equip và không thay đồ/cooldown/tài nguyên nhân vật thật. Loop dừng khi kết thúc hoặc đóng/đổi modal, không giữ RAF nền.

## ONLINE / phát hành
Phải cập nhật **cả server Render và ZIP HTML5 lên2.14**. Protocol10 từ chối≤9; không để server3 skill cũ chạy với client8 skill. Server vẫn sở hữu skill, geometry, hit/cost/cooldown; các field attackKind/skillEffectKind/swingDuration đã có, không nhận kết quả skill từ client. BOT dùng cả8 kiểu theo tầm và cùng tài nguyên/cooldown. Deploy server trước, kiểm tra /api/status version2.14.0/rulesVersion10, rồi upload ZIP itch.io; deploy mất phòng RAM hiện tại. Bot không đăng nhập/triển khai thay tài khoản chủ. Server≤2.13 không có luật hỗ trợ mới. Server chỉ nhận input, không nhận HP/stealthTime/shieldHp/CD client tự khai. BOT dùng heal khi dưới70% HP, tàng hình khi rút có địch và hộ thể khi bị đe dọa dưới85% HP, cùng timer/cooldown như người.

## Kiểm thử
- utility.test.cjs: heal/shield/stealth, cap/thời hạn/CD, cờ/đồng đội, cleanup, BOT, 4 socket thật bao gồm latejoin, snapshot không lộ vị trí, giả mạo/spam, không hút EXP/nhặt đồ khi ẩn.
- utility.browser.js: Q/touch cả3 hỗ trợ, pixel enemy ẩn giống không có actor, fullheal, preview dummy không đổi player, reduced-motion mobile không overflow.
- skills.test.cjs:120 stats/11 kiểu, trajectories hữu hạn,7 skill gây đúng1 hit, cap72, đồng đội/cờ, không ngắt skill, FX cân bằng/không mutate/ít tia touch.
- skills-network.test.cjs: socket thực cả8 kiểu, snapshot/cooldown/pose, chặn giả mạo và spam.
- skills.browser.js:8 Q/8 touch, preview8 skill không đổi actor thật, ba phẩm, ảnh túi, không page error.
- balance.browser.js:1.296 tổ hợp level/rarity/8 quỹ đạo, đầu/tay/độ dày lưỡi vẽ khớp weaponBlade; weapons.test.cjs giữ20 hình hữu hạn/đúng giới hạn đầu mũi.
