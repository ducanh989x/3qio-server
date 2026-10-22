# Gameplay v2.5.0

## EXP hạ gục (v2.3.2 — phần 20% rơi đất)
Người kết liễu chỉ nhận ngay thưởng cơ bản `24 + 16 × cấp đối thủ`. Phần `floor(0,2 × totalXp đối thủ)` **không cộng thẳng** mà rơi thành ngọc EXP lớn quanh xác. Ví dụ Lv10/tổng 7.500 KN → nhận ngay **184 KN**, rơi thêm đúng **1.500 KN**. Phần 20% chia thành tối đa 32 viên số nguyên dương, tổng không mất/lặp giá trị, rải bán kính 85–155 (giới hạn biên), có 0,6s chờ trước khi hút/nhặt. Ai đi tới nhặt (kể cả BOT, người hỗ trợ, người thứ ba hoặc nạn nhân sau tái xuất) nhận giá trị viên đã nhặt, không dành riêng cho người kết liễu. Không có thao tác claim XP từ client.

`totalXp` gồm cả phần đã dùng lên cấp và thưởng đã nhặt trước đó; tiêu KN chạy nhanh không giảm tổng. Đối thủ tổng 0 không có phần 20%. Chỉ rơi một lần khi chết, không trừ tổng EXP của xác chết; tái xuất reset như trước. Ngọc EXP chết thông thường vẫn giữ nguyên và công khai, không thay thế bằng phần 20%. BOT sinh cấp cao được ghi tổng EXP nền bằng tổng chi phí lên cấp (Lv20 = 44.745); robot mở bằng ngọc không tự được cộng EXP nền. EXP thưởng vẫn giới hạn dự trữ 4.060 ở Lv20/21, nhưng tổng tích lũy nhận đủ. Không tăng ATK/ASPD/đổi vũ khí hoặc mở Lv21 bằng thưởng EXP.

Cân bằng ATK và cơ chế chặn mới: xem [COMBAT.md](COMBAT.md). ATK tối đa 53, skill tấn công tối đa 72; vẫn không tăng ATK/ASPD theo LV. Hai vũ khí chạm trong nhịp tấn công phù hợp sẽ hủy cả hai đòn. · Cấp nhân vật độc lập trang bị

## Nhân vật
- Mọi lượt mới, kể cả bot, bắt đầu với khúc gỗ trắng (ATK 18, ASPD 1,10 đòn/s).
- Cấp 1–20 lên bằng EXP. v2.4.0 tăng 50% chi phí: `needXp = 150 + 60n + 15n²`, n = cấp − 1. Ví dụ 1→2: 150, 5→6: 630, 10→11: 1.905, 19→20: 6.090; tổng 1→20: 44.745 KN. HP tối đa = 100 + 12 × cấp; tăng kích thước/hình dáng, giảm nhẹ tốc độ theo công thức cũ. Lên cấp hồi đầy máu, giữ trang bị.
- ATK và ASPD không nhận bất kỳ hệ số nào từ cấp nhân vật. `loot.js` định nghĩa chỉ số theo loại/phẩm; nhân vật to hơn vẫn phóng to tầm vũ khí theo tỷ lệ mô hình.
- Đủ 7 ngọc rồng lập tức lên Lv21 (Long Thần Cơ Giáp, HP 352, robot khổng lồ), giữ trang bị/ATK/ASPD. EXP không mở được 21. Lv20/21 có kho KN chạy tối đa 4.060.

## Rương
Tối đa 15 rương chung/thế giới. Đợt đầu sinh 15 rương **random độc lập** theo 70/15/10/4/1% cho Lv1/2/3/4/5. Không còn phân bố cố định hoặc bảo đảm 1 Lv3 đầu trận. Máu Lv1–5 là 36/72/144/540/900. Không sinh trong vùng cờ hoặc vùng xuất phát trung tâm. Bản đồ nhỏ đánh dấu rương theo màu cấp.

