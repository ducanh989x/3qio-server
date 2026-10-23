# Top 10 người chơi + BOT · v2.19 / protocol11

Ô số lượng rương dưới minimap bị ẩn khỏi HUD và accessibility tree. Thay bằng bảng Top10 trực tiếp: thứ hạng, danh xưng, nhãn BOT, cấp. Hàng Bạn tô vàng; footer luôn cho biết hạng của bạn kể cả ngoài Top10. Nút BXH/menu mở cùng10 hàng kèm EXP/hạ gục. SOLO tính cả người và24 BOT; ONLINE tính mọi actor trong cùng phòng (24 slot), kể cả đang chờ tái xuất theo luật v2.18. Sắp cấp giảm→tổng EXP lifetime giảm→kills giảm→ID để hòa ổn định. Người rời/retired không còn ở lần cập nhật tiếp; respawn reset cấp/EXP/kills theo lượt.

Không hiển thị số lượng rương ở stats menu; chỉ giữ thời gian bù. Không bỏ minimap/marker/beacon Lv4/Lv5; chest HP/rarity/probability/lịch60s/bảo đảm/debt/EXP/vũ khí/ngọc rồng không đổi. DOM radar cũ vẫn tính cho logic marker/hồi quy nhưng display:none!important (không đọc được qua screen reader).

Màn lớn hiển thị10 dòng gọn dưới minimap. Điện thoại dọc nhỏ/ngang thấp có vùng cuộn, không che nút chém/chạy/lướt/túi/skill; nút BXH44px luôn mở được bảng đầy đủ. Dùng nhiều kích thước và cả tình huống có skill Cam để kiểm tra va chạm UI. Không thêm nút nhỏ khó bấm trên bảng compact. Đọc BXH không dừng ONLINE/không tạo invincible; SOLO dừng khi mở modal. Scroll trong danh sách không điều khiển joystick hoặc phát action.

Server gửi optional `top10` tối đa10 bản ghi và `selfRank` riêng người nhận,1Hz/first snapshot. Sort world.actors một lần/phòng, slice10, Map rank một lần trước loop viewers. Chỉ7 field public: id,name,level,totalXp,kills,alive,networkHuman. Không gửi x/y/HP/weapon/phe/utility timer/bag. Người/BOT tàng hình có thể hiện metadata trên bảng, **không tạo actor/minimap/geometry từ metadata**. Actor visibility và bag riêng vẫn xử lý như cũ. Không nhận điểm/hạng tự khai trong input. Mọi tên dùng textContent, không HTML.

Trường `leaderboard` human-only6 field của v2.18 giữ nguyên, tránh client18 hiểu sai BOT thành người thật. Client19 đọc `top10`; nếu backend17/18 chưa có trường này, báo cần server19, không tính sai bảng từ actor đang nhìn thấy. Vẫn protocol11, không thay actorFields/rows-v1 hoặc combat. Cập nhật Render19 trước rồi HTML5/website19. Chưa tự deploy production; deploy reset phòng RAM.

Test:123 npm tests gồm mixed-top10/số hạng ngoài10/metadata privacy của BOT ẩn/forgery/room isolation/fewer-than10. Browser Top10 kiểm tra trực tiếp HUD+modal10, nhãn BOT, hạng24→1, XSS, 4 viewport touch có skill không overlap, chest counts hidden nhưng marker giữ, SOLO10/clean exit. Hồi quy radar/network/utility/tutorial/transport vẫn chạy riêng.
