'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createWorld}=require('../server/world.cjs');
function setup(rarity,slots=0){const w=createWorld({botCount:0});w.orbs.splice(0);const e=w.addHuman('a','A');Object.assign(e,{x:1800,y:1800,weapon:w.loot.makeWeapon(2,rarity)});e.inventory=Array.from({length:slots},(_,i)=>({id:'existing-'+i,profile:1,rarity:4}));return {w,e}}
function drop(w,e,rarity){w.addTreasureDrop({type:'weapon',weapon:w.loot.makeWeapon(19,rarity)},e.x,e.y,0);return w.drops.at(-1)}
test('all 36 rarity pairs: higher equips anywhere, lower/equal rare stashes, lower/equal normal stays; no duplicate',()=>{
 for(let held=0;held<6;held++)for(let found=0;found<6;found++){
  const {w,e}=setup(held),d=drop(w,e,found),accepted=found>held||found>=4;
  assert.equal(w.collectDrop(e,d),accepted,held+' -> '+found);
  assert.equal(e.weapon.rarity,found>held?found:held);assert.equal(e.weapon.profile,found>held?19:2);
  assert.equal(e.inventory.length,found>held?(held>=4?1:0):(found>=4?1:0));
  if(e.inventory.length)assert.equal(e.inventory[0].rarity,found>held?held:found);
  assert.equal(w.collectDrop(e,d),false,'same drop cannot be replayed');
  const copies=(e.weapon.profile===19&&e.weapon.rarity===found?1:0)+e.inventory.filter(i=>i.profile===19&&i.rarity===found).length+w.drops.filter(i=>i.weapon?.profile===19&&i.weapon.rarity===found).length;
  assert.equal(copies,1,'new weapon exists exactly once');
 }
});
test('full bag still permits normal -> orange/red without losing any stored rare',()=>{
 for(let held=0;held<4;held++)for(const found of [4,5]){const {w,e}=setup(held,24),before=JSON.stringify(e.inventory),d=drop(w,e,found);assert.equal(w.collectDrop(e,d),true);assert.equal(e.weapon.rarity,found);assert.equal(JSON.stringify(e.inventory),before);assert.equal(w.drops.includes(d),false)}
});
test('full bag blocks orange -> red and extra rares, never throws away old rare; one slot allows upgrade',()=>{
 const {w,e}=setup(4,24),d=drop(w,e,5),before=JSON.stringify(e.inventory);assert.equal(w.collectDrop(e,d),false);assert.equal(e.weapon.rarity,4);assert.equal(JSON.stringify(e.inventory),before);assert.equal(w.drops.includes(d),true);
 e.inventory.pop();assert.equal(w.collectDrop(e,d),true);assert.equal(e.weapon.rarity,5);assert.equal(e.inventory.length,24);assert.equal(e.inventory.at(-1).profile,2);assert.equal(e.inventory.at(-1).rarity,4);assert.equal(new Set(e.inventory.map(i=>i.id)).size,24);
 for(const rarity of [4,5])assert.equal(w.collectDrop(e,drop(w,e,rarity)),false);
});
test('automatic rare upgrade preserves cooldowns, cancels swing/buff, no level/HP/XP/stamina/dragon changes',()=>{
 const {w,e}=setup(4);Object.assign(e,{cooldown:2,skillCooldown:8,skillBuff:2,skillEffect:.3,swing:.2});const before=JSON.stringify([e.level,e.hp,e.xp,e.totalXp,e.stamina,e.dragonCount,e.team]);assert.equal(w.collectDrop(e,drop(w,e,5)),true);assert.equal(e.cooldown,2);assert.equal(e.skillCooldown,8);assert.equal(e.skillBuff,0);assert.equal(e.skillEffect,0);assert.equal(e.swing,0);assert.equal(JSON.stringify([e.level,e.hp,e.xp,e.totalXp,e.stamina,e.dragonCount,e.team]),before);
});
test('blocked full-bag player does not prevent another actor equipping the same world drop once',()=>{
 const {w,e}=setup(4,24),other=w.addHuman('b','B');Object.assign(other,{x:e.x,y:e.y});const d=drop(w,e,5);assert.equal(w.collectDrop(e,d),false);assert.equal(w.collectDrop(other,d),true);assert.equal(w.collectDrop(e,d),false);assert.equal(other.weapon.rarity,5);assert.equal(other.inventory.length,0);assert.equal(e.inventory.length,24);
});
