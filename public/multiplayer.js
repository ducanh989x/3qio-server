'use strict';
// Display-only interpolation. Never used by hits, resources, costs or camp checks.
function onlineClock(current,target,latest,dt){if(current===null||Math.abs(target-current)>.3)return target;return clamp(current+dt*clamp(1+(target-current-dt)*6,.7,1.3),latest-.2,latest+.08)}
function onlinePosition(e,time,delay){
 const samples=e.netSamples||[];if(samples.length<2)return null;const t=time-delay;
 for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i];if(t<=b.t){const f=clamp((t-a.t)/Math.max(.001,b.t-a.t),0,1);return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}}}
 const last=samples[samples.length-1],ahead=clamp(t-last.t,0,.08);return {x:last.x+(e.netVX||0)*ahead,y:last.y+(e.netVY||0)*ahead};
}
(() => {
 const status=$('lobbyStatus'),start=$('startButton'),roomInput=$('roomCode');
 let mode='online',matchmaking='auto',discovering=true,modeTouched=false,endpoint='',socket=null,id=null,started=false,entities=new Map(),lastSend=0,lastPing=0,lastStateAt=0,ping=0,timeout=null,attackPulse=false,dashPulse=false,pickupPulse=false,skillPulse=false,latest=null,inputDirty=true,lastInputKey='',wireFields=null,arrivalJitter=0,remoteDelay=.06,remoteClock=null;
 const net=window.netGame={active:false,mode:()=>mode,room:'',humans:0,
  inputChanged(){inputDirty=true},
  stopInput(){if(started&&socket?.readyState===WebSocket.OPEN){lastInputKey=JSON.stringify({type:'input',x:0,y:0,angle:player.angle,attack:false,dash:false,pickup:false,skill:false,sprint:false});socket.send(lastInputKey);lastSend=performance.now()}inputDirty=false;attackPulse=dashPulse=pickupPulse=skillPulse=false},
  equipBag(itemId){if(started&&socket?.readyState===WebSocket.OPEN&&player.alive)socket.send(JSON.stringify({type:'equip',itemId}))},
  attackOnce(){if(!paused&&player.alive){attackPulse=true;inputDirty=true}},
  dash(){if(!paused&&player.alive){dashPulse=true;inputDirty=true}},
  pickup(){if(!paused&&player.alive){pickupPulse=true;inputDirty=true}},skill(){if(!paused&&player.alive){skillPulse=true;inputDirty=true}},
  leave(reason=''){
   clearControls();clearTimeout(timeout);const old=socket;socket=null;if(old){old.onclose=null;old.close()}
   net.active=false;started=false;entities.clear();latest=null;attackPulse=false;dashPulse=false;pickupPulse=false;skillPulse=false;
   finishMatch(reason);$('netBar').classList.add('hidden');
   start.disabled=false;start.textContent=startLabel();status.textContent=reason;
   document.querySelector('.top-center small').textContent='Đấu luyện với bot';$('pause').title='Tạm dừng';
  },
  menu(){
   if(state!=='playing'&&state!=='dead')return;
   if(!$('modal').classList.contains('hidden')){closeModal();return}
   if(!player.alive){deathMenu();return}
   showPauseMenu();
  },
  async invite(){
   const text='Chơi 3Q.io cùng mình! Chọn ONLINE, nhập mã phòng '+net.room+'. '+location.origin+location.pathname+'?room='+encodeURIComponent(net.room);
   try{if(window.bash?.share){await window.bash.ready;const result=await window.bash.share({text});if(result.shared){if($('pauseInviteStatus'))$('pauseInviteStatus').textContent='Đã đưa lời mời vào nháp chat.';return}}
    await navigator.clipboard.writeText(net.room);($('pauseInviteStatus')||$('netCounts')).textContent='Đã chép mã '+net.room;return;
   }catch{}
   openModal('<h2>Mời bạn vào phòng</h2><p>Cùng mở game, chọn ONLINE và nhập mã bên dưới. Phòng công khai; mã không phải mật khẩu.</p><input id="inviteCode" readonly value="'+net.room+'" aria-label="Mã phòng"><button class="primary" id="closeInvite">TIẾP TỤC →</button><p>Trận online vẫn diễn ra trong lúc mở menu.</p>');
   $('inviteCode').select();$('closeInvite').onclick=closeModal;
  },
  update(dt){
   clock+=dt;if(!started)return;
   const intent=movementIntent(),age=Math.max(0,Math.min(.1,(performance.now()-lastStateAt)/1000));
   remoteClock=onlineClock(remoteClock,(latest?.elapsed||0)+age-remoteDelay,latest?.elapsed||0,dt);
   for(const e of entities.values()){
    let tx=e.netX+(e.netVX||0)*Math.min(age,.08),ty=e.netY+(e.netVY||0)*Math.min(age,.08);
    if(e!==player){const p=onlinePosition(e,remoteClock,0);if(p){tx=p.x;ty=p.y}}
    if(e===player&&e.alive&&!paused&&!document.hidden){const base=(188-e.level*2.2)*(e.trailDash?2.9:intent.sprint&&e.xp>0?SPRINT_SPEED:1);tx=e.netX+intent.x*base*Math.min(.1,age+.025);ty=e.netY+intent.y*base*Math.min(.1,age+.025);if(e.swing<=0&&e.clashEffect<=0)e.angle=intent.angle}
    if(!e.alive||paused&&e===player){tx=e.netX;ty=e.netY}
    const inset=radius(e)+8;tx=clamp(tx,inset,WORLD-inset);ty=clamp(ty,inset,WORLD-inset);
    const distance=Math.hypot(tx-e.x,ty-e.y),alpha=distance>250?1:1-Math.exp(-dt*(e===player?35:48));
    e.x+=(tx-e.x)*alpha;e.y+=(ty-e.y)*alpha;
    if(e!==player){if(e.swing>0||e.clashEffect>0)e.angle=e.netAngle;else e.angle+=angleDiff(e.netAngle,e.angle)*(1-Math.exp(-dt*18))}
    updateUtility(e,dt);e.swing=Math.max(0,e.swing-dt);e.skillCooldown=Math.max(0,(e.skillCooldown||0)-dt);e.skillBuff=Math.max(0,(e.skillBuff||0)-dt);e.skillEffect=Math.max(0,(e.skillEffect||0)-dt);e.clashEffect=Math.max(0,(e.clashEffect||0)-dt);e.robotSummon=Math.max(0,(e.robotSummon||0)-dt);
   }
   const now=performance.now();
   if(now-lastStateAt>12000){net.leave('Không nhận được trạng thái máy chủ. Hãy vào lại phòng; lượt chơi sẽ bắt đầu lại.');return}
   const urgent=inputDirty&&(attackPulse||dashPulse||pickupPulse||skillPulse);
   if(socket?.readyState===WebSocket.OPEN&&now-lastSend>=(urgent?16:33)&&socket.bufferedAmount<4096){
    const enabled=!paused&&player.alive&&!document.hidden,{x,y,angle}=enabled?intent:{x:0,y:0,angle:player.angle};
    const raw=JSON.stringify({type:'input',x,y,angle,attack:enabled&&!!(mouse.down||keys[' ']||attackPulse),dash:enabled&&dashPulse,pickup:enabled&&pickupPulse,skill:enabled&&skillPulse,sprint:enabled&&!!(mouse.sprint||touch.sprint)});
    if(urgent||raw!==lastInputKey||now-lastSend>=100){socket.send(raw);lastInputKey=raw;attackPulse=false;dashPulse=false;pickupPulse=false;skillPulse=false;inputDirty=false;lastSend=now;}
    if(now-lastPing>3000){lastPing=now;socket.send(JSON.stringify({type:'ping',t:now}))}
   }
   elapsed=Math.max(0,(latest?.elapsed||0)-(player.spawnAt||0));killCount=player.kills;
   for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
   for(const t of texts){t.y-=dt*32;t.life-=dt}texts=texts.filter(t=>t.life>0);
   followCamera(dt);shake=Math.max(0,shake-dt*20);
   if(announcementTime>0){announcementTime-=dt;if(announcementTime<=0)$('announcement').classList.remove('show')}
   uiTick+=dt;if(uiTick>.1){uiTick=0;updateHUD();const counts=net.humans+' người · '+(latest?.bots||0)+' bot · '+ping+' ms';if($('netCounts').textContent!==counts)$('netCounts').textContent=counts;
    const restart=$('restart');if(restart&&!player.alive){const wait=Math.ceil(player.respawn||0);restart.disabled=wait>0;restart.textContent=wait?'HỒI SINH SAU '+wait+'s':'TÁI XUẤT GIANG HỒ →'}
   }
  }
 };
 function startLabel(){return mode==='online'?(matchmaking==='auto'?'CHƠI ONLINE →':'VÀO PHÒNG →'):'CHƠI VỚI BOT →'}
 function chooseMatch(value){
  matchmaking=value;for(const [button,m] of [[$('matchAuto'),'auto'],[$('matchCode'),'code']])button.setAttribute('aria-pressed',String(m===value));
  $('roomFields').classList.toggle('hidden',value!=='code');start.textContent=startLabel();
 }
 function chooseMode(value){mode=value;for(const [button,m] of [[$('modeSolo'),'solo'],[$('modeOnline'),'online']]){button.setAttribute('aria-pressed',String(m===mode))}
  $('onlineFields').classList.toggle('hidden',mode!=='online');chooseMatch(matchmaking);start.disabled=mode==='online'&&discovering;
  $('modeNote').textContent=mode==='online'?'Không cần tài khoản · 16 người/phòng · Tiến độ theo lượt':'Chơi đơn · 24 đối thủ bot · Không cần kết nối máy chủ';
 }
 function deathMenu(){
  showDeath({name:player.killerName||'Đối thủ'});
  const button=$('restart');button.disabled=(player.respawn||0)>0;
  button.onclick=()=>{if(socket?.readyState===WebSocket.OPEN){socket.send(JSON.stringify({type:'respawn'}));button.disabled=true}};
 }
 function snapshot(message){
  if(latest&&message.elapsed<=latest.elapsed)return;
  if(message.actorRows){if(!wireFields||!Array.isArray(message.actorRows)||message.actorRows.length>64)return;const decoded=[];for(const row of message.actorRows){if(!Array.isArray(row)||row.length!==wireFields.length)return;const out=Object.create(null);for(let i=0;i<wireFields.length;i++)out[wireFields[i]]=row[i];decoded.push(out)}message.actors=decoded}
  if(!Array.isArray(message.actors))return;
  const arrival=performance.now(),step=latest?message.elapsed-latest.elapsed:0;
  if(started&&step>0&&step<.3){arrivalJitter=arrivalJitter*.9+Math.abs((arrival-lastStateAt)/1000-step)*.1;remoteDelay=clamp(.06+arrivalJitter*2,.06,.1)}
  if(step>.3)remoteClock=null;
  lastStateAt=arrival;
  const before=started?{alive:player.alive,level:player.level,team:player.team}:null;
  const present=new Set(),clashPoints=new Set();
  for(const data of message.actors){
   present.add(data.id);let e=entities.get(data.id);const isNew=!e;
   if(!e){e=entity(data.x,data.y,data.level,data.name,data.id===id);entities.set(data.id,e)}
   const x=e.x,y=e.y,oldAngle=e.angle,oldHp=e.hp,wasAlive=e.alive,oldClash=e.clashSeq||0,oldSkillCooldown=e.skillCooldown||0;
   // Infer a short dash from authoritative snapshot displacement. No new server
   // field/protocol or physics rule is needed, including on an existing server.
   const serverDt=latest?message.elapsed-latest.elapsed:0;
   const serverDistance=e.netX===undefined?0:Math.hypot(data.x-e.netX,data.y-e.netY);
   e.trailDash=wasAlive&&data.alive&&data.clashSeq===oldClash&&!data.sprinting&&data.hp>=oldHp&&serverDt>0&&serverDt<.5&&serverDistance<140&&serverDistance/serverDt>(188-data.level*2.2)*2.15;
   const vx=serverDt>0&&serverDt<.3?(data.x-e.netX)/serverDt:0,vy=serverDt>0&&serverDt<.3?(data.y-e.netY)/serverDt:0,maxVelocity=(188-data.level*2.2)*2.9*1.1;
   const discontinuity=isNew||!started||!wasAlive||data.alive!==wasAlive||data.clashSeq!==oldClash||Math.hypot(data.x-x,data.y-y)>250;
   Object.assign(e,data);e.isPlayer=data.id===id;e.netX=data.x;e.netY=data.y;e.netAngle=data.angle;e.angle=discontinuity||data.swing>0?data.angle:oldAngle;
   if(started&&e.isPlayer&&data.skillCooldown>oldSkillCooldown+.5)playWeaponSkillSound(e);
   if(discontinuity||serverDt<=0||serverDt>.3)e.netSamples=[];
   e.netSamples??=[];e.netSamples.push({t:message.elapsed,x:data.x,y:data.y});if(e.netSamples.length>4)e.netSamples.shift();
   const validVelocity=!discontinuity&&Math.hypot(vx,vy)<=maxVelocity;e.netVX=validVelocity?vx:0;e.netVY=validVelocity?vy:0;e.x=discontinuity?data.x:x;e.y=discontinuity?data.y:y;
   if(started&&e.clashSeq!==oldClash&&e.clashEffect>0){const key=e.clashX+':'+e.clashY;if(!clashPoints.has(key)){clashPoints.add(key);burst(e.clashX,e.clashY,'#fff0b2',14);floatText(e.clashX,e.clashY-15,'CHẶN!','#fff0b2')}if(e.isPlayer)tone(820,.08,'triangle',.045)}
   if(started&&e.hp<oldHp&&e.alive){burst(e.x,e.y,'#f5d994',8);floatText(e.x,e.y-30,'−'+Math.round(oldHp-e.hp),e.isPlayer?'#ffad8e':'#fff1b8');if(e.isPlayer)shake=6}
   if(started&&wasAlive&&!e.alive){burst(e.x,e.y,HEROES[e.level-1].color,24);if(e.killerName)feed(e.killerName+' ⚔ '+e.name);if(e.droppedXp>0)floatText(e.x,e.y-74,'EXP RƠI: '+e.droppedXp+' KN','#f5cf78');if(e.killerId===id&&e.bountyXp>0){floatText(e.x,e.y-50,'HẠ GỤC +'+e.bountyXp+' KN');shake=7;tone(100,.22,'triangle',.08)}}
  }
  for(const key of entities.keys())if(!present.has(key))entities.delete(key);
  const own=entities.get(id);if(!own)return;player=own;bots=[...entities.values()].filter(e=>e.id!==id);
  if(message.orbs)orbs=message.orbs.map(o=>({x:o[0],y:o[1],value:o[2],phase:o[3],pickupAt:o[4]||0}));
  if(message.chests)chests=message.chests;if(message.drops)drops=message.drops;
  if(message.inventory)player.inventory=message.inventory;
  latest=message;net.humans=message.humans;net.worldElapsed=message.elapsed;
  if(!started){
   started=true;clearTimeout(timeout);window.speedTrails?.clear();particles=[];texts=[];camera={x:player.x,y:player.y};
   $('startScreen').classList.add('hidden');$('modal').classList.add('hidden');paused=false;state='playing';
   document.body.classList.add('online','in-match');$('netBar').classList.remove('hidden');$('netRoom').textContent='PHÒNG '+net.room;
   document.querySelector('.top-center small').textContent='Multiplayer · Máy chủ quyết định trận đấu';$('pause').title='Menu (trận online không tạm dừng)';
   start.disabled=false;announce('Đã vào phòng','Mã '+net.room+' · Người chơi thật và bot','MULTIPLAYER');
  }
  if(before?.alive&&!player.alive){state='dead';mouse.down=false;deathMenu()}
  if(before&&!before.alive&&player.alive){state='playing';closeModal();camera={x:player.netX,y:player.netY};announce('Tái xuất','Bảo hộ xuất trận 4 giây')}
  if(before&&player.level>before.level){burst(player.x,player.y,'#ffe6a2',25);shake=4;if(player.level===21)robotSummonFeedback(player);announce(HEROES[player.level-1].name,player.level===21?'7 ngọc rồng · Triệu hồi robot khổng lồ':'Tăng sinh lực, kích thước · Giữ nguyên trang bị');tone(640,.3,'triangle',.05)}
  if(before&&player.team!==before.team&&player.team!=='neutral'){announce(teamOf(player).name,'Đồng quốc gia không gây sát thương cho nhau','GIA NHẬP TRẬN DOANH')}
  if(!before||before.alive!==player.alive||before.level!==player.level||before.team!==player.team)updateHUD();
 }
 async function connect(){
  if(net.active)return;
  const automatic=matchmaking==='auto',room=automatic?'':roomInput.value.trim().toUpperCase();if(!automatic&&!/^[A-Z0-9-]{1,18}$/.test(room)){status.textContent='Mã phòng: 1–18 ký tự A–Z, 0–9 hoặc dấu gạch ngang.';return}
  if(!endpoint){status.textContent='Chưa có máy chủ online ở địa chỉ này. Bản itch.io cần cấu hình multiplayer-config.js; chế độ BOT vẫn chơi được.';return}
  start.disabled=true;start.textContent=automatic?'ĐANG GHÉP PHÒNG…':'ĐANG KẾT NỐI…';status.textContent=automatic?'Đang tìm phòng còn chỗ…':'Đang vào phòng '+room+'…';
  resetBagUI();net.active=true;net.room=room;id=null;started=false;entities.clear();lastSend=0;lastPing=0;lastInputKey='';wireFields=null;arrivalJitter=0;remoteDelay=.06;remoteClock=null;
  let ws;try{ws=new WebSocket(endpoint)}catch{net.leave('Không mở được kết nối. Máy chủ online phải dùng WSS khi trang game chạy HTTPS.');return}
  socket=ws;timeout=setTimeout(()=>net.leave('Không kết nối được máy chủ. Hãy thử lại hoặc chọn chế độ BOT.'),9000);
  ws.onopen=()=>{if(socket===ws)ws.send(JSON.stringify({type:'join',rulesVersion:11,transport:'rows-v1',...(automatic?{matchmaking:'auto'}:{room}),name:$('nickname').value.trim()||'Lữ khách'}))};
  ws.onmessage=event=>{
   if(socket!==ws)return;let message;try{message=JSON.parse(event.data)}catch{return}
   if(message.type==='welcome'){if(message.rulesVersion!==11){net.leave('Máy chủ đang dùng luật cũ. Cần cập nhật cả game và máy chủ lên v2.17.0 (EXP Lv10–20, vũ khí mới và gà cao su).');return}if(message.transport==='rows-v1'&&Array.isArray(message.actorFields)&&message.actorFields.length<=64&&message.actorFields.every(k=>typeof k==='string'&&/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)&&!['constructor','prototype'].includes(k)))wireFields=message.actorFields;id=message.id;net.room=message.room;try{const url=new URL(location.href);if(automatic)url.searchParams.delete('room');else url.searchParams.set('room',net.room);history.replaceState(null,'',url.pathname+url.search+url.hash)}catch{}}
   else if(message.type==='state')snapshot(message);
   else if(message.type==='pong')ping=Math.max(0,Math.round(performance.now()-message.t));
   else if(message.type==='bagResult')$('bagStatus').textContent=message.message;
   else if(message.type==='error')net.leave((message.message?.startsWith('Khác phiên bản gameplay')||message.message?.startsWith('Khác luật'))?'Khác luật EXP/vũ khí. Hãy cập nhật cả game và máy chủ lên v2.17.0 (protocol11).':message.message);
  };
  ws.onclose=()=>{if(socket===ws)net.leave('Mất kết nối với phòng. Bấm chơi để thử lại; lượt chơi sẽ bắt đầu lại.')};
  ws.onerror=()=>{if(socket===ws)status.textContent='Kết nối online bị lỗi. Đang chờ máy chủ…'};
 }
 function selectMode(value){if(net.active)net.leave();modeTouched=true;chooseMode(value)}
 $('modeSolo').onclick=()=>selectMode('solo');$('modeOnline').onclick=()=>selectMode('online');
 $('matchAuto').onclick=()=>{if(net.active)net.leave();chooseMatch('auto')};$('matchCode').onclick=()=>{if(net.active)net.leave();chooseMatch('code')};
 $('newRoom').onclick=()=>{modeTouched=true;roomInput.value='Q-'+Math.random().toString(36).slice(2,8).toUpperCase();chooseMatch('code');chooseMode('online')};
 $('netInvite').onclick=()=>net.invite();$('netLeave').onclick=()=>net.leave('Đã rời phòng. Tiến độ lượt chơi không được lưu.');
 const soloStart=startGame;
 start.onclick=()=>{modeTouched=true;if(mode==='online')connect();else{if(net.active)net.leave();soloStart()}};
 // Enter in a lobby input follows the selected mode instead of bypassing online.
 $('nickname').addEventListener('keydown',event=>{if(event.key==='Enter'){event.stopPropagation();start.click()}});
 roomInput.addEventListener('keydown',event=>{if(event.key==='Enter'){event.stopPropagation();start.click()}});
 const queryRoom=new URLSearchParams(location.search).get('room');if(queryRoom&&/^[A-Za-z0-9-]{1,18}$/.test(queryRoom)){roomInput.value=queryRoom.toUpperCase();matchmaking='code'}
 chooseMode('online');status.textContent='Đang kiểm tra máy chủ…';
 (async()=>{
  try{
   if(window.MULTIPLAYER_SERVER_URL){endpoint=window.MULTIPLAYER_SERVER_URL.replace(/^http/,'ws');status.textContent='Máy chủ online đã cấu hình.';return}
   const response=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(2500)});const info=await response.json();
   if(info.game==='3qio'&&info.multiplayer){endpoint=location.origin.replace(/^http/,'ws')+'/ws';status.textContent='Máy chủ sẵn sàng · Bấm chơi để tự ghép phòng.'}
   else status.textContent='Không có máy chủ online ở đây. Bạn vẫn có thể chọn BOT để chơi.';
  }catch{status.textContent='Chưa kết nối được máy chủ. Bạn vẫn có thể chọn BOT để chơi.'}
  finally{discovering=false;if(!modeTouched)chooseMode('online');else if(!net.active)chooseMode(mode)}
 })();
})();
