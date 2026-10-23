'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{WebSocket}=require('ws'),{createServer}=require('../server/index.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){const end=Date.now()+6000;while(!fn()){if(Date.now()>end)throw Error('AI socket timeout');await sleep(10)}}
test('server owns bot tactics/skills/retreat and replicates movement to both humans without leaking brain or accepting forged bot intent',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:1}),clients=[];const {port}=await app.listen();
 try{
  for(let i=0;i<2;i++){const ws=new WebSocket('ws://localhost:'+port+'/ws');clients.push(ws);ws.inbox=[];ws.on('error',()=>{});ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify({type:'join',rulesVersion:11,room:'AI-NET',name:'Observer '+i}));await until(()=>ws.inbox.some(m=>m.type==='welcome'))}
  const w=app.rooms.get('AI-NET').world,bot=w.actors.find(e=>!e.networkHuman),humans=w.actors.filter(e=>e.networkHuman);w.orbs.splice(0);w.chests.forEach(c=>c.alive=false);
  Object.assign(bot,{x:1800,y:1800,level:1,hp:112,maxHp:112,angle:0,invincible:0,brain:null,aiTime:0,target:null,enlistTarget:null,team:'neutral',weapon:w.loot.makeWeapon(3,5),cooldown:0,swing:0});Object.assign(humans[0],{x:1970,y:1800,invincible:0});Object.assign(humans[1],{x:2600,y:1800,invincible:0});
  await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.actors.some(e=>e.id===bot.id&&e.skillCooldown>9&&e.weapon.rarity===5))));assert.ok(bot.brain);assert.equal(w.weaponStats(bot).atk,w.loot.stats(w.loot.makeWeapon(3,5)).atk);
  assert.ok(clients.every(ws=>ws.inbox.filter(m=>m.type==='state').every(m=>m.actors.every(e=>!('brain' in e)&&!('target' in e)&&!('aiTime' in e)))));
  clients[0].send(JSON.stringify({type:'input',botId:bot.id,brain:{recovering:false,intent:{x:99999,y:99999}},level:21,skillCooldown:0,hp:99999}));await sleep(100);assert.equal(humans[0].level,1);assert.ok(humans[0].hp<=112);assert.ok(bot.x<2200&&bot.skillCooldown>8);
  Object.assign(bot,{x:1800,y:1800,hp:15,maxHp:112,brain:null,aiTime:0,target:null,swing:0,cooldown:0,xp:50});Object.assign(humans[0],{x:1900,y:1800});const time=w.elapsed;
  await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.elapsed>time&&m.actors.some(e=>e.id===bot.id&&e.x<1785))));assert.equal(bot.brain.recovering,true);assert.equal(bot.target.flee,true);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
