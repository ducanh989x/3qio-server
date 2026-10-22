# BOT chiến thuật · v2.7.0

`ai.js` dùng chung ở BOT/offline và Node VM ONLINE. Client online chỉ vẽ trạng thái do server gửi, không quyết định BOT. Không thêm actor, vật phẩm hay bonus chỉ số.

## Hành vi
- Mỗi tên BOT có tính cách ổn định: độ liều lĩnh, ngưỡng rút lui, tốc độ xoay và nhịp phản ứng khác nhau. Chu kỳ quan sát gốc 0,2–0,4s có jitter ±10%; thao tác có độ trễ và giữ lịch chờ qua các lần quan sát, không reset vô hạn.
- Chỉ quan sát actor/đồ/rương/EXP trong bán kính 650. Biết vị trí bốn cờ như bản đồ công khai. Không đọc input, túi đối phương, cooldown ẩn hoặc kết quả RNG tương lai. Dự đoán hướng chạy chỉ từ hai vị trí đã quan sát, giới hạn lead ±40 đơn vị mỗi trục. Không ưu tiên người thật hơn BOT.
- So sánh HP hiện tại, DPS trang bị, tầm/size vũ khí và số địch/đồng minh gần. Chọn trận có cơ hội, đuổi mục tiêu yếu; rút lui nếu thua trang bị/kích thước hoặc bị vây. Không cố đánh người cùng phe, trong cờ hoặc còn bảo hộ xuất trận.
- Đi vòng bên sườn, giữ cự ly theo vũ khí thật, lùi nhịp hồi đòn, xoay hướng có giới hạn. Quan sát động tác vung để né/lướt; không chặn hoàn hảo hay phản ứng tức thì. Chặn vẫn chỉ do hai vũ khí chạm đúng nhịp theo combat.js.
- Máu dưới ngưỡng cá nhân 28–38% thì về cờ, hồi bằng tốc độ có sẵn đến 74% mới thôi nghỉ. Không tự hồi đầy/teleport. Không mở đòn tấn công khi đang trong cờ. Ở liên tục đủ 5s mới gia nhập như luật chung. Mục tiêu gia nhập có thời hạn cam kết để không mải nhặt EXP rồi bỏ cờ mãi.
- Ưu tiên ngọc rồng, nâng phẩm hợp lệ, đồ hiếm trong sức chứa; về cờ đổi món mạnh hơn trong túi. Tính quãng đường, rủi ro và thời gian phá rương; ưu tiên rương gần vỡ hơn việc gõ Lv5 bằng khúc gỗ hàng chục giây. EXP lớn rơi công khai đáng nhặt hơn EXP thường, nhưng phải hết pickup delay.
- Kỹ năng chọn theo loại/tầm/số đối thủ và trả đúng hồi chiêu. Lướt trả 35 thể lực, chỉ chủ động dùng khi còn ít nhất 60, có khoảng nghỉ 2,4–3,8s. Chạy thoát ngắn 1,1s, nghỉ ít nhất 4,5s giữa các đợt, trả 10 EXP hiện tại/s qua moveEntity; không trừ tổng tích lũy/không tụt cấp. Không tạo ASPD/ATK/HP/tốc độ/hồi máu riêng mới; hệ số tốc độ BOT cũ 0,86 vẫn giữ.
- Né thân gần, chỉnh hướng ở biên và thử hướng khác khi kẹt. Không thêm vật cản vào cây/đá vốn chỉ trang trí. Chết/tái xuất xóa trí nhớ/mục tiêu cũ; người chơi không bao giờ bị hàm AI điều khiển.

## Multiplayer và đóng gói
`brain`, `target`, `aiTime` không nằm trong actorFields/snapshot. Server không nhận lệnh điều khiển BOT từ client. `ai.js` phải có ở gốc server ZIP và public/, được nạp trước game.js trong browser và VM. HTML5 BOT cần ZIP mới; ONLINE cần cập nhật server lên v2.7.0 để có hành vi mới. Không đổi luật vật lý hoặc giao thức, giữ rulesVersion 7. Các cân bằng rương/EXP/vũ khí/túi/robot của v2.5.0 giữ nguyên; tự ghép phòng v2.6.0 vẫn hoạt động.

## Kiểm thử
- `npm test`: ai.test.cjs và ai-network.test.cjs cùng các suite hồi quy; kiểm tra tầm nhìn, getter bẫy dữ liệu ẩn, phản ứng/ghi nhớ, chọn trận/rút lui, cự ly, nhặt đồ/rương/EXP, cờ, kỹ năng, phí dash/sprint, hồi sinh, mô phỏng 24 BOT, socket thật và chống khai giả.
- `playwright-cli run-code --filename=tests/ai.browser.js`: chiến đấu bàn phím/cảm ứng, rút lui/hồi phục và mang đồ về cờ.
- `tests/ai-network.browser.cjs`: hai trình duyệt desktop/touch cùng thấy BOT dùng skill/rút lui; client không có brain của server. Fixture chỉ ở tiến trình kiểm thử, không thêm endpoint quản trị vào bản chơi thật.
