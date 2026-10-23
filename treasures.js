'use strict';
let chests=[],drops=[],treasureSerial=0,treasureWave=0,treasureOwed4=0,treasureOwed5=0;
let bagZone=null,bagOpen=false,bagRenderKey='';
// Also used by server per-viewer replication: never send a hidden enemy's position.
function canObserveActor(viewer,target){return target.stealthTime<=0||!target.stealthTime||viewer===target||(viewer.team&&viewer.team!=='neutral'&&viewer.team===target.team)}
function clearUtility(e){e.stealthTime=0;e.shieldTime=0;e.shieldHp=0}
function updateUtility(e,dt){e.stealthTime=Math.max(0,(e.stealthTime||0)-dt);e.shieldTime=Math.max(0,(e.shieldTime||0)-dt);if(e.shieldTime===0)e.shieldHp=0}
function weaponStats(e){return LootRules.stats(e.weapon)}
function weaponASPD(e){return weaponStats(e).aspd*(e.skillBuff>0?CombatRules.flurryMultiplier:1)}
function weaponPower(item){const w=LootRules.stats(item);return w.atk*w.aspd}
function treasurePosition(){
 for(let i=0;i<150;i++){
  const p={x:rand(220,WORLD-220),y:rand(220,WORLD-220)};
  if(Math.hypot(p.x-1800,p.y-1800)>190&&!CAMP_ZONES.some(z=>dist(z,p)<CAMP_RADIUS+110)&&!chests.some(c=>dist(c,p)<120))return p;
 }
 return {x:1800+rand(-400,400),y:1800+rand(-400,400)};
}
function spawnTreasures(rng=Math.random){
 chests=[];drops=[];treasureSerial=0;treasureWave=0;treasureOwed4=0;treasureOwed5=0;resetBagUI();
 for(let i=0;i<LootRules.maxChests;i++){
  const level=LootRules.rollChestLevel(0,rng),p=i<2?{x:1800+Math.cos(i*TAU/2)*210,y:1800+Math.sin(i*TAU/2)*210}:treasurePosition();
  chests.push({...p,id:'chest-'+(++treasureSerial),level,hp:LootRules.chestHp[level-1],maxHp:LootRules.chestHp[level-1],alive:true,respawn:0});
 }
}
// Refill only broken slots on the shared one-minute boundary. Surviving
// chests retain HP, level and location: no mid-fight healing or rerolling.
function updateChestWaves(now=elapsed,rng=Math.random){
 const wave=LootRules.chestWave(now);
 if(wave>treasureWave){
  // Fixed milestones never reset on lucky random rolls. Accrue even when full;
  // never heal/replace living chests or exceed the cap to pay a guarantee.
  treasureOwed4+=Math.floor(wave/5)-Math.floor(treasureWave/5);
  treasureOwed5+=Math.floor(wave/10)-Math.floor(treasureWave/10);
  treasureWave=wave;
  for(const c of chests)if(!c.alive){
   let level;
   if(treasureOwed5>0){level=5;treasureOwed5--}
   else if(treasureOwed4>0){level=4;treasureOwed4--}
   else level=LootRules.rollChestLevel(wave*LootRules.chestPeriod,rng);
   const p=treasurePosition();
   Object.assign(c,{...p,id:'chest-'+(++treasureSerial),level,hp:LootRules.chestHp[level-1],maxHp:LootRules.chestHp[level-1],alive:true,respawn:0});
  }
 }
 for(const c of chests)if(!c.alive)c.respawn=Math.max(0,(treasureWave+1)*LootRules.chestPeriod-now);
}
function addTreasureDrop(data,x,y,delay=.35){
 if(drops.length>=120){const i=drops.findIndex(d=>d.type!=='dragon');if(i>=0)drops.splice(i,1);else return}
 drops.push({...data,id:'drop-'+(++treasureSerial),x:clamp(x,40,WORLD-40),y:clamp(y,40,WORLD-40),pickAfter:elapsed+delay,expires:elapsed+(data.type==='dragon'?300:120)});
}
function breakTreasure(c,e,rng=Math.random){
 if(!c.alive||!e.alive)return false;c.alive=false;c.hp=0;c.respawn=Math.max(0,(LootRules.chestWave(elapsed)+1)*LootRules.chestPeriod-elapsed);
 const loot=LootRules.rollChest(c.level,e.dragonCount,rng);
 addTreasureDrop({type:'weapon',weapon:loot.weapon},c.x-18,c.y+20);
 if(loot.dragon)addTreasureDrop({type:'dragon'},c.x+27,c.y+20);
 gainXP(e,8+c.level*6);burst(c.x,c.y,'#d8b37b',15);return true;
}
function damageTreasure(c,e,damage){if(!c.alive)return;c.hp=Math.max(0,c.hp-damage);if(c.hp===0)breakTreasure(c,e)}
function hitTreasures(e,blade){
 for(const c of chests){
  if(!c.alive||e.hitSet.has(c.id))continue;
  if(bladeHitsCircle(blade,c,28)){
   e.hitSet.add(c.id);damageTreasure(c,e,e.attackDamage??weaponStats(e).atk);
  }
 }
}
function canCollectDrop(e,d){
 if(!e.alive||e.stealthTime>0||d.expires<=elapsed||(!window.netGame?.active&&d.pickAfter>elapsed))return false;
 if(d.type==='dragon')return e.dragonCount<7;
 if(d.type!=='weapon')return false;
 // A rare upgrade replaces normal gear without needing a bag slot. An old
 // rare must fit in the bag first; never discard it to force an upgrade.
 if(d.weapon.rarity>=4)return (d.weapon.rarity>e.weapon.rarity&&e.weapon.rarity<4)||(e.inventory?.length||0)<LootRules.bagSize;
 return d.weapon.rarity>e.weapon.rarity||(e.weapon.profile===0&&e.weapon.rarity===0&&d.weapon.profile>0);
}
function nearestDrop(e,bot=false,onlyWeapons=false){
 let best=null,bd=radius(e)+20;
 for(const d of drops){
  if((onlyWeapons&&d.type!=='weapon')||!canCollectDrop(e,d))continue;
  const distance=dist(e,d);if(distance<=bd){bd=distance;best=d}
 }
 return best;
}
function setHeldWeapon(e,item){
 clearUtility(e);e.weapon=LootRules.makeWeapon(item.profile,item.rarity);e.skillBuff=0;e.skillEffect=0;e.swing=0;e.hitSet=new Set();
}
function stashWeapon(e,item){
 e.inventory??=[];if(e.inventory.length>=LootRules.bagSize)return false;
 e.inventory.push({id:'bag-'+(++treasureSerial),...LootRules.makeWeapon(item.profile,item.rarity)});return true;
}
function equipFromBag(e,itemId){
 // Always validate the actual actor position on the server, never client claims.
 if(!e.alive||!campAt(e)||typeof itemId!=='string')return false;
 const index=(e.inventory||[]).findIndex(item=>item.id===itemId);if(index<0)return false;
 const item=e.inventory.splice(index,1)[0],old=e.weapon;
 setHeldWeapon(e,item);
 if(old.rarity>=4)stashWeapon(e,old);
 else if(old.profile>0)addTreasureDrop({type:'weapon',weapon:old},e.x-32,e.y+16,.6);
 if(e.isPlayer)updateHUD();return true;
}
function collectDragon(e){
 if(!e.alive||e.dragonCount>=7)return false;
 e.dragonCount++;burst(e.x,e.y,'#f5bd72',22);
 if(e.dragonCount===7){
  clearUtility(e);e.level=21;e.xp=Math.min(MAX_XP_RESERVE,e.xp);e.maxHp=100+e.level*12;e.hp=e.maxHp;keepInBounds(e);
  e.robotSummon=RobotRules.summonSeconds;robotSummonFeedback(e);
  if(e.isPlayer)announce('Long Thần Cơ Giáp · Lv21','7 ngọc rồng · Triệu hồi robot khổng lồ','TRIỆU HỒI CƠ GIÁP');
 }else if(e.isPlayer)announce('Ngọc rồng '+e.dragonCount+'/7','Tỉ lệ rương tiếp theo '+(LootRules.dragonChance(e.dragonCount)*100).toLocaleString('vi-VN')+'%','THU THẬP NGỌC RỒNG');
 return true;
}
function collectDrop(e,d){
 if(!canCollectDrop(e,d)||dist(e,d)>radius(e)+20||!drops.includes(d))return false;
 drops.splice(drops.indexOf(d),1);
 if(d.type==='dragon')return collectDragon(e);
 if(d.weapon.rarity>=4&&d.weapon.rarity<=e.weapon.rarity){stashWeapon(e,d.weapon);if(e.isPlayer)floatText(e.x,e.y-45,'+ '+LootRules.stats(d.weapon).rarityName+' vào túi',LootRules.stats(d.weapon).color)}
 else{
  const old=e.weapon;
  if(old.rarity>=4)stashWeapon(e,old);
  else if(old.profile>0)addTreasureDrop({type:'weapon',weapon:old},e.x-32,e.y+16,.6);
  setHeldWeapon(e,d.weapon);
  if(e.isPlayer)floatText(e.x,e.y-45,weaponStats(e).name+' · '+weaponStats(e).rarityName,weaponStats(e).color);
 }
 if(e.isPlayer)updateHUD();return true;
}
function pickUp(e,onlyWeapons=false){
 if(window.netGame?.active&&e===player)return false;
 const d=nearestDrop(e,false,onlyWeapons);return d?collectDrop(e,d):false;
}
function applyWeaponDamage(e,other,damage){
 if(!e.alive||!other.alive||other.invincible>0||!canAttack(e,other))return false;
 other.stealthTime=0;const absorbed=other.shieldTime>0?Math.min(other.shieldHp||0,damage):0;other.shieldHp=Math.max(0,(other.shieldHp||0)-absorbed);if(other.shieldHp===0)other.shieldTime=0;
 const taken=damage-absorbed;other.hp-=taken;other.lastDamageAt=elapsed;burst(other.x,other.y,absorbed?'#8cdfe3':'#f5d994',8);floatText(other.x,other.y-30,taken>0?'−'+taken:'HẤP THỤ '+absorbed,other.isPlayer?'#ffad8e':'#fff1b8');
 const a=Math.atan2(other.y-e.y,other.x-e.x);other.x+=Math.cos(a)*19;other.y+=Math.sin(a)*19;keepInBounds(other);
 if(other.isPlayer){shake=7;lastDamage=elapsed;tone(85,.15,'sawtooth',.04)}if(other.hp<=0)kill(other,e);return true;
}
function useWeaponSkill(e){
 if(window.netGame?.active&&e===player){window.netGame.skill();return false}
 const w=weaponStats(e);if(!e.alive||!w.skill||e.skillCooldown>0||(w.skill!=='flurry'&&e.swing>0))return false;
 if(w.skill==='heal'&&e.hp>=e.maxHp||w.skill==='stealth'&&campAt(e))return false;
 e.skillCooldown=w.skillCooldown;e.skillEffect=.6;e.skillEffectKind=w.skill;
 if(w.skillUtility){
  if(w.skill==='stealth')e.stealthTime=w.rarity===5?5:4;
  if(w.skill==='heal'){const restored=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*.25));e.hp+=restored;if(e.isPlayer)floatText(e.x,e.y-45,'+'+restored+' HP','#a4edac')}
  if(w.skill==='shield'){e.shieldTime=4;e.shieldHp=Math.floor(e.maxHp*.2)}
  if(e.isPlayer){playWeaponSkillSound(e);updateHUD()}return true;
 }
 e.stealthTime=0;
 if(w.skill==='flurry'){e.skillBuff=3;if(e.isPlayer){playWeaponSkillSound(e);updateHUD()}return true}
 e.attackKind=w.skill;e.swingDuration=w.skillDuration;e.swing=w.skillDuration;e.hitSet=new Set();
 e.attackDamage=Math.round(w.atk*(w.rarity===5?CombatRules.redSkillMultiplier:CombatRules.orangeSkillMultiplier));
 e.cooldown=Math.max(e.cooldown,1/weaponASPD(e));
 if(e.isPlayer){playWeaponSkillSound(e);updateHUD()}return true;
}
function updateTreasures(dt,actors){
 updateChestWaves();
 drops=drops.filter(d=>d.expires>elapsed);
 for(const e of actors){
  updateUtility(e,dt);
  e.skillCooldown=Math.max(0,(e.skillCooldown||0)-dt);e.skillBuff=Math.max(0,(e.skillBuff||0)-dt);e.skillEffect=Math.max(0,(e.skillEffect||0)-dt);
  if(e.alive)for(const d of drops.slice())collectDrop(e,d);
  if(e.alive&&!e.isPlayer&&!e.networkHuman){
   if(campAt(e)){const best=(e.inventory||[]).reduce((a,b)=>!a||weaponPower(b)>weaponPower(a)?b:a,null);if(best&&weaponPower(best)>weaponPower(e.weapon))equipFromBag(e,best.id)}
  }
 }
}
function playerCamp(){
 return player?.alive?campAt(window.netGame?.active?{x:player.netX??player.x,y:player.netY??player.y}:player):null;
}
function resetBagUI(){bagZone=null;bagOpen=false;bagRenderKey='';$('inventoryPanel').classList.add('hidden')}
function closeBag(){bagOpen=false;$('inventoryPanel').classList.add('hidden');$('lootButton').focus?.({preventScroll:true})}
function openBag(){if(state!=='playing'||!playerCamp())return;bagOpen=true;bagZone=playerCamp().team;bagRenderKey='';updateBagUI()}
function updateBagUI(){
 const zone=state==='playing'?playerCamp():null,panel=$('inventoryPanel');
 if(!zone){resetBagUI();return}
 if(bagZone!==zone.team){bagZone=zone.team;bagOpen=true;mouse.active=false;mouse.down=false;resetSprint()}
 panel.classList.toggle('hidden',!bagOpen||!$('modal').classList.contains('hidden'));
 if(!bagOpen)return;
 const inventory=player.inventory||[],key=JSON.stringify([zone.team,inventory,player.weapon]);
 if(key===bagRenderKey)return;bagRenderKey=key;
 $('bagTitle').textContent='TÚI BINH KHÍ · '+inventory.length+'/'+LootRules.bagSize;
 $('bagCamp').textContent='Cờ '+KINGDOMS[zone.team].name+' · Được đổi trang bị trong vòng an toàn';
 const held=weaponStats(player);$('bagEquipped').textContent='Đang cầm: '+held.name+' · '+held.rarityName+' · ATK '+held.atk+' · '+held.aspd+'/s · Cỡ ×'+held.size.toFixed(2);$('bagEquipped').style.color=held.color;
 $('bagItems').innerHTML=inventory.length?inventory.map(item=>{const w=LootRules.stats(item);return '<button class="bag-item" data-item="'+item.id+'" style="--item-color:'+w.color+'"><canvas class="bag-item-art" width="180" height="56" aria-hidden="true"></canvas><b>'+w.name+'</b><span>'+w.rarityName+' · ATK '+w.atk+' · '+w.aspd+'/s · Cỡ ×'+w.size.toFixed(2)+'</span><small>'+w.skillName+' · TRANG BỊ →</small></button>'}).join(''):'<p class="bag-empty">Túi chưa có vũ khí vàng/cam hoặc đỏ.<br>Đi sát vật phẩm để tự thu thập.</p>';
 $('bagStatus').textContent='Chọn món để trang bị tại cờ. Nhặt phẩm cao hơn tự cầm; Cam/Đỏ cũ hoặc không cao hơn giữ trong túi. Đồ thường cũ rơi xuống đất. Không đặt lại hồi chiêu. Rời vòng cờ sẽ đóng túi.';
 $('bagClose').onclick=closeBag;
 for(const button of $('bagItems').querySelectorAll('[data-item]')){
  const item=inventory.find(item=>item.id===button.dataset.item),art=button.querySelector('canvas');
  if(item&&art){const paint=art.getContext('2d'),w=LootRules.stats(item),fit=Math.min(158/(w.baseReach+10),19/(WEAPON_PROFILES[w.profile].width+3));paint.translate(8,28);paint.scale(fit,fit);paint.translate(0,-7);weapon(paint,{level:w.profile+1,rarity:w.rarity},w.baseReach-10)}
  button.onclick=()=>{
   if(!playerCamp())return;
   if(window.netGame?.active){window.netGame.equipBag(button.dataset.item);$('bagStatus').textContent='Đang gửi yêu cầu đổi vũ khí…'}
   else equipFromBag(player,button.dataset.item);
  };
 }
}
function updateLootHUD(){
 const w=weaponStats(player),d=nearestDrop(player),skill=$('skillButton');
 const worldTime=window.netGame?.active?(window.netGame.worldElapsed||0):elapsed;
 const next=(LootRules.chestWave(worldTime)+1)*LootRules.chestPeriod;
 $('chestWave').textContent='BÙ RƯƠNG SAU '+formatTime(Math.min(LootRules.chestPeriod,Math.ceil(Math.max(0,next-worldTime))));
 $('chestWave').title='Mỗi 60 giây bù rương đã phá. Lv1–5: 70/15/10/4/1%. Đợt 5/10/15… bảo đảm Lv4; 10/20/30… bảo đảm Lv5. Thiếu ô trống thì giữ chờ; ưu tiên Lv5.';
 $('weaponStats').title='Kích thước vũ khí theo phẩm: ×'+w.size.toFixed(2);$('weaponStats').textContent='ATK '+w.atk+' · ASPD '+weaponASPD(player).toFixed(2)+'/s';
 $('dragonCount').textContent='NGỌC '+player.dragonCount+'/7'+(player.level===21?' · CƠ GIÁP':'');$('dragonCount').classList.toggle('hidden',player.dragonCount===0);
 const description=d?(d.type==='dragon'?'Tự nhặt ngọc rồng':d.weapon.rarity>=4&&d.weapon.rarity<=player.weapon.rarity?'Tự cất vào túi · '+LootRules.stats(d.weapon).rarityName:'Tự trang bị · '+LootRules.stats(d.weapon).rarityName):(player.inventory?.length||0)>=LootRules.bagSize?'Túi đầy · Không bỏ Cam/Đỏ cũ để đổi đồ':'AUTO: phẩm cao hơn tự cầm · Cam/Đỏ còn lại vào túi';
 $('pickupHint').textContent=description;$('pickupHint').style.color=d?(d.type==='dragon'?'#f57d76':LootRules.stats(d.weapon).color):'#b3bea4';
 $('lootButton').disabled=!player.alive||!playerCamp();$('lootButton').textContent=(isTouch?'':'F · ')+'TÚI '+(player.inventory?.length||0)+'/'+LootRules.bagSize;
 $('lootButton').title='Vào vòng cờ để mở túi và đổi vũ khí';updateBagUI();
 const busy=w.skill!=='flurry'&&player.swing>0;
 const unavailable=w.skill==='heal'&&player.hp>=player.maxHp||w.skill==='stealth'&&!!playerCamp();
 skill.classList.toggle('hidden',!w.skill);skill.disabled=!w.skill||player.skillCooldown>0||!player.alive||busy||unavailable;
 skill.textContent=w.skill?(isTouch?'':'Q · ')+w.skillName+(player.stealthTime>0?' · ẨN '+Math.ceil(player.stealthTime)+'s':player.shieldTime>0?' · CHẮN '+Math.ceil(player.shieldHp):player.skillCooldown>0?' '+Math.ceil(player.skillCooldown)+'s':unavailable?(w.skill==='heal'?' · ĐẦY MÁU':' · NGOÀI CỜ'):busy?' · ĐỢI NHỊP':''):'CAM/ĐỎ: MỞ SKILL';
 skill.style.borderColor=w.skill?w.color:'#8d987455';skill.title=w.skill?w.skillDescription+' Hồi '+w.skillCooldown+'s.'+(w.skillUtility?' Không gây sát thương.':w.skill==='flurry'?'':' Mỗi mục tiêu tối đa một hit/skill.'):'';
}
// Cosmetic radar/beacons only. Chest positions, loot and combat stay authoritative.
const CHEST_BEACONS=Object.freeze({4:Object.freeze({color:'#d7a6ff'}),5:Object.freeze({color:'#ffda76'})});
const chestBeaconMotion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
function chestBeaconPulse(){return chestBeaconMotion ? .5+.5*Math.sin(clock*TAU/2.4) : .5}
function chestSymbolPath(paint,level,size){
 paint.beginPath();const points=level===5?10:4;
 for(let i=0;i<points;i++){const a=-Math.PI/2+i*TAU/points,r=level===5&&i%2?size*.68:size;if(i)paint.lineTo(Math.cos(a)*r,Math.sin(a)*r);else paint.moveTo(Math.cos(a)*r,Math.sin(a)*r)}paint.closePath();
}
function drawChestMapMarker(paint,chest,scale){
 const style=CHEST_BEACONS[chest.level];if(!style||!chest.alive)return;
 const x=chest.x*scale,y=chest.y*scale,pulse=chestBeaconPulse();
 paint.save();paint.translate(x,y);paint.strokeStyle=style.color;paint.globalAlpha=.25+pulse*.35;paint.lineWidth=2;paint.beginPath();paint.arc(0,0,12+pulse*3,0,TAU);paint.stroke();paint.globalAlpha=1;
 chestSymbolPath(paint,chest.level,chest.level===5?11:10.5);paint.fillStyle='#192b26';paint.fill();paint.lineWidth=2;paint.stroke();
 paint.fillStyle=style.color;paint.font='900 14px sans-serif';paint.textAlign='center';paint.textBaseline='middle';paint.fillText(String(chest.level),0,.7);paint.restore();
}
function updateChestRadar(){
 const panel=$('chestRadar'),frame=$('map').parentElement;if(!panel||!frame)return;
 const four=chests.filter(c=>c.alive&&c.level===4).length,five=chests.filter(c=>c.alive&&c.level===5).length,key=four+':'+five;
 if(panel.dataset.counts===key)return;panel.dataset.counts=key;
 $('chestRadar4').textContent='Lv4: '+four;$('chestRadar5').textContent='Lv5: '+five;
 panel.classList.toggle('hidden',!four&&!five);frame.classList.toggle('has-rare',!!(four||five));
 const label='Bản đồ nhỏ: '+four+' rương Lv4 (hình thoi tím), '+five+' rương Lv5 (ngôi sao vàng). Đi tới ký hiệu để tìm rương.';
 $('map').setAttribute('aria-label',label);frame.title=label;
}
function drawTreasure(c){
 const color=['#b8a177','#94b46d','#7eaaba','#ad85b4','#d7aa58'][c.level-1];
 ctx.save();ctx.translate(c.x,c.y);
 const beacon=CHEST_BEACONS[c.level],pulse=beacon?chestBeaconPulse():0;
 if(beacon){
  ctx.fillStyle=beacon.color+'18';ctx.beginPath();ctx.moveTo(-24,8);ctx.lineTo(-10,-112);ctx.lineTo(10,-112);ctx.lineTo(24,8);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalAlpha=.35+pulse*.25;ctx.strokeStyle=beacon.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,16,39+pulse*5,18+pulse*3,0,0,TAU);ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(0,-100-pulse*4);chestSymbolPath(ctx,c.level,11);ctx.fillStyle=beacon.color;ctx.strokeStyle='#203127';ctx.lineWidth=2;ctx.fill();ctx.stroke();ctx.restore();
 }
 ellipse(ctx,4,18,32,14,'#26392844');
 ctx.fillStyle='#59432d';ctx.fillRect(-25,-6,50,32);ctx.fillStyle=color;ctx.fillRect(-26,-20,52,22);ctx.strokeStyle='#3c382b';ctx.lineWidth=3;ctx.strokeRect(-26,-20,52,46);
 for(const x of [-18,15]){ctx.fillStyle='#d4bd79';ctx.fillRect(x,-20,4,46)}ctx.fillStyle='#ead48e';ctx.fillRect(-4,-5,8,13);
 ctx.font=(beacon?'800 13px':'600 10px')+' "Be Vietnam Pro",sans-serif';ctx.textAlign='center';const label='RƯƠNG '+(beacon?'Lv':'')+c.level;
 if(beacon){ctx.strokeStyle='#172a21';ctx.lineWidth=4;ctx.strokeText(label,0,-35)}ctx.fillStyle=beacon?beacon.color:'#fff0cc';ctx.fillText(label,0,beacon?-35:-31);
 ctx.fillStyle='#24362c';ctx.fillRect(-26,32,52,4);ctx.fillStyle=color;ctx.fillRect(-26,32,52*c.hp/c.maxHp,4);ctx.restore();
}
function drawTreasureDrop(d){
 ctx.save();ctx.translate(d.x,d.y);const dragon=d.type==='dragon',w=dragon?null:LootRules.stats(d.weapon),color=dragon?'#f57d76':w.color;
 ctx.globalAlpha=.2;ellipse(ctx,0,5,24,14,color);ctx.globalAlpha=1;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,5,23,13,0,0,TAU);ctx.stroke();
 if(dragon){ellipse(ctx,0,-5,12,12,'#edb65b');ellipse(ctx,-4,-9,4,3,'#ffe4ac');ctx.fillStyle='#a63f30';ctx.font='14px serif';ctx.textAlign='center';ctx.fillText('★',0,0)}
 else{ctx.save();ctx.translate(-18,-8+Math.sin(clock*3)*2);ctx.scale(.46*w.size,.46*w.size);weapon(ctx,{level:w.profile+1},55);ctx.restore()}
 ctx.font='9px "Be Vietnam Pro",sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(dragon?'NGỌC RỒNG':w.rarityName,0,29);ctx.restore();
}
