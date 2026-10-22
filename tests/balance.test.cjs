'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createWorld}=require('../server/world.cjs'),L=require('../loot.js');
test('all 15 initial slots use random rolls, including immediate Lv5; minute waves preserve damaged survivors',()=>{
 const w=createWorld({botCount:0}),e=w.addHuman('a','A');let n=0;const counts=[0,0,0,0,0];for(let batch=0;batch<100;batch++){w.spawnTreasures(()=>(n+++.5)/1500);for(const c of w.chests){counts[c.level-1]++;assert.equal(c.hp,w.loot.chestHp[c.level-1])}}assert.deepEqual(counts,[1050,225,150,60,15]);
 w.spawnTreasures(()=>.999999);assert.ok(w.chests.every(c=>c.level===5));const high=w.chests[1],low=w.chests[0];high.hp-=35;const snapshot=JSON.stringify(high);w.breakTreasure(low,e,()=>.5);w.updateChestWaves(59.99,()=>0);assert.equal(low.alive,false);w.updateChestWaves(60,()=>0);assert.equal(low.level,1);assert.equal(low.alive,true);assert.equal(w.chests.length,15);assert.equal(JSON.stringify(high),snapshot);
});
test('fixed guarantees every 5/10 refill waves coexist, never count initial slots and do not reset after lucky rolls',()=>{
 const w=createWorld({botCount:0}),e=w.addHuman('a','A');w.spawnTreasures(()=>0);
 for(let wave=1;wave<=20;wave++){
  for(const c of w.chests)w.breakTreasure(c,e,()=>.5);w.updateChestWaves(wave*60,()=>wave===1?.97:wave===2?.995:0);
  if(wave===1)assert.ok(w.chests.every(c=>c.level===4));else if(wave===2)assert.ok(w.chests.every(c=>c.level===5));else{assert.equal(w.chests.filter(c=>c.level===4).length,wave%5===0?1:0);assert.equal(w.chests.filter(c=>c.level===5).length,wave%10===0?1:0)}
  const once=JSON.stringify(w.chests);w.updateChestWaves(wave*60,()=>.999);assert.equal(JSON.stringify(w.chests),once);assert.equal(w.chests.length,15);
 }
});
test('full waves defer guarantees without touching survivors; one slot prioritizes Lv5, retains all Lv4 debts, resets per world',()=>{
 const w=createWorld({botCount:0}),e=w.addHuman('a','A');w.spawnTreasures(()=>0);w.chests[1].hp-=10;const survivors=JSON.stringify(w.chests);w.updateChestWaves(300,()=>0);w.updateChestWaves(600,()=>0);assert.equal(JSON.stringify(w.chests),survivors);
 const c=w.chests[0];for(const [wave,level] of [[11,5],[12,4],[13,4],[14,1]]){w.breakTreasure(c,e,()=>.5);w.updateChestWaves(wave*60,()=>0);assert.equal(c.level,level);assert.equal(w.chests.length,15);assert.equal(w.chests[1].hp,26)}
 const other=createWorld({botCount:0});other.spawnTreasures(()=>0);other.breakTreasure(other.chests[0],other.addHuman('b','B'),()=>.5);other.updateChestWaves(60,()=>0);assert.equal(other.chests[0].level,1);
 w.updateChestWaves(900,()=>0);w.spawnTreasures(()=>0);w.breakTreasure(w.chests[0],e,()=>.5);w.updateChestWaves(60,()=>0);assert.equal(w.chests[0].level,1);
});
test('every XP gate is exactly 50% harder, total to Lv20 = 44745, reserve and seven-ball Lv21 stay unchanged',()=>{
 const w=createWorld({botCount:0});
 for(let level=1;level<20;level++){const n=level-1,needed=150+60*n+15*n*n,e=w.addHuman('L'+level,'Threshold');e.level=level;e.totalXp=w.startingXP(level);const stats=JSON.stringify(w.weaponStats(e));assert.equal(w.startingXP(level+1)-w.startingXP(level),needed);w.gainXP(e,needed-1);assert.equal(e.level,level);w.gainXP(e,1);assert.equal(e.level,level+1);assert.equal(e.xp,0);assert.equal(JSON.stringify(w.weaponStats(e)),stats)}
 const e=w.addHuman('max','Max');assert.equal(w.startingXP(20),44745);w.gainXP(e,44744);assert.equal(e.level,19);assert.equal(e.xp,6089);w.gainXP(e,1);assert.equal(e.level,20);w.gainXP(e,1000000);assert.equal(e.level,20);assert.equal(e.xp,4060);for(let i=0;i<7;i++)w.collectDragon(e);assert.equal(e.level,21);assert.equal(e.hp,352);
});
test('all weapon types grow monotonically by rarity around fixed grip; blade length and width match size without LV-based ATK/ASPD',()=>{
 const sizes=[1,1.08,1.16,1.25,1.36,1.5],w=createWorld({botCount:0}),e=w.addHuman('weapon','Weapon');e.angle=0;
 for(let profile=0;profile<20;profile++)for(const level of [1,20,21]){
  e.level=level;let previous=0,grip;
  for(let rarity=0;rarity<6;rarity++){
   e.weapon=L.makeWeapon(profile,rarity);const stats=w.weaponStats(e),blade=w.weaponBlade(e,.5),scale=w.radius(e)/(17+level*1.35),length=Math.hypot(blade.b.x-blade.a.x,blade.b.y-blade.a.y);
   assert.equal(stats.size,sizes[rarity]);assert.ok(Math.abs(length-(stats.baseReach-10)*stats.size*scale)<1e-8);assert.ok(length>previous);previous=length;
   if(!grip)grip=blade.a;assert.deepEqual(blade.a,grip);const width=['axe','glaive','halberd','poleblade'].includes(stats.kind)?6:4;assert.ok(Math.abs(blade.width-width*stats.size*scale)<1e-8);
   assert.equal(stats.atk,L.stats(L.makeWeapon(profile,rarity)).atk);assert.equal(stats.aspd,L.stats(L.makeWeapon(profile,rarity)).aspd);
  }
 }
});
test('red same-type blade physically reaches a target that white cannot, with exact intrinsic damage',()=>{
 for(const rarity of [0,5]){
  const w=createWorld({botCount:0}),a=w.addHuman('a','A'),b=w.addHuman('b','B');w.orbs.splice(0);Object.assign(a,{x:1800,y:1800,angle:0,invincible:0,weapon:L.makeWeapon(1,rarity)});Object.assign(b,{x:1900,y:1800,invincible:0});w.attack(a);for(let i=0;i<12;i++)w.step(1/30);assert.equal(b.hp,rarity===0?112:112-w.weaponStats(a).atk);
 }
});
