'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createWorld}=require('../server/world.cjs');
function setup(){const w=createWorld({botCount:1}),e=w.actors[0];w.orbs.splice(0);for(const c of w.chests)c.alive=false;Object.assign(e,{x:1800,y:1800,level:1,hp:112,maxHp:112,invincible:0,angle:0,enlistTarget:null,brain:null,aiTime:0,target:null,team:'neutral',weapon:w.loot.makeWeapon(),xp:0,totalXp:0});return {w,e}}
function human(w,x=1870,y=1800){const h=w.addHuman('human-'+w.actors.length,'Opponent');Object.assign(h,{x,y,invincible:0,angle:Math.PI});return h}
function advance(w,seconds){for(let i=0;i<Math.ceil(seconds*30);i++)w.step(1/30)}
test('stable personalities vary reaction/courage; finite sensing ignores actors/loot outside 650 and never reads human intent/private bags/enemy cooldown',()=>{
 const {w,e}=setup(),h=human(w,2500);const profiles=new Set();for(const name of ['Thanh Phong','Tử Long','Vô Danh','Hổ Vệ','Bạch Mã']){const a=w.createBotBrain({...e,name}),b=w.createBotBrain({...e,name});assert.equal(JSON.stringify(a.profile),JSON.stringify(b.profile));assert.ok(a.profile.reaction>=.2&&a.profile.reaction<=.4);profiles.add(JSON.stringify(a.profile))}assert.equal(profiles.size,5);
 w.addTreasureDrop({type:'dragon'},2500,1800,0);w.botThink(e,w.actors);assert.equal(e.target.wander,true);assert.equal(e.brain.seen.size,0);
 h.x=1870;for(const key of ['input','inventory','cooldown'])Object.defineProperty(h,key,{configurable:true,get(){throw Error('AI read hidden '+key)}});assert.doesNotThrow(()=>w.botThink(e,w.actors));assert.equal(e.target.enemy,h);assert.equal(e.brain.seen.size,1);
});
test('observed target memory and delayed actions do not track invisible future movement; aim has bounded turn speed and no stat bonuses',()=>{
 const {w,e}=setup(),h=human(w);e.angle=Math.PI;const before={hp:e.hp,maxHp:e.maxHp,stats:JSON.stringify(w.weaponStats(e)),stamina:e.stamina};w.botThink(e,w.actors,0);assert.ok(e.aiTime>=.18&&e.aiTime<=.44);assert.ok(e.brain.intent.actionAt>=.18);const x=e.target.x,y=e.target.y;h.x=2000;h.y=1600;e.aiTime=999;w.updateBot(e,1/30,w.actors,.01);assert.equal(e.target.x,x);assert.equal(e.target.y,y);assert.ok(Math.abs(e.angle-Math.PI)<.2);assert.equal(e.swing,0);assert.equal(e.hp,before.hp);assert.equal(e.maxHp,before.maxHp);assert.equal(e.stamina,before.stamina);assert.equal(JSON.stringify(w.weaponStats(e)),before.stats);
});
test('chooses winnable opponents but retreats from superior gear/size and outnumbering without prioritizing humans',()=>{
 const {w,e}=setup(),h=human(w,1950);Object.assign(h,{level:21,dragonCount:7,hp:352,maxHp:352,weapon:w.loot.makeWeapon(19,5)});w.botThink(e,w.actors);assert.equal(e.target.flee,true);assert.equal(e.target.camp,true);
 Object.assign(h,{level:1,hp:10,maxHp:112,weapon:w.loot.makeWeapon()});w.botThink(e,w.actors);assert.equal(e.target.enemy,h);assert.ok(!e.target.flee);
 h.hp=112;h.x=1900;human(w,1850,1850);w.botThink(e,w.actors);assert.equal(e.target.flee,true);
});
test('recovery has hysteresis, protects capture for five seconds and never attacks from inside flags',()=>{
 const {w,e}=setup();e.hp=20;w.botThink(e,w.actors);assert.equal(e.brain.recovering,true);assert.equal(e.target.camp,true);assert.equal(e.hp,20);e.hp=60;w.botThink(e,w.actors);assert.equal(e.brain.recovering,true);e.hp=90;w.botThink(e,w.actors);assert.equal(e.brain.recovering,false);
 Object.assign(e,{x:350,y:350,hp:112,team:'neutral',brain:null,aiTime:0,enlistTarget:'quan'});advance(w,4.9);assert.equal(e.team,'neutral');assert.equal(e.swing,0);assert.ok(w.campAt(e));advance(w,.2);assert.equal(e.team,'quan');
 const h=human(w,560,350);e.hp=20;e.weapon=w.loot.makeWeapon(19,5);e.aiTime=0;advance(w,.5);assert.equal(e.swing,0);assert.equal(e.skillCooldown,0);assert.equal(h.hp,112);assert.ok(w.campAt(e));
});
test('nearby EXP cannot indefinitely distract a bot committed to joining a nation',()=>{
 const {w,e}=setup();e.enlistTarget='quan';w.orbs.push({x:1850,y:1800,value:2,pickupAt:0});w.botThink(e,w.actors,0);assert.ok(e.target.orb);w.botThink(e,w.actors,10);assert.equal(e.target.camp,true);assert.equal(e.target.x,350);assert.equal(e.target.y,350);assert.equal(e.team,'neutral');assert.equal(e.joinTime,0);
});
test('same-nation, camp-protected and spawn-shielded actors are not combat targets',()=>{
 const {w,e}=setup(),h=human(w);e.team=h.team='thuc';w.botThink(e,w.actors);assert.ok(!e.target.enemy);
 Object.assign(e,{x:600,y:350,team:'neutral'});Object.assign(h,{x:350,y:350,team:'neutral'});w.botThink(e,w.actors);assert.ok(!e.target.enemy);
 h.x=700;h.invincible=4;w.botThink(e,w.actors);assert.ok(!e.target.enemy);h.invincible=0;w.botThink(e,w.actors);assert.equal(e.target.enemy,h);
});
test('uses held-weapon reach to strafe at range instead of walking through the opponent, including exact overlap/edges',()=>{
 const {w,e}=setup(),h=human(w,1866);w.botThink(e,w.actors);const startY=e.y;w.updateBot(e,1/30,w.actors,.01);assert.notEqual(e.y,startY);assert.equal(e.x,1800);
 e.weapon=w.loot.makeWeapon(19,5);e.aiTime=0;w.botThink(e,w.actors);const longRange=e.brain.intent.range;e.weapon=w.loot.makeWeapon();w.botThink(e,w.actors);assert.ok(longRange>e.brain.intent.range);
 h.x=e.x;h.y=e.y;w.botThink(e,w.actors);w.updateBot(e,1/30,w.actors,.02);assert.ok(Number.isFinite(e.x)&&Number.isFinite(e.y));assert.ok(Math.hypot(e.x-h.x,e.y-h.y)>0);
 Object.assign(e,{x:30,y:30,aiTime:0,target:null,brain:null});h.alive=false;advance(w,1);assert.ok(e.x>=w.radius(e)+8&&e.y>=w.radius(e)+8);
});
test('loot utility favors dragon progress/upgrades, damaged high chests and public XP; waits for pickup delay',()=>{
 const {w,e}=setup();w.addTreasureDrop({type:'weapon',weapon:w.loot.makeWeapon(2,1)},1900,1800,0);w.addTreasureDrop({type:'dragon'},2000,1800,0);e.dragonCount=6;w.botThink(e,w.actors);assert.equal(e.target.drop.type,'dragon');
 w.drops.splice(0);const [small,high]=w.chests;Object.assign(small,{x:1900,y:1800,alive:true,level:1,hp:36,maxHp:36});Object.assign(high,{x:1900,y:1850,alive:true,level:5,hp:900,maxHp:900});w.botThink(e,w.actors);assert.equal(e.target.chest,small);high.hp=5;w.botThink(e,w.actors);assert.equal(e.target.chest,high);
 small.alive=high.alive=false;const ordinary={x:1850,y:1800,value:2,pickupAt:0},pool={x:2100,y:1800,value:100,pickupAt:.6};w.orbs.push(ordinary,pool);w.botThink(e,w.actors,0);assert.equal(e.target.orb,ordinary);w.botThink(e,w.actors,.7);assert.equal(e.target.orb,pool);
});
test('rare gear is still collected privately, brought to a real flag and equipped only there',()=>{
 const {w,e}=setup();Object.assign(e,{x:600,y:350});w.addTreasureDrop({type:'weapon',weapon:w.loot.makeWeapon(19,5)},600,350,0);w.step(.01);assert.equal(e.inventory.length,1);assert.equal(e.weapon.rarity,0);e.aiTime=0;w.botThink(e,w.actors);assert.equal(e.target.camp,true);advance(w,2);assert.ok(w.campAt(e));assert.equal(e.weapon.rarity,5);assert.equal(e.inventory.length,0);
});
test('pending actions survive perception refreshes; ordinary swings actually damage enemies and break/farm chests',()=>{
 const {w,e}=setup(),h=human(w,1866);w.botThink(e,w.actors,0);const scheduled=e.brain.intent.actionAt;w.botThink(e,w.actors,.2);assert.equal(e.brain.intent.actionAt,scheduled);advance(w,2);assert.ok(h.hp<112);assert.equal(w.weaponStats(e).atk,18);
 h.alive=false;e.brain=null;e.aiTime=0;e.cooldown=0;e.swing=0;Object.assign(e,{x:1800,y:1800,angle:0});const chest=w.chests[0];Object.assign(chest,{x:1870,y:1800,level:1,hp:36,maxHp:36,alive:true});advance(w,4);assert.equal(chest.alive,false);assert.ok(e.weapon.profile>0||e.inventory.length>0);assert.ok(e.totalXp>=14);
});
test('offensive skill is timed to a visible valid target, consumes real cooldown and does not spam when no target exists',()=>{
 const {w,e}=setup(),h=human(w,1970);e.weapon=w.loot.makeWeapon(3,5);advance(w,.65);assert.ok(e.skillCooldown>9&&e.skillCooldown<=10);assert.ok(h.hp<112&&h.hp>=40);const stats=JSON.stringify(w.weaponStats(e));h.alive=false;e.skillCooldown=0;e.aiTime=0;advance(w,.8);assert.equal(e.skillCooldown,0);assert.equal(JSON.stringify(w.weaponStats(e)),stats);
});
test('dodge pays 35 stamina with reserve/rate limits; emergency sprint pays current XP, never lifetime XP; humans are never AI-driven',()=>{
 const {w,e}=setup(),h=human(w,1868);h.hp=10;h.swing=.3;h.angle=Math.PI;e.stamina=20;w.botThink(e,w.actors,0);e.aiTime=999;e.brain.intent.actionAt=0;w.updateBot(e,.01,w.actors,.3);assert.equal(e.dash,0);e.stamina=100;w.updateBot(e,.01,w.actors,.4);assert.equal(e.stamina,65);assert.equal(e.dash,.23);assert.ok(e.brain.nextDash>2);w.updateBot(e,.01,w.actors,.5);assert.equal(e.stamina,65);
 Object.assign(e,{dash:0,hp:20,xp:100,totalXp:100,aiTime:0,brain:null});h.swing=0;w.botThink(e,w.actors,1);e.brain.intent.actionAt=0;e.aiTime=999;w.updateBot(e,.1,w.actors,1);assert.ok(Math.abs(e.xp-99)<1e-8);assert.equal(e.totalXp,100);assert.equal(e.level,1);
 const position=[h.x,h.y,h.angle,h.hp,h.xp];w.updateBot(h,1,w.actors,2);assert.deepEqual([h.x,h.y,h.angle,h.hp,h.xp],position);assert.equal(h.brain,null);
});
test('respawn discards old plans; a crowded 24-bot simulation stays finite and within ordinary progression/loot limits',{timeout:12000},()=>{
 const {w,e}=setup();w.botThink(e,w.actors);e.alive=false;e.respawn=0;w.step(.01);assert.equal(e.alive,true);assert.equal(e.brain,null);assert.equal(e.target,null);
 const crowded=createWorld({botCount:24});advance(crowded,10);for(const bot of crowded.actors){assert.ok([bot.x,bot.y,bot.hp,bot.angle,bot.cooldown,bot.stamina].every(Number.isFinite));assert.ok(bot.x>=crowded.radius(bot)+8-1e-7&&bot.x<=3600-crowded.radius(bot)-8+1e-7);assert.ok(bot.y>=crowded.radius(bot)+8-1e-7&&bot.y<=3600-crowded.radius(bot)-8+1e-7);assert.ok(bot.inventory.length<=24);assert.ok(bot.level>=1&&bot.level<=21);assert.ok(crowded.weaponStats(bot).atk<=53);if(bot.brain)assert.ok(bot.brain.seen.size<=23)}
});
