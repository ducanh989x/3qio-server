# Tạo hình chibi Tam Quốc · v2.8.0

20 bậc lính/võ tướng có bảng màu tươi, nét viền rõ, đầu to, thân/giày ngắn và khuôn mặt hướng về người xem để đọc được trên điện thoại. Thân và vũ khí vẫn xoay theo hướng ngắm thật. Danh tính không phụ thuộc vũ khí đang nhặt; lên cấp vẫn đổi tướng như trước.

## Điểm nhận diện
1. Dân binh: nón và áo vá, nụ cười răng khểnh.
2. Khăn Vàng: khăn vàng lớn, đuôi khăn hai bên.
3. Bộ tốt: mũ sắt tròn có ba đinh tán.
4. Ngũ trưởng: chỏm đỏ, huy hiệu mũi nhọn, ria cong.
5. Chu Thương: da nâu, tóc nhọn, râu đen, răng khểnh.
6. Liêu Hóa: khăn xanh, tóc mai bạc, râu lún phún.
7. Quan Bình: băng trán xanh ngọc, chỏm tóc trẻ trung.
8. Tào Hồng: mũ lam có đồng tiền vuông, ria cong.
9. Hàn Đương: áo cam đất, vết sẹo nhỏ trên má.
10. Hoàng Cái: đầu hói bóng, tóc mai và râu trắng.
11. Từ Hoảng: khăn trắng quấn nhiều nếp, áo xanh lam.
12. Trương Liêu: mũ lam chỏm vàng, râu ngắn.
13. Cam Ninh: khăn tím, chuông vàng trên vai và khuyên tai.
14. Thái Sử Từ: khăn đỏ, lông mũ hai nhánh.
15. Hoàng Trung: râu trắng to, mũ cài tên và cung/ống tên sau lưng.
16. Mã Siêu: giáp bạc, bờm trắng trên mũ.
17. Trương Phi: mũ tai hổ, lông mày rậm, mũi đỏ, râu tròn xù, đốm vai.
18. Triệu Vân: giáp bạc xanh ngọc, chỏm mũ xanh, khăn gió, kiếm đeo bên người.
19. Quan Vũ: mặt đỏ, mũ xanh, râu dài chẻ ba.
20. Lữ Bố: vương miện vàng, hạt ngọc đỏ, hai lông trĩ cong đầu vàng.

Đây là minh họa vui nhộn/cách điệu, không phải phục dựng trang phục lịch sử. Binh khí/lore Diễn Nghĩa và Long Thần Cơ Giáp Lv21 giữ nguyên.

## Biểu cảm và giới hạn
Chớp mắt theo nhịp, má hồng, chân nhún khi đi; há miệng khi vung đòn, mắt lo lắng/giọt mồ hôi khi HP dưới 30%, mồ hôi khi chạy, mắt sao lúc chặn va vũ khí. Biểu cảm chỉ dùng trạng thái công khai đã có, không sinh hiệu ứng gameplay hoặc vật thể mạng mới. Portrait đứng yên, không ngẫu nhiên hoặc đột biến trạng thái.

`chibi.js` chỉ vẽ. Không đổi modelRadius, bodyScale, radius, moveEntity, hitbox, ATK/ASPD/HP, cooldown, phí lướt/chạy, luật rương/EXP/quốc gia/túi hay AI v2.7. Vị trí tay cầm (10,7), transform (2,r*.6), độ vươn, tỷ lệ phẩm và strikePose của main weapon không đổi. Cờ/bảo hộ vẫn cùng bán kính. Mũ/áo choàng/chòm râu là trang trí, không phải hitbox phụ.

Thêm chibi.js trước game.js vào HTML5, public/, nguồn server VM, static allowlist, Docker preparation và build ZIP; protocol vẫn 7. Catalog tăng cỡ portrait, dời tên/Lv lên 6px để không đè chỏm mũ. Client phải cập nhật để thấy tạo hình mới; backend cũ protocol7 vẫn tương thích gameplay. Bộ ZIP v2.8.0 gồm nguồn đồng bộ.

Kiểm thử: chibi.test.cjs kiểm tra 20 danh tính/geometry khác nhau, hữu hạn, save/restore cân bằng, không sửa actor và 480 tổ hợp trạng thái/hướng; chibi.browser.js kiểm tra catalog/trận desktop/touch; balance.browser.js kiểm tra 486 tổ hợp hình vẽ và hitbox của vũ khí, kể cả Lv21, kỹ năng và sáu phẩm.
