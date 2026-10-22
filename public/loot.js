'use strict';
// Shared, deterministic equipment rules. Character level never enters ATK/ASPD.
const LootRules=(()=>{
 const rarities=[
  {name:'Trắng',color:'#ecebdc',atk:1,aspd:1,size:1},
  {name:'Lục',color:'#8ed18c',atk:1.08,aspd:1.05,size:1.08},
  {name:'Lam',color:'#7bbde8',atk:1.18,aspd:1.1,size:1.16},
  {name:'Tím',color:'#c99be9',atk:1.32,aspd:1.17,size:1.25},
  {name:'Cam',color:'#f5b467',atk:1.5,aspd:1.25,size:1.36},
  {name:'Đỏ',color:'#f57d76',atk:1.7,aspd:1.35,size:1.5}
 ];
 const names=['Khúc gỗ','Đoản đao','Thiết kiếm','Trường thương','Trường thương','Đại đao','Đại đao','Đại đao','Đại đao','Thiết tiên','Đại phủ','Đại đao','Đại đao','Thiết thương','Đại đao','Trường thương','Trượng bát xà mâu','Trường thương','Thanh long yển nguyệt đao','Phương thiên họa kích'];
 const kinds=['club','dao','jian','spear','spear','poleblade','poleblade','poleblade','poleblade','whip','axe','poleblade','poleblade','spear','poleblade','spear','serpent','spear','glaive','halberd'];
 const speeds={club:1.1,dao:1.65,jian:1.9,spear:1.35,poleblade:1,whip:1.5,axe:.8,serpent:1.2,glaive:.85,halberd:.9};
 const budgets={club:19.8,dao:21,jian:21,spear:23,poleblade:24,whip:22,axe:25,serpent:23,glaive:25,halberd:25};
 const weights=[
  [72,22,5.5,.45,.05,0],
  [55,30,13,1.8,.2,0],
  [25,30,28,13.5,3,.5],
  [10,22,32,28,7,1],
  [3,10,25,45,14,3]
 ];
 const chestHp=[36,72,144,540,900],chestPeriod=60,maxChests=15;
 // Fixed independent probabilities for initial and ordinary refill slots.
 // Scheduled guarantees are exceptions, handled per shared 60-second wave.
 const spawnWeights=[70,15,10,4,1];
 function chestWave(seconds=0){return Math.floor((Math.max(0,Number(seconds)||0)+1e-7)/chestPeriod)}
 function chestSpawnWeights(){return spawnWeights}
 function rollChestLevel(seconds=0,rng=Math.random){
  let roll=rng()*100,last=1;const row=chestSpawnWeights(seconds);
  for(let i=0;i<row.length;i++){if(row[i]===0)continue;last=i+1;roll-=row[i];if(roll<0)return last}return last;
 }
 function makeWeapon(profile=0,rarity=0){return {profile:Number.isInteger(profile)&&profile>=0&&profile<20?profile:0,rarity:Number.isInteger(rarity)&&rarity>=0&&rarity<6?rarity:0}}
 const statsCache=new Array(120);
 function stats(item){
  const p=Number.isInteger(item?.profile)&&item.profile>=0&&item.profile<20?item.profile:0,rarity=Number.isInteger(item?.rarity)&&item.rarity>=0&&item.rarity<6?item.rarity:0,key=p*6+rarity;
  if(statsCache[key])return statsCache[key];
  const w={profile:p,rarity},r=rarities[rarity],kind=kinds[p];
  const atk=Math.round(budgets[kind]/speeds[kind]*r.atk);
  const skill=w.rarity<4?null:['spear','serpent'].includes(kind)?'pierce':['poleblade','axe','glaive','halberd'].includes(kind)?'whirl':'flurry';
  return statsCache[key]=Object.freeze({...w,name:names[p],kind,color:r.color,rarityName:r.name,atk,aspd:Math.round(speeds[kind]*r.aspd*100)/100,size:r.size,baseReach:48+(p+1)*3.6,reach:10+(38+(p+1)*3.6)*r.size,skill,skillName:skill==='pierce'?'Xuyên trận':skill==='whirl'?'Hoành tảo':skill==='flurry'?'Liên kích':null,skillCooldown:w.rarity===5?10:12});
 }
 function dragonChance(owned=0){const n=Math.max(0,Math.min(7,Math.floor(Number(owned)||0)));return n>=7?0:.001*2**n}
 function rollChest(level,owned=0,rng=Math.random){
  const tier=Math.max(1,Math.min(5,Math.floor(level)||1));let roll=rng()*100,rarity=tier<3?4:5;
  for(let i=0;i<6;i++){if(weights[tier-1][i]===0)continue;roll-=weights[tier-1][i];if(roll<0){rarity=i;break}}
  const weapon=makeWeapon(1+Math.min(18,Math.floor(rng()*19)),rarity);
  return {weapon,dragon:rng()<dragonChance(owned)};
 }
 return {bagSize:24,rarities,names,kinds,weights,chestHp,chestPeriod,maxChests,chestWave,chestSpawnWeights,rollChestLevel,makeWeapon,stats,dragonChance,rollChest};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LootRules;
