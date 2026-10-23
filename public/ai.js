'use strict';
// Shared solo/server AI. Reads visible positions, health, held weapons and swings;
// never reads human input, private bags, enemy cooldowns or future random rolls.
const BotRules={vision:650,recoverAt:.74,minReaction:.2,maxReaction:.4,dashReserve:60};
function createBotBrain(e){
 let hash=2166136261;for(const char of e.name||'BOT')hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
 const unit=n=>((hash>>>n)&255)/255;
 return {profile:{reaction:.2+.2*unit(0),courage:1.08+.32*unit(8),retreat:.28+.1*unit(16),turnRate:4.2+1.6*unit(0),orbit:unit(8)>.5?1:-1},recovering:false,seen:new Map(),intent:null,fired:false,nextDash:0,nextSprint:0,sprintUntil:0,orbitUntil:0,enlistAfter:null,stuck:0,lastX:e.x,lastY:e.y};
}
function botPower(e){return Math.max(1,e.hp)*weaponPower(e.weapon)*clamp(reach(e)/90,.7,1.8)}
function botCamp(e,threat=null){
 const here=campAt(e);if(here)return here;
 return CAMP_ZONES.reduce((a,b)=>{
  const cost=z=>{const d=dist(e,z);if(!threat)return d;const t=dist(e,threat);return d+Math.max(0,((z.x-e.x)*(threat.x-e.x)+(z.y-e.y)*(threat.y-e.y))/Math.max(1,d*t))*500};
  return cost(b)<cost(a)?b:a;
 });
}
function botThink(e,actors,now=elapsed){
 const brain=e.brain??=createBotBrain(e),p=brain.profile,seen=new Map(),visible=[],foes=[];let friends=0;
 for(const other of actors){
  if(other===e||!other.alive||!canObserveActor(e,other))continue;const d=dist(e,other);if(d>BotRules.vision)continue;
  const previous=brain.seen.get(other),sample={ref:other,x:other.x,y:other.y,d,radius:radius(other),reach:reach(other),hp:other.hp,maxHp:other.maxHp,invincible:other.invincible||0,swing:other.swing||0,angle:other.angle,power:botPower(other),vx:0,vy:0,time:now};
  if(previous&&now>previous.time){const time=now-previous.time;sample.vx=clamp((sample.x-previous.x)/time,-300,300);sample.vy=clamp((sample.y-previous.y)/time,-300,300)}
  seen.set(other,sample);visible.push(sample);
  if(canAttack(e,other))foes.push(sample);else if(e.team!=='neutral'&&other.team===e.team&&d<300)friends++;
 }
 if(brain.enlistAfter===null)brain.enlistAfter=now+2+p.reaction*15;
 brain.seen=seen;foes.sort((a,b)=>a.d-b.d);const nearest=foes[0],power=botPower(e),zone=campAt(e),ratio=e.hp/e.maxHp;
 if(ratio<p.retreat)brain.recovering=true;else if(ratio>=BotRules.recoverAt)brain.recovering=false;
 if(now>=brain.orbitUntil){if(Math.random()<.22)p.orbit*=-1;brain.orbitUntil=now+rand(2.5,4.5)}
 const pressure=foes.filter(o=>o.d<280),outnumbered=pressure.length>friends+1&&pressure.reduce((sum,o)=>sum+o.power,0)>power*(1.6+friends*.6);
 const danger=nearest&&nearest.d<Math.max(240,nearest.reach+radius(e)+100)&&(nearest.power>power*p.courage||outnumbered);
 const betterGear=(e.inventory||[]).some(item=>weaponPower(item)>weaponPower(e.weapon));
 let goal=null,enemy=null;
 if(brain.recovering||danger){const camp=botCamp(e,nearest);goal={x:camp.x,y:camp.y,camp:true,flee:true,threat:nearest?.ref||null};}
 else if(zone&&e.team!==zone.team){goal={x:zone.x,y:zone.y,camp:true};}
 else{
  const targets=foes.filter(o=>o.invincible<=0&&o.power<=power*p.courage&&(o.d<360||(o.hp/o.maxHp<.3&&o.d<500)));
  targets.sort((a,b)=>(a.d+a.power/power*70-(a.ref===e.target?.enemy?40:0)+a.hp/a.maxHp*50)-(b.d+b.power/power*70-(b.ref===e.target?.enemy?40:0)+b.hp/b.maxHp*50));
  enemy=targets[0]||null;
  if(enemy&&!zone)goal={x:enemy.x,y:enemy.y,enemy:enemy.ref};
  else if(betterGear&&!zone){const camp=botCamp(e,nearest);goal={x:camp.x,y:camp.y,camp:true};}
  else{
   let best=null,bestScore=-Infinity;
   const riskAt=point=>foes.reduce((sum,o)=>sum+(dist(o,point)<220?Math.min(2,o.power/power)*35:0),0);
   for(const drop of drops){
    const d=dist(e,drop);if(d>BotRules.vision||!canCollectDrop(e,drop))continue;
    const value=drop.type==='dragon'?110+e.dragonCount*12:drop.weapon.rarity>=4?80+drop.weapon.rarity*8:85+(drop.weapon.rarity-e.weapon.rarity)*14;
    const score=value-d*.1-riskAt(drop)+(e.target?.drop===drop?12:0);if(score>bestScore){bestScore=score;best={x:drop.x,y:drop.y,loot:true,drop}}
   }
   for(const chest of chests){
    const d=dist(e,chest);if(!chest.alive||d>BotRules.vision)continue;
    const seconds=chest.hp/Math.max(1,weaponPower(e.weapon)),score=48+chest.level*11-d*.08-seconds*3-riskAt(chest)+(e.target?.chest===chest?12:0);
    if(score>bestScore){bestScore=score;best={x:chest.x,y:chest.y,chest}}
   }
   for(const orb of orbs){
    const d=dist(e,orb);if(d>BotRules.vision||(orb.pickupAt||0)>now)continue;
    const score=26+Math.min(orb.value,160)*1.25/(1+d/100)-d*.065-riskAt(orb);
    if(score>bestScore){bestScore=score;best={x:orb.x,y:orb.y,orb}}
   }
   const enlist=CAMP_ZONES.find(z=>z.team===e.enlistTarget&&e.team!==z.team);
   if(enlist&&(now>=brain.enlistAfter||(!best||dist(e,best)>280)&&bestScore<90))goal={x:enlist.x,y:enlist.y,camp:true};
   else if(best&&bestScore>0)goal=best;
   else if(e.target?.wander&&dist(e,e.target)>75)goal=e.target;
   else goal={x:clamp(e.x+rand(-380,380),90,WORLD-90),y:clamp(e.y+rand(-380,380),90,WORLD-90),wander:true};
  }
 }
 e.target=goal;e.aiTime=p.reaction*rand(.9,1.1);
 const previousIntent=brain.intent;
 const sameAction=goal.enemy?previousIntent?.enemy?.ref===goal.enemy:goal.chest?previousIntent?.chest===goal.chest:goal.flee&&previousIntent?.flee&&previousIntent?.threat?.ref===nearest?.ref;
 // A perception refresh must not keep postponing an already pending action.
 const actionAt=sameAction&&!brain.fired?previousIntent.actionAt:now+p.reaction*.75+rand(.04,.08);
 const intent={...goal,visible,enemy:goal.enemy?enemy:null,threat:goal.flee?nearest:null,actionAt,attack:false,skill:false,dodge:false};
 if(goal.enemy&&enemy){
  const w=weaponStats(e),normal=reach(e)+enemy.radius;
  intent.range=normal;intent.facingX=enemy.x+clamp(enemy.vx*p.reaction*.45,-40,40);intent.facingY=enemy.y+clamp(enemy.vy*p.reaction*.45,-40,40);
  intent.attack=enemy.d<normal+5;intent.dodge=enemy.swing>0&&enemy.d<enemy.reach+radius(e)+70&&Math.abs(angleDiff(Math.atan2(e.y-enemy.y,e.x-enemy.x),enemy.angle))<1.4;
  if(w.skill&&!w.skillUtility&&e.skillCooldown<=0){
   const thrust=['pierce','lunge','serpent'].includes(w.skill),sweep=['whirl','crescent','cross'].includes(w.skill);
   intent.skill=thrust?enemy.d<reach(e)*(w.skill==='lunge'?1.75:1.9)+enemy.radius&&enemy.d>normal*.65:sweep?enemy.d<normal*1.05||pressure.length>1:w.skill==='cleave'?enemy.d<normal*1.1:enemy.d<normal*1.4&&e.skillBuff<=0;
  }
 }else if(goal.chest){intent.range=reach(e)+26;intent.attack=dist(e,goal)<intent.range;intent.skill=!!weaponStats(e).skill&&!weaponStats(e).skillUtility&&goal.chest.hp>weaponStats(e).atk*2&&foes.every(o=>o.d>300)}
 if(goal.flee&&nearest){intent.facingX=nearest.x;intent.facingY=nearest.y;intent.dodge=nearest.swing>0&&nearest.d<nearest.reach+radius(e)+90}
 const support=weaponStats(e);intent.utility=support.skillUtility&&e.skillCooldown<=0&&(support.skill==='heal'?ratio<.7:support.skill==='stealth'?goal.flee&&!!nearest:pressure.length>0&&ratio<.85);
 brain.intent=intent;brain.fired=false;return goal;
}
function updateBot(e,dt,actors,now=elapsed){
 if(!e.alive||e.isPlayer||e.networkHuman||dt<=0)return;
 const brain=e.brain??=createBotBrain(e);e.aiTime-=dt;
 if(!brain.intent||e.aiTime<=0||e.target?.enemy&&(!e.target.enemy.alive||!canAttack(e,e.target.enemy)||!canObserveActor(e,e.target.enemy)))botThink(e,actors,now);
 const intent=brain.intent,p=brain.profile;if(!intent)return;
 const dx=intent.x-e.x,dy=intent.y-e.y,d=Math.hypot(dx,dy),enemy=intent.enemy;
 let mx=0,my=0;
 if(enemy){
  const radial=d>intent.range*.9?1:d<intent.range*.58?-.8:e.cooldown>0&&e.swing<=0?-.3:0;
  mx=dx/Math.max(1,d)*radial-dy/Math.max(1,d)*p.orbit*.52;my=dy/Math.max(1,d)*radial+dx/Math.max(1,d)*p.orbit*.52;
  if(d<1){mx=Math.cos(e.angle+p.orbit*Math.PI/2);my=Math.sin(e.angle+p.orbit*Math.PI/2)}
 }else if(d>(intent.camp?45:intent.chest?reach(e)*.76+26:12)){mx=dx/Math.max(1,d);my=dy/Math.max(1,d)}
 if(intent.flee&&intent.threat&&!campAt(e)){
  const t=intent.threat,awayX=e.x-t.x,awayY=e.y-t.y,length=Math.hypot(awayX,awayY);
  if(length<330){mx=mx*.55+awayX/Math.max(1,length)*1.4;my=my*.55+awayY/Math.max(1,length)*1.4}
 }
 if(intent.dodge&&!campAt(e)&&enemy){mx=-Math.sin(enemy.angle)*p.orbit;my=Math.cos(enemy.angle)*p.orbit}
 const walking=Math.hypot(mx,my)>.1;
 // Local body avoidance and map-edge steering, not full-map omniscience.
 if(walking){
  for(const other of intent.visible){const x=e.x-other.x,y=e.y-other.y,length=Math.hypot(x,y),gap=(radius(e)+other.radius)*.85+20;if(length>0&&length<gap){const weight=(gap-length)/gap*.85;mx+=x/length*weight;my+=y/length*weight}}
  const inset=radius(e)+25;if(e.x<inset+35)mx+=.7;if(e.x>WORLD-inset-35)mx-=.7;if(e.y<inset+35)my+=.7;if(e.y>WORLD-inset-35)my-=.7;
  const moved=Math.hypot(e.x-brain.lastX,e.y-brain.lastY);brain.stuck=moved<dt*10?brain.stuck+dt:0;
  if(brain.stuck>.75){const angle=Math.atan2(my,mx)+p.orbit*Math.PI/2;mx=Math.cos(angle);my=Math.sin(angle);if(brain.stuck>1.25)brain.stuck=0}
 }else brain.stuck=0;
 const facing=Math.atan2((intent.facingY??intent.y)-e.y,(intent.facingX??intent.x)-e.x);e.angle+=clamp(angleDiff(facing,e.angle),-p.turnRate*dt,p.turnRate*dt);
 if(now>=intent.actionAt&&!campAt(e)){
  if(intent.utility&&!brain.fired&&useWeaponSkill(e))brain.fired=true;
  if(intent.dodge&&now>=brain.nextDash&&e.stamina>=BotRules.dashReserve&&e.dash<=0){e.stamina-=35;e.dash=.23;brain.nextDash=now+rand(2.4,3.8)}
  if(intent.flee&&intent.threat&&e.xp>=20&&now>=brain.nextSprint){brain.sprintUntil=now+1.1;brain.nextSprint=now+4.5}
  const valid=enemy?enemy.ref.alive&&canAttack(e,enemy.ref)&&enemy.ref.invincible<=0:intent.chest?.alive;
  if(valid&&!brain.fired&&Math.abs(angleDiff(facing,e.angle))<.3){
   let used=false;if(intent.skill&&e.skillCooldown<=0)used=useWeaponSkill(e);
   if(!used&&intent.attack&&d<(intent.range||0)+8&&e.cooldown<=0){attack(e);used=true}
   if(used)brain.fired=true;
  }
 }
 brain.lastX=e.x;brain.lastY=e.y;moveEntity(e,mx,my,dt,intent.flee&&now<brain.sprintUntil);
}
