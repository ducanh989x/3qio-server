'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const L=require('../loot.js');const {createWorld}=require('../server/world.cjs');
function setup(){const w=createWorld({botCount:0});w.spawnTreasures(()=>0);w.orbs.splice(0);const e=w.addHuman('a','A');Object.assign(e,{x:1800,y:1800,invincible:0});return {w,e}}
function advance(w,t){for(let n=0;n<Math.ceil(t*30);n++)w.step(1/30)}
test('six rarities, five valid tables with monotonically better rare chances; exact boundary rolls',()=>{
 assert.deepEqual(L.rarities.map(r=>r.name),['Trắng','Lục','Lam','Tím','Cam','Đỏ']);assert.deepEqual(L.chestHp,[36,72,144,540,900]);assert.deepEqual(L.chestSpawnWeights(),[70,15,10,4,1]);
 const {w}=setup();assert.equal(w.chests.length,15);for(let level=1;level<=5;level++){const tier=Array.from(w.chests).filter(c=>c.level===level);assert.ok(tier.every(c=>c.hp===L.chestHp[level-1]&&c.maxHp===c.hp))}
 L.weights.forEach((row,i)=>{assert.ok(Math.abs(row.reduce((a,b)=>a+b,0)-100)<1e-8);if(i)for(let rarity=1;rarity<=5;rarity++)assert.ok(row.slice(rarity).reduce((a,b)=>a+b,0)>=L.weights[i-1].slice(rarity).reduce((a,b)=>a+b,0));
  assert.equal(L.rollChest(i+1,0,()=>0).weapon.rarity,0);assert.equal(L.rollChest(i+1,0,()=>.9999999).weapon.rarity,i<2?4:5);assert.equal(L.rollChest(i+1,0,()=>1).weapon.rarity,i<2?4:5);
 });
});
test('Lv1/2 can never drop red weapons; exact sampled weights, higher chests and dragon chances unchanged',()=>{
 assert.deepEqual(L.weights[0],[72,22,5.5,.45,.05,0]);assert.deepEqual(L.weights[1],[55,30,13,1.8,.2,0]);
 assert.deepEqual(L.weights.slice(2),[[25,30,28,13.5,3,.5],[10,22,32,28,7,1],[3,10,25,45,14,3]]);
 for(let level=1;level<=2;level++){const counts=[0,0,0,0,0,0];for(let n=0;n<100000;n++){let i=0;const roll=L.rollChest(level,0,()=>[(n+.5)/100000,.5,.5][i++]);counts[roll.weapon.rarity]++}L.weights[level-1].forEach((p,i)=>assert.equal(counts[i],p*1000))}
 for(let owned=0;owned<7;owned++)assert.equal(L.dragonChance(owned),.001*2**owned);
});
test('fixed 70/15/10/4/1 spawn probabilities at every age, exact boundaries and stable shared 60s clock',()=>{
 assert.equal(L.chestPeriod,60);assert.equal(L.maxChests,15);
 for(const t of [0,60,120,240,300,360,480,600,6000]){
  assert.deepEqual(L.chestSpawnWeights(t),[70,15,10,4,1]);const counts=[0,0,0,0,0];for(let n=0;n<10000;n++)counts[L.rollChestLevel(t,()=>(n+.5)/10000)-1]++;assert.deepEqual(counts,[7000,1500,1000,400,100]);
  for(const [roll,level] of [[0,1],[.699999,1],[.7,2],[.849999,2],[.85,3],[.949999,3],[.95,4],[.989999,4],[.99,5],[1,5]])assert.equal(L.rollChestLevel(t,()=>roll),level);
 }
 assert.equal(L.chestWave(59.999),0);assert.equal(L.chestWave(60),1);assert.equal(L.chestWave(119.999),1);assert.equal(L.chestWave(120),2);assert.equal(L.chestWave(240),4);
 let floatClock=0;for(let i=0;i<3600;i++)floatClock+=1/30;assert.equal(L.chestWave(floatClock),2);
});
test('global waves refill only broken slots, preserve damaged survivors, cap 15 and reset per world',()=>{
 const {w,e}=setup(),c=w.chests[0],survivor=w.chests[1],oldId=c.id;survivor.hp-=10;
 const before=JSON.stringify(survivor);w.breakTreasure(c,e,()=>.5);assert.equal(c.respawn,60);
 w.updateChestWaves(59.999,()=>.999999);assert.equal(c.alive,false);assert.ok(c.respawn>0);
 w.updateChestWaves(60,()=>.999999);assert.equal(c.alive,true);assert.equal(c.level,5);assert.equal(c.hp,900);assert.notEqual(c.id,oldId);assert.equal(JSON.stringify(survivor),before);
 w.breakTreasure(c,e,()=>.5);w.updateChestWaves(119.999,()=>.999999);assert.equal(c.alive,false);w.updateChestWaves(120,()=>.999999);assert.equal(c.level,5);assert.equal(c.hp,900);
 w.breakTreasure(c,e,()=>.5);w.updateChestWaves(179.999,()=>.999999);assert.equal(c.alive,false);w.updateChestWaves(180,()=>.999999);assert.equal(c.level,5);
 w.breakTreasure(c,e,()=>.5);w.updateChestWaves(240,()=>.999999);assert.equal(c.level,5);assert.equal(c.hp,900);
 w.breakTreasure(c,e,()=>.5);w.updateChestWaves(360,()=>.999999);assert.equal(c.level,4);assert.equal(c.hp,540);
 const snapshot=JSON.stringify(w.chests);w.updateChestWaves(360,()=>0);assert.equal(JSON.stringify(w.chests),snapshot);
 for(const chest of w.chests)if(chest!==survivor)w.breakTreasure(chest,e,()=>.5);
 w.updateChestWaves(12000,()=>.999999);assert.equal(w.chests.length,15);assert.equal(new Set(Array.from(w.chests,c=>c.id)).size,15);assert.ok(w.chests.every(c=>c.alive));assert.equal(JSON.stringify(survivor),before);
 for(const chest of w.chests)for(const z of [{x:350,y:350},{x:3250,y:350},{x:350,y:3250},{x:3250,y:3250}])assert.ok(Math.hypot(chest.x-z.x,chest.y-z.y)>175);
 const fresh=setup();assert.equal(fresh.w.chests.length,15);assert.ok(fresh.w.chests.every(c=>c.level===1));
});
test('auto collects dragons, upgrades every higher rarity including orange/red and stashes displaced rares',()=>{
 const {w,e}=setup();w.addTreasureDrop({type:'dragon'},e.x,e.y,0);w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(2,1)},e.x+100,e.y,.35);
 w.step(.1);assert.equal(e.weapon.profile,0);assert.equal(e.dragonCount,1);
 const d=w.drops.find(d=>d.type==='weapon');d.x=e.x+w.radius(e)+19;w.step(.1);assert.equal(e.weapon.profile,0);d.x=e.x+w.radius(e)+20.1;advance(w,.2);assert.equal(e.weapon.profile,0);
 d.x=e.x+w.radius(e)+19;w.step(.01);assert.equal(e.weapon.profile,2);
 for(const rarity of [2,3]){w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(3,rarity)},e.x,e.y,0);w.step(.01);assert.equal(e.weapon.rarity,rarity)}
 for(const rarity of [0,1,2,3])w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(18,rarity)},e.x,e.y,0);
 w.step(.01);assert.equal(e.weapon.profile,3);assert.equal(e.weapon.rarity,3);assert.equal(w.drops.filter(d=>d.weapon?.profile===18).length,4);
 for(const rarity of [4,5]){w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(19,rarity)},e.x,e.y,0);w.step(.01);assert.equal(e.weapon.rarity,rarity)}
 assert.equal(e.inventory.length,1);assert.equal(e.inventory[0].rarity,4);
 const other=setup();other.w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(3,0)},other.e.x,other.e.y,.35);other.w.step(.1);assert.equal(other.e.weapon.profile,0);advance(other.w,.3);assert.equal(other.e.weapon.profile,3);
 const dead=setup();dead.e.alive=false;dead.w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(4,0)},dead.e.x,dead.e.y,0);advance(dead.w,.2);assert.equal(dead.e.weapon.profile,0);
});
test('full bag leaves rare drops intact while normal upgrades and seven auto dragon pickups still work',()=>{
 const {w,e}=setup();e.weapon=L.makeWeapon(19,5);for(let i=0;i<L.bagSize;i++)w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(1,4)},e.x,e.y,0);w.step(.01);
 assert.equal(e.inventory.length,24);assert.equal(new Set(Array.from(e.inventory,item=>item.id)).size,24);
 w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(19,5)},e.x,e.y,0);for(let i=0;i<8;i++)w.addTreasureDrop({type:'dragon'},e.x,e.y,0);
 w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(2,2)},e.x,e.y,0);w.step(.01);
 assert.equal(e.inventory.length,24);assert.equal(e.weapon.rarity,5);assert.equal(e.dragonCount,7);assert.equal(e.level,21);assert.equal(w.drops.filter(d=>d.type==='dragon').length,1);assert.equal(w.drops.filter(d=>d.weapon?.rarity===5).length,1);
 e.x=350;e.y=350;assert.equal(w.equipFromBag(e,e.inventory[0].id),true);assert.equal(e.inventory.length,24);
 // Make room via a fixture; manual rare swaps themselves never consume items.
 e.inventory.pop();
 const rare=w.drops.find(d=>d.weapon?.rarity===5);rare.x=e.x;rare.y=e.y;w.step(.01);assert.equal(e.inventory.length,24);assert.equal(w.drops.includes(rare),false);
});
test('competing auto pickups are atomic and a full bag does not block another player',()=>{
 const {w,e}=setup(),other=w.addHuman('b','B');Object.assign(other,{x:1810,y:1800});w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(19,5)},1800,1800,0);w.step(.01);
 assert.equal([e,other].filter(a=>a.weapon.rarity===5).length,1);assert.equal(e.inventory.length+other.inventory.length,0);assert.equal(w.drops.length,0);
 e.inventory=Array.from({length:24},(_,i)=>({id:'fixture-'+i,profile:1,rarity:4}));other.inventory=[];other.weapon=L.makeWeapon(19,5);
 w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(19,5)},e.x,e.y,0);w.step(.01);assert.equal(e.inventory.length,24);assert.equal(other.inventory.length,1);assert.equal(w.drops.length,0);
});
test('bots seek ground upgrades and return to a flag to equip rare bag weapons',()=>{
 const w=createWorld({botCount:1}),e=w.actors[0];w.orbs.splice(0);Object.assign(e,{x:1800,y:1800,enlistTarget:null,aiTime:0,target:null,level:1});
 w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(2,1)},1950,1800,0);w.step(.01);assert.equal(e.target.loot,true);advance(w,1);assert.equal(e.weapon.rarity,1);
 Object.assign(e,{x:600,y:350,aiTime:0,target:null,weapon:L.makeWeapon(1,5)});w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(19,5)},600,350,0);w.step(.01);assert.equal(e.inventory.length,1);advance(w,2);
 assert.equal(e.weapon.rarity,5);assert.equal(e.weapon.profile,19);assert.equal(e.inventory.length,1);assert.equal(e.inventory[0].profile,1);
});
test('every weapon/rarity has finite intrinsic stats; only orange/red has exactly one skill',()=>{
 for(let profile=0;profile<L.names.length;profile++)for(let rarity=0;rarity<6;rarity++){
  const s=L.stats(L.makeWeapon(profile,rarity));assert.ok(s.atk>0&&s.aspd>0&&s.reach>0);assert.equal(!!s.skill,rarity>=4);if(rarity>=4)assert.ok(s.skillName&&s.skillCooldown>0);
 }
});
test('default rubber chicken, XP levels preserve equipment and exact ATK/ASPD; XP cannot unlock 21',()=>{
 const {w,e}=setup(),start=w.weaponStats(e);assert.equal(start.name,'Gà cao su lè lưỡi');assert.equal(start.atk,18);assert.equal(start.rarity,0);
 e.weapon=L.makeWeapon(17,4);const initial=JSON.stringify(w.weaponStats(e));
 w.gainXP(e,1000000);assert.equal(e.level,20);assert.equal(e.maxHp,340);assert.equal(e.hp,340);assert.equal(e.xp,4060);assert.equal(JSON.stringify(w.weaponStats(e)),initial);
 for(let i=0;i<7;i++)assert.equal(w.collectDragon(e),true);assert.equal(e.level,21);assert.equal(e.dragonCount,7);assert.equal(e.hp,352);assert.equal(JSON.stringify(w.weaponStats(e)),initial);assert.equal(w.collectDragon(e),false);
 w.gainXP(e,999999);assert.equal(e.level,21);assert.equal(e.xp,4060);
});
test('dragon drop is independent, exactly 0.1% doubled for 0–6 owned, stops at 7',()=>{
 for(let n=0;n<7;n++){
  assert.equal(L.dragonChance(n),.001*2**n);
  for(let level=1;level<=5;level++){
   let i=0;assert.equal(L.rollChest(level,n,()=>[.5,.5,L.dragonChance(n)-1e-8][i++]).dragon,true);
   i=0;assert.equal(L.rollChest(level,n,()=>[.5,.5,L.dragonChance(n)][i++]).dragon,false);
  }
 }
 assert.equal(L.dragonChance(7),0);assert.equal(L.rollChest(5,7,()=>0).dragon,false);
});
test('chests take one hit per swing; break once, drop guaranteed weapon and bonus dragon, respawn',()=>{
 const {w,e}=setup(),c=w.chests[0];Object.assign(c,{x:1860,y:1800});e.input.attack=true;advance(w,.32);e.input.attack=false;assert.equal(c.hp,c.maxHp-18);
 const others=w.chests.filter(other=>other!==c);assert.ok(others.every(other=>other.hp===other.maxHp));
 assert.equal(w.breakTreasure(c,e,()=>0),true);assert.equal(w.breakTreasure(c,e,()=>0),false);assert.equal(w.drops.length,2);assert.equal(w.drops.filter(d=>d.type==='weapon').length,1);assert.equal(w.drops.filter(d=>d.type==='dragon').length,1);
 advance(w,59);assert.equal(c.alive,false);advance(w,1);assert.equal(c.alive,true);assert.equal(c.hp,c.maxHp);assert.ok(c.level>=1&&c.level<=5);
});
test('camp-only bag equip rejects forged/stale IDs and dead actors; swaps preserve cooldowns and rare items',()=>{
 const {w,e}=setup();w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(19,5)},e.x+150,e.y,0);assert.equal(w.pickUp(e),false);
 w.drops[0].x=e.x;e.weapon=L.makeWeapon(1,5);e.alive=false;assert.equal(w.pickUp(e),false);e.alive=true;assert.equal(w.pickUp(e),true);assert.equal(e.weapon.profile,1);assert.equal(e.inventory.length,1);
 const id=e.inventory[0].id;assert.equal(w.equipFromBag(e,id),false);assert.equal(w.equipFromBag(e,{profile:19,rarity:5}),false);
 Object.assign(e,{x:350,y:350,alive:false});assert.equal(w.equipFromBag(e,id),false);e.alive=true;
 e.weapon=L.makeWeapon(2,2);e.skillCooldown=8;e.cooldown=2;e.skillBuff=2;e.swing=.2;
 assert.equal(w.equipFromBag(e,id),true);assert.equal(e.team,'neutral');assert.equal(e.weapon.rarity,5);assert.equal(e.skillCooldown,8);assert.equal(e.cooldown,2);assert.equal(e.skillBuff,0);assert.equal(e.swing,0);assert.equal(e.inventory.length,0);assert.equal(w.drops[0].weapon.rarity,2);
 assert.equal(w.equipFromBag(e,id),false);w.addTreasureDrop({type:'weapon',weapon:L.makeWeapon(3,4)},e.x,e.y,0);w.step(.01);const orange=e.inventory[0].id;
 assert.equal(w.equipFromBag(e,orange),true);assert.equal(e.weapon.rarity,4);assert.equal(e.inventory.length,1);assert.equal(e.inventory[0].rarity,5);assert.notEqual(e.inventory[0].id,id);assert.equal(w.equipFromBag(e,id),false);
 for(const pos of [{x:3250,y:350},{x:350,y:3250},{x:3250,y:3250}]){Object.assign(e,pos);assert.equal(w.equipFromBag(e,e.inventory[0].id),true)}
 e.x=1800;e.y=1800;const before=JSON.stringify(e.inventory);assert.equal(w.equipFromBag(e,e.inventory[0].id),false);assert.equal(JSON.stringify(e.inventory),before);
});
test('weapon damage is identical at different actor levels; skills honor teams/safe camps and cooldown',()=>{
 for(const level of [1,10,20,21]){
  const {w,e}=setup(),b=w.addHuman('b','B');e.level=level;Object.assign(b,{x:1860,y:1800,hp:500,maxHp:500,invincible:0});e.input.attack=true;advance(w,.32);e.input.attack=false;assert.equal(b.hp,482);
 }
 for(const protectedBy of ['team','camp','none']){
  const {w,e}=setup(),b=w.addHuman('b','B');e.weapon=L.makeWeapon(19,4);Object.assign(b,{x:1870,y:1800,hp:1000,maxHp:1000,invincible:0});
  if(protectedBy==='team')e.team=b.team='thuc';if(protectedBy==='camp'){e.x=555;e.y=350;b.x=495;b.y=350;e.angle=Math.PI}
  assert.equal(w.useWeaponSkill(e),true);assert.equal(w.useWeaponSkill(e),false);advance(w,.36);assert.equal(b.hp<1000,protectedBy==='none');
 }
 const {w,e}=setup();e.weapon=L.makeWeapon(2,4);const base=w.weaponASPD(e);assert.equal(w.useWeaponSkill(e),true);assert.ok(Math.abs(w.weaponASPD(e)-base*1.3)<1e-10);advance(w,3.2);assert.equal(w.weaponASPD(e),base);
});
test('respawn resets weapon, dragon count and skill state; chest placement avoids safe circles',()=>{
 const {w,e}=setup();for(const c of w.chests)for(const z of [{x:350,y:350},{x:3250,y:350},{x:350,y:3250},{x:3250,y:3250}])assert.ok(Math.hypot(c.x-z.x,c.y-z.y)>175);
 e.inventory.push({id:'bag-test',profile:3,rarity:4});e.weapon=L.makeWeapon(19,5);e.dragonCount=7;e.level=21;e.skillCooldown=9;e.alive=false;e.respawn=0;assert.equal(w.respawn(e),true);assert.equal(e.weapon.profile,0);assert.equal(e.weapon.rarity,0);assert.equal(e.dragonCount,0);assert.equal(e.skillCooldown,0);assert.equal(e.level,1);assert.equal(e.inventory.length,0);
});
