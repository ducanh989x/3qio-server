'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{WebSocket}=require('ws');
const {createServer}=require('../server/index.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const end=Date.now()+15000;while(!fn()){if(Date.now()>end)throw Error('Matchmaking timeout');await sleep(10)}}
async function join(port,clients,extra={matchmaking:'auto'}){
 const ws=new WebSocket('ws://localhost:'+port+'/ws');clients.push(ws);ws.reply=null;ws.on('error',()=>{});ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='welcome'||m.type==='error')ws.reply=m});await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j)});ws.send(JSON.stringify({type:'join',rulesVersion:11,name:'Guest',...extra}));await until(()=>ws.reply);return ws;
}
test('automatic joins share public rooms, exclude friend rooms, support invitations, fill busiest vacancies and clean up',{timeout:20000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  const friend=await join(port,clients,{room:'FRIENDS'}),a=await join(port,clients),b=await join(port,clients);assert.equal(friend.reply.room,'FRIENDS');assert.equal(a.reply.room,b.reply.room);assert.match(a.reply.room,/^AUTO-[A-F0-9]{8}$/);assert.equal(a.reply.matchmaking,'auto');assert.notEqual(a.reply.id,b.reply.id);
  const invited=await join(port,clients,{room:a.reply.room});assert.equal(invited.reply.room,a.reply.room);
  const newcomers=await Promise.all(Array.from({length:14},()=>join(port,clients)));assert.ok(newcomers.every(ws=>ws.reply.type==='welcome'));assert.equal(app.rooms.get(a.reply.room).clients.size,16);assert.equal(app.rooms.get('FRIENDS').clients.size,1);assert.equal(app.rooms.size,3);const second=[...app.rooms.values()].find(r=>r.automatic&&r.code!==a.reply.room);assert.equal(second.clients.size,1);
  a.terminate();await until(()=>app.rooms.get(b.reply.room).clients.size===15);const replacement=await join(port,clients);assert.equal(replacement.reply.room,b.reply.room);assert.equal(second.clients.size,1);
  replacement.send(JSON.stringify({type:'join',rulesVersion:11,matchmaking:'auto'}));await sleep(50);assert.equal(app.rooms.get(b.reply.room).clients.size,16);
  const status=await (await fetch('http://localhost:'+port+'/api/status')).json();assert.equal(status.matchmaking,true);assert.equal(status.version,'2.20.0');
 }finally{clients.forEach(ws=>ws.terminate());await until(()=>app.rooms.size===0);await app.close()}
});
test('128 concurrent guests respect 16-per-room / 8-room bounds, explicit busy errors and reuse freed slots',{timeout:30000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  for(let batch=0;batch<8;batch++){
   const group=await Promise.all(Array.from({length:16},()=>join(port,clients)));assert.ok(group.every(ws=>ws.reply.type==='welcome'));
   // Keep this allocation/load-bound test focused on matchmaking, not combat.
   for(const room of app.rooms.values()){room.world.orbs.splice(0);room.world.step=()=>{}}
  }
  assert.equal(app.rooms.size,8);assert.equal([...app.rooms.values()].reduce((sum,r)=>sum+r.clients.size,0),128);assert.ok([...app.rooms.values()].every(r=>r.clients.size===16));
  const extra=await join(port,clients);assert.equal(extra.reply.type,'error');assert.match(extra.reply.message,/đủ phòng/);assert.equal(app.rooms.size,8);
  const first=clients[0],code=first.reply.room;first.terminate();await until(()=>app.rooms.get(code).clients.size===15);const next=await join(port,clients);assert.equal(next.reply.room,code);assert.equal(app.rooms.size,8);
 }finally{clients.forEach(ws=>ws.terminate());await until(()=>app.rooms.size===0);await app.close()}
});
