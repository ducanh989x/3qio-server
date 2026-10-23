'use strict';
// 27 equipment profiles, independent of the 20 hero levels. Existing literary
// weapons reference HEROES; the rubber chicken and extra oddities are gameplay inventions.
const WEAPON_PROFILES=[
 {kind:'chicken',wood:'#f5d456',wrap:'#e9a84a',width:9,description:'Gà cao su vàng, cổ dài bóp trong tay, mắt lồi, mào đỏ và lưỡi hồng thè ra. Đồ vui khởi đầu, không phải binh khí trong Diễn Nghĩa.'},
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
 {kind:'halberd',blade:32,width:28,wood:'#765336',wrap:'#964b38',tassel:'#ba4d36',description:'Họa kích Lữ Bố: mũi thương đâm thẳng ở giữa, hai lưỡi nguyệt hai bên nối bằng ngạnh; không phải đao hoặc đinh ba.'},
 {kind:'hammer',wood:'#71513c',wrap:'#a87951',width:14,description:'Đại chùy đầu sắt khối lớn có đinh tán, cán quấn da ngắn. Đòn nặng nhưng chậm; thiết kế bổ sung cho gameplay.'},
 {kind:'dual',wood:'#5e5664',wrap:'#9c6b8a',width:13,description:'Hai thanh kiếm song song, một dài một ngắn, chắn tay riêng. Cả hai lưỡi dùng cùng một lần đánh, không nhân đôi sát thương.'},
 {kind:'scythe',wood:'#796148',wrap:'#61927b',width:18,description:'Liềm cán dài, lưỡi cong móc về phía chuôi có sống thép sáng. Đồ bổ sung cho gameplay, không gán cho võ tướng.'},
 {kind:'boulder',wood:'#848b7b',wrap:'#a38b66',width:17,description:'Tảng đá lớn đa giác quấn đai thừng, có vân nứt và mặt cắt. Cầm để đập cận chiến, không ném đá hoặc tạo đạn bay.'},
 {kind:'pan',wood:'#625544',wrap:'#b08755',width:13,description:'Chảo chiến mặt tròn tối, viền kim loại và cán quấn vải; món đồ bếp dùng làm vũ khí vui trong game.'},
 {kind:'fish',wood:'#83a8ab',wrap:'#5f8589',width:10,description:'Cá mặn khổng lồ màu xanh bạc, vảy, vây và mắt ngơ ngác; cầm đuôi để quật, không phải vũ khí trong truyện.'},
 {kind:'chair',wood:'#a47746',wrap:'#69503a',width:17,description:'Ghế gỗ chiến gồm tựa lưng, mặt ngồi và bốn chân, có đinh đồng; dùng để đập cận chiến, chỉ là đồ dị gameplay.'}
];
const WEAPON_ACCENTS=Object.freeze(['#c79b69','#f2a46e','#a9dcf0','#efb76a','#8dbf92','#d9ac74','#83d7b0','#8bbaef','#e9c574','#f2a19c','#d5d0b0','#9fbcf2','#db95ee','#f08c7b','#f0d17e','#c6e4fa','#b7db89','#8be5ee','#8ce3b3','#ffbc8d','#d5c2a1','#db9bdc','#97d6b7','#b9c8a7','#f2cf8b','#8ed8e1','#e2b482']);
const WEAPON_HEADS=Object.freeze(['wood','saber','straight','leaf','triangle','cleaver','moon','beak','fan','segmented','axe','long','hook','diamond','broad','needle','serpent','willow','dragon','double-moon','hammer','dual','scythe','boulder','pan','fish','chair']);
function weapon(c,hero,length){
 const p=WEAPON_PROFILES[hero.level-1];
 if(!p)throw new RangeError('Weapon profile must be 1–'+WEAPON_PROFILES.length);
 const tip=length+10,accent=WEAPON_ACCENTS[hero.level-1],design=WEAPON_HEADS[hero.level-1],rare=(hero.rarity||0)>=4,finish=hero.rarity===5?'#ff9b87':rare?'#f5cf84':accent;
 // Keep the long wooden haft dominant: these are polearms, not giant knives.
 const head=Math.min(p.blade||0,tip*(p.kind==='poleblade'?.32:p.kind==='spear'?.29:p.kind==='serpent'?.36:.43)),neck=tip-head;
 const dark='#293c35',bronze='#b09a62',edge='#f0eee0';
 c.save();c.translate(0,7);c.lineCap='round';c.lineJoin='round';
 const steel=c.createLinearGradient(0,-(p.width||8),0,(p.width||8));
 steel.addColorStop(0,'#657d79');steel.addColorStop(.38,rare?accent:'#a7bab4');steel.addColorStop(.52,'#e3e6d7');steel.addColorStop(.64,hero.rarity===5?'#ffcfba':rare?'#ece1b4':'#b6c7bd');steel.addColorStop(1,'#718b82');
 function shape(points,fill=steel){poly(c,points,fill,dark)}
 function band(x,width=3,color=bronze){line(c,[[x,-3],[x,3]],color,width)}
 function shaft(end){
  line(c,[[7,0],[end,0]],dark,7);
  line(c,[[7,0],[end,0]],p.wood,4.6);
  const gripEnd=['dao','jian','club','whip'].includes(p.kind)?27:20;
  line(c,[[gripEnd+1,-1.4],[end,-1.4]],'#dec59b66',1);
  for(let x=11;x<gripEnd;x+=3)line(c,[[x,-2],[x+1,2]],p.wrap,2.5);
  band(7,3,accent);band(gripEnd+1,2,accent);
  if(rare){poly(c,[[21,-3],[24,0],[21,3],[18,0]],finish,dark);line(c,[[9,-1],[gripEnd,-1]],finish,1.2);if(hero.rarity===5)band(27,2,finish)}
  for(let x=47;x<end-9;x+=31)band(x,1.5,'#494d3d');
 }
 function tassel(x){
  if(!p.tassel)return;
  line(c,[[x,-3],[x,4]],bronze,2.5);
  for(let i=0;i<6;i++){c.beginPath();c.moveTo(x-1,2);c.quadraticCurveTo(x-6-i,6+i,x-12-i*1.2,4+i*.8);c.strokeStyle=i%2?accent:p.tassel;c.lineWidth=1.1;c.stroke()}
 }
 function socket(){
  shape([[neck-9,-2.8],[neck+3,-4],[neck+6,0],[neck+3,4],[neck-9,2.8]],'#7e8c7e');band(neck-7,2);
 }
 if(p.kind==='chicken'){
  line(c,[[8,0],[31,0]],dark,8);line(c,[[8,0],[31,0]],'#efc34c',5);
  ellipse(c,30,0,11,7,'#f4d35e');ellipse(c,29,-1,7,4,'#ffe992');
  line(c,[[35,0],[tip-9,0]],'#f5d65c',8);ellipse(c,tip-8,-1,7,6,'#ffdf69');
  c.lineWidth=1.2;poly(c,[[tip-13,-6],[tip-12,-11],[tip-9,-7],[tip-7,-10],[tip-5,-5]],'#e35955',dark);
  ellipse(c,tip-7,-3,2.8,3,'#fff4db');ellipse(c,tip-6,-3,1.2,1.6,'#243b35');
  poly(c,[[tip-3,-1],[tip,1],[tip-4,3]],'#df8647',dark);
  c.beginPath();c.moveTo(tip-3,2);c.quadraticCurveTo(tip-2,10,tip-9,11);c.strokeStyle='#ed8295';c.lineWidth=3;c.stroke();
  line(c,[[26,5],[23,11],[19,11]],'#e09a41',2);line(c,[[33,5],[32,11],[28,12]],'#e09a41',2);
  if(rare){band(16,3,finish);ellipse(c,30,-1,2,2,finish)}
 }else if(p.kind==='hammer'){
  shaft(tip-12);shape([[tip-26,-13],[tip-3,-13],[tip,-10],[tip,10],[tip-3,13],[tip-26,13],[tip-28,9],[tip-28,-9]]);
  line(c,[[tip-24,-9],[tip-5,-9]],edge,2);band(tip-14,5,accent);
  for(const y of [-8,8]){ellipse(c,tip-23,y,1.6,1.6,bronze);ellipse(c,tip-5,y,1.6,1.6,bronze)}
 }else if(p.kind==='dual'){
  shaft(25);for(const y of [-6,6]){const end=tip-(y>0?7:0);shape([[25,y-2.7],[end-7,y-2],[end,y],[end-7,y+2],[25,y+2.7]]);line(c,[[28,y],[end-2,y]],edge,1);line(c,[[23,y-5],[26,y-5],[26,y+5],[23,y+5]],bronze,2);line(c,[[8,y],[23,y]],p.wrap,3)}
 }else if(p.kind==='scythe'){
  shaft(tip-8);shape([[tip-14,3],[tip-18,-12],[tip-32,-18],[tip-43,-15],[tip-30,-10],[tip-23,-2],[tip-21,4]]);
  line(c,[[tip-43,-15],[tip-30,-10],[tip-23,-2],[tip-21,4]],edge,1.5);band(tip-14,4,accent);
 }else if(p.kind==='boulder'){
  line(c,[[8,0],[25,0]],p.wrap,7);c.lineWidth=1.5;shape([[21,0],[tip-32,-10],[tip-17,-17],[tip-4,-12],[tip,0],[tip-6,14],[tip-23,16],[tip-34,8]],'#909a86');
  shape([[tip-32,-10],[tip-17,-17],[tip-4,-12],[tip-17,-5]],'#b4b9a3');line(c,[[tip-18,-12],[tip-23,-3],[tip-13,2],[tip-16,10]],'#586f60',2);line(c,[[tip-28,-8],[tip-22,13]],p.wrap,3);line(c,[[tip-6,-8],[tip-11,12]],p.wrap,3);
 }else if(p.kind==='pan'){
  shaft(tip-19);ellipse(c,tip-13,0,13,13,'#394b46');ellipse(c,tip-13,0,10,10,'#657c72');ellipse(c,tip-13,0,7,7,'#344b42');c.beginPath();c.arc(tip-13,0,11,-2.5,-.5);c.strokeStyle=finish;c.lineWidth=2;c.stroke();
 }else if(p.kind==='fish'){
  line(c,[[8,0],[25,0]],p.wrap,4);c.lineWidth=1.2;shape([[18,0],[26,-8],[24,0],[26,8]],'#77a9a4');
  ellipse(c,(tip+26)/2,0,(tip-26)/2,9,'#8dc6c5');ellipse(c,(tip+26)/2,-2,(tip-26)/2-3,5,'#c5e0d8');
  poly(c,[[39,-7],[43,-14],[49,-7]],'#659b9f',dark);ellipse(c,tip-5,-3,3,3,'#f1ecd7');ellipse(c,tip-4,-3,1.3,1.6,dark);line(c,[[tip-2,3],[tip-5,3]],dark,1);
  for(let x=33;x<tip-12;x+=6)line(c,[[x,-3],[x+3,0],[x,3]],'#639a98',1);
 }else if(p.kind==='chair'){
  shaft(tip-27);const x=tip-30;shape([[x,-10],[tip-3,-10],[tip-3,-4],[x,-4]],p.wood);shape([[x,3],[tip,3],[tip,9],[x,9]],'#b28a52');
  for(const xx of [x+3,tip-7]){line(c,[[xx,-14],[xx,14]],dark,5);line(c,[[xx,-14],[xx,14]],p.wood,3)}line(c,[[x+7,-9],[x+7,2]],accent,2);line(c,[[tip-11,-9],[tip-11,2]],accent,2);for(const xx of [x+3,tip-7])ellipse(c,xx,5,1.5,1.5,bronze);
 }else if(p.kind==='club'){
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
  if(design==='triangle')shape([[neck,-w],[tip,0],[neck,w],[neck+4,0]]);
  else if(design==='diamond')shape([[neck,0],[neck+head*.46,-w],[tip,0],[neck+head*.46,w]]);
  else if(design==='needle')shape([[neck,-w*.45],[tip-8,-w*.25],[tip,0],[tip-8,w*.25],[neck,w*.45]]);
  else if(design==='willow'){c.beginPath();c.moveTo(neck,-2);c.quadraticCurveTo(neck+head*.55,-w,tip,0);c.quadraticCurveTo(neck+head*.55,w,neck,2);c.closePath();c.fillStyle=steel;c.fill();c.strokeStyle=dark;c.lineWidth=1.4;c.stroke()}
  else shape([[neck,-2],[neck+head*.28,-w],[tip,0],[neck+head*.28,w],[neck,2]]);
  line(c,[[neck+3,0],[tip-2,0]],edge,1.4);
  line(c,[[neck+head*.28,w-1],[tip-2,0]],'#eff2df',.8);tassel(neck-8);
 }else if(p.kind==='poleblade'){
  shaft(neck+7);socket();const w=Math.min(p.width,head*.28),bend=p.curve*.4;
  c.beginPath();c.moveTo(neck,-2);
  if(design==='cleaver'){c.lineTo(tip-3,-2);c.lineTo(tip,1);c.lineTo(tip-3,w);c.lineTo(neck,w);}
  else if(design==='beak'){c.lineTo(tip-7,-2-bend);c.lineTo(tip,-bend);c.lineTo(tip-9,w);c.lineTo(tip-head*.6,w*.4);c.lineTo(neck,w*.45);}
  else if(design==='fan'){c.lineTo(tip-8,-3);c.lineTo(tip,0);c.quadraticCurveTo(tip-4,w+1,neck+head*.45,w);c.lineTo(neck,w*.4);}
  else if(design==='long'){c.lineTo(tip-3,-2);c.lineTo(tip,0);c.lineTo(tip-10,w*.6);c.lineTo(neck,w*.45);}
  else if(design==='hook'){c.quadraticCurveTo(tip-9,-4-bend,tip,-bend);c.lineTo(tip-5,1);c.lineTo(tip-11,w);c.quadraticCurveTo(neck+head*.7,w*.2,neck+head*.4,w);c.lineTo(neck,w*.5);}
  else if(design==='broad'){c.lineTo(tip-7,-2-bend);c.lineTo(tip,-bend);c.quadraticCurveTo(tip-5,w*1.05,neck+head*.5,w);c.lineTo(neck,w*.7);}
  else{c.lineTo(tip-8,-2-bend);c.quadraticCurveTo(tip-3,-3-bend,tip,-bend);c.quadraticCurveTo(tip-3,w*.6,tip-head*.28,w);c.quadraticCurveTo(neck+head*.38,w+1,neck,w*.55)}c.closePath();
  c.fillStyle=steel;c.fill();c.strokeStyle=dark;c.lineWidth=1.4;c.stroke();
  c.beginPath();c.moveTo(neck+3,w*.55);c.quadraticCurveTo(neck+head*.38,w,tip-head*.28,w-1);c.quadraticCurveTo(tip-5,w*.5,tip-1,-bend);c.strokeStyle=edge;c.lineWidth=1.6;c.stroke();
  line(c,[[neck+4,0],[tip-8,-1-bend]],accent,1.3);
  for(let i=0;i<(hero.level%3)+1;i++){const x=neck+5+i*4;line(c,[[x,1],[x+2,Math.min(w-1,4)],[x+4,1]],accent,.8)}tassel(neck-7);
  if(hero.level===13){ellipse(c,neck-13,6,2.2,2.8,bronze);ellipse(c,neck-18,8,2,2.5,accent)}
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
