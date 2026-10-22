'use strict';
// Novel-inspired silhouettes, not archaeological reconstructions. Each level has
// its own proportions/materials; named weapons and character lore live in HEROES.
const WEAPON_PROFILES=[
 {kind:'club',wood:'#967047',wrap:'#655333',width:3.2,description:'Khúc gỗ thô khởi đầu, vân gỗ sẫm và dây quấn tay cầm; không có lưỡi kim loại.'},
 {kind:'dao',blade:28,width:6,curve:3,wood:'#70523a',wrap:'#756447',description:'Đao ngắn một lưỡi, sống dày, mũi hơi hất; chuôi gỗ có vòng đuôi.'},
 {kind:'jian',blade:33,width:4.5,wood:'#70523b',wrap:'#5e5543',description:'Kiếm thẳng hai lưỡi, mũi nhọn đối xứng, sống giữa và chắn tay bằng đồng.'},
 {kind:'spear',blade:24,width:4.8,wood:'#967049',wrap:'#67533d',tassel:'#91523c',description:'Thương lính: cán gỗ dài, đầu lá liễu nhỏ có sống giữa và bầu tra cán.'},
 {kind:'spear',blade:29,width:6.5,wood:'#654b35',wrap:'#43392d',tassel:'#874735',description:'Thương của Chu Thương: đầu lá rộng, cán gỗ sẫm, bầu sắt và tua vải ngắn.'},
 {kind:'poleblade',blade:31,width:9,curve:2,wood:'#7b5a3a',wrap:'#5b4933',description:'Đại đao Liêu Hóa: lưỡi bản thẳng một cạnh, đầu vát và cổ đao tra cán dài.'},
 {kind:'poleblade',blade:35,width:10,curve:5,wood:'#755936',wrap:'#49725a',tassel:'#8e4a34',description:'Đại đao Quan Bình: lưỡi cong vừa, bản rộng về đầu, cổ đao gia cố và tay quấn xanh.'},
 {kind:'poleblade',blade:37,width:9,curve:2,wood:'#60503f',wrap:'#425a71',description:'Đại đao Tào Hồng: sống gần thẳng, mũi xiên gọn, cán tối và đai sắt.'},
 {kind:'poleblade',blade:38,width:12,curve:4,wood:'#986a42',wrap:'#755239',description:'Đại đao Hàn Đương: bản đao rộng, mũi quét nhẹ, cán gỗ nâu và đai đồng.'},
 {kind:'whip',width:5.5,wood:'#544938',wrap:'#714832',description:'Thiết tiên Hoàng Cái: thanh sắt cứng chia đốt, tiết diện có cạnh; không phải roi dây hoặc chùy gai.'},
 {kind:'axe',blade:33,width:25,wood:'#796044',wrap:'#4b5960',description:'Đại phủ Từ Hoảng: một lưỡi rìu lớn hình quạt, mắt tra cán và gót đối trọng; không phải búa hai đầu.'},
 {kind:'poleblade',blade:42,width:10,curve:3,wood:'#514637',wrap:'#435a68',tassel:'#80513d',description:'Đại đao Trương Liêu: lưỡi dài tương đối hẹp, mũi xiên, cổ bọc sắt và cán sẫm.'},
 {kind:'poleblade',blade:41,width:12,curve:7,wood:'#805435',wrap:'#925340',tassel:'#aa5239',description:'Đại đao Cam Ninh: lưỡi vuốt cong về mũi, cạnh cắt rõ, tay cầm quấn vải đỏ nâu.'},
 {kind:'spear',blade:34,width:6.4,wood:'#795738',wrap:'#78513b',tassel:'#b1523b',description:'Thiết thương Thái Sử Từ: đầu mâu hình thoi kéo dài, sống sắt nổi, cổ có tua đỏ.'},
 {kind:'poleblade',blade:45,width:14,curve:6,wood:'#725332',wrap:'#9b8454',tassel:'#81543b',description:'Đại đao Hoàng Trung: lưỡi lớn một cạnh, sống dày, bầu cán dài; cung và ống tên vẫn đeo sau lưng.'},
 {kind:'spear',blade:35,width:5.2,wood:'#ac946c',wrap:'#c6c4aa',tassel:'#c1c5b0',description:'Thương Mã Siêu: mũi dài thanh, bầu thép, cán gỗ sáng và tua màu ngà; không gán tên Hổ đầu thương.'},
 {kind:'serpent',blade:44,width:7,wood:'#574a38',wrap:'#414a3b',tassel:'#78442f',description:'Xà mâu Trương Phi: một lưỡi mâu uốn lượn liên tục, mũi nhọn, cán đen chắc; không thêm móc hoặc lưỡi phụ.'},
 {kind:'spear',blade:40,width:5.8,wood:'#807252',wrap:'#b3c9be',tassel:'#e0dfc7',description:'Thương Triệu Vân: mũi lá liễu dài, hai cạnh rõ, cổ thép và tua ngà. Thanh Công kiếm là vũ khí phụ đeo bên người.'},
 {kind:'glaive',blade:49,width:29,wood:'#695138',wrap:'#477052',tassel:'#a34b34',description:'Yển nguyệt đao Quan Vũ: một bản đao lớn dạng trăng khuyết, sống dày, cổ đồng khắc nét rồng và cán dài.'},
 {kind:'halberd',blade:32,width:28,wood:'#765336',wrap:'#964b38',tassel:'#ba4d36',description:'Họa kích Lữ Bố: mũi thương đâm thẳng ở giữa, hai lưỡi nguyệt hai bên nối bằng ngạnh; không phải đao hoặc đinh ba.'}
];
function weapon(c,hero,length){
 const p=WEAPON_PROFILES[hero.level-1];
 if(!p)throw new RangeError('Weapon level must be 1–20');
 const tip=length+10;
 // Keep the long wooden haft dominant: these are polearms, not giant knives.
 const head=Math.min(p.blade||0,tip*(p.kind==='poleblade'?.32:p.kind==='spear'?.29:p.kind==='serpent'?.36:.43)),neck=tip-head;
 const dark='#293c35',bronze='#b09a62',edge='#f0eee0';
 c.save();c.translate(0,7);c.lineCap='round';c.lineJoin='round';
 const steel=c.createLinearGradient(0,-(p.width||8),0,(p.width||8));
 steel.addColorStop(0,'#657d79');steel.addColorStop(.38,'#a7bab4');steel.addColorStop(.52,'#e3e6d7');steel.addColorStop(.64,'#b6c7bd');steel.addColorStop(1,'#718b82');
 function shape(points,fill=steel){poly(c,points,fill,dark)}
 function band(x,width=3,color=bronze){line(c,[[x,-3],[x,3]],color,width)}
 function shaft(end){
  line(c,[[7,0],[end,0]],dark,7);
  line(c,[[7,0],[end,0]],p.wood,4.6);
  const gripEnd=['dao','jian','club','whip'].includes(p.kind)?27:20;
  line(c,[[gripEnd+1,-1.4],[end,-1.4]],'#dec59b66',1);
  for(let x=11;x<gripEnd;x+=3)line(c,[[x,-2],[x+1,2]],p.wrap,2.5);
  band(7,3,'#777b68');band(gripEnd+1,2);
  for(let x=47;x<end-9;x+=31)band(x,1.5,'#494d3d');
 }
 function tassel(x){
  if(!p.tassel)return;
  line(c,[[x,-3],[x,4]],bronze,2.5);
  for(let i=0;i<6;i++){c.beginPath();c.moveTo(x-1,2);c.quadraticCurveTo(x-6-i,6+i,x-12-i*1.2,4+i*.8);c.strokeStyle=p.tassel;c.lineWidth=1.1;c.stroke()}
 }
 function socket(){
  shape([[neck-9,-2.8],[neck+3,-4],[neck+6,0],[neck+3,4],[neck-9,2.8]],'#7e8c7e');band(neck-7,2);
 }
 if(p.kind==='club'){
  shaft(tip-2);line(c,[[27,-1],[tip-2,-1]],'#d4c28b',1.5);
  for(let x=32;x<tip-2;x+=11)line(c,[[x-3,-2],[x+2,-.5],[x+4,-1.5]],'#684b32',1);ellipse(c,tip-2,0,2.5,3,'#b89360');
 }else if(p.kind==='whip'){
  shaft(28);band(28,4);const end=tip-3;
  shape([[30,-4],[end,-3.3],[tip,0],[end,3.3],[30,4]]);
  line(c,[[32,0],[end,0]],edge,1.5);
  for(let x=34;x<end;x+=7){line(c,[[x,-4],[x,4]],'#344c45',2);line(c,[[x+1,-3],[x+1,3]],'#b5bdaa',.8)}
  ellipse(c,7,0,3,3,bronze);
 }else if(p.kind==='jian'||p.kind==='dao'){
  const start=26,w=p.width;shaft(start);
  if(p.kind==='jian'){
   shape([[start,-w],[tip-9,-w*.58],[tip,0],[tip-9,w*.58],[start,w]]);
   line(c,[[start+2,0],[tip-1,0]],edge,1.2);
   line(c,[[start+2,w-1],[tip-9,w*.58-1],[tip-1,0]],'#edf0df',.9);
   shape([[24,-9],[28,-8],[30,-4],[30,4],[28,8],[24,9],[26,3],[26,-3]],bronze);
   ellipse(c,7,0,4,3,bronze);
  }else{
   shape([[start,-3],[tip-9,-3],[tip,-p.curve],[tip-3,3],[tip-12,w+2],[start,w]]);
   line(c,[[start+3,w-1],[tip-12,w+1],[tip-3,2],[tip,-p.curve]],edge,1.3);
   band(25,3);ellipse(c,5,0,4,4,bronze);ellipse(c,5,0,2.2,2.2,'#243c31');
  }
 }else if(p.kind==='spear'){
  shaft(neck+4);socket();const w=Math.min(p.width,head*.2);
  shape([[neck,-2],[neck+head*.28,-w],[tip,0],[neck+head*.28,w],[neck,2]]);
  line(c,[[neck+3,0],[tip-2,0]],edge,1.4);
  line(c,[[neck+head*.28,w-1],[tip-2,0]],'#eff2df',.8);tassel(neck-8);
 }else if(p.kind==='poleblade'){
  shaft(neck+7);socket();const w=Math.min(p.width,head*.28),bend=p.curve*.4;
  c.beginPath();c.moveTo(neck,-2);c.lineTo(tip-8,-2-bend);
  c.quadraticCurveTo(tip-3,-3-bend,tip,-bend);
  c.quadraticCurveTo(tip-3,w*.6,tip-head*.28,w);
  c.quadraticCurveTo(neck+head*.38,w+1,neck,w*.55);c.closePath();
  c.fillStyle=steel;c.fill();c.strokeStyle=dark;c.lineWidth=1.4;c.stroke();
  c.beginPath();c.moveTo(neck+3,w*.55);c.quadraticCurveTo(neck+head*.38,w,tip-head*.28,w-1);c.quadraticCurveTo(tip-5,w*.5,tip-1,-bend);c.strokeStyle=edge;c.lineWidth=1.6;c.stroke();
  line(c,[[neck+4,0],[tip-8,-1-bend]],'#6a827b',1);tassel(neck-7);
 }else if(p.kind==='axe'){
  const eye=tip-20,w=p.width;shaft(eye+8);
  shape([[eye-6,3],[eye-8,-14],[eye-15,-w+4],[eye+5,-w],[tip,-16],[tip-1,-1],[eye+9,10]]);
  c.beginPath();c.moveTo(eye-12,-w+5);c.quadraticCurveTo(tip-1,-w,tip-1,-15);c.lineTo(tip-2,-2);c.strokeStyle=edge;c.lineWidth=2.2;c.stroke();
  shape([[eye-6,-6],[eye+5,-6],[eye+5,4],[eye-6,4]],'#899484');
  line(c,[[eye,-8],[eye,5]],bronze,3);shape([[eye-4,5],[eye+1,5],[eye+1,13],[eye-4,13]],'#6d7f74');
 }else if(p.kind==='serpent'){
  shaft(neck+4);socket();const w=p.width;
  // One continuous flame-like spear blade, not two prongs or a side hook.
  c.beginPath();c.moveTo(neck,-3);
  c.bezierCurveTo(neck+9,-w-3,neck+14,-w-2,neck+21,-1);
  c.bezierCurveTo(neck+29,w,tip-6,w,tip,-5);
  c.bezierCurveTo(tip-1,8,tip-12,w+5,neck+22,5);
  c.bezierCurveTo(neck+13,-3,neck+12,-3,neck,4);c.closePath();
  c.fillStyle=steel;c.fill();c.strokeStyle=dark;c.lineWidth=1.4;c.stroke();
  c.beginPath();c.moveTo(neck+2,0);c.bezierCurveTo(neck+15,-w,neck+19,4,neck+30,5);c.quadraticCurveTo(tip-4,7,tip-1,-3);c.strokeStyle=edge;c.lineWidth=1.2;c.stroke();tassel(neck-7);
 }else if(p.kind==='glaive'){
  shaft(neck+8);socket();const w=p.width;
  c.beginPath();c.moveTo(neck,-2);c.quadraticCurveTo(neck+4,-w,tip-7,-w);
  c.lineTo(tip,-w+4);c.quadraticCurveTo(tip-18,-w+10,tip-17,-7);
  c.quadraticCurveTo(tip-12,1,tip-5,4);c.quadraticCurveTo(neck+22,15,neck,8);c.closePath();
  c.fillStyle=steel;c.fill();c.strokeStyle=dark;c.lineWidth=1.6;c.stroke();
  c.beginPath();c.moveTo(neck+2,8);c.quadraticCurveTo(neck+23,13,tip-6,4);c.quadraticCurveTo(tip-29,-10,tip-1,-w+4);c.strokeStyle=edge;c.lineWidth=2;c.stroke();
  // Restrained engraved dragon motif, a visual interpretation only.
  line(c,[[neck+6,-1],[neck+12,-12],[neck+21,-16],[neck+25,-11],[neck+18,-7],[neck+15,0],[neck+24,4]],bronze,1.5);
  line(c,[[neck+22,-16],[neck+20,-20],[neck+25,-18]],bronze,1);band(neck-5,4);tassel(neck-9);
 }else if(p.kind==='halberd'){
  const root=tip-45;shaft(tip-23);
  shape([[tip-29,0],[tip-20,-5],[tip,0],[tip-20,5]]);
  line(c,[[tip-27,0],[tip-2,0]],edge,1.2);
  for(const s of [-1,1]){
   line(c,[[root,0],[root+2,s*16],[root+11,s*18]],bronze,3);
   c.beginPath();c.moveTo(root-2,s*11);c.quadraticCurveTo(root-6,s*27,root+8,s*28);
   c.quadraticCurveTo(root+22,s*27,tip-8,s*9);
   c.quadraticCurveTo(root+18,s*20,root+9,s*19);c.quadraticCurveTo(root+3,s*18,root-2,s*11);c.closePath();
   c.fillStyle=steel;c.fill();c.strokeStyle=dark;c.lineWidth=1.3;c.stroke();
   c.beginPath();c.moveTo(root,s*14);c.quadraticCurveTo(root-3,s*25,root+8,s*26);c.quadraticCurveTo(root+21,s*25,tip-9,s*10);c.strokeStyle=edge;c.lineWidth=1.4;c.stroke();
  }
  band(root-5,4);tassel(root-9);
 }
 c.restore();
}
