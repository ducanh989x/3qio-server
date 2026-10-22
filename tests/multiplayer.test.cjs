'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {WebSocket}=require('ws');
const {createWorld}=require('../server/world.cjs');
const {createServer,sanitizeInput}=require('../server/index.cjs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function pair(){const world=createWorld({botCount:0});world.orbs.splice(0);const a=world.addHuman('a','A'),b=world.addHuman('b','B');Object.assign(a,{x:1800,y:1800,invincible:0});Object.assign(b,{x:1860,y:1800,invincible:0,hp:200,maxHp:200});return {world,a,b}}
function swing(world,a){a.input={x:0,y:0,angle:0,attack:true,dash:false};for(let i=0;i<20;i++)world.step(.016);a.input.attack=false}
test('shared authoritative combat: one hit per swing, teams, safe camps, evolution and respawn',()=>{
 let {world,a,b}=pair();swing(world,a);assert.equal(b.hp,182);assert.equal(b.x,1879);assert.equal(a.kills,0);
 ({world,a,b}=pair());a.team=b.team='thuc';swing(world,a);assert.equal(b.hp,200);assert.equal(b.x,1860);
 for(const zone of [{x:350,y:350},{x:3250,y:350},{x:350,y:3250},{x:3250,y:3250}]){
  ({world,a,b}=pair());a.x=zone.x+205;a.y=zone.y;b.x=zone.x+145;b.y=zone.y;a.input.angle=Math.PI;
  a.input.attack=true;for(let i=0;i<20;i++)world.step(.016);assert.equal(b.hp,200);assert.equal(b.x,zone.x+145);
 }
 ({world,a,b}=pair());a.x=350;a.y=350;b.x=2000;for(let i=0;i<149;i++)world.step(1/30);assert.equal(a.team,'neutral');world.step(1/30);assert.equal(a.team,'quan');
 world.gainXP(a,150);assert.equal(a.level,2);assert.equal(a.hp,124);
 ({world,a,b}=pair());b.hp=18;swing(world,a);assert.equal(b.alive,false);assert.equal(a.kills,1);assert.ok(a.totalXp>=40);assert.equal(world.respawn(b),false);
 a.x=2200;for(let i=0;i<160;i++)world.step(1/30);assert.equal(world.respawn(b),true);assert.equal(b.alive,true);assert.equal(b.level,1);assert.equal(b.team,'neutral');assert.equal(b.invincible,4);
});
test('human movement uses player speed, normalized input and no AI wandering',()=>{
 const {world,a,b}=pair();b.x=2500;a.input={x:1,y:0,angle:0,attack:false,dash:false};const x=a.x;world.step(.1);assert.ok(Math.abs(a.x-x-18.58)<.001);assert.equal(b.x,2500);
 a.input={x:0,y:0,angle:0,attack:false,dash:true};const stamina=a.stamina;world.step(1/30);assert.ok(a.stamina<stamina-34);assert.equal(a.input.dash,false);
 assert.deepEqual(sanitizeInput({x:1e100,y:'infinity',angle:Infinity,attack:'true',dash:true,hp:999999}),{x:1,y:0,angle:0,attack:false,dash:true,sprint:false,pickup:false,skill:false});
});
function waitFor(ws,predicate,ms=5000){
 const previous=[...(ws.inbox||[])].reverse().find(predicate);if(previous)return Promise.resolve(previous);
 return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{ws.off('message',handler);reject(Error('Message timeout'))},ms);function handler(raw){const message=JSON.parse(raw);if(predicate(message)){clearTimeout(timeout);ws.off('message',handler);resolve(message)}}ws.on('message',handler)});
}
async function client(port,room,name){const ws=new WebSocket('ws://localhost:'+port+'/ws');ws.inbox=[];ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));ws.on('error',()=>{});await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)});ws.send(JSON.stringify({type:'join',rulesVersion:7,room,name}));return ws}
test('real sockets: shared room, isolated rooms, malicious state ignored, input timeout and cleanup',{timeout:15000},async()=>{
 const app=createServer({port:0,botCount:0});const {port}=await app.listen();const clients=[];
 try{
  const a=await client(port,'SHARED','A');clients.push(a);const wa=await waitFor(a,m=>m.type==='welcome');
  const b=await client(port,'SHARED','B');clients.push(b);const wb=await waitFor(b,m=>m.type==='welcome');
  const c=await client(port,'OTHER','C');clients.push(c);await waitFor(c,m=>m.type==='welcome');
  const shared=await waitFor(b,m=>m.type==='state'&&m.humans===2);assert.ok(shared.actors.some(e=>e.id===wa.id));assert.ok(shared.actors.some(e=>e.id===wb.id));
  const isolated=await waitFor(c,m=>m.type==='state');assert.equal(isolated.humans,1);assert.ok(!isolated.actors.some(e=>e.id===wa.id));
  const room=app.rooms.get('SHARED');room.world.orbs.splice(0);const actor=room.world.actors.find(e=>e.id===wa.id);actor.x=1800;actor.y=1800;const other=room.world.actors.find(e=>e.id===wb.id);other.x=2500;other.y=1800;
  a.send(JSON.stringify({type:'input',x:999999,y:0,angle:0,hp:1e9,level:20,team:'ngo',id:wb.id,totalXp:999999}));
  const moved=await waitFor(b,m=>m.type==='state'&&m.actors.some(e=>e.id===wa.id&&e.x>1820));const actual=moved.actors.find(e=>e.id===wa.id);assert.equal(actual.level,1);assert.equal(actual.team,'neutral');assert.ok(actual.hp<=112);assert.ok(actual.x<1900);
  await sleep(450);const stopped=actor.x;await sleep(150);assert.equal(actor.x,stopped);
  a.close();await waitFor(b,m=>m.type==='state'&&m.humans===1&&!m.actors.some(e=>e.id===wa.id));
  b.close();c.close();await sleep(80);assert.equal(app.rooms.size,0);
  const status=await fetch('http://localhost:'+port+'/api/status');assert.equal((await status.json()).multiplayer,true);
  for(const file of ['/server/index.cjs','/package.json','/.build/google-fonts.css'])assert.equal((await fetch('http://localhost:'+port+file)).status,404);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
test('real sockets receive PvP damage/death/respawn; friendly fire and camps stay protected',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0});const {port}=await app.listen();const clients=[];
 try{
  const a=await client(port,'PVP','A');clients.push(a);const wa=await waitFor(a,m=>m.type==='welcome');
  const b=await client(port,'PVP','B');clients.push(b);const wb=await waitFor(b,m=>m.type==='welcome');
  const room=app.rooms.get('PVP'),aa=room.world.actors.find(e=>e.id===wa.id),bb=room.world.actors.find(e=>e.id===wb.id);
  room.world.orbs.splice(0);Object.assign(aa,{x:1800,y:1800,team:'thuc',invincible:0});Object.assign(bb,{x:1860,y:1800,team:'thuc',invincible:0});
  a.send(JSON.stringify({type:'input',x:0,y:0,angle:0,attack:true}));await sleep(350);assert.equal(bb.hp,112);
  Object.assign(aa,{x:555,y:350,team:'neutral',cooldown:0,swing:0});Object.assign(bb,{x:495,y:350,team:'neutral'});
  a.send(JSON.stringify({type:'input',x:0,y:0,angle:Math.PI,attack:true}));await sleep(350);assert.equal(bb.hp,112);assert.equal(bb.x,495);
  Object.assign(aa,{x:1800,y:1800,cooldown:0,swing:0});Object.assign(bb,{x:1860,y:1800,hp:18});
  a.send(JSON.stringify({type:'input',x:0,y:0,angle:0,attack:true}));
  const dead=await waitFor(b,m=>m.type==='state'&&m.actors.some(e=>e.id===wb.id&&!e.alive));assert.equal(dead.actors.find(e=>e.id===wa.id).kills,1);
  b.send(JSON.stringify({type:'respawn'}));await sleep(80);assert.equal(bb.alive,false);
  bb.respawn=0;b.send(JSON.stringify({type:'respawn'}));
  const alive=await waitFor(b,m=>m.type==='state'&&m.elapsed>dead.elapsed&&m.actors.some(e=>e.id===wb.id&&e.alive));const returned=alive.actors.find(e=>e.id===wb.id);
  assert.equal(returned.level,1);assert.equal(returned.team,'neutral');assert.ok(returned.invincible>3);assert.equal(returned.hp,112);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
test('capacity, invalid room code and malformed message handling',{timeout:15000},async()=>{
 const app=createServer({port:0,botCount:0});const {port}=await app.listen();const clients=[];
 try{
  for(let i=0;i<16;i++){const ws=await client(port,'CAPACITY','P'+i);clients.push(ws);await waitFor(ws,m=>m.type==='welcome')}
  const full=await client(port,'CAPACITY','Extra');clients.push(full);const error=await waitFor(full,m=>m.type==='error');assert.match(error.message,/16/);assert.equal(app.rooms.get('CAPACITY').clients.size,16);
  const invalid=await client(port,'<BAD>','Bad');clients.push(invalid);assert.match((await waitFor(invalid,m=>m.type==='error')).message,/Mã phòng/);
  const closed=new Promise(resolve=>full.once('close',resolve));full.send('{invalid');await closed;
  assert.equal(app.rooms.size,1);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
