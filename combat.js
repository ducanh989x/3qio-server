'use strict';
// Shared melee geometry: the same transform is used for rendering, body hits
// and weapon contact. No client-reported hit/block outcome is accepted.
const CombatRules={recoilDistance:32,timingWindow:.09,activeFrom:.08,activeTo:.9,blockUntil:.8,flurryMultiplier:1.3,orangeSkillMultiplier:1.2,redSkillMultiplier:1.35};
function strikePose(e,p){
 const kind=e.attackKind||'normal';
 return {angle:e.angle+(kind==='pierce'?0:kind==='whirl'?-Math.PI+p*TAU:-1.4+p*2.8),extension:kind==='pierce'?1+1.2*Math.sin(Math.PI*p):kind==='whirl'?1.3:1};
}
function weaponBlade(e,p,w=weaponStats(e)){
 const pose=strikePose(e,p),s=bodyScale(e),r=modelRadius(e),c=Math.cos(pose.angle),n=Math.sin(pose.angle);
 const point=(x,y)=>({x:e.x+(x*c-y*n)*s,y:e.y+(x*n+y*c)*s});
 const a=point(2+10*pose.extension,r*.6+7),b=point(2+w.reach*pose.extension,r*.6+7);
 return {a,b,width:(['axe','glaive','halberd','poleblade'].includes(w.kind)?6:4)*w.size*s,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)};
}
function closestOnBlade(p,blade){
 const dx=blade.b.x-blade.a.x,dy=blade.b.y-blade.a.y,den=dx*dx+dy*dy;
 const t=den?clamp(((p.x-blade.a.x)*dx+(p.y-blade.a.y)*dy)/den,0,1):0;
 return {x:blade.a.x+dx*t,y:blade.a.y+dy*t};
}
function pointBladeDistance(p,blade){return dist(p,closestOnBlade(p,blade))}
function bladeHitsCircle(blade,p,radius){
 const pad=radius+blade.width;
 return p.x>=blade.minX-pad&&p.x<=blade.maxX+pad&&p.y>=blade.minY-pad&&p.y<=blade.maxY+pad&&pointBladeDistance(p,blade)<=pad;
}
function bladeContact(a,b){
 const rx=a.b.x-a.a.x,ry=a.b.y-a.a.y,sx=b.b.x-b.a.x,sy=b.b.y-b.a.y,dx=b.a.x-a.a.x,dy=b.a.y-a.a.y,den=rx*sy-ry*sx;
 if(Math.abs(den)>1e-9){const t=(dx*sy-dy*sx)/den,u=(dx*ry-dy*rx)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return {distance:0,x:a.a.x+t*rx,y:a.a.y+t*ry}}
 const pairs=[[a.a,closestOnBlade(a.a,b)],[a.b,closestOnBlade(a.b,b)],[closestOnBlade(b.a,a),b.a],[closestOnBlade(b.b,a),b.b]];
 const pair=pairs.reduce((best,p)=>dist(p[0],p[1])<dist(best[0],best[1])?p:best);
 return {distance:dist(pair[0],pair[1]),x:(pair[0].x+pair[1].x)/2,y:(pair[0].y+pair[1].y)/2};
}
function registerClash(a,b,contact,phaseA,phaseB){
 for(const [e,p] of [[a,phaseA],[b,phaseB]]){const pose=strikePose(e,p);e.clashAngle=pose.angle;e.clashExtension=pose.extension;e.swing=0;e.clashSeq=(e.clashSeq||0)+1;e.clashEffect=.28;e.clashX=contact.x;e.clashY=contact.y}
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
