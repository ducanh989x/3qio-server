# 3Q.io multiplayer · v2.17.0

**v2.17 / protocol11 bắt buộc:** server quyết định EXP mới (target Lv10 ×1.25 → Lv20 ×2, ceil), cộng dồn73315 và danh mục27 profile/162 stats. ID20–26 là vũ khí bổ sung, starter0 gà cao su; client không được khai weapon/XP/level/damage. Cùng compound capsule collider cho Song kiếm/đầu/cán; một hitSet mỗi đòn. Rarity/drop weights/cap HP/ATK/ASPD/7 ngọc và bag-private/stealth giữ nguyên. Không thêm field actor; vẫn rows-v1 hoặc objects trong cùng protocol11. **Cập nhật CẢ backend và HTML5 lên v2.17 trước khi chơi chung**, không tương thích server≤2.16. Thông báo deploy mất phòng RAM. Các mục cũ dưới đây là lịch sử.

**v2.16:** tutorial 5 bước chỉ tự mở tại lobby lần đầu theo tùy chọn trình duyệt. Khi xem lại giữa trận, clearControls/menu dừng input ngay, không tạo invincible hoặc gửi action từ phím đọc hướng dẫn. SOLO dừng, ONLINE tiếp tục và có cảnh báo. Không thêm request/field/luật, vẫn protocol10; HTML5 v2.16 chạy với backend≥2.14. Tối ưu actorRows/CPU cần backend≥2.15. Chỉ thay ZIP itch.io là có tutorial; nếu Render phục vụ cả frontend thì deploy gói mới (reset phòng RAM).

**v2.15 giữ protocol10**: client xin transport rows-v1. Welcome trả actorFields một lần nếu hỗ trợ; sau đó actorRows có cùng thứ tự/giá trị, null cho undefined. Client cũ nhận objects; client mới fallback objects từ server2.14 (đã thử backend ZIP thật). Snapshot vẫn đầy đủ, actor ẩn lọc trước serialize, bag riêng. Input đổi~30Hz, không đổi100ms heartbeat, pulse16ms/stop ngay; stale350ms giữ nguyên. Buffer đối thủ60–100ms/4 mẫu/ngoại suy≤80ms chỉ hiển thị, không thay combat/geometry/cost. Backpressure soft32KiB/hard2MB, tài nguyên pack1 lần/phòng/đợt, VM compile1 lần/process/context riêng. Xem PERFORMANCE.md. Deploy server2.15 trước để có giảm byte, rồi đổi HTML5; client2.15 cũng chạy được với server2.14. Chưa triển khai production.

**v2.14 / protocol10**:3 skill hỗ trợ, server kiểm tra HP/CD/buff, không nhận hp/stealthTime/shieldHp/skillCooldown client khai. Snapshot lọc toàn bộ actor tàng hình khỏi đối thủ (kể cả neutral/latejoin); bản thân/đồng quốc gia được thấy và có timer. Client loại actor không có trong snapshot, tái xuất dùng vị trí mới; không dự đoán vị trí actor ẩn. BOT bỏ perception/target ẩn ngay, không sinh trails/EXP attraction khi ẩn. Giữ bag private, guard cờ/đồng đội. Cập nhật **cả backend và HTML5**; API version2.14.0/rulesVersion10. Deploy mất phòng RAM, chưa triển khai production. Xem SKILLS.md.

Lịch sử v2.13.0: protocol9 bắt buộc cho8 kiểu skill. Server quyết định loại/quỹ đạo/duration/one-hit/cooldown, vẫn dùng field attackKind/skillEffectKind/swingDuration có sẵn. Bỏ mọi thông tin skill/weapon/damage client tự khai. FX/âm chỉ phản ánh trạng thái server; preview trong danh mục dùng dummy local, không gửi skill/equip cho actor thật. Cập nhật server trước (version2.13.0/rulesVersion9) rồi HTML5; client/server≤2.12 bị từ chối. Deploy mất phòng trong RAM. Xem SKILLS.md.

v2.12.0: đánh dấu rõ rương Lv4/Lv5 và đếm rương hiếm sống trên minimap. Dùng mảng chests toàn phòng mà server đã gửi, không phụ thuộc khoảng cách camera. Không thêm field/request, không lộ túi hay đổi luật spawn/loot. Snapshot rương vẫn 5Hz, bản đồ vẽ10Hz. Phá rương mất dấu sau snapshot kế tiếp; hồi sinh dùng ID/vị trí mới. Client2.12 dùng server2.11/protocol8 được, không cần redeploy chỉ vì radar. Server2.9/2.10/protocol7 vẫn cần nâng như hướng dẫn v2.11 dưới đây.

