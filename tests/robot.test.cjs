'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createWorld}=require('../server/world.cjs'),{createServer}=require('../server/index.cjs'),{WebSocket}=require('ws');
const {readFileSync}=require('node:fs'),{join}=require('node:path'),vm=require('node:vm');
test('seven balls summon exactly one controlled Lv21 form, retain equipment/affiliation/stats, clamp large body, reset on respawn',()=>{
 const w=createWorld({botCount:0}),e=w.addHuman('robot','Pilot');w.orbs.splice(0);
 e.weapon=w.loot.makeWeapon(19,5);e.team='ngo';e.inventory.push({id:'kept',profile:3,rarity:4});e.cooldown=.7;e.skillCooldown=4;
 const stats=JSON.stringify(w.weaponStats(e)),gear=JSON.stringify(e.inventory);
 for(let i=0;i<6;i++){assert.equal(w.collectDragon(e),true);assert.equal(e.level,1);assert.equal(e.robotSummon,0)}
 w.gainXP(e,1e9);assert.equal(e.level,20);const radius20=w.radius(e),reach20=w.reach(e);
 e.x=e.y=27;assert.equal(w.collectDragon(e),true);assert.equal(e.level,21);assert.equal(e.hp,352);assert.equal(e.maxHp,352);assert.equal(e.dragonCount,7);assert.equal(e.robotSummon,2.4);assert.equal(e.cooldown,.7);assert.equal(e.skillCooldown,4);assert.equal(e.team,'ngo');assert.equal(JSON.stringify(e.inventory),gear);assert.equal(JSON.stringify(w.weaponStats(e)),stats);assert.equal(w.actors.length,1);
 assert.ok(w.radius(e)/radius20>1.65&&w.radius(e)/radius20<1.7);assert.ok(w.reach(e)/reach20>1.6);assert.equal(e.x,w.radius(e)+8);assert.equal(e.y,w.radius(e)+8);
 assert.equal(w.collectDragon(e),false);assert.equal(w.actors.length,1);w.step(.1);assert.ok(e.robotSummon<2.4&&e.robotSummon>2.2);
 for(let i=0;i<75;i++)w.step(1/30);assert.equal(e.robotSummon,0);assert.equal(e.level,21);
 e.alive=false;e.respawn=0;assert.equal(w.respawn(e),true);assert.equal(e.level,1);assert.equal(e.robotSummon,0);assert.equal(e.dragonCount,0);
});
test('robot illustration: finite drawing, balanced canvas state, seven spheres and no mutation across animation phases',()=>{
 const game=readFileSync(join(__dirname,'../game.js'),'utf8'),ctx=vm.createContext({Math,TAU:Math.PI*2,clock:0,clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
 vm.runInContext(game.slice(game.indexOf('function ellipse('),game.indexOf('function drawSidearm(')),ctx);
 vm.runInContext(readFileSync(join(__dirname,'../robot.js'),'utf8')+';globalThis.drawMech=drawRobot;',ctx);
 for(const moving of [0,1])for(const robotSummon of [0,.01,1.2,2.4])for(const portrait of [false,true]){
  let depth=0,spheres=0;const c=new Proxy({globalAlpha:1,save(){depth++},restore(){depth--}},{get:(t,k)=>k in t?t[k]:(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),k);if(k==='ellipse'&&args[2]===.075)spheres++}});
  const e={level:21,angle:.7,phase:1,moving,robotSummon},before=JSON.stringify(e);ctx.drawMech(c,e,45.35,portrait);assert.equal(depth,0);assert.equal(spheres,7);assert.equal(JSON.stringify(e),before);
 }
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){const end=Date.now()+5000;while(!fn()){if(Date.now()>end)throw Error('robot snapshot timeout');await sleep(10)}}
test('server owns robot unlock/size and replicates summon to both sockets; forged robot fields do nothing',{timeout:10000},async()=>{
 const app=createServer({port:0,botCount:0}),clients=[];const {port}=await app.listen();
 try{
  for(let i=0;i<2;i++){const ws=new WebSocket('ws://localhost:'+port+'/ws');ws.inbox=[];ws.on('message',raw=>ws.inbox.push(JSON.parse(raw)));await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify({type:'join',rulesVersion:7,room:'ROBOT',name:'Pilot '+i}));clients.push(ws)}
  await until(()=>app.rooms.get('ROBOT')?.world.actors.length===2);const w=app.rooms.get('ROBOT').world,[a,b]=w.actors;
  clients[0].send(JSON.stringify({type:'input',level:21,dragonCount:7,robotSummon:999,scale:999}));await sleep(100);assert.equal(a.level,1);assert.equal(a.dragonCount,0);assert.equal(a.robotSummon,0);
  a.x=1800;b.x=2200;const stats=JSON.stringify(w.weaponStats(a));for(let i=0;i<7;i++)w.collectDragon(a);
  await until(()=>clients.every(ws=>ws.inbox.some(m=>m.type==='state'&&m.actors.some(e=>e.id===a.id&&e.level===21&&e.dragonCount===7&&e.robotSummon>0&&e.robotSummon<=2.4))));assert.equal(w.actors.length,2);assert.equal(b.level,1);assert.equal(JSON.stringify(w.weaponStats(a)),stats);
 }finally{clients.forEach(ws=>ws.terminate());await app.close()}
});
