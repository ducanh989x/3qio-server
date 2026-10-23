'use strict';
// Shared melee geometry: the same transform is used for rendering, body hits
// and weapon contact. No client-reported hit/block outcome is accepted.
const CombatRules={recoilDistance:32,timingWindow:.09,activeFrom:.08,activeTo:.9,blockUntil:.8,flurryMultiplier:1.3,orangeSkillMultiplier:1.2,redSkillMultiplier:1.35};
function strikePose(e,p){
 const kind=e.attackKind||'normal';
 p=clamp(p,0,1);let angle=-1.4+p*2.8,extension=1;
 switch(kind){
  case 'pierce':angle=0;extension=1+1.2*Math.sin(Math.PI*p);break;
  case 'whirl':angle=-Math.PI+p*TAU;extension=1.3;break;
  case 'lunge':angle=-.32+.64*p;extension=1+.9*Math.sin(Math.PI*p);break;
  case 'cleave':angle=-.65+1.3*p;extension=1+.45*Math.sin(Math.PI*p);break;
  case 'crescent':angle=-Math.PI*2/3+p*Math.PI*4/3;extension=1.35;break;
  case 'cross':angle=-1.15*Math.cos(p*TAU);extension=1+.22*Math.sin(p*TAU)**2;break;
  case 'serpent':angle=.34*Math.sin(p*TAU*2);extension=1+Math.sin(Math.PI*p);break;
 }
 return {angle:e.angle+angle,extension};
}
const weaponFormCache=new Map();
function weaponBlade(e,p,w=weaponStats(e)){
 const pose=strikePose(e,p),s=bodyScale(e),r=modelRadius(e),c=Math.cos(pose.angle),n=Math.sin(pose.angle);
 const point=(x,y)=>({x:e.x+(x*c-y*n)*s,y:e.y+(x*n+y*c)*s});
 const a=point(2+10*pose.extension,r*.6+7),b=point(2+w.reach*pose.extension,r*.6+7);
 const blade={a,b,width:(['axe','glaive','halberd','poleblade'].includes(w.kind)?6:4)*w.size*s,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)};
 let form=weaponFormCache.get(w.profile);
 if(form===undefined){const t=w.baseReach,forms={chicken:[[10,0,28,0,3],[28,0,t-6,0,6]],hammer:[[10,0,t-14,0,3],[t-14,0,t-14,0,14]],dual:[[10,0,26,0,3],[26,-6,t-3,-6,2.7],[26,6,t-10,6,2.7]],scythe:[[10,0,t-8,0,3],[t-40,-14,t-30,-13,3],[t-30,-13,t-20,-2,4]],boulder:[[10,0,25,0,3],[t-17,0,t-17,0,17]],pan:[[10,0,t-13,0,3],[t-13,0,t-13,0,13]],fish:[[10,0,30,0,3],[35,0,t-9,0,9]],chair:[[10,0,t-25,0,3],[t-15,0,t-15,0,15]]};form=forms[w.kind]||null;if(form)form=Object.freeze(form.map(row=>Object.freeze(row)));weaponFormCache.set(w.profile,form)}
 if(form){const local=(x,y)=>point(2+(10+(x-10)*w.size)*pose.extension,r*.6+7+y*w.size);blade.parts=form.map(([x,y,xx,yy,width])=>{const a=local(x,y),b=local(xx,yy);return{a,b,width:width*w.size*s,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)}});blade.width=Math.max(...blade.parts.map(p=>p.width));for(const key of ['minX','minY'])blade[key]=Math.min(...blade.parts.map(p=>p[key]));for(const key of ['maxX','maxY'])blade[key]=Math.max(...blade.parts.map(p=>p[key]))}
 return blade;
}
function closestOnBlade(p,blade){
 const dx=blade.b.x-blade.a.x,dy=blade.b.y-blade.a.y,den=dx*dx+dy*dy;
 const t=den?clamp(((p.x-blade.a.x)*dx+(p.y-blade.a.y)*dy)/den,0,1):0;
 return {x:blade.a.x+dx*t,y:blade.a.y+dy*t};
}
function pointBladeDistance(p,blade){return dist(p,closestOnBlade(p,blade))}
function bladeHitsCircle(blade,p,radius){
 if(blade.parts)return blade.parts.some(part=>bladeHitsCircle(part,p,radius));
 const pad=radius+blade.width;
 return p.x>=blade.minX-pad&&p.x<=blade.maxX+pad&&p.y>=blade.minY-pad&&p.y<=blade.maxY+pad&&pointBladeDistance(p,blade)<=pad;
}
function bladeContact(a,b){
 if(a.parts||b.parts){let best=null;for(const aa of a.parts||[a])for(const bb of b.parts||[b]){const hit=bladeContact(aa,bb),clearance=hit.distance-aa.width-bb.width;if(!best||clearance<best.clearance)best={...hit,clearance}}return{x:best.x,y:best.y,distance:best.clearance+a.width+b.width}}
 const rx=a.b.x-a.a.x,ry=a.b.y-a.a.y,sx=b.b.x-b.a.x,sy=b.b.y-b.a.y,dx=b.a.x-a.a.x,dy=b.a.y-a.a.y,den=rx*sy-ry*sx;
 if(Math.abs(den)>1e-9){const t=(dx*sy-dy*sx)/den,u=(dx*ry-dy*rx)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return {distance:0,x:a.a.x+t*rx,y:a.a.y+t*ry}}
 const pairs=[[a.a,closestOnBlade(a.a,b)],[a.b,closestOnBlade(a.b,b)],[closestOnBlade(b.a,a),b.a],[closestOnBlade(b.b,a),b.b]];
 const pair=pairs.reduce((best,p)=>dist(p[0],p[1])<dist(best[0],best[1])?p:best);
 return {distance:dist(pair[0],pair[1]),x:(pair[0].x+pair[1].x)/2,y:(pair[0].y+pair[1].y)/2};
}
function registerClash(a,b,contact,phaseA,phaseB){
 for(const [e,p] of [[a,phaseA],[b,phaseB]]){const pose=strikePose(e,p);e.clashAngle=pose.angle;e.clashExtension=pose.extension;e.swing=0;if(e.skillEffectKind!=='flurry')e.skillEffect=0;e.clashSeq=(e.clashSeq||0)+1;e.clashEffect=.28;e.clashX=contact.x;e.clashY=contact.y}
 // Symmetric separation, applied once per clash; never move protected campers.
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),nx=length>1e-8?dx/length:String(a.id)<String(b.id)?1:-1,ny=length>1e-8?dy/length:0;
 for(const [e,direction] of [[a,-1],[b,1]])if(!isCampProtected(e)){e.x+=nx*direction*CombatRules.recoilDistance;e.y+=ny*direction*CombatRules.recoilDistance;keepInBounds(e)}
 burst(contact.x,contact.y,'#fff0b2',14);floatText(contact.x,contact.y-15,'CHẶN!','#fff0b2');
 if(a.isPlayer||b.isPlayer)tone(820,.08,'triangle',.045);
}
function resolveMelee(actors,starts,dt){
 const swinging=actors.filter(e=>e.alive&&(starts.get(e)||0)>0),blocked=new Set();if(!swinging.length)return;
 const weapons=new Map(swinging.map(e=>[e,weaponStats(e)]));
 const steps=Math.min(48,Math.max(1,Math.ceil(dt*360)));
 for(let step=1;step<=steps;step++){
  const blades=new Map(),ages=new Map(),phases=new Map();
  for(const e of swinging){
   if(!e.alive||blocked.has(e))continue;
   const duration=e.swingDuration||.32,age=duration-starts.get(e)+dt*step/steps,p=age/duration;
   if(p<CombatRules.activeFrom||p>CombatRules.activeTo)continue;
   blades.set(e,weaponBlade(e,p,weapons.get(e)));ages.set(e,age);phases.set(e,p);
  }
  // Resolve ALL weapon contacts first, not after the first actor deals damage.
  for(let i=0;i<swinging.length;i++)for(let j=i+1;j<swinging.length;j++){
   const a=swinging[i],b=swinging[j];if(!blades.has(a)||!blades.has(b)||blocked.has(a)||blocked.has(b)||(!canAttack(a,b)&&!canAttack(b,a)))continue;
   if(phases.get(a)>CombatRules.blockUntil||phases.get(b)>CombatRules.blockUntil||Math.abs(ages.get(a)-ages.get(b))>CombatRules.timingWindow+1e-8||a.hitSet.has(b)||b.hitSet.has(a))continue;
   const ba=blades.get(a),bb=blades.get(b),pad=ba.width+bb.width;
   if(ba.maxX+pad<bb.minX||bb.maxX+pad<ba.minX||ba.maxY+pad<bb.minY||bb.maxY+pad<ba.minY)continue;
   const contact=bladeContact(ba,bb);
   if(contact.distance<=pad){blocked.add(a);blocked.add(b);registerClash(a,b,contact,phases.get(a),phases.get(b))}
  }
  for(const e of swinging){
   const blade=blades.get(e);if(!blade||blocked.has(e)||!e.alive)continue;
   for(const other of actors){
    if(!other.alive||other.invincible>0||e.hitSet.has(other)||!canAttack(e,other))continue;
    if(bladeHitsCircle(blade,other,radius(other))){e.hitSet.add(other);applyWeaponDamage(e,other,e.attackDamage??weaponStats(e).atk)}
   }
   hitTreasures(e,blade);
  }
 }
}
function drawClashEffect(c,e){
 if(!(e.clashEffect>0))return;
 const fade=Math.min(1,e.clashEffect/.28),r=9+(1-fade)*17;
 c.save();c.translate(e.clashX,e.clashY);c.globalAlpha=fade;c.strokeStyle='#fff0b2';c.lineWidth=2;
 for(let i=0;i<6;i++){const a=i*TAU/6;c.beginPath();c.moveTo(Math.cos(a)*4,Math.sin(a)*4);c.lineTo(Math.cos(a)*r,Math.sin(a)*r);c.stroke()}
 c.restore();
}
// Bounded, deterministic cosmetics: no hit tests, random particles, timers or actor mutation.
function drawUtilitySkillEffect(c,e,r,kind){
 const active=kind==='stealth'?e.stealthTime:kind==='shield'?e.shieldTime:e.skillEffect;if(!(active>0))return;
 const phase=clamp(1-(e.skillEffect||0)/.6,0,1),turn=chestBeaconMotion?clock*.5:0;
 c.save();c.rotate(-e.angle);c.globalAlpha*=kind==='heal'?clamp((e.skillEffect||0)/.6,0,1):.85;
 if(kind==='heal'){
  c.strokeStyle='#a0f0b7';c.lineWidth=2;c.beginPath();c.arc(0,0,r+8+phase*18,0,TAU);c.stroke();
  c.fillStyle='#b5ffd0';for(let i=0;i<3;i++){const x=(i-1)*(r*.8+5),y=-r-5-phase*28+(i%2)*10;c.fillRect(x-2,y-6,4,12);c.fillRect(x-6,y-2,12,4)}
 }else if(kind==='shield'){
  c.strokeStyle='#8ee1ec';c.fillStyle='#75cfe91a';c.lineWidth=2.5;c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6-Math.PI/2,x=Math.cos(a)*(r+13),y=Math.sin(a)*(r+13);if(i)c.lineTo(x,y);else c.moveTo(x,y)}c.closePath();c.fill();c.stroke();
  c.fillStyle='#b4f5ff';c.fillRect(-r,r+18,2*r*clamp((e.shieldHp||0)/Math.max(1,Math.floor(e.maxHp*.2)),0,1),2);
 }else{
  c.strokeStyle='#d9c1ff';c.lineWidth=1.5;for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,r+8+i*4,turn+i*2,turn+i*2+.9);c.stroke()}
 }
 c.restore();
}
function drawWeaponSkillEffect(c,e,r){
 const w=weaponStats(e),kind=e.skillEffectKind||w.skill,buff=kind==='flurry'&&e.skillBuff>0;
 if(['stealth','heal','shield'].includes(kind)){drawUtilitySkillEffect(c,e,r,kind);return}
 if(!kind||(!(e.skillEffect>0)&&!buff)||(!buff&&(e.clashEffect>0||e.attackKind!==kind)))return;
 const fade=buff?Math.min(1,e.skillBuff):clamp(e.skillEffect/.6,0,1),phase=e.swing>0?clamp(1-e.swing/(e.swingDuration||.32),0,1):1;
 const color=WEAPON_ACCENTS[w.profile],reach=w.reach,red=w.rarity===5;
 c.save();c.globalAlpha=fade*.68;c.strokeStyle=color;c.fillStyle=color;c.lineCap='round';c.lineJoin='round';
 function stroke(points,width,ink=color){c.beginPath();points(c);c.strokeStyle=ink;c.lineWidth=width;c.stroke()}
 if(kind==='flurry'){
  const turn=chestBeaconMotion?clock*3:0;
  for(let i=0;i<3;i++){const a=turn+i*TAU/3;stroke(p=>p.arc(0,0,r*1.3+i*5,a,a+1.1),i===0?4:2);const x=Math.cos(a)*(r*1.6+12),y=Math.sin(a)*(r*1.6+12);stroke(p=>{p.moveTo(x-7,y-3);p.lineTo(x+7,y+3)},2,'#fff3ce')}
 }else{
  // Follow the exact blade-tip transform, including thrust extension and return strokes.
  const start=Math.max(0,phase-.32),samples=isTouch?6:10;
  c.beginPath();for(let i=0;i<=samples;i++){const p=start+(phase-start)*i/samples,pose=strikePose(e,p),a=pose.angle-e.angle,x=2+reach*pose.extension,y=r*.6+7,px=x*Math.cos(a)-y*Math.sin(a),py=x*Math.sin(a)+y*Math.cos(a);if(i)c.lineTo(px,py);else c.moveTo(px,py)}c.strokeStyle=color;c.lineWidth=red?12:9;c.stroke();c.lineWidth=2;c.strokeStyle='#fff5d5';c.stroke();
  const pose=strikePose(e,phase),a=pose.angle-e.angle,extension=pose.extension;
  c.save();c.rotate(a);c.translate(2,r*.6+7);const end=reach*extension;
  if(kind==='pierce'){
   c.beginPath();c.moveTo(20,-4);c.lineTo(end-14,-8);c.lineTo(end,0);c.lineTo(end-14,8);c.lineTo(20,4);c.closePath();c.fill();
   for(let i=0;i<3;i++){const x=end*(.35+i*.2);stroke(p=>{p.moveTo(x-7,-11);p.lineTo(x+3,0);p.lineTo(x-7,11)},2,'#fff5db')}
  }else if(kind==='lunge'){
   for(let i=0;i<4;i++){const x=end*(.3+i*.16);stroke(p=>{p.moveTo(x-16,-15);p.lineTo(x,0);p.lineTo(x-16,15)},3)}
   stroke(p=>{p.moveTo(16,0);p.lineTo(end,0)},2,'#fff6db');
  }else if(kind==='serpent'){
   for(const sign of [-1,1])stroke(p=>{p.moveTo(15,0);for(let i=1;i<=18;i++){const t=i/18;p.lineTo(15+(end-15)*t,Math.sin(t*TAU*2-phase*3)*9*sign*Math.sin(Math.PI*t))}},2.5);
  }else if(kind==='cleave'){
   c.beginPath();c.moveTo(end*.4,-5);c.lineTo(end,-13);c.lineTo(end,13);c.lineTo(end*.4,5);c.closePath();c.fill();
   for(let i=-2;i<=2;i++)stroke(p=>{p.moveTo(end-4,i*4);p.lineTo(end-17-Math.abs(i)*5,i*10)},2,'#fff3c9');
  }else if(kind==='cross'){
   for(const sign of [-1,1])stroke(p=>{p.moveTo(end*.45,-sign*18);p.quadraticCurveTo(end*.8,sign*16,end,0)},4);
  }else if(kind==='crescent'){
   for(let i=0;i<3;i++)stroke(p=>p.arc(0,0,Math.max(8,end-i*8),-.75,.75),i===0?5:2);
  }else if(kind==='whirl'){
   for(let i=0;i<3;i++)stroke(p=>p.arc(0,0,Math.max(8,end-i*9),-1.1,.7),i===0?5:2);
  }
  c.restore();
 }
 // Few fixed embers rather than unbounded particle entities; reduced motion is static.
 const count=isTouch?5:9,turn=chestBeaconMotion?phase*1.5:0;
 for(let i=0;i<count;i++){const a=i*TAU/count+turn,d=r+12+(i%3)*6;c.globalAlpha=fade*(red?.75:.45);c.fillStyle=i%2?color:'#fff2bd';c.fillRect(Math.cos(a)*d,Math.sin(a)*d,red?3:2,red?3:2)}
 c.restore();
}
function playWeaponSkillSound(e){
 const kind=weaponStats(e).skill,freq={pierce:690,lunge:790,serpent:420,cleave:115,crescent:330,cross:520,whirl:195,flurry:880,stealth:310,heal:620,shield:250}[kind]||220;
 tone(freq,.15,['cleave','whirl'].includes(kind)?'triangle':'sine',.035);
}