v2.11.0: protocol8 thay luật nhặt Cam/Đỏ: cao phẩm hơn tự cầm ngay, Cam/Đỏ cũ/không cao hơn giữ trong túi. Món đang cầm không có bản sao trong túi. Không vứt đồ hiếm cũ khi đầy túi. Server shared quyết định mọi nhặt/đổi; bag chỉ gửi cho chủ sở hữu. Cập nhật CẢ backend Render và HTML5 lên v2.11.0, server trước rồi client. Client cũ protocol≤7 bị từ chối; client mới hướng dẫn cập nhật kể cả nhận lỗi từ server cũ. Deploy reset phòng trong RAM; thông báo người đang chơi trước khi deploy.

v2.10.0: HUD gọn, thông tin/mời bạn ở pause. THOÁT TRẬN gọi net.leave() đóng WebSocket, hủy input/timeout, xóa entities và bag/equipment local; server chỉ bỏ actor của socket đó. Rejoin guest mới, giữ nguyên thế giới của người khác. Pause ONLINE không dừng server, cảnh báo rõ; chết cũng có exit. Không đổi gameplay, actorFields/input hoặc protocol7. Client v2.10.0 tương thích backend Render v2.9.0; không cần redeploy backend chỉ vì UI mới. Xem HUD.md.

v2.9.0: cùng movementIntent với SOLO; input dirty nhịp ≥16ms, idle ≥33ms, dừng xếp input nếu WS buffer ≥4KiB. Menu/blur gửi stop ngay. Ngoại suy hiển thị đối thủ ≤80ms, chính mình ≤100ms; hiệu chỉnh theo snapshot, snap teleport/respawn/clash, clamp biên. Góc idle nội suy đường ngắn, góc đòn đánh theo server. Không mô phỏng/chi XP/HP/stamina hay xác nhận hit ở client. Server physics 30Hz/giới hạn100msg/s/input timeout350ms giữ nguyên; protocol7 không thêm field. Stats cache120 frozen không đổi giá trị; cache render/HUD/DPR nằm ở client. Xem PERFORMANCE.md để biết giới hạn và kiểm thử trễ150ms.

v2.8.0: 20 tạo hình chibi trong chibi.js, chỉ dùng trạng thái công khai để vẽ biểu cảm. Không thêm field mạng, chỉ số hay hitbox; main weapon giữ đúng transform/collision đã có. Client cập nhật để thấy nét vẽ mới; server/HTML5 ZIP đã đồng bộ chibi.js, protocol vẫn 7, client cũ tương thích gameplay. Robot và BOT v2.7 giữ nguyên. Xem CHIBI.md.

v2.7.0: BOT chiến thuật từ `ai.js`, dùng chung SOLO/Node VM: quyết định có trễ, tầm quan sát 650, tính cách, chọn trận/đi vòng/giữ cự ly/rút về cờ, nhặt đồ/EXP/rương và dùng skill/dash/sprint có trả phí. Không đọc input hoặc dữ liệu ẩn đối phương, không buff chỉ số. Server quyết định mọi hành vi, không gửi brain/target/aiTime trong snapshot và không chấp nhận khai giả BOT từ input. Update server để có BOT mới ONLINE; update HTML5 để có SOLO mới. RulesVersion vẫn 7 vì hình học/chỉ số/giao thức chiến đấu không đổi. Xem AI.md; gói server có ai.js ở gốc lẫn public/.

v2.6.0: mặc định ONLINE, tự ghép phòng bằng `{type:'join',rulesVersion:7,matchmaking:'auto',name}` không cần room. Server chọn phòng automatic đông nhất còn chỗ, không trộn vào phòng mã thủ công; đầy 16 thì tạo phòng mới, tối đa 8 phòng. Trả mã thật trong welcome; liên kết mời vào mã đó vẫn được. Chọn và thêm người đồng bộ, không overbook. Hết chỗ trả lỗi rõ ràng; đóng kết nối xóa actor/phòng trống. Đây là bổ sung giao thức tương thích, không đổi rulesVersion hoặc luật gameplay. Client tự ghép cần server v2.6.0; client cũ vẫn vào mã thủ công như trước. API status thêm matchmaking:true, maxRooms:8.

