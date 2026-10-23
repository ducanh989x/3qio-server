'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
const {createWorld}=require('./world.cjs');
const MAX_PLAYERS=16,MAX_ROOMS=8,STEP=1/30;
const actorFields=['id','name','x','y','level','team','joinTime','joinTarget','hp','maxHp','xp','totalXp','stamina','swing','angle','phase','cooldown','moving','kills','alive','invincible','networkHuman','respawn','spawnAt','killerName','killerId','bountyXp','droppedXp','sprinting','weapon','dragonCount','robotSummon','skillCooldown','skillBuff','skillEffect','stealthTime','shieldTime','shieldHp','skillEffectKind','swingDuration','attackKind','clashSeq','clashEffect','clashX','clashY','clashAngle','clashExtension'];
const zeroInput=()=>({x:0,y:0,angle:0,attack:false,dash:false,sprint:false,pickup:false,skill:false});
function sanitizeInput(message){return {x:Number.isFinite(message.x)?Math.max(-1,Math.min(1,message.x)):0,y:Number.isFinite(message.y)?Math.max(-1,Math.min(1,message.y)):0,angle:Number.isFinite(message.angle)?Math.atan2(Math.sin(message.angle),Math.cos(message.angle)):0,attack:message.attack===true,dash:message.dash===true,sprint:message.sprint===true,pickup:message.pickup===true,skill:message.skill===true}}
function createServer({port=Number(process.env.PORT)||3002,botCount=null}={}){
 const rooms=new Map(),adaptiveBots=botCount===null;
 const balanceBots=room=>{if(adaptiveBots)room.world.setBotCount(24-room.clients.size)};
 const stage=path.join(__dirname,'../../tam-quoc-export/game');
 const localPublic=path.join(__dirname,'../public');
 const publicRoot=process.env.STATIC_ROOT?path.resolve(process.env.STATIC_ROOT):(fs.existsSync(path.join(localPublic,'index.html'))?localPublic:fs.existsSync(path.join(stage,'multiplayer.js'))?stage:path.join(__dirname,'..'));
 const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.ttf':'font/ttf','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
 const publicFiles=new Set(['index.html','game.js','weapons.js','kingdoms.js','style.css','kingdoms.css','multiplayer.js','multiplayer.css','multiplayer-config.js','loot.js','treasures.js','combat.js','robot.js','ai.js','chibi.js','loot.css','fonts.css','tutorial.js','tutorial.css','standings.js','standings.css','README-ITCH-IO.txt','HUONG-DAN-MULTIPLAYER.txt']);
 const server=http.createServer((req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch{res.writeHead(400).end();return}
  if(pathname==='/api/status'){
   res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Cache-Control','no-store');
   res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({game:'3qio',version:'2.20.0',rulesVersion:11,multiplayer:true,matchmaking:true,rooms:rooms.size,maxPlayers:MAX_PLAYERS,maxRooms:MAX_ROOMS,botMode:adaptiveBots?'fill24':'fixed',populationTarget:adaptiveBots?24:null}));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
  const name=pathname==='/'?'index.html':pathname.slice(1);
  if(!publicFiles.has(name)&&!/^fonts\/[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404).end('Not found');return}
  const file=path.resolve(publicRoot,name);
  if(!file.startsWith(publicRoot+path.sep)){res.writeHead(403).end();return}
  fs.stat(file,(err,stat)=>{
   if(err||!stat.isFile()){res.writeHead(404).end('Not found');return}
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':name.startsWith('fonts/')?'public, max-age=86400':'no-store'});
   if(req.method==='HEAD')res.end();else fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  });
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:2048,perMessageDeflate:false});
 server.on('upgrade',(req,socket,head)=>{
  if(req.url!=='/ws'||wss.clients.size>=MAX_ROOMS*MAX_PLAYERS+16){socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
 });
 const send=(ws,value)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(value))};
 wss.on('connection',ws=>{
  ws.alive=true;ws.joined=null;ws.count=0;ws.rateStart=Date.now();
  const deadline=setTimeout(()=>{if(!ws.joined)ws.close(1008,'Join timeout')},5000);
  ws.on('pong',()=>ws.alive=true);
  ws.on('error',()=>{});
  ws.on('message',(raw,binary)=>{
   const now=Date.now();if(now-ws.rateStart>1000){ws.count=0;ws.rateStart=now}
   if(++ws.count>100||binary){ws.close(1008,'Invalid input rate or format');return}
   let msg;try{msg=JSON.parse(raw.toString())}catch{ws.close(1008,'Invalid JSON');return}
   if(!msg||typeof msg!=='object'){ws.close(1008,'Invalid message');return}
   if(msg.type==='join'&&!ws.joined){
    if(msg.rulesVersion!==11){send(ws,{type:'error',message:'Khác luật EXP/vũ khí (protocol11). Hãy cập nhật cả game và máy chủ lên v2.17.0 rồi tải lại trang.'});return}
    const automatic=msg.matchmaking==='auto';
    if(!automatic&&(typeof msg.room!=='string'||!/^[A-Z0-9-]{1,18}$/.test(msg.room))){send(ws,{type:'error',message:'Mã phòng chỉ dùng A–Z, 0–9 và dấu gạch ngang (tối đa 18 ký tự).'});return}
    // Synchronous selection + insertion prevents overbooking concurrent joins.
    // Fill the busiest public room; friend-code rooms are never auto-filled.
    let room=automatic?[...rooms.values()].filter(r=>r.automatic&&r.clients.size<MAX_PLAYERS).sort((a,b)=>b.clients.size-a.clients.size)[0]:rooms.get(msg.room);
    if(!room){
     if(rooms.size>=MAX_ROOMS){send(ws,{type:'error',message:'Máy chủ đã đủ phòng. Vui lòng thử lại sau hoặc chơi BOT.'});return}
     let code=msg.room;
     if(automatic){do{code='AUTO-'+randomUUID().slice(0,8).toUpperCase()}while(rooms.has(code))}
     room={code,automatic,world:createWorld({botCount:adaptiveBots?0:botCount}),clients:new Map(),ticks:0};rooms.set(code,room);
    }
    if(room.clients.size>=MAX_PLAYERS){send(ws,{type:'error',message:'Phòng đã đủ 16 người. Hãy chọn mã phòng khác.'});return}
    const name=(typeof msg.name==='string'?msg.name:'Lữ khách').normalize('NFC').replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,18)||'Lữ khách';
    const actor=room.world.addHuman(randomUUID(),name);
    const record={ws,actor,lastInput:now,compact:msg.transport==='rows-v1'};room.clients.set(ws,record);balanceBots(room);ws.joined={room,record};clearTimeout(deadline);
    send(ws,{type:'welcome',rulesVersion:11,...(record.compact?{transport:'rows-v1',actorFields}:{}),id:actor.id,room:room.code,matchmaking:room.automatic?'auto':'code',maxPlayers:MAX_PLAYERS});return;
   }
   if(msg.type==='ping'){send(ws,{type:'pong',t:Number.isFinite(msg.t)?msg.t:0});return}
   if(!ws.joined)return;
   const {room,record}=ws.joined;
   if(msg.type==='input'){
    const input=sanitizeInput(msg);input.dash=input.dash||record.actor.input.dash;input.pickup=input.pickup||record.actor.input.pickup;input.skill=input.skill||record.actor.input.skill;
    record.actor.input=input;record.lastInput=now;
   }else if(msg.type==='equip'&&typeof msg.itemId==='string'&&msg.itemId.length<=64){
    const ok=room.world.equipFromBag(record.actor,msg.itemId);send(ws,{type:'bagResult',ok,message:ok?'Đã đổi vũ khí.':'Không thể đổi: cần ở trong vòng cờ, còn sống và món đồ phải có trong túi.'});
   }else if(msg.type==='respawn')room.world.respawn(record.actor);
  });
  ws.on('close',()=>{clearTimeout(deadline);if(ws.joined){const {room,record}=ws.joined;room.world.removeHuman(record.actor);room.clients.delete(ws);if(!room.clients.size)rooms.delete(room.code);else balanceBots(room)}});
 });
 const tick=setInterval(()=>{
  const now=Date.now();
  for(const room of rooms.values()){
   for(const record of room.clients.values())if(now-record.lastInput>350)record.actor.input={...zeroInput(),angle:record.actor.angle};
   room.world.step(STEP);room.ticks++;
   if(room.ticks%2)continue; // 15 authoritative snapshots / second, 30 physics ticks.
   const actors=room.world.actors.map(actor=>{const out={};for(const key of actorFields)out[key]=typeof actor[key]==='number'?Math.round(actor[key]*1000)/1000:actor[key];return out});
   // Serialize rounded actor values and resource tuples once per room, not per viewer.
   // Transport is optional within protocol11: rows and object snapshots both supported.
   const rows=actors.map(out=>actorFields.map(key=>out[key]??null)),worldActors=room.world.actors,botTotal=worldActors.filter(e=>!e.networkHuman).length;
   const resourceFrame=room.ticks%6===0||[...room.clients.values()].some(r=>!r.ws.sentOrbs),rawOrbs=resourceFrame?room.world.orbs:[],packedOrbs=rawOrbs.map(o=>[Math.round(o.x),Math.round(o.y),o.value,Math.round(o.phase*10)/10,o.pickupAt||0]);
   // Public standings whitelist: never serialize position, HP, team, equipment or utility state.
   // Build once per room at 1Hz (and first snapshot), independent of actor visibility.
   const standingsFrame=room.ticks%30===0||[...room.clients.values()].some(r=>!r.ws.sentLeaderboard);
   const leaderboard=standingsFrame?[...room.clients.values()].map(({actor:e})=>({id:e.id,name:e.name,level:e.level,totalXp:Math.floor(e.totalXp),kills:e.kills,alive:e.alive})).sort((a,b)=>b.level-a.level||b.totalXp-a.totalXp||b.kills-a.kills||a.id.localeCompare(b.id)):null;
   // Mixed Top10 is a separate optional payload: v2.18 clients keep their human-only board.
   const allStandings=standingsFrame?worldActors.map(e=>({id:e.id,name:e.name,level:e.level,totalXp:Math.floor(e.totalXp),kills:e.kills,alive:e.alive,networkHuman:!!e.networkHuman})).sort((a,b)=>b.level-a.level||b.totalXp-a.totalXp||b.kills-a.kills||a.id.localeCompare(b.id)):null;
   const top10=allStandings?.slice(0,10),ranks=allStandings?new Map(allStandings.map((e,i)=>[e.id,i+1])):null;
   // EXP-only presentation has its own minimal payload; legacy Top10 keeps v2.19 ordering.
   const expStandings=allStandings?.slice().sort((a,b)=>b.totalXp-a.totalXp||b.kills-a.kills||a.id.localeCompare(b.id));
   const scoreTop10=expStandings?.slice(0,10).map(e=>({id:e.id,name:e.name,totalXp:e.totalXp})),scoreRanks=expStandings?new Map(expStandings.map((e,i)=>[e.id,i+1])):null;
   for(const {ws,actor,compact} of room.clients.values()){
    if(ws.bufferedAmount>2e6){ws.terminate();continue}if(ws.bufferedAmount>32768)continue;
    const visible=worldActors.map(other=>room.world.canObserveActor(actor,other));
    const snapshot={type:'state',elapsed:room.world.elapsed,inventory:actor.inventory,...(compact?{actorRows:rows.filter((_,i)=>visible[i])}:{actors:actors.filter((_,i)=>visible[i])}),humans:room.clients.size,bots:botTotal};
    // Nearby resource snapshots at 5 Hz; full actor state remains at 15 Hz.
    if(room.ticks%6===0||!ws.sentOrbs){snapshot.orbs=[];for(let i=0;i<rawOrbs.length;i++)if(Math.abs(rawOrbs[i].x-actor.x)<1250&&Math.abs(rawOrbs[i].y-actor.y)<1000)snapshot.orbs.push(packedOrbs[i]);snapshot.chests=room.world.chests;snapshot.drops=room.world.drops.filter(d=>Math.abs(d.x-actor.x)<1250&&Math.abs(d.y-actor.y)<1000);ws.sentOrbs=true}
    if(leaderboard){snapshot.leaderboard=leaderboard;snapshot.top10=top10;snapshot.selfRank=ranks.get(actor.id);snapshot.scoreTop10=scoreTop10;snapshot.scoreRank=scoreRanks.get(actor.id);ws.sentLeaderboard=true}
    send(ws,snapshot);
   }
  }
 },1000/30);
 const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue}ws.alive=false;ws.ping()}},15000);
 server.on('close',()=>{clearInterval(tick);clearInterval(heartbeat)});
 function close(){for(const ws of wss.clients)ws.terminate();return new Promise(resolve=>wss.close(()=>server.close(resolve)))}
 return {server,wss,rooms,listen:()=>new Promise(resolve=>server.listen(port,'0.0.0.0',()=>resolve(server.address()))),close};
}
if(require.main===module){const app=createServer();app.listen().then(address=>console.log('3Q.io multiplayer on 0.0.0.0:'+address.port));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)))}
module.exports={createServer,sanitizeInput};
