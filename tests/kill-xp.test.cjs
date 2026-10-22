'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createWorld}=require('../server/world.cjs'),{createServer}=require('../server/index.cjs'),{WebSocket}=require('ws');
function setup(){const w=createWorld({botCount:0}),a=w.addHuman('killer','Killer'),b=w.addHuman('victim','Victim'),c=w.addHuman('other','Other');w.orbs.splice(0);for(const [i,e] of [a,b,c].entries())Object.assign(e,{x:1800+i*150,y:1800,invincible:0});return {w,a,b,c}}
const pool=w=>Array.from(w.orbs).filter(o=>o.pickupAt>0),sum=os=>os.reduce((s,o)=>s+o.value,0);
function takePool(w,e){while(pool(w).length){const o=pool(w)[0];e.x=o.x;e.y=o.y;w.collectXPOrbs([e],1/30,w.elapsed+1)}}
test('killer gets only base XP; floored 20% lifetime XP scatters once with exact conserved value and normal death orbs retained',()=>{
 const {w,a,b,c}=setup();w.gainXP(b,5003);b.xp=1;const level=b.level,total=b.totalXp,base=24+16*level;
 assert.equal(w.killRewardXP(b),base);assert.equal(w.killDropXP(b),1000);w.applyWeaponDamage(c,b,1);w.applyWeaponDamage(a,b,9999);
 assert.equal(a.totalXp,base);assert.equal(a.kills,1);assert.equal(c.totalXp,0);assert.equal(b.totalXp,total);assert.equal(b.bountyXp,base);assert.equal(b.droppedXp,1000);assert.equal(b.killerId,a.id);
 const bonus=pool(w);assert.equal(sum(bonus),1000);assert.ok(bonus.length<=32);assert.equal(w.orbs.length-bonus.length,14+level);for(const o of bonus){const d=Math.hypot(o.x-b.x,o.y-b.y);assert.ok(d>=85-1e-6&&d<=155+1e-6);assert.equal(o.pickupAt,.6)}
 const count=w.orbs.length;assert.equal(w.applyWeaponDamage(a,b,9999),false);assert.equal(a.totalXp,base);assert.equal(w.orbs.length,count);
 b.respawn=0;w.respawn(b);assert.equal(b.droppedXp,0);assert.equal(b.bountyXp,0);assert.equal(b.killerId,null);
});
test('pickup delay blocks even touching actors; third parties/bots may collect, competing pickups cannot duplicate XP',()=>{
 const {w,a,b,c}=setup();w.gainXP(b,5000);w.applyWeaponDamage(a,b,9999);w.orbs.splice(0,w.orbs.length,...pool(w));const base=a.totalXp;
 const first=pool(w)[0];a.x=c.x=first.x;a.y=c.y=first.y;w.collectXPOrbs([c,a],1/30,.59);assert.equal(a.totalXp,base);assert.equal(c.totalXp,0);assert.equal(sum(pool(w)),1000);
 // Use the same shared pickup path for a bot/third party, with no ownership gate.
 c.networkHuman=false;w.collectXPOrbs([c,a],1/30,.6);assert.ok(c.totalXp>0);assert.equal(a.totalXp-base+c.totalXp+sum(pool(w)),1000);
 while(pool(w).length){const o=pool(w)[0];a.x=c.x=o.x;a.y=c.y=o.y;w.collectXPOrbs([c,a],1/30,1)}
 assert.equal(a.totalXp-base+c.totalXp,1000);const received=a.totalXp+c.totalXp;w.collectXPOrbs([a,c],1/30,1);assert.equal(a.totalXp+c.totalXp,received);
});
test('tiny/huge pools use positive integer chunks, at most 32 orbs, no value loss and valid positions at map edges',()=>{
 const {w}=setup();for(const amount of [0,1,2,7,49,999,1000000000]){w.orbs.splice(0);w.scatterKillXP({x:31,y:3569},amount);assert.equal(sum(pool(w)),amount);assert.ok(w.orbs.length<=32);for(const o of w.orbs){assert.ok(Number.isInteger(o.value)&&o.value>0);assert.ok(o.x>=30&&o.x<=3570&&o.y>=30&&o.y<=3570)}}
});
test('share uses lifetime XP despite sprint/current XP, zero totals drop nothing, allies and camps cannot produce rewards',()=>{
 const {w,a,b}=setup();assert.equal(w.killRewardXP(b),40);assert.equal(w.killDropXP(b),0);w.gainXP(b,5000);const total=b.totalXp,xp=b.xp;b.input.x=1;b.input.sprint=true;
 for(let i=0;i<30;i++){w.orbs.splice(0);w.step(1/30)}assert.ok(b.xp<xp-9.99);assert.equal(b.totalXp,total);assert.equal(w.killDropXP(b),1000);
 for(const invalid of [NaN,Infinity,-10])assert.equal(w.killDropXP({totalXp:invalid}),0);
 b.team=a.team='thuc';assert.equal(w.applyWeaponDamage(a,b,9999),false);assert.equal(a.kills,0);b.team='neutral';b.x=b.y=350;assert.equal(w.applyWeaponDamage(a,b,9999),false);assert.equal(a.totalXp,0);
});
test('high-level bots have starting XP; collected pools cap current reserve but not lifetime, never grant equipment or unlock Lv21',()=>{
 const bots=createWorld({botCount:24});assert.equal(bots.startingXP(20),44745);for(const e of bots.actors)assert.equal(e.totalXp,bots.startingXP(e.level));
 const {w,a,b}=setup();w.gainXP(a,100000);w.gainXP(b,100000);a.xp=0;const total=a.totalXp,weapon=JSON.stringify(a.weapon),base=w.killRewardXP(b),dropped=w.killDropXP(b);w.applyWeaponDamage(a,b,9999);
 assert.equal(a.totalXp,total+base);assert.equal(a.xp,base);w.orbs.splice(0,w.orbs.length,...pool(w));takePool(w,a);assert.equal(a.totalXp,total+base+dropped);assert.equal(a.xp,4060);assert.equal(a.level,20);assert.equal(a.dragonCount,0);assert.equal(JSON.stringify(a.weapon),weapon);
 for(let i=0;i<7;i++)w.collectDragon(a);const v=w.addHuman('next','Next');Object.assign(v,{invincible:0,x:2200,y:1800});w.gainXP(v,50000);const total21=a.totalXp,base21=w.killRewardXP(v),drop21=w.killDropXP(v);a.xp=0;w.applyWeaponDamage(a,v,9999);w.orbs.splice(0,w.orbs.length,...pool(w));takePool(w,a);assert.equal(a.level,21);assert.equal(a.hp,352);assert.equal(a.totalXp,total21+base21+drop21);assert.equal(a.xp,4060);assert.equal(JSON.stringify(a.weapon),weapon);
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){const end=Date.now()+5000;while(!fn()){if(Date.now()>end)throw Error('XP socket timeout');await sleep(10)}}
test('real sockets: server-owned ground pool visible to both clients, no direct 20% award or forged claims',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  for(let i=0;i<2;i++){const ws=new WebSocket('ws://localhost:'+port+'/ws');ws.inbox=[];ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify({type:'join',rulesVersion:7,room:'GROUND-XP',name:'Duel '+i}));clients.push(ws)}
  await until(()=>app.rooms.get('GROUND-XP')?.world.actors.length===2);const w=app.rooms.get('GROUND-XP').world,[a,b]=w.actors;w.orbs.splice(0);
  clients[0].send(JSON.stringify({type:'input',totalXp:999999999,bountyXp:999999999,droppedXp:999999999}));await sleep(100);assert.ok(a.totalXp<1000);assert.equal(a.bountyXp,0);
  Object.assign(a,{x:1800,y:1800,invincible:0});Object.assign(b,{x:1860,y:1800,invincible:0});w.gainXP(b,5000);b.hp=1;const base=w.killRewardXP(b),before=a.totalXp;
  clients[0].send(JSON.stringify({type:'input',attack:true,angle:0}));await until(()=>!b.alive);clients[0].send(JSON.stringify({type:'input',attack:false}));assert.equal(a.kills,1);assert.equal(sum(pool(w)),1000);assert.ok(a.totalXp>=before+base&&a.totalXp<before+base+1000);
  await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.actors.some(e=>e.id===b.id&&!e.alive&&e.killerId===a.id&&e.bountyXp===base&&e.droppedXp===1000))));
  await until(()=>clients.every(ws=>ws.inbox.some(m=>m.orbs&&m.orbs.filter(o=>o[4]>0).reduce((s,o)=>s+o[2],0)===1000)));
  a.x=800;a.y=1800;const earned=a.totalXp;clients[0].send(JSON.stringify({type:'input',pickupXp:1000,killReward:999999999,droppedXp:999999999,kills:999}));await sleep(100);assert.equal(a.kills,1);assert.ok(a.totalXp<earned+1000);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
