# Tự bù BOT và BXH · v2.18 / protocol11

## Population
Mặc định mỗi phòng ONLINE có24 slot: H người thật kết nối (kể cả chết/chờ hồi sinh) và24−H BOT. 1+23,2+22,…16+8. Không thay giới hạn16 người/phòng/8 phòng, không lấy số actor đang thấy/tàng hình để đếm. SOLO vẫn24 BOT + người chơi.

Đồng bộ số BOT ngay khi join/close, trong cùng callback Node không có async chèn vào. Join bị từ chối không đổi BOT. Người mất kết nối được thay một BOT; phòng trống bị xóa, không tạo BOT cho phòng bỏ trống.

Rút BOT chết trước rồi xa người nhất để bớt biến mất cạnh trận đánh. Đây là retirement, không phải kill: không hạ gục/XP/vũ khí/ngọc, không sửa người hoặc BOT còn lại. Rời phòng loại refs khỏi seen/visible/intent/target, đánh dấu actor retired không còn alive/swing để không đánh trúng bóng cũ. Actor ID không tái sử dụng trong phòng. BOT mới Lv1–3, starter gà18ATK/1.10ASPD, invincible2s như baseline NPC; spawn thử tối đa48 vị trí, ưu tiên cách người≥650 trong bounds100–3500, fallback vị trí xa nhất. Không tăng damage/ASPD/tốc độ/AI đọc input. Respawn BOT thường theo luật cũ.

`createServer({botCount:0})`/số khác giữ fixed fixture/embedding. Production không truyền botCount bật fill24. API `/api/status`: version2.18.0,rulesVersion11,botMode:"fill24",populationTarget24. 24 là slot, không cam kết luôn24 nhân vật còn sống cùng lúc. Render Free vẫn có thể ngủ; số BOT tăng lúc ít người có thêm chi phí AI, không bảo đảm FPS/server128 người.

## BXH
Nút **BXH** cạnh menu,44px trên desktop/touch, kèm hạng của bạn. Bảng đầy đủ16 người cùng phòng, không BOT; SOLO bảng nhân vật còn sống. Trình bày cấp/tổng EXP/hạ gục, tự đánh dấu Bạn và người đang chờ tái xuất. Có bản trong chi tiết menu. Sắp xếp cấp giảm→tổng EXP lifetime giảm→kills giảm→ID để hòa hạng ổn định.

Lấy từ room.clients, không từ danh sách actor đã lọc theo góc nhìn. Server đóng gói một lần/phòng ở1Hz và snapshot đầu; backpressure giữ nguyên. Chỉ sáu trường public: id,name,level,totalXp,kills,alive. Người tàng hình vẫn có hàng **metadata công khai**, nhưng không có vị trí/HP/phe/weapon/timer/số ngọc, không tạo actor/bản đồ/geometry từ hàng BXH. Tọa độ/HP thực vẫn lọc riêng theo canObserveActor; bag vẫn riêng. Không nhận điểm/level/BXH tự khai từ input.

Cập nhật khi cấp/EXP/kill đổi; người rời phòng bị loại ở lần cập nhật tiếp theo (≤~1s), respawn trở Lv1/EXP0/kills0 theo luật lượt hiện tại. Không lưu tài khoản/điểm xuyên chết/room/reset. DOM dùng textContent, không parse tên người thành HTML. Cache DOM theo sáu trường, không stringify brain/target có vòng tham chiếu. Bảng cuộn, không chiếm chiến trường mặc định.

Xem bảng clear input, SOLO dừng; ONLINE tiếp tục, không bất tử. Kỹ năng/đòn/input không phát trong lúc đọc. Đóng trở lại trận, không giữ phím. Desktop/touch portrait/landscape hỗ trợ.

## Tương thích/triển khai
Vẫn protocol11: thêm trường leaderboard tùy chọn, không thay luật vật lý hay actorFields/rows-v1. Client17 bỏ qua trường mới, chơi với backend18 được. Client18 với server17 không suy đoán bảng từ actor nhìn thấy (sai khi ẩn); hiện thông báo nâng backend18. Tính năng đầy đủ cần Render18 trước và HTML5/website18. Server≤16 không hỗ trợ protocol11. Deploy mất phòng RAM; bot chưa tự deploy tài khoản.

## Test
`tests/population.test.cjs`: 1→16 socket thật,24 slot, reject17, refill/cleanup/isolation, retire không reward/reset, monotonic IDs/bounds, roster hidden-human whitelist, chống khai điểm, tần suất1Hz, respawn/disconnect.
`tests/population.browser.cjs`:16 người+8 BOT thật, bảng16 người không BOT, public metadata/ẩn actor, XSS text, cập nhật hạng, đọc không phát action, ONLINE chạy/SOLO dừng, 4 viewport touch, SOLO25 như cũ.
