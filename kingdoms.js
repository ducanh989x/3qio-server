'use strict';
const KINGDOMS={
 neutral:{id:'neutral',name:'Trung gian',code:'–',shape:'ring',color:'#c8cec1',ink:'#667568'},
 quan:{id:'quan',name:'Quần',code:'Q',shape:'diamond',color:'#e3bc70',ink:'#826237',direction:'Tây Bắc'},
 nguy:{id:'nguy',name:'Ngụy',code:'N',shape:'square',color:'#8cbde8',ink:'#405f80',direction:'Đông Bắc'},
 thuc:{id:'thuc',name:'Thục',code:'T',shape:'triangle',color:'#a3d49a',ink:'#456b46',direction:'Tây Nam'},
 ngo:{id:'ngo',name:'Ngô',code:'G',shape:'circle',color:'#ed9b80',ink:'#945440',direction:'Đông Nam'}
};
const CAMP_RADIUS=175,JOIN_SECONDS=5;
const CAMP_ZONES=[
 {team:'quan',x:350,y:350},{team:'nguy',x:3250,y:350},
 {team:'thuc',x:350,y:3250},{team:'ngo',x:3250,y:3250}
];
const teamOf=e=>KINGDOMS[e.team]||KINGDOMS.neutral;
const campAt=e=>{const authoritative=typeof window!=='undefined'&&window.netGame?.active&&Number.isFinite(e.netX)&&Number.isFinite(e.netY),x=authoritative?e.netX:e.x,y=authoritative?e.netY:e.y;return CAMP_ZONES.find(z=>Math.hypot(x-z.x,y-z.y)<=CAMP_RADIUS)||null};
const isCampProtected=e=>campAt(e)!==null;
// Safe circles protect every occupant immediately, regardless of allegiance.
// Check current position on every hit (not a cached invincibility timer).
// Neutral players outside safe circles are individuals, NOT allies of each other.
const canAttack=(a,b)=>a!==b&&!isCampProtected(b)&&(teamOf(a).id==='neutral'||teamOf(b).id==='neutral'||teamOf(a).id!==teamOf(b).id);
function updateAllegiance(e,dt){
 if(!e.alive){e.joinTime=0;e.joinTarget=null;return}
 const zone=campAt(e);
 if(!zone||e.team===zone.team){e.joinTime=0;e.joinTarget=null;return}
 if(e.joinTarget!==zone.team){e.joinTarget=zone.team;e.joinTime=0}
 e.joinTime=Math.min(JOIN_SECONDS,e.joinTime+dt);
 if(e.joinTime+1e-9<JOIN_SECONDS)return;
 e.team=zone.team;e.joinTime=0;e.joinTarget=null;e.enlistTarget=null;
 const team=teamOf(e);
 burst(e.x,e.y,team.color,30);
 if(e.isPlayer){
  announce(team.name,'Đồng quốc gia không gây sát thương cho nhau','GIA NHẬP TRẬN DOANH');
  feed('Bạn đã gia nhập '+team.name);tone(540,.35,'triangle',.04);updateHUD();
 }
}
function updateCaptureHUD(){
 const team=teamOf(player),target=KINGDOMS[player.joinTarget];
 $('faction').textContent=(team.id==='neutral'?'TRUNG GIAN':team.code+' · '+team.name.toUpperCase());
 $('faction').style.color=team.color;
 const zone=campAt(player),active=player.alive&&!!zone;
 $('capturePanel').classList.toggle('hidden',!active);
 if(!active)return;
 const campTeam=KINGDOMS[zone.team],joining=target&&target.id===zone.team;
 $('captureName').textContent=joining?'GIA NHẬP '+campTeam.name.toUpperCase():'VÙNG AN TOÀN · '+campTeam.name.toUpperCase();
 $('captureTime').textContent=joining?Math.max(0,JOIN_SECONDS-player.joinTime).toFixed(1)+'s':'AN TOÀN';
 $('captureFill').style.width=joining?(player.joinTime/JOIN_SECONDS*100)+'%':'100%';
 $('captureFill').style.background=campTeam.color;
 $('capturePanel').style.borderColor=campTeam.color+'77';
 $('captureSymbol').textContent=campTeam.code;
 $('captureSymbol').style.color=campTeam.color;
 $('captureHint').textContent=joining?'Được bảo vệ · Rời vòng sẽ tính lại tiến độ':'Trong vòng cờ: không nhận sát thương từ đòn đánh.';
}
function drawTeamBadge(c,id,x,y,r=7,letters=true){
 const t=KINGDOMS[id]||KINGDOMS.neutral;
 c.save();c.translate(x,y);c.lineWidth=1.5;c.strokeStyle=t.color;c.fillStyle=t.ink;
 c.beginPath();
 if(t.shape==='diamond'){c.moveTo(0,-r*1.3);c.lineTo(r,0);c.lineTo(0,r*1.3);c.lineTo(-r,0);c.closePath()}
 else if(t.shape==='square')c.rect(-r,-r,r*2,r*2);
 else if(t.shape==='triangle'){c.moveTo(0,-r*1.3);c.lineTo(r*1.2,r);c.lineTo(-r*1.2,r);c.closePath()}
 else c.arc(0,0,r,0,Math.PI*2);
 c.fill();c.stroke();
 if(t.id==='neutral'){c.beginPath();c.moveTo(-r*.4,0);c.lineTo(r*.4,0);c.stroke()}
 else if(letters){c.fillStyle='#fff6dc';c.font='700 '+Math.round(r*1.15)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(t.code,0,t.shape==='triangle'?1:0)}
 c.restore();
}
function drawCampGround(zone){
 const t=KINGDOMS[zone.team],r=CAMP_RADIUS;
 ctx.save();ctx.translate(zone.x,zone.y);
 ctx.fillStyle=t.color+'18';ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
 ctx.strokeStyle=t.color+'aa';ctx.lineWidth=3;ctx.stroke();
 ctx.strokeStyle=t.color+'35';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r-10,0,TAU);ctx.stroke();
 for(let i=0;i<12;i++){
  const a=i/12*TAU,x=Math.cos(a)*(r+8),y=Math.sin(a)*(r+8);
  ellipse(ctx,x+2,y+4,8,5,'#233d2b33');
  poly(ctx,[[x-7,y+3],[x-6,y-5],[x,y-9],[x+7,y-4],[x+6,y+5]],'#a5a184','#64745a');
 }
 ctx.fillStyle='#263d2a99';ctx.textAlign='center';ctx.font='600 11px "Be Vietnam Pro",sans-serif';ctx.fillText('VÙNG AN TOÀN',0,r-28);ctx.font='500 9px "Be Vietnam Pro",sans-serif';ctx.fillText('Ở trong vòng 5 giây để gia nhập',0,r-12);
 ctx.fillStyle=t.color;ctx.shadowColor='#203122';ctx.shadowBlur=5;ctx.font='700 18px "Noto Serif",serif';ctx.fillText(t.name.toUpperCase(),0,-r-20);ctx.shadowBlur=0;
 ctx.restore();
}
function drawCampFlag(zone){
 const t=KINGDOMS[zone.team],wave=Math.sin(clock*2.5+zone.x)*5;
 ctx.save();ctx.translate(zone.x,zone.y);
 ellipse(ctx,-18,18,65,17,'#243b2a35');
 poly(ctx,[[-59,22],[-61,9],[-48,0],[-34,8],[-36,23]],'#9b9d7b','#626f52');
 line(ctx,[[-48,17],[-48,-122]],'#3e4934',6);line(ctx,[[-49,15],[-49,-122]],'#c5ae78',2);
 poly(ctx,[[-48,-116],[58,-110+wave],[51,-47+wave],[-48,-51]],t.ink,t.color);
 line(ctx,[[-43,-111],[52,-105+wave]],t.color,2);
 drawTeamBadge(ctx,t.id,3,-86,14);
 ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.font='700 13px "Be Vietnam Pro",sans-serif';ctx.fillText(t.name.toUpperCase(),3,-60);
 poly(ctx,[[-48,-137],[-42,-123],[-54,-123]],t.color);
 ctx.restore();
}
function showKingdoms(){
 const members=[player,...bots].filter(e=>e.alive),current=teamOf(player);
 openModal('<div class="eyebrow">TỨ PHƯƠNG CHIÊU MỘ</div><h2>Trận doanh</h2><p>Hiện tại: <b style="color:'+current.color+'">'+current.name+'</b>. Đi đến cờ tại một trong bốn góc bản đồ, ở liên tục trong vòng tròn <b>5 giây</b> để gia nhập.</p><div class="kingdom-grid">'+CAMP_ZONES.map(z=>{const t=KINGDOMS[z.team];return '<section class="kingdom-card" style="--camp-color:'+t.color+'"><span class="kingdom-code">'+t.code+'</span><div><strong>'+t.name+'</strong><small>'+t.direction+' · '+members.filter(e=>e.team===z.team).length+' võ tướng</small></div></section>'}).join('')+'</div><div class="kingdom-rules"><p><b>Trung gian — vòng rỗng:</b> chưa gia nhập quốc gia nào; có thể đánh tất cả, kể cả những người trung gian khác.</p><p><b>Cùng quốc gia:</b> không gây sát thương hoặc đẩy lùi nhau bằng đòn đánh. Vẫn đánh được quốc gia khác và người trung gian.</p><p><b>Vùng an toàn:</b> bất kỳ ai đứng trong vòng cờ đều không nhận sát thương hoặc đẩy lùi từ đòn đánh, kể cả người trung gian và phe địch. Bảo vệ có hiệu lực ngay, không cần chờ gia nhập. Ra khỏi vòng là mất bảo vệ ngay.</p><p><b>Đổi trận doanh:</b> ở vòng cờ quốc gia khác đủ 5 giây. Rời vòng hoặc bị hạ gục sẽ mất tiến độ. Trong lúc chờ, bạn vẫn thuộc phe cũ. Tạm dừng cũng dừng bộ đếm.</p><p>Quần: hình thoi vàng · Ngụy: vuông xanh dương · Thục: tam giác xanh lá · Ngô: tròn đỏ. Ký hiệu hiện trên đầu, minimap và bảng xếp hạng. Trận doanh độc lập với nhân vật tiến hóa; bot cũng phải gia nhập dưới cờ.</p></div><button class="primary" id="closeKingdoms">ĐÃ RÕ <span>→</span></button>');
 $('closeKingdoms').onclick=closeModal;
}
