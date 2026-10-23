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
 const names=['Gà cao su lè lưỡi','Đoản đao','Thiết kiếm','Trường thương','Trường thương','Đại đao','Đại đao','Đại đao','Đại đao','Thiết tiên','Đại phủ','Đại đao','Đại đao','Thiết thương','Đại đao','Trường thương','Trượng bát xà mâu','Trường thương','Thanh long yển nguyệt đao','Phương thiên họa kích','Đại Chùy','Song kiếm','Liềm','Tảng đá lớn','Chảo chiến','Cá mặn','Ghế gỗ'];
 const kinds=['chicken','dao','jian','spear','spear','poleblade','poleblade','poleblade','poleblade','whip','axe','poleblade','poleblade','spear','poleblade','spear','serpent','spear','glaive','halberd','hammer','dual','scythe','boulder','pan','fish','chair'];
 const baseReaches=Object.freeze([...Array.from({length:20},(_,p)=>48+(p+1)*3.6),74,62,94,60,58,76,72]);
 const speeds={club:1.1,dao:1.65,jian:1.9,spear:1.35,poleblade:1,whip:1.5,axe:.8,serpent:1.2,glaive:.85,halberd:.9,chicken:1.1,hammer:.8,dual:1.85,scythe:1.05,boulder:.82,pan:1.35,fish:1.5,chair:1};
 const budgets={club:19.8,dao:21,jian:21,spear:23,poleblade:24,whip:22,axe:25,serpent:23,glaive:25,halberd:25,chicken:19.8,hammer:25,dual:21,scythe:24,boulder:25,pan:22,fish:21,chair:24};
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
 function makeWeapon(profile=0,rarity=0){return {profile:Number.isInteger(profile)&&profile>=0&&profile<names.length?profile:0,rarity:Number.isInteger(rarity)&&rarity>=0&&rarity<6?rarity:0}}
 const skills=Object.freeze({
  pierce:Object.freeze({name:'Xuyên trận',duration:.32,description:'Đâm thẳng, tầm vươn tối đa ×2,2.'}),
  whirl:Object.freeze({name:'Hoành tảo',duration:.32,description:'Quét tròn một vòng, tầm ×1,3.'}),
  flurry:Object.freeze({name:'Liên kích',duration:0,description:'Tăng ASPD ×1,30 trong 3 giây, không đánh tự động.'}),
  lunge:Object.freeze({name:'Phá phong',duration:.36,description:'Đâm chéo từ trái sang phải, tầm tối đa ×1,9; không dịch chuyển nhân vật.'}),
  cleave:Object.freeze({name:'Bổ sơn',duration:.44,description:'Bổ nặng cung hẹp, vươn tầm ×1,45 ở giữa nhịp.'}),
  crescent:Object.freeze({name:'Nguyệt trảm',duration:.36,description:'Quét cung rộng 240 độ, tầm ×1,35.'}),
  cross:Object.freeze({name:'Song hồi',duration:.44,description:'Quét tới rồi thu về; mỗi mục tiêu chỉ nhận một hit trong cả hai nhịp.'}),
  stealth:Object.freeze({name:'Tàng hình',duration:0,utility:true,description:'Ẩn khỏi đối thủ 4s (Cam) / 5s (Đỏ). Đánh, trúng đòn hoặc vào vòng cờ sẽ hiện hình; vẫn có thể bị đánh trúng. Khi ẩn không hút EXP/nhặt đồ.'}),
  heal:Object.freeze({name:'Hồi xuân',duration:0,utility:true,description:'Hồi ngay 25% HP tối đa, không vượt trần. Đầy máu không tiêu lượt dùng.'}),
  shield:Object.freeze({name:'Hộ thể',duration:0,utility:true,description:'Lá chắn 4s hấp thụ tối đa 20% HP tối đa. Không chặn đẩy lùi hoặc biến thành bất tử.'}),
  serpent:Object.freeze({name:'Xà ảnh',duration:.4,description:'Đầu mâu lượn hai bên hướng ngắm, vươn tối đa ×2.'})
 });
 const profileSkills=Object.freeze(['flurry','stealth','flurry','pierce','lunge','cleave','heal','cross','shield','cross','cleave','crescent','cross','pierce','crescent','lunge','serpent','pierce','crescent','whirl','cleave','cross','crescent','shield','whirl','flurry','cleave']);
 const statsCache=new Array(names.length*6);
 function stats(item){
  const p=Number.isInteger(item?.profile)&&item.profile>=0&&item.profile<names.length?item.profile:0,rarity=Number.isInteger(item?.rarity)&&item.rarity>=0&&item.rarity<6?item.rarity:0,key=p*6+rarity;
  if(statsCache[key])return statsCache[key];
  const w={profile:p,rarity},r=rarities[rarity],kind=kinds[p];
  const atk=Math.round(budgets[kind]/speeds[kind]*r.atk);
  const skill=w.rarity<4?null:profileSkills[p],definition=skills[skill];
  return statsCache[key]=Object.freeze({...w,name:names[p],kind,color:r.color,rarityName:r.name,atk,aspd:Math.round(speeds[kind]*r.aspd*100)/100,size:r.size,baseReach:baseReaches[p],reach:10+(baseReaches[p]-10)*r.size,skill,skillName:definition?.name||null,skillDescription:definition?.description||'',skillDuration:definition?.duration||0,skillUtility:!!definition?.utility,skillCooldown:definition?.utility?(skill==='heal'?(rarity===5?18:20):(rarity===5?16:18)):(rarity===5?10:12)});
 }
 function dragonChance(owned=0){const n=Math.max(0,Math.min(7,Math.floor(Number(owned)||0)));return n>=7?0:.001*2**n}
 function rollChest(level,owned=0,rng=Math.random){
  const tier=Math.max(1,Math.min(5,Math.floor(level)||1));let roll=rng()*100,rarity=tier<3?4:5;
  for(let i=0;i<6;i++){if(weights[tier-1][i]===0)continue;roll-=weights[tier-1][i];if(roll<0){rarity=i;break}}
  const weapon=makeWeapon(1+Math.min(names.length-2,Math.floor(rng()*(names.length-1))),rarity);
  return {weapon,dragon:rng()<dragonChance(owned)};
 }
 return {bagSize:24,skills,profileSkills,rarities,names,kinds,baseReaches,weights,chestHp,chestPeriod,maxChests,chestWave,chestSpawnWeights,rollChestLevel,makeWeapon,stats,dragonChance,rollChest};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LootRules;