Triển khai một website dùng **3qio-web-v2.17.0.zip** và `render.yaml`: xem **DEPLOY-WEB.md**. Game và server chung một dịch vụ Docker, tự nhận cùng origin, không cần itch.io hoặc cấu hình WSS riêng. `public/` có game và font; `scripts/prepare-public.cjs` hỗ trợ checkout nguồn thiếu public mà vẫn giữ font đóng gói khi có. Gói Free có thể ngủ. Cấu hình một instance vì phòng lưu trong RAM.

v2.5.0 (thay luật rương cũ): spawn đầu và ô bù thường random Lv1/2/3/4/5 = 70/15/10/4/1%, không tăng theo tuổi phòng. Chu kỳ 60s, mốc đợt 5/10/15… bảo đảm 1 Lv4, 10/20/30… thêm 1 Lv5; đợt đầu không tính, không reset khi ra sớm. Rương sống không bị thay/hồi; tối đa 15; thiếu ô thì giữ nợ cho đợt có chỗ, ưu tiên Lv5. Các ô bảo đảm là ngoại lệ xác suất. Đỏ chỉ rơi từ Lv3/4/5; Lv1/2 chuyển phần đỏ sang cam. Server tự quản lý RNG/mốc/nợ/loot; join/respawn không reset, client không khai được kết quả. Cập nhật cả HTML5/server v2.5.0, protocol 7; từ chối v2.4.x trở xuống. Các mục cũ sau đây là lịch sử.

v2.4.0: đầu phòng 11 Lv1 + 3 Lv2 + 1 Lv3, nhịp bù 60s. EXP tăng 50% theo `150+60n+15n²`, tổng 44.745 đến Lv20. Vũ khí theo phẩm có size ×1/1,08/1,16/1,25/1,36/1,5; hình vẽ/chiều rộng/chặn/tầm đánh đồng bộ quanh tay cầm. Server tự tính từ profile/rarity thật, bỏ qua size/reach/EXP do client khai. Không đổi ATK/ASPD vốn có, kho chạy vẫn 4.060, Lv21 vẫn 7 ngọc. Bắt buộc cả game/server v2.4.0 vì protocol 6; từ chối v2.3.x trở xuống.

v2.3.3: nhịp bù rương **60s/lần**, dựa giờ chung phòng; join muộn/respawn không reset nhịp. Tối đa 15, chỉ thay rương đã phá, không hồi/reroll rương còn sống. Mốc cấp cao giữ nguyên phút 2/4/6/10 (`chestDifficultyPeriod:120` tách khỏi `chestPeriod:60`). Cập nhật cả game/server v2.3.3; protocol vẫn 5.

v2.3.2: người kết liễu chỉ nhận ngay cơ bản `24 + 16 × cấp đối thủ`. Phần `floor(20% × tổng EXP đối thủ)` **rơi thành ngọc**, không cộng thẳng. Server chia tối đa 32 viên, đúng tổng giá trị, chờ 0,6s trước hút/nhặt; ai tới nhặt đều được, không khóa chủ. Ngọc chết thường không đổi. Snapshot xác chết gửi `bountyXp` (cơ bản), `droppedXp` (rơi) và `killerId`; orbs thêm phần tử tùy chọn thứ 5 `pickupAt` (0 = thường). Respawn reset metadata. Server quyết định rơi/nhặt, bỏ qua claim/XP client khai; tranh nhặt không nhân đôi. Tổng không giảm khi tiêu KN chạy; BOT cấp cao có tổng nền. Protocol vẫn 5 (dữ liệu bổ sung tương thích), cập nhật cả HTML5/server v2.3.2.

v2.3.0: 7 ngọc rồng triệu hồi robot Long Thần Cơ Giáp (Lv21). Kích thước thật ~1,7 lần Lv20, HP 352, giữ vũ khí/ATK/ASPD/túi/quốc gia, không sinh thêm actor hay bất tử. Máy chủ xác thực số ngọc, nâng cấp, hiệu ứng 2,4s và biên bản đồ; snapshot `robotSummon` cho mọi người trong phòng. `robot.js` dùng chung browser/Node VM; không tin trường level/dragonCount/robotSummon/scale từ client. Cập nhật cả HTML5/server v2.3.0.

v2.2.1: chặn thành công bật lùi 32 đơn vị mỗi bên, không mất HP; người trong vùng cờ không bị đẩy, chặn ở biên bản đồ. Toàn bộ lực đẩy/tỉ lệ rương tính trên server. Lv1/2 giảm phẩm hiếm theo LOOT.md, Lv3–5/ngọc/nhịp rương không đổi. Client không nhận nhầm bật lùi chặn thành LƯỚT.