Mỗi 60 giây tính từ lúc bản đồ/phòng bắt đầu (mốc 1:00, 2:00, 3:00…), bù các rương đã phá tại vị trí mới. Rương còn sống giữ nguyên vị trí/cấp/HP, kể cả đang bị đánh; không biến mất, không tự nâng cấp/hồi máu. Không tạo thêm khi đủ 15 rương. Nếu bỏ qua nhiều mốc trong một bước, chỉ bù các ô trống một lần, nhưng giữ đủ các bảo đảm đã tới hạn; không cộng dồn rương vượt trần. Đồng hồ RƯƠNG/BÙ SAU cạnh nút TÚI dùng giờ chung của phòng; vào muộn hoặc hồi sinh không đặt lại nhịp. BOT tạm dừng thì thời gian trận dừng; ONLINE mở menu vẫn tiếp tục.

Tỉ lệ random cho từng rương ở mọi thời điểm (đợt đầu và ô bù thường): **Lv1 70% · Lv2 15% · Lv3 10% · Lv4 4% · Lv5 1%**. Không có giai đoạn mở khóa hoặc tăng xác suất theo tuổi phòng.

Bảo đảm theo **đợt bù 60s của phòng**, không theo từng rương, đợt đầu không tính: các mốc 5/10/15… bảo đảm 1 Lv4; 10/20/30… bảo đảm thêm 1 Lv5. Mặc định mốc cố định, không reset khi ra sớm. Tại đợt 10 có cả hai nếu đủ ô trống. Ô bảo đảm là ngoại lệ của phân bố random, nên tổng quan sát khi tính cả bảo đảm không đúng tuyệt đối 70/15/10/4/1.

Không có ô đã phá thì không thêm/thay rương sống: giữ nợ bảo đảm tới đợt có ô. Thiếu chỗ cho cả hai thì ưu tiên Lv5, Lv4 vẫn chờ; không mất nợ và không vượt 15. Nhiều mốc bị bỏ qua vẫn cộng đủ nợ, chạy lại cùng mốc không cộng lần nữa. Join muộn/tái xuất không reset; thế giới mới reset. `loot.js`: chestHp, chestPeriod=60, maxChests=15, chestSpawnWeights/rollChestLevel. `treasures.js`: treasureWave, treasureOwed4/5 và trả bảo đảm qua slot trống.

Mỗi lần phá rương: luôn 1 vũ khí + nhận 8 + 6 × cấp rương EXP; ngọc rồng có thể rơi thêm độc lập. Một đòn chỉ đánh trúng mỗi rương một lần; chỉ người gây đòn cuối được dùng số ngọc hiện có để tính xác suất. Vũ khí/ngọc trên đất là công khai, ai tới nhặt trước được.

Tỉ lệ phẩm vũ khí, % (v2.5.0: đỏ chỉ rơi từ Lv3/4/5; phần đỏ cũ của Lv1/2 chuyển sang cam, các phẩm khác và ngọc rồng không đổi):

| Rương | Trắng | Lục | Lam | Tím | Cam | Đỏ |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 72 | 22 | 5,5 | 0,45 | 0,05 | 0 |
| 2 | 55 | 30 | 13 | 1,8 | 0,2 | 0 |
| 3 | 25 | 30 | 28 | 13,5 | 3 | 0,5 |
| 4 | 10 | 22 | 32 | 28 | 7 | 1 |
| 5 | 3 | 10 | 25 | 45 | 14 | 3 |

Loại vũ khí rơi chọn trong 19 mẫu đao/kiếm/thương/đại đao/thiết tiên/đại phủ/xà mâu/yển nguyệt đao/họa kích từ thư viện v1; không tặng vũ khí theo cấp tướng. Khúc gỗ chỉ là trang bị mặc định. Các loại cùng tên có thể có tỷ lệ/cán/lưỡi và chỉ số gốc khác nhau.

