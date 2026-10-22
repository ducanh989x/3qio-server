# Combat v2.4.0

v2.4.0: kích thước trang bị theo phẩm trắng/lục/lam/tím/cam/đỏ là ×1/1,08/1,16/1,25/1,36/1,5. Phóng hai trục quanh điểm cầm (10,7), tay không bị phóng. `reach = 10 + (baseReach − 10) × size`, độ dày blade cũng nhân size; tiếp tục nhân bodyScale. Hình vẽ, đánh thường, skill, hit rương và chặn cùng một hình học. Không tăng thêm ATK/ASPD từ kích thước. · Cân bằng ATK và chặn vũ khí

## Sát thương
ATK không phụ thuộc LV nhân vật hoặc số thứ tự mẫu vũ khí. LV vẫn chỉ đổi HP, thân hình/hình dáng, kích thước/tầm theo mô hình và đặc điểm di chuyển như trước. HP Lv1 = 112, Lv20 = 340, Lv21 = 352.

ATK = round(ngân sách DPS loại / tốc độ cơ bản loại × hệ số ATK phẩm). Ngân sách DPS trắng khoảng 20–25/s, khiến đao/kiếm nhanh đánh nhẹ, phủ/đại đao chậm đánh nặng thay vì vừa nhanh vừa có ATK lớn.

| Phẩm | Hệ số ATK | Hệ số ASPD |
|---|---:|---:|
| Trắng | 1 | 1 |
| Lục | 1,08 | 1,05 |
| Lam | 1,18 | 1,10 |
| Tím | 1,32 | 1,17 |
| Vàng/cam | 1,50 | 1,25 |
| Đỏ | 1,70 | 1,35 |

- Khúc gỗ vẫn 18 ATK, 1,10 đòn/s.
- Đòn thường tối đa 53 ATK; DPS thường dưới 60/s ở tất cả 120 tổ hợp loại/phẩm. Ví dụ Phương thiên họa kích đỏ: 208 → 47 ATK.
- Xuyên trận/Hoành tảo: ATK ×1,20 cam, ×1,35 đỏ; sát thương đơn tối đa 72. Giữ hồi 12/10s.
- Liên kích: ASPD ×1,30 trong 3s (thay ×1,65), giữ hồi 12/10s.
- Tướng Lv1 đầy máu chịu ít nhất 3 đòn thường mạnh nhất; Lv20 ít nhất 7. Đây là số đòn lý thuyết khi không hồi máu/chặn/buff, không phải thời gian TTK cố định hoặc cam kết không chết bởi combo/nhiều người.
- Không thêm giáp theo LV hoặc giảm sát thương bí mật theo % HP. Không đổi HP/tần suất rương, ngọc, túi, quốc gia hay chạy nhanh. v2.2.1 chỉ giảm thêm tỉ lệ phẩm hiếm của rương Lv1/2 (xem LOOT.md).

## Chặn
Dùng Click/Space hoặc nút CHÉM/CHẶN, không có nút lá chắn riêng.

Hai đòn phải đang ở pha tấn công, tuổi đòn lệch không quá 90ms, chưa ở pha thu hồi, và hai đoạn vũ khí có độ dày phải thực sự chạm nhau. 90ms chỉ là điều kiện cần: không bảo đảm chặn nếu sai hướng/vị trí. Đứng yên cầm vũ khí không chặn được.

Vũ khí dùng đúng góc, gốc tay, độ dài và tỷ lệ thân hình khi vẽ. Va chạm vũ khí được giải quyết trước sát thương lên thân ở mỗi bước con (khoảng 360 Hz trong tick 30 Hz); không phụ thuộc người nào nằm trước trong danh sách actor. Khi chạm: hủy cả hai đòn hiện tại, không sát thương từ hai đòn đã bị hủy; từ v2.2.1 hai bên bật lùi 32 đơn vị ra xa nhau (áp dụng một lần, không cộng lực theo FPS). Người đang trong vòng cờ không bị đẩy, vị trí bị chặn ở biên bản đồ; hiện tia lửa và CHẶN! tại điểm va chạm. Giữ nguyên cooldown đánh thường và skill, không thêm invincibility hoặc bảo vệ khỏi người thứ ba. Không hoàn lại sát thương đã trúng trước đó.

Xuyên trận/Hoành tảo nay vung/đâm trong 0,32s thay vì gây sát thương tức thì. Va chạm/hitbox cùng dùng đoạn vũ khí thực, đánh mỗi mục tiêu/rương tối đa một lần. Hai skill này cũng có thể bị chặn và vẫn mất hồi chiêu nếu bị chặn. Cần chờ kết thúc đòn đang vung mới dùng; Q không ngắt chém để gây hai hit tức thì. Khi skill đang ra đòn, cooldown đánh thường ngăn tự chém ghi đè skill. Liên kích chỉ là buff; các nhát chém trong buff dùng luật chặn bình thường.

Đồng đội không chặn/gây sát thương cho nhau. Vùng cờ vẫn bảo vệ ngay và hồi sinh vẫn có bảo hộ. Chặn không gây hại cho đồng đội/vùng an toàn. Đòn tấn công từ người đang được bảo hộ vẫn có thể bị đối phương chặn, không làm mất bảo hộ.

## ONLINE
`combat.js` dùng chung BOT và Node VM. Máy chủ quyết định thời gian, hướng, hình học, sát thương, cooldown và kết quả chặn; bỏ qua trường damage/parry/clash/invincible/HP do client khai. Không có lag compensation hoặc cam kết cửa sổ chặn theo đồng hồ máy khách. Snapshot gửi attackKind và clashSeq/effect/điểm chạm để trình duyệt vẽ hiệu ứng; không cần client gửi yêu cầu chặn.

v2.3.0: robot Lv21 có scale 2,4, hitbox/tầm vũ khí cùng tỷ lệ bản vẽ, không tăng ATK/ASPD hoặc skill damage; HP vẫn 352. Cần cập nhật cả HTML5 và server v2.5.0 (`rulesVersion: 7`). Các bản v2.4 trở xuống bị từ chối để tránh trộn kích thước và luật.

## Kiểm thử
`npm test` gồm tests/combat.test.cjs: 120 biến thể, giới hạn DPS/ATK/skill, chặn 30/60/120 Hz và đảo thứ tự actor, sai nhịp/hướng/khoảng cách, không có invulnerability, người thứ ba, skill, vùng cờ/đồng đội, hình học suy biến và socket thực/chống giả kết quả.

`playwright-cli run-code --filename=tests/combat.browser.js`: thao tác Space và chạm nút, va chạm thực, HP hai bên giữ nguyên, chữ/tia lửa, layout mobile. Fixture chỉ được dựng trong tiến trình kiểm thử, không thêm endpoint quản trị vào game.
