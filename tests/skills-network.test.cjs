'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{WebSocket}=require('ws'),{createServer}=require('../server/index.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){const end=Date.now()+6000;while(!fn()){if(Date.now()>end)throw Error('Skill snapshot timeout');await sleep(10)}}
test('real sockets replicate all eight server-owned skills/poses and ignore forged skill/weapon/damage/cooldown',{timeout:20000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();try{
  for(let i=0;i<2;i++){const ws=new WebSocket('ws://localhost:'+port+'/ws');clients.push(ws);ws.inbox=[];ws.on('error',()=>{});ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify({type:'join',rulesVersion:11,room:'SKILLS',name:'Skill '+i}));await until(()=>ws.inbox.some(m=>m.type==='welcome'))}
  const w=app.rooms.get('SKILLS').world,[a,b]=w.actors;w.orbs.splice(0);w.chests.forEach(c=>c.alive=false);
  for(const profile of [3,19,2,4,10,18,7,16]){
   const stats=w.loot.stats(w.loot.makeWeapon(profile,5));Object.assign(a,{x:1800,y:1800,weapon:w.loot.makeWeapon(profile,5),angle:0,invincible:0,skillCooldown:0,skillEffect:0,skillBuff:0,swing:0,cooldown:0,attackKind:stats.skill==='flurry'?'normal':stats.skill});Object.assign(b,{x:2400,y:1800,invincible:0,hp:1000,maxHp:1000});
   if(stats.skill!=='flurry'){const blade=w.weaponBlade(a,.5);b.x=blade.a.x+(blade.b.x-blade.a.x)*.8;b.y=blade.a.y+(blade.b.y-blade.a.y)*.8}const at=w.elapsed;for(const ws of clients)ws.inbox=[];
   clients[0].send(JSON.stringify({type:'input',skill:true,angle:0,attackKind:'forged',skillEffectKind:'forged',weapon:{profile:0,rarity:0},skillCooldown:0,damage:999999,level:21,hp:999999}));await until(()=>a.skillCooldown>0);
   await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.elapsed>=at&&m.actors.some(e=>e.id===a.id&&e.skillEffectKind===stats.skill&&e.skillCooldown>0&&e.weapon.profile===profile&&(stats.skill==='flurry'?e.skillBuff>0:e.attackKind===stats.skill&&e.swingDuration===stats.skillDuration)))));
   await sleep(500);assert.equal(a.weapon.profile,profile);assert.equal(a.level,1);assert.ok(a.hp<=112);assert.ok(a.skillCooldown>9);assert.equal(1000-b.hp,stats.skill==='flurry'?0:Math.round(stats.atk*1.35));
   const hp=b.hp;clients[0].send(JSON.stringify({type:'input',skill:true,skillCooldown:0,damage:999999}));await sleep(60);assert.equal(b.hp,hp);
  }
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