v2.2.0 giảm ATK/DPS/skill theo COMBAT.md. `combat.js` dùng chung với BOT: vũ khí chạm thật khi chém đúng nhịp sẽ hủy hai đòn, không damage từ đòn bị hủy, có bật lùi chặn nhẹ theo v2.2.1. Không invulnerability, không hoàn lại damage trước đó; giữ cooldown. Skill đâm/quét có hoạt ảnh ra đòn và cũng bị chặn. Máy chủ giải quyết timing/hình học trước body damage, snapshot gửi attackKind/clashSeq/hiệu ứng/điểm chạm. Không nhận kết quả parry/damage/clash do client khai. Chưa có lag compensation.

v2.1.0 tự nhặt vũ khí/ngọc khi đi sát, chỉ tự nâng phẩm trắng–tím. Vàng/cam–đỏ vào túi 24 ô, không tự trang bị, đầy túi thì giữ trên đất. Vào vòng cờ bất kỳ tự hiện popup; F/TÚI mở lại, chọn món để trang bị, rời cờ tự đóng. Không cần chờ gia nhập phe. Đổi đồ hiếm trả món cũ về túi; đồ thường cũ rơi xuống đất. Giữ hồi chiêu, không dừng trận. Túi không lưu qua tái xuất/rời phòng.

Máy chủ tự xử lý nhặt, chỉ nhận ID món để đổi. Kiểm tra nhân vật còn sống, vị trí thật nằm trong vòng cờ và ID thực sự thuộc túi. Không chấp nhận inventory/vị trí/phẩm do client khai; ID đã dùng không thể phát lại để nhân đôi đồ. Snapshot túi chỉ gửi về chính socket sở hữu, không gửi túi người khác.

v2.0.2 có tối đa 15 rương (HP 36/72/144/540/900), đầu trận 12 Lv1 + 3 Lv2. Từ v2.3.3 mỗi 60 giây theo giờ chung của phòng bù rương đã phá tại vị trí mới; tỉ lệ cấp cao tăng theo thời gian (Lv3 phút 2, Lv4 phút 4, Lv5 phút 6). Rương sống không bị nâng cấp hoặc hồi đầy khi sang đợt. Vào muộn/hồi sinh không đặt lại nhịp rương. Có đồng hồ BÙ SAU. Luật nhặt/đổi đồ dùng cơ chế mới v2.1.0 ở trên. Máy chủ xử lý tự nhặt cho mọi người chơi, client không quyết định kết quả. Muốn áp dụng cân bằng mới phải cập nhật gói server, không chỉ thay ZIP HTML5.

**Cập nhật cả game lẫn máy chủ:** v2.5.0 dùng `rulesVersion: 7`, từ chối kết nối client cũ (kể cả v2.4.x) để không trộn luật combat. Cấp nhân vật không tăng ATK/ASPD; rương, loot, ngọc rồng/Lv21 và kỹ năng đều do máy chủ tính. Client chỉ gửi điều khiển/skill và ID món trong túi để đổi tại cờ, không gửi kết quả rương hoặc chỉ số trang bị. Cùng phòng nhìn thấy cùng rương và cùng drop; một vật phẩm chỉ nhặt được một lần. Xem LOOT.md để biết cân bằng và điều khiển F/Q.

## Chơi thử

Mở website, nhập tên rồi bấm CHƠI ONLINE để tự ghép phòng. Mỗi phòng tối đa 16 người và 8 bot. Muốn hẹn bạn: chọn CHƠI CÙNG BẠN rồi cùng nhập mã, hoặc gửi liên kết từ nút MỜI khi đã vào phòng. TẠO MÃ sinh mã khác. MỜI chỉ chuẩn bị nháp chat Bash.tv khi SDK khả dụng, nếu không thì chép mã/hiện mã. BOT vẫn chơi không cần máy chủ.

Phòng là công khai, mã không phải mật khẩu. Danh xưng là tên khách do người chơi nhập, không phải tài khoản đã xác minh. Không lưu tiến độ: rời phòng, mất kết nối hoặc khởi động lại máy chủ sẽ mất lượt chơi. Hồi sinh sau khi chết bắt đầu từ cấp 1; có 4 giây bảo hộ. Phòng trống bị xóa tự động.

