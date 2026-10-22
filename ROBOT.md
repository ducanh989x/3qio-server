# Long Thần Cơ Giáp · Tướng ẩn Lv21 · v2.3.0

## Tạo hình
Robot chiến thần khổng lồ thay tạo hình người vàng của Lv21. Thân máy thép xanh xám, viền vàng, giáp vai lớn, khớp thủy lực, chân nặng, động cơ sau lưng, đầu có sừng giáp và mắt cyan. Lõi phản ứng phát sáng/nhịp thở, 7 viên ngọc xoay chậm quanh thân. Đây là thiết kế hư cấu có chủ đích, không phải nhân vật lịch sử hay vũ khí Diễn Nghĩa mới.

`robot.js` vẽ vector Canvas, không cần ảnh mạng hoặc WebGL. Tay giữ đúng vũ khí hiện có qua bộ vẽ chung. Khung người lớn hơn khoảng 1,68 lần Lv20 (~5,8 lần Lv1); scale 2,4, radius 108,84 đơn vị. Hitbox, va chạm, biên, nhặt đồ và đoạn vũ khí đều dùng kích thước thật, không chỉ phóng to ảnh. Di chuyển/đánh/skill/chạy/lướt dùng điều khiển cũ.

## Triệu hồi
- Nhặt đủ 7 viên cộng dồn; EXP vẫn chỉ lên Lv20. Viên thứ 7 tự kích hoạt, không thêm nút.
- Người chơi chuyển sang điều khiển robot, cùng actor/ID, không thêm BOT hoặc đồng minh AI.
- Vòng năng lượng, ánh sáng 7 ngọc, hạt vàng/cyan và âm trầm khi bật âm thanh; hiệu ứng 2,4 giây.
- Thân máy hiện ngay; không tạm dừng, không bất tử hay sát thương vùng khi triệu hồi.
- HP vẫn 352 và hồi đầy như luật Lv21 trước đó. Giữ nguyên trang bị, ATK, ASPD, skill/cooldown, túi và quốc gia; không tặng họa kích hoặc vũ khí hiếm.
- Chỉ kích hoạt một lần mỗi lượt; không nhận viên thứ 8, không đặt lại hiệu ứng bằng yêu cầu client. Chết/tái xuất/rời phòng đặt lại như trước.

## Xem thiết kế
Bảng tiến hóa → thẻ **21 · Long Thần Cơ Giáp**. Có ảnh so kích thước với lính Lv1; chỉ xem, không cấp ngọc hoặc mở khóa. Họa kích cam trong ảnh là minh họa. Trong trận luôn giữ vũ khí đang cầm.

## ONLINE và kiểm thử
Máy chủ quyết định cấp/số ngọc/kích thước, clamp vị trí khi thân máy lớn lên. Snapshot `robotSummon` gửi hiệu ứng tới cả chủ nhân và người khác trong phòng. Không tin `level`, `dragonCount`, `scale` hay `robotSummon` do client khai. Không lưu tài khoản.

Cập nhật cả HTML5/server **v2.5.0**, `rulesVersion:7`, từ chối v2.4.x trở xuống để tránh lệch hitbox. Server ZIP phải có `robot.js` ở cả gốc và `public/`.

- `npm test`: robot.test.cjs kiểm tra 7 viên, không tăng ATK/ASPD/đổi đồ/phe, không sinh thêm actor, hitbox/biên, reset, vẽ hữu hạn/cân bằng Canvas/7 ngọc, socket thật và chống giả mạo.
- `playwright-cli run-code --filename=tests/robot.browser.js`: nhặt 7 viên thực, triệu hồi, catalog, di chuyển desktop, đánh/skill cảm ứng, 390×844/320×568/844×390.
- `tests/inventory-network.browser.cjs`: hai trình duyệt desktop/touch, cùng nhìn thấy robot/hiệu ứng, giữ chỉ số và không thêm BOT.
