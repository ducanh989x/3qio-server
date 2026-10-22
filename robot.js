'use strict';
// Lv21 is a player-controlled form, never an extra AI or a replacement weapon.
const RobotRules={scale:2.4,summonSeconds:2.4};
function robotSummonFeedback(e){
 burst(e.x,e.y,'#83f2eb',30);burst(e.x,e.y,'#f6cd70',24);
 if(e.isPlayer){shake=7;tone(65,.65,'triangle',.07);tone(130,.5,'sine',.05);tone(520,.7,'sine',.035)}
}
function drawRobot(c,e,r,portrait=false){
 c.save();c.scale(r,r);
 const glow='#8cf8ef',gold='#e7bf69',edge='#172c35',steel='#405b68';
 const panel=(points,fill=steel,stroke=edge)=>{c.lineWidth=.035;poly(c,points,fill,stroke)};
 const ellipse=(c,x,y,rx,ry,fill,stroke)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.025;c.stroke()}};
 const seam=(points,color=gold,width=.025)=>line(c,points,color,width);
 const pulse=.5+.5*Math.sin(clock*2.4+e.phase),step=portrait?0:Math.sin(clock*8+e.phase)*.06*(e.moving||0);
 const progress=1-clamp((e.robotSummon||0)/RobotRules.summonSeconds,0,1);
 // Seven collected spheres orbit the machine; not additional collectible drops.
 c.save();c.rotate(-(portrait?-.7:e.angle)+clock*.18);
 c.strokeStyle='#72e0d24d';c.lineWidth=.018;c.beginPath();c.arc(0,0,1.34,0,TAU);c.stroke();
 for(let i=0;i<7;i++){
  const a=i*TAU/7,x=Math.cos(a)*1.34,y=Math.sin(a)*1.34;
  ellipse(c,x,y,.075,.075,'#f6ba55','#6e5129');ellipse(c,x-.017,y-.02,.027,.027,'#fff0b0');
  seam([[x-.025,y],[x+.025,y]],'#b35b39',.012);seam([[x,y-.025],[x,y+.025]],'#b35b39',.012);
 }
 if(progress<1&&!portrait){
  c.globalAlpha=1-progress;c.strokeStyle=glow;c.lineWidth=.035;
  for(const rad of [1.4+progress*.8,1.9-progress*.5]){c.beginPath();c.arc(0,0,rad,0,TAU);c.stroke()}
  for(let i=0;i<7;i++){const a=i*TAU/7;seam([[Math.cos(a)*1.34,Math.sin(a)*1.34],[Math.cos(a)*.5,Math.sin(a)*.5]],'#f2d59588',.025)}
 }
 c.restore();
 if(!portrait)c.globalAlpha*=Math.min(1,.5+progress);
 // Paired rear thrusters, articulated hips and heavy feet.
 for(const side of [-1,1]){
  c.save();c.scale(1,side);
  const jet=.14+(portrait?0:(e.moving||0)*.3);
  panel([[-.78,.27],[-1.12,.27],[-1.12,.6],[-.72,.6]],'#253f4c');
  panel([[-1.1,.31],[-1.1-jet,.43],[-1.1,.55]],'#7ae8dd66','#6fcfcf66');
  ellipse(c,-.65,.51,.21,.22,'#152b34');ellipse(c,-.65,.51,.105,.105,'#75939c');
  panel([[-.78+step,.36],[-1.06+step,.38],[-1.17+step,.66],[-1.02+step,.83],[-.55+step,.76],[-.5+step,.51]],'#57717a');
  seam([[-1.04+step,.46],[-1.1+step,.64],[-.94+step,.7],[-.68+step,.65]]);
  // Giant gold-edged shoulder shield and hydraulic forearm.
  ellipse(c,-.03,.66,.25,.25,'#19323e');
  panel([[-.43,.65],[-.26,.95],[.14,1.1],[.43,.86],[.32,.6],[-.08,.48]],'#3b5968');
  panel([[-.32,.67],[-.19,.86],[.12,.98],[.31,.82],[.23,.65],[-.07,.58]],'#b69b61');
  seam([[-.17,.68],[.11,.82],[.22,.75]],'#fff0b2',.03);
  panel([[.23,.66],[.48,.59],[.71,.76],[.63,.94],[.35,.95],[.18,.83]],'#536d78');
  seam([[.31,.78],[.57,.83]],glow,.035);
  for(let j=0;j<3;j++)seam([[-.84+j*.1,.31],[-.82+j*.1,.39]],'#91a4a8',.018);
  c.restore();
 }
 // Angular breastplate and glowing circular dragon reactor.
 panel([[-.79,-.42],[-.47,-.66],[.23,-.52],[.5,-.26],[.5,.26],[.23,.52],[-.47,.66],[-.79,.42]],'#213b48');
 panel([[-.58,-.34],[-.35,-.49],[.17,-.39],[.33,0],[.17,.39],[-.35,.49],[-.58,.34]],'#526d78');
 seam([[-.61,-.3],[-.36,-.47],[.16,-.38]],gold,.04);seam([[-.61,.3],[-.36,.47],[.16,.38]],gold,.04);
 ellipse(c,-.23,0,.32,.32,'#172d3a',gold);ellipse(c,-.23,0,.23,.23,'#387e88');
 c.save();c.shadowColor=glow;c.shadowBlur=portrait?8:12;
 ellipse(c,-.23,0,.12+pulse*.025,.12+pulse*.025,glow);c.restore();
 for(let i=0;i<6;i++){const a=i*TAU/6+clock*.25;seam([[-.23+Math.cos(a)*.255,Math.sin(a)*.255],[-.23+Math.cos(a)*.3,Math.sin(a)*.3]],'#ffe3a0',.025)}
 // Armoured head: gold horns, dark visor and bright cyan eyes. Facing +X.
 panel([[.14,-.25],[.36,-.38],[.76,-.26],[.86,0],[.76,.26],[.36,.38],[.14,.25]],'#bd9d5d');
 panel([[.3,-.23],[.64,-.22],[.79,0],[.64,.22],[.3,.23],[.44,0]],'#273e4c');
 seam([[.48,-.19],[.67,-.12],[.72,0],[.67,.12],[.48,.19]],glow,.04);
 panel([[.29,-.29],[.12,-.55],[.46,-.43],[.59,-.28]],'#f1d18b');
 panel([[.29,.29],[.12,.55],[.46,.43],[.59,.28]],'#f1d18b');
 seam([[.78,-.08],[.9,0],[.78,.08]],'#e7c57b',.025);
 c.restore();
}
function showRobot(){
 openModal('<div class="eyebrow">TƯỚNG ẨN · LV21</div><h2>Long Thần Cơ Giáp</h2><canvas id="robotShowcase" width="700" height="460" style="display:block;width:100%;max-width:700px;margin:auto" aria-label="Robot Long Thần Cơ Giáp khổng lồ bên cạnh lính Lv1"></canvas><p>Hội đủ <b>7 viên ngọc rồng</b> để triệu hồi và điều khiển robot khổng lồ. Giáp thép–vàng, lõi năng lượng và 7 viên ngọc xoay quanh thân. Không thể mở bằng EXP.</p><p>Thân hình lớn hơn khoảng <b>1,7 lần Lv20</b>; hitbox và tầm vũ khí theo kích thước thật. HP <b>352</b>, hồi đầy khi triệu hồi. <b>Giữ nguyên vũ khí, ATK, ASPD, túi đồ và quốc gia.</b> Không sinh thêm BOT đánh hộ, không có bất tử khi triệu hồi.</p><p style="font-size:11px">Đây là bản xem tạo hình, không mở khóa trong trận. Họa kích trong hình chỉ để minh họa; robot thực tế cầm đúng vũ khí bạn đang có.</p>');
 const c=$('robotShowcase').getContext('2d'),small=entity(0,0,1,''),large=entity(0,0,21,'');large.weapon=LootRules.makeWeapon(19,4);
 drawWarrior(c,small,100,225,.85,true);drawWarrior(c,large,330,225,.85,true);
 c.fillStyle='#dfd5b5';c.font='600 20px "Be Vietnam Pro",sans-serif';c.textAlign='center';c.fillText('LÍNH · LV1',100,420);c.fillText('LONG THẦN CƠ GIÁP · LV21',360,420);
}
