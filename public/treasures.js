'use strict';
let chests=[],drops=[],treasureSerial=0,treasureWave=0,treasureOwed4=0,treasureOwed5=0;
let bagZone=null,bagOpen=false,bagRenderKey='';
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
 if(!e.alive||d.expires<=elapsed||(!window.netGame?.active&&d.pickAfter>elapsed))return false;
 if(d.type==='dragon')return e.dragonCount<7;
 if(d.type!=='weapon')return false;
 if(d.weapon.rarity>=4)return (e.inventory?.length||0)<LootRules.bagSize;
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
 e.weapon=LootRules.makeWeapon(item.profile,item.rarity);e.skillBuff=0;e.skillEffect=0;e.swing=0;e.hitSet=new Set();
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
  e.level=21;e.xp=Math.min(MAX_XP_RESERVE,e.xp);e.maxHp=100+e.level*12;e.hp=e.maxHp;keepInBounds(e);
  e.robotSummon=RobotRules.summonSeconds;robotSummonFeedback(e);
  if(e.isPlayer)announce('Long Thần Cơ Giáp · Lv21','7 ngọc rồng · Triệu hồi robot khổng lồ','TRIỆU HỒI CƠ GIÁP');
 }else if(e.isPlayer)announce('Ngọc rồng '+e.dragonCount+'/7','Tỉ lệ rương tiếp theo '+(LootRules.dragonChance(e.dragonCount)*100).toLocaleString('vi-VN')+'%','THU THẬP NGỌC RỒNG');
 return true;
}
function collectDrop(e,d){
 if(!canCollectDrop(e,d)||dist(e,d)>radius(e)+20||!drops.includes(d))return false;
 drops.splice(drops.indexOf(d),1);
 if(d.type==='dragon')return collectDragon(e);
 if(d.weapon.rarity>=4){stashWeapon(e,d.weapon);if(e.isPlayer)floatText(e.x,e.y-45,'+ '+LootRules.stats(d.weapon).rarityName+' vào túi',LootRules.stats(d.weapon).color)}
 else{const old=e.weapon;setHeldWeapon(e,d.weapon);if(old.profile>0)addTreasureDrop({type:'weapon',weapon:old},e.x-32,e.y+16,.6);if(e.isPlayer)floatText(e.x,e.y-45,weaponStats(e).name+' · '+weaponStats(e).rarityName,weaponStats(e).color)}
 if(e.isPlayer)updateHUD();return true;
}
function pickUp(e,onlyWeapons=false){
 if(window.netGame?.active&&e===player)return false;
 const d=nearestDrop(e,false,onlyWeapons);return d?collectDrop(e,d):false;
}
function applyWeaponDamage(e,other,damage){
 if(!e.alive||!other.alive||other.invincible>0||!canAttack(e,other))return false;
 other.hp-=damage;other.lastDamageAt=elapsed;burst(other.x,other.y,'#f5d994',8);floatText(other.x,other.y-30,'−'+damage,other.isPlayer?'#ffad8e':'#fff1b8');
 const a=Math.atan2(other.y-e.y,other.x-e.x);other.x+=Math.cos(a)*19;other.y+=Math.sin(a)*19;keepInBounds(other);
 if(other.isPlayer){shake=7;lastDamage=elapsed;tone(85,.15,'sawtooth',.04)}if(other.hp<=0)kill(other,e);return true;
}
function useWeaponSkill(e){
 if(window.netGame?.active&&e===player){window.netGame.skill();return false}
 const w=weaponStats(e);if(!e.alive||!w.skill||e.skillCooldown>0||(w.skill!=='flurry'&&e.swing>0))return false;
 e.skillCooldown=w.skillCooldown;e.skillEffect=.5;e.skillEffectKind=w.skill;
 if(w.skill==='flurry'){e.skillBuff=3;if(e.isPlayer)updateHUD();return true}
 e.attackKind=w.skill;e.swingDuration=.32;e.swing=.32;e.hitSet=new Set();
 e.attackDamage=Math.round(w.atk*(w.rarity===5?CombatRules.redSkillMultiplier:CombatRules.orangeSkillMultiplier));
 e.cooldown=Math.max(e.cooldown,1/weaponASPD(e));
 if(e.isPlayer)updateHUD();return true;
}
function updateTreasures(dt,actors){
 updateChestWaves();
 drops=drops.filter(d=>d.expires>elapsed);
 for(const e of actors){
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
 $('bagItems').innerHTML=inventory.length?inventory.map(item=>{const w=LootRules.stats(item);return '<button class="bag-item" data-item="'+item.id+'" style="--item-color:'+w.color+'"><b>'+w.name+'</b><span>'+w.rarityName+' · ATK '+w.atk+' · '+w.aspd+'/s · Cỡ ×'+w.size.toFixed(2)+'</span><small>'+w.skillName+' · TRANG BỊ →</small></button>'}).join(''):'<p class="bag-empty">Túi chưa có vũ khí vàng/cam hoặc đỏ.<br>Đi sát vật phẩm để tự thu thập.</p>';
 $('bagStatus').textContent='Chọn món để trang bị. Đồ vàng/đỏ đang cầm trở về túi; đồ thường rơi xuống đất. Không đặt lại hồi chiêu. Rời vòng cờ sẽ đóng túi.';
 $('bagClose').onclick=closeBag;
 for(const button of $('bagItems').querySelectorAll('[data-item]'))button.onclick=()=>{
  if(!playerCamp())return;
  if(window.netGame?.active){window.netGame.equipBag(button.dataset.item);$('bagStatus').textContent='Đang gửi yêu cầu đổi vũ khí…'}
  else equipFromBag(player,button.dataset.item);
 };
}
function updateLootHUD(){
 const w=weaponStats(player),d=nearestDrop(player),skill=$('skillButton');
 const worldTime=window.netGame?.active?(window.netGame.worldElapsed||0):elapsed;
 const next=(LootRules.chestWave(worldTime)+1)*LootRules.chestPeriod;
 $('chestWave').textContent='RƯƠNG '+chests.filter(c=>c.alive).length+'/'+LootRules.maxChests+' · BÙ SAU '+formatTime(Math.min(LootRules.chestPeriod,Math.ceil(Math.max(0,next-worldTime))));
 $('chestWave').title='Mỗi 60 giây bù rương đã phá. Lv1–5: 70/15/10/4/1%. Đợt 5/10/15… bảo đảm Lv4; 10/20/30… bảo đảm Lv5. Thiếu ô trống thì giữ chờ; ưu tiên Lv5.';
 $('weaponStats').title='Kích thước vũ khí theo phẩm: ×'+w.size.toFixed(2);$('weaponStats').textContent='ATK '+w.atk+' · ASPD '+weaponASPD(player).toFixed(2)+'/s';
 $('dragonCount').textContent='NGỌC RỒNG '+player.dragonCount+'/7'+(player.level===21?' · LV21 ĐÃ MỞ':' · RƠI '+(LootRules.dragonChance(player.dragonCount)*100).toLocaleString('vi-VN')+'%');
 const description=(player.inventory?.length||0)>=LootRules.bagSize?'Túi đầy · Vàng/đỏ giữ trên đất':d?(d.type==='dragon'?'Tự nhặt ngọc rồng':d.weapon.rarity>=4?'Tự cất vào túi · '+LootRules.stats(d.weapon).rarityName:'Tự trang bị · '+LootRules.stats(d.weapon).rarityName):'AUTO: phẩm cao hơn · Vàng/đỏ vào túi';
 $('pickupHint').textContent=description;$('pickupHint').style.color=d?(d.type==='dragon'?'#f57d76':LootRules.stats(d.weapon).color):'#b3bea4';
 $('lootButton').disabled=!player.alive||!playerCamp();$('lootButton').textContent=(isTouch?'':'F · ')+'TÚI '+(player.inventory?.length||0)+'/'+LootRules.bagSize;
 $('lootButton').title='Vào vòng cờ để mở túi và đổi vũ khí';updateBagUI();
 const busy=w.skill!=='flurry'&&player.swing>0;
 skill.disabled=!w.skill||player.skillCooldown>0||!player.alive||busy;
 skill.textContent=w.skill?(isTouch?'':'Q · ')+w.skillName+(player.skillCooldown>0?' '+Math.ceil(player.skillCooldown)+'s':busy?' · ĐỢI NHỊP':''):'CAM/ĐỎ: MỞ SKILL';
 skill.style.borderColor=w.skill?w.color:'#8d987455';
}
function drawTreasure(c){
 const color=['#b8a177','#94b46d','#7eaaba','#ad85b4','#d7aa58'][c.level-1];
 ctx.save();ctx.translate(c.x,c.y);ellipse(ctx,4,18,32,14,'#26392844');
 ctx.fillStyle='#59432d';ctx.fillRect(-25,-6,50,32);ctx.fillStyle=color;ctx.fillRect(-26,-20,52,22);ctx.strokeStyle='#3c382b';ctx.lineWidth=3;ctx.strokeRect(-26,-20,52,46);
 for(const x of [-18,15]){ctx.fillStyle='#d4bd79';ctx.fillRect(x,-20,4,46)}ctx.fillStyle='#ead48e';ctx.fillRect(-4,-5,8,13);
 ctx.font='600 10px "Be Vietnam Pro",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff0cc';ctx.fillText('RƯƠNG '+c.level,0,-31);
 ctx.fillStyle='#24362c';ctx.fillRect(-26,32,52,4);ctx.fillStyle=color;ctx.fillRect(-26,32,52*c.hp/c.maxHp,4);ctx.restore();
}
function drawTreasureDrop(d){
 ctx.save();ctx.translate(d.x,d.y);const dragon=d.type==='dragon',w=dragon?null:LootRules.stats(d.weapon),color=dragon?'#f57d76':w.color;
 ctx.globalAlpha=.2;ellipse(ctx,0,5,24,14,color);ctx.globalAlpha=1;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,5,23,13,0,0,TAU);ctx.stroke();
 if(dragon){ellipse(ctx,0,-5,12,12,'#edb65b');ellipse(ctx,-4,-9,4,3,'#ffe4ac');ctx.fillStyle='#a63f30';ctx.font='14px serif';ctx.textAlign='center';ctx.fillText('★',0,0)}
 else{ctx.save();ctx.translate(-18,-8+Math.sin(clock*3)*2);ctx.scale(.46*w.size,.46*w.size);weapon(ctx,{level:w.profile+1},55);ctx.restore()}
 ctx.font='9px "Be Vietnam Pro",sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(dragon?'NGỌC RỒNG':w.rarityName,0,29);ctx.restore();
}
