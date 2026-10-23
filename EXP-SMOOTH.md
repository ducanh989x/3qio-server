# Tên + tổng EXP & nhịp di chuyển · v2.20 / protocol11

## BXH
Top10 chỉ có hạng, **tên nguyên văn** và **tổng EXP tích lũy của lượt hiện tại**. Không LV/nhãn BOT/ONLINE/Bạn/đang hồi sinh/hạ gục trong hàng; cả hai loại nhân vật vẫn tham gia. Màu nhẹ giữ hàng của mình; footer dùng #hạng + tên, không nối hậu tố vào tên. EXP không phải số dư xp dùng chạy; Sprint không trừ lifetime totalXp, respawn/reset mất lượt theo luật cũ.

Sắp EXP giảm→kills giảm khi hòa→ID ổn định. Không ưu tiên Lv21 hoặc cấp tướng. Server gửi `scoreTop10:[{id,name,totalXp}]` và `scoreRank` riêng1Hz/first snapshot. Chỉ3 trường, không cấp/loại/HP/tọa độ/phe/timer/weapon/inventory. Điểm không nhận từ input. Các payload leaderboard18/top10/selfRank19 giữ nguyên cho client cũ, không đổi nghĩa ngầm. Frontend20 cần backend20 để có BXH này; server17–19 vẫn chơi được nhưng hiện cần nâng cấp dữ liệu. Không đoán điểm của actor bị ẩn từ danh sách đang nhìn thấy. Mọi tên/điểm dùng textContent; formatter Intl dùng chung, key theo array snapshot thay vì stringify lại mỗi15Hz; không tạo bảng cho details đóng. Compact chỉ đổi DOM khi điểm/tên/thứ tự thay.

## Di chuyển (display-only)
Trước đây target local dùng thời gian từ lần nhận packet, reset ở mọi arrival, có thể thay nhịp khi packet dồn/chậm. Thêm localClock độc lập, dùng onlineClock FPS-independent để làm đều phase. Target backfill tối đa80ms bằng vận tốc snapshot khi clock chậm, lead theo intent; **vector offset tổng bị chặn≤100ms tốc độ thật**. Bounds thế giới giữ nguyên. Reset clock khi spawn/death/reveal/discontinuity/teleport/clash/gap lớn, không đi nội suy qua bản đồ.

Không đổi input, tốc độ, sprint1.65/10xp/s, dash, HP, ATK/ASPD, hitbox, cooldown, knockback hoặc gainXP. Không gửi vị trí dự đoán về server. Camp/inventory vẫn dùng netX/Y authoritative. Remote buffer4 sample/extrapolate80ms và backpressure không đổi. Pause/dead dùng vị trí server, clear input ngay; XP không giảm client-side. Backend17+ protocol11 dùng được phần render/motion frontend20.

## Giảm tải vẽ
- EXP orb:4 sprite64×64 (logical32×32,2x), giữ màu/bóng/radius/bobbing, một drawImage thay nhiều primitive/save/rotate/stroke mỗi orb.
- Grass/stone: sprite48×48, giữ transform/màu/line cap/lineWidth; không vẽ lại mỗi nhịp. LRU nhỏ theo viewport128–1024, loại lớn64–256. Giảm cache khi viewport nhỏ lại; tránh scan-thrash màn1440p/4K. Không bake toàn bản đồ, không đổi culling hoặc layers.
- Memory pixel cache nhỏ mặc định128×48×48×4≈1.2MB; tăng giới hạn theo màn lớn, không tăng vô hạn. Orb4×64×64×4≈64KB. Không cần WebGL/SAB/worker hay tài nguyên tải mới.

Mẫu Chrome sandbox1280×800 sau warmup, cảnh đứng yên có160 orb và terrain, không toàn bộ24 nhân vật:3950→584 lệnh Canvas chính/frame (−85%); median JS draw đầu2.568→1.704ms. Đây không phải FPS toàn game, không phải bảo đảm điện thoại/Render. Các phép vẽ bake một lần vẫn có chi phí khi mới vào vùng.

Trace tổng hợp packet0–110ms, tốc độ185.8 và render30/60/120Hz: variance pixel-step14.82→5.08 /3.24→1.01 /0.93→0.27; maxstep12.28→8.02 /6.70→3.99 /3.60→2.00. Không đi lùi trong trace. Không suy ra ping giảm70% hoặc hết lag thực tế. Server Free có thể ngủ; mạng nghẽn vẫn có correction/timeout.

## Test/deploy
`exp-smooth.test.cjs`: prediction bound/no state mutation, phase jitter3FPS, caches warm/bounds/wide-screen nonthrash, server EXP-primary vslv21,3-field whitelist/forgery/legacy.
`exp-render.browser.cjs`: so renderer v2.19 thật với v2.20 sau warmup (baseline ZIP giải nén /tmp/3qio-v219-baseline), đếm lệnh/median, cache/no gameplay mutation. Native delayed150ms/menuStop/teleport/rate/XP và ordered jitter/skipped snapshot tests chạy riêng; Top10 portrait/landscape assert tên nguyên văn, EXP73315, không tag,3 cột.
Cập nhật Render20 trước rồi HTML5/website20; vẫn protocol11. Deploy reset phòng RAM. Bot chưa triển khai tài khoản production.