Máy chủ quyết định vị trí, sát thương, XP, tiến hóa, gia nhập phe, hồi sinh và ngọc. Trình duyệt chỉ gửi hướng di chuyển/đánh/lướt/chạy. Giữ chuột phải (cảm ứng: giữ CHẠY) để chạy ×1,65, mất 10 KN hiện tại/giây khi thực sự di chuyển; hết KN thì về tốc độ thường, không tụt cấp. Đứng yên, bị chặn hẳn ở biên hoặc đang LƯỚT không mất KN chạy; LƯỚT không cộng dồn tốc độ với CHẠY. Cấp 20 có kho KN dự trữ tối đa 4.060 để tiếp tục chạy, nạp bằng nhặt ngọc/hạ đối thủ. Tổng KN đã nhận là thống kê lịch sử, không bị trừ. Cùng phe không đánh nhau; mọi người trong vòng cờ đều được bảo vệ ngay; gia nhập vẫn cần 5 giây liên tục. Mở menu không dừng trận online: người đứng yên ngoài vòng an toàn vẫn có thể bị đánh. BOT là chế độ chơi đơn cũ với 24 bot, không cần máy chủ.

## Chạy từ mã nguồn

Yêu cầu Node.js >= 20, Python 3 để đóng gói:

```
npm ci
python3 build_release.py
npm start
```

Mở `http://localhost:3002`. Máy chủ lắng nghe `0.0.0.0`; biến `PORT` đổi cổng. Chạy test: `npm test`.

`server/world.cjs` chạy chính các luật trong game.js/kingdoms.js bằng bộ chuyển đổi DOM trơ trong Node VM, không sao chép một bộ luật khác. Không có chuỗi từ mạng được thực thi. Mỗi phòng có thế giới độc lập. Tick vật lý 30 Hz; trạng thái nhân vật 15 Hz; ngọc gần người chơi 5 Hz. Máy chủ giới hạn 8 phòng, 16 người/phòng, payload 2 KB, 100 tin/giây/socket, đóng socket im lặng và dừng input quá hạn 350 ms. Đây là prototype, chưa có đăng nhập, lưu trữ, chống lạm dụng nâng cao hay chia tải nhiều máy chủ.

## Đưa online lâu dài

**File HTML5 ZIP trên itch.io không tự chạy máy chủ Node.** Preview Bash.tv chỉ là máy chủ thử nghiệm trong sandbox; không được xem là hosting luôn hoạt động hoặc endpoint triển khai chính thức.

**Khuyên dùng một website:** triển khai `3qio-web-v2.17.0.zip` theo DEPLOY-WEB.md. Phần dưới dành cho người vẫn muốn tách itch.io và backend.

1. Dùng `3qio-server-v2.17.0.zip` để triển khai lên nền tảng hỗ trợ Node.js/WebSocket hoặc Docker. ZIP máy chủ có package.json, server/, luật mô phỏng và public/ với client/font. Không upload ZIP máy chủ làm HTML5 game trên itch.io.
2. Giải nén gói máy chủ. Chạy `npm ci --omit=dev`, sau đó `STATIC_ROOT=./public npm start`. Hoặc `docker build -t 3qio .` rồi `docker run -p 3002:3002 3qio`.
3. Cấu hình nền tảng/reverse proxy cung cấp HTTPS và WebSocket upgrade. `/api/status` phải trả JSON với `multiplayer: true`. Endpoint WebSocket là `wss://TEN-MAY-CHU/ws`. Hạ tầng không được rewrite đường dẫn /ws hoặc chặn upgrade. Một instance duy nhất; tắt autoscale nhiều instance vì phòng đang nằm trong bộ nhớ.
4. Trong HTML5 ZIP, sửa multiplayer-config.js: `window.MULTIPLAYER_SERVER_URL = 'wss://TEN-MAY-CHU/ws';`. Đây là địa chỉ công khai, không phải API key. Không đưa bí mật hay mật khẩu vào client.
5. Nén lại các file client sao cho index.html vẫn ở gốc, upload ZIP HTML5 mới lên dự án itch.io và bật browser play. Máy chủ dùng WSS vì itch.io chạy HTTPS. Mở hai trình duyệt/máy, nhập cùng mã và thử di chuyển/đánh/gia nhập phe.

Nếu build từ mã nguồn, có thể đặt `MULTIPLAYER_SERVER_URL=wss://TEN-MAY-CHU/ws python3 build_release.py` để tự ghi cấu hình vào ZIP client. Nếu bỏ trống, client chỉ tự dò máy chủ cùng origin; trên itch.io nó mặc định chơi BOT cho đến khi được cấu hình endpoint riêng.

Server chỉ phục vụ file public cho phép, không phục vụ mã server/package/.env. API status là công khai và không chứa dữ liệu riêng. WebSocket không dùng cookie hoặc phiên đăng nhập Bash/itch. Tên người chơi và trạng thái trận là dữ liệu công khai trong phòng.
