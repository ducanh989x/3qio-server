'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {WebSocket}=require('ws');
const {createWorld}=require('../server/world.cjs');
const {createServer,sanitizeInput}=require('../server/index.cjs');
function setup(){const world=createWorld({botCount:0});world.orbs.splice(0);const e=world.addHuman('runner','Chạy');Object.assign(e,{x:1800,y:1800,xp:50,totalXp:500});e.input={x:1,y:0,angle:0,attack:false,dash:false,sprint:true};return {world,e}}
function step(world,dt){world.orbs.splice(0);world.step(dt)}
test('sprint is 1.65x, costs 10 current XP/s, independent of tick size; lifetime XP unchanged',()=>{
 for(const ticks of [10,30,100]){const {world,e}=setup();for(let i=0;i<ticks;i++)step(world,1/ticks);assert.ok(Math.abs(e.x-1800-185.8*1.65)<1e-7);assert.ok(Math.abs(e.xp-40)<1e-7);assert.equal(e.totalXp,500);assert.equal(e.sprinting,true);assert.equal(e.level,1)}
});
test('zero/fractional XP cannot create free speed or level loss',()=>{
 const {world,e}=setup();e.xp=0;step(world,.1);assert.ok(Math.abs(e.x-1818.58)<1e-7);assert.equal(e.sprinting,false);
 e.x=1800;e.xp=.5;step(world,.1);assert.equal(e.xp,0);assert.ok(Math.abs(e.x-1800-185.8*(.1+.65*.05))<1e-7);
 e.level=7;e.xp=.1;step(world,.1);assert.equal(e.level,7);assert.equal(e.xp,0);assert.equal(e.totalXp,500);
});
test('standing still, blocked boundary, death and dash do not spend sprint XP; dash never stacks',()=>{
 const {world,e}=setup();e.input.x=0;step(world,.1);assert.equal(e.xp,50);assert.equal(e.sprinting,false);
 e.x=world.radius(e)+8;e.input.x=-1;step(world,.1);assert.equal(e.xp,50);
 e.x=1800;e.input.x=1;e.input.dash=true;step(world,.1);assert.ok(Math.abs(e.x-1800-185.8*2.9*.1)<1e-7);assert.equal(e.xp,50);assert.equal(e.sprinting,false);
 e.alive=false;step(world,.1);assert.equal(e.xp,50);
});
test('level 20 can refill a capped current-XP reserve for sprinting',()=>{
 const {world,e}=setup();e.level=20;e.xp=0;world.gainXP(e,7);assert.equal(e.xp,7);world.gainXP(e,5000);assert.equal(e.xp,4060);step(world,.1);assert.ok(Math.abs(e.xp-4059)<1e-7);assert.equal(e.level,20);
 assert.equal(sanitizeInput({sprint:'true'}).sprint,false);assert.equal(sanitizeInput({sprint:true,xp:1e9,sprintCost:0}).sprint,true);
});
test('real server owns sprint cost/speed and clears stale held input',{timeout:8000},async()=>{
 const app=createServer({port:0,botCount:0});const {port}=await app.listen();let ws,clear;
 try{
  ws=new WebSocket('ws://localhost:'+port+'/ws');const inbox=[];ws.on('message',raw=>inbox.push(JSON.parse(raw)));ws.on('error',()=>{});
  await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)});
  ws.send(JSON.stringify({type:'join',rulesVersion:7,room:'SPRINT',name:'Runner'}));
  const until=async fn=>{const start=Date.now();while(!fn()){if(Date.now()-start>4000)throw Error('Sprint network timeout');await new Promise(r=>setTimeout(r,10))}};
  await until(()=>inbox.some(m=>m.type==='welcome'));
  const room=app.rooms.get('SPRINT'),e=room.world.actors.find(e=>e.networkHuman);Object.assign(e,{x:500,y:1800,xp:20});room.world.orbs.splice(0);clear=setInterval(()=>room.world.orbs.splice(0),10);
  ws.send(JSON.stringify({type:'input',x:1,y:0,angle:0,sprint:true,xp:999999,sprintCost:0,speed:999999}));
  await until(()=>inbox.some(m=>m.type==='state'&&m.actors.some(a=>a.xp<20&&a.sprinting)));
  assert.ok(e.x<650);assert.equal(e.level,1);assert.ok(e.xp<20&&e.xp>15);
  await new Promise(r=>setTimeout(r,600));const xp=e.xp,x=e.x;await new Promise(r=>setTimeout(r,140));assert.equal(e.xp,xp);assert.equal(e.x,x);assert.equal(e.sprinting,false);
 }finally{clearInterval(clear);ws?.terminate();await app.close()}
});