## Kích thước theo phẩm (v2.4.0)
Cùng một loại, trắng ×1,00; lục ×1,08; lam ×1,16; tím ×1,25; cam ×1,36; đỏ ×1,50 (lớn nhất). `size` phóng đều hai trục quanh điểm cầm (10,7), giữ bàn tay/gốc cầm. `baseReach` là độ dài mẫu trắng, `reach = 10 + (baseReach − 10) × size`. Chiều dày hitbox cũng nhân size; thân nhân vật tiếp tục nhân bodyScale. Đánh thường, skill, rương, chặn và bản vẽ dùng cùng hình học. Đồ trên đất cũng vẽ lớn theo phẩm; không tăng bán kính nhặt hoặc slot túi. Không cộng thêm ATK/ASPD chỉ vì phóng hình.

## Nhặt và kỹ năng
- Tự nhặt trong bán kính nhân vật + 20, không cần nút nhặt. Vũ khí trắng–tím chỉ tự trang bị nếu phẩm cao hơn đang cầm; ngoại lệ khúc gỗ trắng được đổi sang vũ khí trắng thật. Không đổi theo DPS, không lấy đồ ngang/thấp hơn. Đồ thường cũ rơi xuống đất, trừ khúc gỗ.
- Vũ khí vàng/cam (rarity 4) và đỏ (5) tự cất vào túi, không tự trang bị kể cả đang cầm khúc gỗ. Túi 24 ô; đầy thì đồ hiếm giữ trên đất, không xóa hoặc thay đồ khác. Mỗi món có ID riêng, kể cả trùng loại/phẩm. Ngọc rồng tự nhặt, không chiếm ô; đủ 7 thì dừng lấy thêm. Đồ không đủ điều kiện không chặn nhặt món khác.
- Vào vòng cờ bất kỳ (không cần cùng phe/chờ gia nhập) tự mở popup túi; F/nút TÚI mở lại nếu đã đóng. Chọn món để trang bị chỉ khi còn sống và đang trong vòng cờ. Rời cờ/chết/rời phòng sẽ đóng popup. Popup không tạm dừng trận và không khóa joystick; Esc đóng túi. Danh sách cuộn được trên điện thoại.
- Đổi từ túi giữ cả hồi chiêu đánh thường/skill, hủy hoạt ảnh đòn/buff skill cũ. Đồ vàng/đỏ đang cầm trở về túi bằng ID mới; đồ thường cũ rơi xuống đất, khúc gỗ không rơi. Thay đồ hiếm khi túi đầy không làm mất đồ vì lấy món ra trước khi cất món cũ.
- Có 0,35s chờ sau rương vỡ, 0,6s chờ với đồ đổi xuống đất. Vũ khí trên đất tồn tại 120s, ngọc rồng 300s, giới hạn 120 vật phẩm. Túi chỉ tồn tại trong lượt, tái xuất bắt đầu túi rỗng.
- BOT cũng tự nhặt theo luật này và chọn món tốt hơn trong túi khi tới vòng cờ.
- Cam/đỏ có đúng 1 skill theo loại, Q hoặc nút kỹ năng. Các phẩm khác không có skill.
- Thương/xà mâu: Xuyên trận, tầm ×2,2 và góc hẹp.
- Đại đao/đại phủ/yển nguyệt đao/họa kích: Hoành tảo, vòng tròn tầm ×1,3.
- Đao ngắn/kiếm/thiết tiên: Liên kích, ASPD ×1,30 trong 3s.
- Skill cam hồi 12s, đỏ 10s. Xuyên trận/Hoành tảo gây ATK ×1,20 (cam), ×1,35 (đỏ), không phụ thuộc cấp tướng. Không tiêu hao KN. Đòn thường/skill đều không gây sát thương lên đồng đội, mục tiêu bảo hộ hoặc người trong vòng cờ. Rương cũng nhận sát thương từ skill tấn công. Xuyên trận/Hoành tảo ra đòn trong 0,32s thay vì gây damage tức thì, có thể bị chặn, không dùng giữa đòn đang vung. Mỗi mục tiêu chỉ nhận một hit mỗi đòn.

