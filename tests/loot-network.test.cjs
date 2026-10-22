'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {WebSocket}=require('ws');const {createServer}=require('../server/index.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const deadline=Date.now()+5000;while(!fn()){if(Date.now()>deadline)throw Error('Loot socket timeout');await sleep(10)}}
async function connect(port,version=7){const ws=new WebSocket('ws://localhost:'+port+'/ws');ws.inbox=[];ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));ws.on('error',()=>{});await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j)});ws.send(JSON.stringify({type:'join',rulesVersion:version,room:'GEAR',name:'Tester'}));return ws}
test('real sockets: automatic loot, private bags, camp-only owned-item equip, replay safety and skills',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  const a=await connect(port),b=await connect(port);clients.push(a,b);await until(()=>b.inbox.some(m=>m.type==='state'&&m.humans===2));
  const world=app.rooms.get('GEAR').world,[aa,bb]=world.actors;world.orbs.splice(0);Object.assign(aa,{x:1800,y:1800,invincible:0});Object.assign(bb,{x:1790,y:1800,hp:1000,maxHp:1000,invincible:0});
  const c=world.chests[0];c.level=5;c.hp=c.maxHp=world.loot.chestHp[4];c.x=1800;c.y=1800;world.breakTreasure(c,aa,()=>.999999);world.drops[0].x=1830;world.drops[0].y=1800;
  await until(()=>aa.inventory.length===1);assert.equal(bb.inventory.length,0);assert.equal(aa.weapon.profile,0);assert.equal(world.drops.length,0);
  const itemId=aa.inventory[0].id;
  await until(()=>a.inbox.some(m=>m.type==='state'&&m.inventory?.some(item=>item.id===itemId)));
  assert.ok(b.inbox.filter(m=>m.type==='state').every(m=>m.inventory.length===0&&m.actors.every(e=>!('inventory' in e))));
  a.send(JSON.stringify({type:'equip',itemId,x:350,y:350,team:'thuc',weapon:{profile:19,rarity:5}}));await until(()=>a.inbox.some(m=>m.type==='bagResult'&&!m.ok));assert.equal(aa.weapon.profile,0);
  bb.x=350;bb.y=350;b.send(JSON.stringify({type:'equip',itemId,inventory:aa.inventory}));await until(()=>b.inbox.some(m=>m.type==='bagResult'&&!m.ok));assert.equal(bb.weapon.profile,0);bb.x=1790;bb.y=1800;
  aa.x=350;aa.y=350;a.send(JSON.stringify({type:'equip',itemId}));await until(()=>aa.weapon.rarity===5);assert.equal(aa.inventory.length,0);
  a.send(JSON.stringify({type:'equip',itemId}));await sleep(80);assert.equal(aa.inventory.length,0);
  await until(()=>b.inbox.some(m=>m.type==='state'&&m.actors.some(e=>e.id===aa.id&&e.weapon.rarity===5)));
  aa.x=1800;aa.y=1800;const before=bb.hp;a.send(JSON.stringify({type:'input',skill:true,weapon:{profile:0,rarity:0},inventory:[{profile:19,rarity:5}],dragonCount:7,level:21,skillCooldown:0,atk:999999}));
  await until(()=>aa.skillCooldown>0&&bb.hp<before);assert.equal(aa.weapon.rarity,5);assert.equal(aa.dragonCount,0);assert.equal(aa.level,1);assert.equal(aa.inventory.length,0);
  const hp=bb.hp;a.send(JSON.stringify({type:'input',skill:true}));await sleep(150);assert.equal(bb.hp,hp);assert.ok(aa.skillCooldown>9);
  await until(()=>b.inbox.some(m=>m.type==='state'&&m.actors.some(e=>e.id===aa.id&&e.skillCooldown>0)&&m.actors.some(e=>e.id===bb.id&&e.hp<before)));
  aa.alive=false;aa.respawn=0;aa.dragonCount=6;a.send(JSON.stringify({type:'respawn'}));await until(()=>aa.alive);assert.equal(aa.weapon.profile,0);assert.equal(aa.dragonCount,0);assert.equal(aa.inventory.length,0);
  bb.x=2600;world.addTreasureDrop({type:'weapon',weapon:world.loot.makeWeapon(2,1)},aa.x+65,aa.y,0);
  a.send(JSON.stringify({type:'input',x:1,y:0}));await until(()=>aa.weapon.profile===2);a.send(JSON.stringify({type:'input',x:0,y:0}));
  await until(()=>b.inbox.some(m=>m.type==='state'&&m.actors.some(e=>e.id===aa.id&&e.weapon.profile===2&&e.weapon.rarity===1)));
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
test('late join and player respawn use shared room age, not personal age or client supplied time',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0});const {port}=await app.listen();const clients=[];
 try{
  const a=await connect(port);clients.push(a);await until(()=>a.inbox.some(m=>m.type==='welcome'));
  const world=app.rooms.get('GEAR').world;world.orbs.splice(0);const originalChests=JSON.stringify(world.chests);world.step(360);
  const b=await connect(port);clients.push(b);await until(()=>b.inbox.some(m=>m.type==='state'&&m.humans===2));
  const id=b.inbox.find(m=>m.type==='welcome').id,state=b.inbox.find(m=>m.type==='state'&&m.humans===2),actor=state.actors.find(e=>e.id===id);
  assert.ok(state.elapsed>=360);assert.ok(actor.spawnAt>=360);assert.equal(world.loot.chestSpawnWeights(state.elapsed)[4],1);
  assert.equal(state.chests.length,15);assert.equal(JSON.stringify(world.chests),originalChests,'surviving initial chests are not silently upgraded');
  const e=world.actors.find(e=>e.id===id),time=world.elapsed;e.alive=false;e.respawn=0;assert.equal(world.respawn(e),true);assert.equal(world.elapsed,time);
  b.send(JSON.stringify({type:'input',elapsed:999999,chestWave:999,spawnWeights:[0,0,0,0,100]}));await sleep(100);assert.ok(world.elapsed<time+1);assert.equal(world.loot.chestSpawnWeights(world.elapsed)[4],1);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
test('guaranteed Lv4/Lv5 are server-owned and shared with late joiners; pending rewards survive one-slot waves',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  const a=await connect(port);clients.push(a);await until(()=>a.inbox.some(m=>m.type==='welcome'));const w=app.rooms.get('GEAR').world;w.spawnTreasures(()=>0);w.chests[2].hp=26;
  for(const c of w.chests.slice(0,2)){c.alive=false;c.hp=0}w.step(600);const [five,four]=w.chests;assert.equal(five.level,5);assert.equal(four.level,4);assert.equal(w.chests[2].hp,26);const firstIds=[five.id,four.id];
  const b=await connect(port);clients.push(b);await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.chests?.some(c=>c.id===firstIds[0]&&c.level===5)&&m.chests.some(c=>c.id===firstIds[1]&&c.level===4))));
  const before=JSON.stringify(w.chests);b.send(JSON.stringify({type:'input',elapsed:999999,chestWave:999,treasureOwed4:999,treasureOwed5:999,spawnWeights:[0,0,0,0,100],chests:[]}));await sleep(100);assert.equal(JSON.stringify(w.chests),before);
  five.alive=false;five.hp=0;w.step(60);assert.equal(five.level,4);const nextId=five.id;await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.chests?.some(c=>c.id===nextId&&c.level===4))));assert.equal(w.chests.length,15);assert.equal(w.chests[2].hp,26);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
test('old clients get an explicit rules-version error, not a silently incompatible room',{timeout:8000},async()=>{
 const app=createServer({port:0,botCount:0});const {port}=await app.listen();let ws;
 try{for(const version of [1,2,3,4,5,6]){ws=await connect(port,version);await until(()=>ws.inbox.some(m=>m.type==='error'));assert.equal(app.rooms.size,0);assert.match(ws.inbox.find(m=>m.type==='error').message,/v2\.5\.0/);ws.terminate();ws=null}}finally{ws?.terminate();await app.close()}
});
