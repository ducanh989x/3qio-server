'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createWorld}=require('../server/world.cjs'),{createServer}=require('../server/index.cjs'),{WebSocket}=require('ws');
const L=require('../loot.js');
function pair(distance=60){const w=createWorld({botCount:0});w.orbs.splice(0);const a=w.addHuman('a','A'),b=w.addHuman('b','B');Object.assign(a,{x:1800,y:1800,invincible:0});Object.assign(b,{x:1800+distance,y:1800,invincible:0});a.input.angle=0;b.input.angle=Math.PI;return {w,a,b}}
function advance(w,t,hz=120){for(let i=0;i<Math.ceil(t*hz);i++)w.step(1/hz)}
test('162 weapon variants: bounded ATK/DPS, rarity progression, no normal or skill one-shot at Lv1',()=>{
 let maxAtk=0,maxDps=0,maxSkill=0;
 for(let p=0;p<L.names.length;p++)for(let r=0;r<6;r++){
  const s=L.stats(L.makeWeapon(p,r));maxAtk=Math.max(maxAtk,s.atk);maxDps=Math.max(maxDps,s.atk*s.aspd);maxSkill=Math.max(maxSkill,Math.round(s.atk*(r===5?1.35:1.2)));
  assert.ok(s.atk<=53);assert.ok(s.atk*s.aspd<60);assert.ok(Math.round(s.atk*(r===5?1.35:1.2))<112);
  if(r){const prev=L.stats(L.makeWeapon(p,r-1));assert.ok(s.atk>=prev.atk);assert.ok(s.atk*s.aspd>prev.atk*prev.aspd)}
 }
 assert.equal(maxAtk,53);assert.ok(maxDps<60);assert.equal(maxSkill,72);
 assert.equal(Math.ceil(112/maxAtk),3);assert.equal(Math.ceil(340/maxAtk),7);
 for(let p=1;p<L.names.length;p++){const s=L.stats(L.makeWeapon(p,0));assert.ok(s.atk*s.aspd>=20&&s.atk*s.aspd<=26)}
});
test('simultaneous physical contacts cancel both swings without damage, with symmetric recoil, independent of actor order/tick rate',()=>{
 for(const hz of [30,60,120])for(const reversed of [false,true])for(const distance of [60,100]){
  const {w,a,b}=pair(distance);if(reversed)w.actors.reverse();w.attack(a);w.attack(b);advance(w,.36,hz);
  assert.equal(a.clashSeq,1);assert.equal(b.clashSeq,1);assert.equal(a.hp,112);assert.equal(b.hp,112);assert.equal(a.x,1768);assert.equal(b.x,1832+distance);assert.equal(a.swing,0);assert.equal(b.swing,0);assert.equal(a.invincible,0);assert.equal(a.kills+b.kills,0);assert.equal(a.lastDamageAt,0);
 }
});
test('recoil is symmetric diagonally, respects world bounds and never displaces protected flag occupants',()=>{
 let {w,a,b}=pair();Object.assign(a,{x:1800,y:1800});Object.assign(b,{x:1800+60/Math.sqrt(2),y:1800+60/Math.sqrt(2)});a.input.angle=Math.PI/4;b.input.angle=Math.PI*1.25;w.attack(a);w.attack(b);advance(w,.36);assert.equal(a.clashSeq,1);assert.ok(Math.abs(a.x-(1800-32/Math.sqrt(2)))<1e-6);assert.ok(Math.abs(a.y-(1800-32/Math.sqrt(2)))<1e-6);
 ({w,a,b}=pair());Object.assign(a,{x:30,y:1800});Object.assign(b,{x:90,y:1800});w.attack(a);w.attack(b);advance(w,.36);assert.equal(a.clashSeq,1);assert.equal(a.x,w.radius(a)+8);assert.equal(b.x,122);
 ({w,a,b}=pair());Object.assign(a,{x:520,y:350});Object.assign(b,{x:580,y:350});w.attack(a);w.attack(b);advance(w,.36);assert.equal(a.clashSeq,1);assert.equal(a.x,520);assert.equal(b.x,612);assert.equal(a.hp,112);assert.equal(b.hp,112);
});
test('timing alone is insufficient: far apart, wrong-facing, late, and idle weapons do not block',()=>{
 let {w,a,b}=pair(300);w.attack(a);w.attack(b);advance(w,.36);assert.equal(a.clashSeq+b.clashSeq,0);
 ({w,a,b}=pair());b.input.angle=0;w.attack(a);w.attack(b);advance(w,.36);assert.equal(a.clashSeq+b.clashSeq,0);assert.equal(b.hp,94);
 ({w,a,b}=pair());w.attack(a);advance(w,.12);w.attack(b);advance(w,.36);assert.equal(a.clashSeq+b.clashSeq,0);assert.equal(b.hp,94);
 ({w,a,b}=pair());w.attack(a);advance(w,.36);assert.equal(a.clashSeq+b.clashSeq,0);assert.equal(b.hp,94);
});
test('block consumes the existing attack cooldown, gives no invulnerability, and does not protect from a third attacker',()=>{
 const {w,a,b}=pair();w.attack(a);w.attack(b);advance(w,.2);assert.equal(a.clashSeq,1);assert.ok(a.cooldown>0);w.attack(a);assert.equal(a.swing,0);
 const c=w.addHuman('c','C');Object.assign(c,{x:a.x-60,y:a.y,invincible:0});c.input.angle=0;w.attack(c);advance(w,.36);assert.equal(a.hp,94);assert.equal(a.invincible,0);
});
test('swept skill blades can also be blocked and charge cooldown; unblocked skill hits only once',()=>{
 for(const profile of [3,19]){
  const {w,a,b}=pair(profile===3?110:145);a.weapon=L.makeWeapon(profile,5);b.weapon=L.makeWeapon(19,0);
  assert.equal(w.useWeaponSkill(a),true);w.attack(b);advance(w,.36);assert.equal(a.clashSeq,1);assert.equal(a.hp,112);assert.equal(b.hp,112);assert.ok(a.skillCooldown>9);
 }
 const {w,a,b}=pair(70);a.weapon=L.makeWeapon(19,5);b.hp=b.maxHp=1000;const damage=Math.round(w.weaponStats(a).atk*1.35);w.useWeaponSkill(a);advance(w,.7);assert.equal(b.hp,1000-damage);
});
test('friendly weapons do not clash, flag protection remains immediate, and blade geometry handles parallel/crossing/degenerate segments',()=>{
 let {w,a,b}=pair();a.team=b.team='thuc';w.attack(a);w.attack(b);advance(w,.36);assert.equal(a.clashSeq+b.clashSeq,0);assert.equal(b.hp,112);
 ({w,a,b}=pair());a.x=555;a.y=350;b.x=495;b.y=350;a.input.angle=Math.PI;w.attack(a);advance(w,.36);assert.equal(b.hp,112);assert.equal(b.x,495);
 const seg=(ax,ay,bx,by)=>({a:{x:ax,y:ay},b:{x:bx,y:by},width:4});assert.equal(w.bladeContact(seg(0,0,10,10),seg(0,10,10,0)).distance,0);assert.equal(w.bladeContact(seg(0,0,10,0),seg(0,20,10,20)).distance,20);assert.equal(w.bladeContact(seg(0,0,0,0),seg(3,4,3,4)).distance,5);
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){const end=Date.now()+5000;while(!fn()){if(Date.now()>end)throw Error('combat socket timeout');await sleep(10)}}
test('real sockets replicate server-owned clashes and ignore client-reported damage/block outcomes',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  for(let i=0;i<2;i++){const ws=new WebSocket('ws://localhost:'+port+'/ws');ws.inbox=[];ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify({type:'join',rulesVersion:11,room:'CLASH',name:'Duel '+i}));clients.push(ws)}
  await until(()=>app.rooms.get('CLASH')?.world.actors.length===2);const w=app.rooms.get('CLASH').world,[a,b]=w.actors;w.orbs.splice(0);Object.assign(a,{x:1800,y:1800,invincible:0});Object.assign(b,{x:1860,y:1800,invincible:0});
  clients[0].send(JSON.stringify({type:'input',attack:true,angle:0}));clients[1].send(JSON.stringify({type:'input',attack:true,angle:Math.PI}));await until(()=>a.clashSeq===1&&b.clashSeq===1);
  for(const ws of clients)ws.send(JSON.stringify({type:'input',attack:false,clashSeq:999,clashEffect:99,invincible:99,hp:999999,damage:999999,parry:true}));
  await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.actors.every(e=>e.clashSeq===1&&e.hp===112))));await sleep(100);assert.equal(a.hp,112);assert.equal(b.hp,112);assert.equal(a.invincible,0);assert.equal(a.clashSeq,1);assert.equal(b.clashSeq,1);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