## Ngọc rồng
Là vật phẩm đặc biệt phẩm đỏ, đếm cộng dồn 0–7, không chiếm ô vũ khí. Không áp dụng bộ 7 mã sao khác nhau. Tỉ lệ trên MỌI cấp rương = 0,001 × 2^số ngọc đang giữ: 0,1 / 0,2 / 0,4 / 0,8 / 1,6 / 3,2 / 6,4% cho 0–6 viên. Đây không phải tỉ lệ có điều kiện sau khi đã roll phẩm đỏ. Từ 7 viên không rơi thêm theo người đó và người đã có 7 không nhặt thêm.

Đủ 7 viên sẽ triệu hồi **Long Thần Cơ Giáp · Lv21**, robot khổng lồ do chính người chơi điều khiển. Hiệu ứng 2,4s với 7 ngọc xoay quanh; không dừng trận hoặc tạo bất tử. Kích thước thực ~1,7 lần Lv20 (scale 2,4), hitbox/tầm vũ khí cùng tỷ lệ; HP vẫn 352, hồi đầy, giữ nguyên vũ khí/ATK/ASPD/túi/quốc gia. Không thêm BOT đánh hộ. Bảng tiến hóa có bản xem hình, không cấp ngọc/mở khóa. Xem ROBOT.md.

Chết/tái xuất, rời phòng hoặc máy chủ khởi động lại sẽ mất trang bị và ngọc như tiến độ nhân vật. Không có lưu tài khoản.

## Multiplayer và kiểm thử
Máy chủ chạy chính luật shared `loot.js`/`treasures.js`/`game.js`, tự nhặt không cần cờ từ client. Client gửi điều khiển/skill hoặc `{type:'equip',itemId}`. Máy chủ kiểm tra sống, vị trí thật trong cờ và ID thuộc túi trước khi đổi. Client không chọn kết quả rương, ATK, ASPD, inventory hay số ngọc. Snapshot inventory chỉ gửi về đúng socket chủ sở hữu, không nằm trong actor công khai. Rương/drop đồng bộ 5 Hz, actor/trang bị/skill/túi 15 Hz, mô phỏng 30 Hz. Nhặt cạnh tranh và phát lại ID đã dùng không nhân đôi đồ. Protocol `rulesVersion: 7` từ chối các client v2.4.x trở xuống; cập nhật CẢ ZIP HTML5 và gói server lên v2.5.0.

`npm test`: luật quốc gia/vùng an toàn, 20 hình vũ khí, di chuyển/sprint, xác suất rương, ATK/ASPD độc lập cấp, 7 ngọc/21, nhặt/đổi/hồi chiêu, skill và socket thực (tranh nhặt, giả mạo trang bị, sai phiên bản).
`playwright-cli run-code --filename=tests/loot.browser.js`: desktop/touch, phá rương + đi sát tự nhặt, chỉ nâng phẩm, popup túi ở cờ, đổi đồ/giữ hồi chiêu, 24 ô/cuộn/tap, bảy ngọc tự nhặt → Lv21, danh mục, nhịp rương và đồng hồ phòng.
`tests/inventory-network.browser.cjs`: Playwright với máy chủ thử riêng, hai trình duyệt desktop/touch, auto-loot, túi riêng từng socket, popup, thao tác đổi đồ thực, đồng bộ vũ khí cho đối thủ, từ chối đổi ngoài cờ. Cần playwright-core/Chromium (có thể đặt PLAYWRIGHT_MODULE và CHROME_PATH). Fixture chỉ thao tác world trong tiến trình kiểm thử, không thêm endpoint quản trị vào game thật.
