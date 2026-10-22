'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),mapCtx=$('map').getContext('2d');
// Main weapons follow the novel, not modern game/folklore weapon names.
// Chapters refer to the common 120-chapter edition; shapes remain stylized for the game.
const HEROES=[
 ['Dân binh','Khởi nghĩa','Khúc gỗ','#9b9671','club','Trang bị khởi đầu do game quy ước, không phải binh khí của một nhân vật cụ thể.'],
 ['Khăn Vàng','Khởi nghĩa','Đoản đao','#c7ae53','dao','Trang bị quân lính do game quy ước; không đại diện riêng cho Trương Giác hay một tướng Khăn Vàng.'],
 ['Bộ tốt','Quân ngũ','Thiết kiếm','#7e9582','jian','Trang bị quân lính do game quy ước.'],
 ['Ngũ trưởng','Quân ngũ','Trường thương','#8d795d','spear','Trang bị quân lính do game quy ước.'],
 ['Chu Thương','Thục','Trường thương','#74593e','spear','Hồi 28 tả Chu Thương cầm thương cưỡi ngựa khi gặp Quan Vũ. Việc ông vác đao cho Quan Vũ không có nghĩa đó là binh khí riêng của ông.',28],
 ['Liêu Hóa','Thục','Đại đao','#6a855d','poleblade','Chọn đại đao theo các trận đánh trong truyện: ở hồi 113, Liêu Hóa chém Trịnh Luân bằng một đao.',113],
 ['Quan Bình','Thục','Đại đao','#66967f','poleblade','Hồi 74, Quan Bình xách đao lên ngựa ra đón đánh Bàng Đức. Không gán riêng Thanh long yển nguyệt đao của Quan Vũ cho Quan Bình.',74],
 ['Tào Hồng','Ngụy','Đại đao','#6c86a0','poleblade','Hồi 12, Tào Hồng dùng kế kéo đao để chém Hà Mạn; game dùng đại đao, không đặt tên riêng cho binh khí.',12],
 ['Hàn Đương','Ngô','Đại đao','#b57c57','poleblade','Hồi 5 giới thiệu Hàn Đương sử dụng một thanh đại đao. Thiết tích xà mâu thuộc về Trình Phổ, không phải Hàn Đương.',5],
 ['Hoàng Cái','Ngô','Thiết tiên','#bc7351','whip','Hồi 5 giới thiệu Hoàng Cái dùng roi sắt (thiết tiên). Đây là binh khí cứng, không phải roi dây hay chùy gai.',5],
 ['Từ Hoảng','Ngụy','Đại phủ','#7d97ad','axe','Hồi 14 tả Từ Hoảng dùng búa lớn giao chiến với Hứa Chử. Game dùng tên loại binh khí, không coi tên trang trí là tên riêng trong truyện.',14],
 ['Trương Liêu','Ngụy','Đại đao','#6089aa','poleblade','Hồi 53, Thái Sử Từ cầm thương ra trận, Trương Liêu vung đao nghênh chiến; đổi từ nguyệt nha kích sang đại đao.',53],
 ['Cam Ninh','Ngô','Đại đao','#be7655','poleblade','Hồi 50, Cam Ninh dùng đao chém Mã Diên và Trương Khải. Ông còn dùng cung, kích và xích ở những tình tiết khác; ở đây chọn đại đao làm vũ khí chính.',50],
 ['Thái Sử Từ','Ngô','Thiết thương','#a86c59','spear','Hồi 11 tả Thái Sử Từ mang cung tên, tay cầm thiết thương phá vây cứu Khổng Dung. Hồi 15 ông cũng đấu thương với Tôn Sách; không dùng song kích làm vũ khí chính.',11],
 ['Hoàng Trung','Thục','Đại đao','#b6a375','poleblade','Hồi 53 nhấn mạnh cả đao và tài bắn cung của Hoàng Trung. Game dùng đại đao khi cận chiến và đeo cung sau lưng; không đặt tên Xích huyết đao.',53,'bow'],
 ['Mã Siêu','Thục','Trường thương','#c4c7b8','spear','Hồi 65, Mã Siêu cầm thương đấu Trương Phi; ông còn dùng lưu tinh chùy trong trận này. Truyện không gọi cây thương là Hổ đầu thương.',65],
 ['Trương Phi','Thục','Trượng bát xà mâu','#5e7767','serpent','Hồi 1 gọi là trượng bát điểm cương mâu, đồng thời dùng tên trượng bát xà mâu. Game thể hiện bằng lưỡi mâu uốn lượn, không phải thương có thêm một móc bên cạnh.',1],
 ['Triệu Vân','Thục','Trường thương','#93b8b4','spear','Triệu Vân dùng trường thương; hồi 41 đoạt Thanh Công kiếm từ Hạ Hầu Ân tại Trường Bản. Kiếm được đeo bên người, còn Long đảm thương không phải tên nêu trong bản Diễn Nghĩa này.',41,'sword'],
 ['Quan Vũ','Thục','Thanh long yển nguyệt đao','#4b9772','glaive','Hồi 1 ghi rõ Thanh long yển nguyệt đao, còn gọi Lãnh diễm cứ, nặng 82 cân theo truyện. Đây là binh khí có tên riêng trong tác phẩm.',1],
 ['Lữ Bố','Vô song','Phương thiên họa kích','#b55743','halberd','Hồi 5 tả Lữ Bố cầm Phương thiên họa kích khi giao chiến ở Hổ Lao Quan. Game vẽ mũi đâm chính và hai lưỡi nguyệt đối xứng.',5]
].map((h,i)=>({name:h[0],faction:h[1],weapon:h[2],color:h[3],type:h[4],lore:h[5],chapter:h[6]||null,sidearm:h[7]||null,level:i+1}));
HEROES.push({...HEROES[19],name:'Long Thần Cơ Giáp',faction:'Ẩn',weapon:'Trang bị đang cầm',color:'#d2b765',level:21,sidearm:null,chapter:null,lore:'Hội đủ 7 viên ngọc rồng để triệu hồi robot khổng lồ Long Thần Cơ Giáp. Giữ nguyên vũ khí, ATK, ASPD và quốc gia; HP 352.'});
const WORLD=3600,TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
let W=innerWidth,H=innerHeight,dpr=1,state='menu',paused=false,player,bots=[],orbs=[],particles=[],texts=[],decos=[],camera={x:1800,y:1800},clock=0,elapsed=0,last=0,uiTick=0,shake=0,announcementTime=0,killCount=0,mouse={x:0,y:0,active:false,down:false,sprint:false},keys={},touch={active:false,x:0,y:0,sprint:false},isTouch=matchMedia('(pointer:coarse)').matches,soundEnabled=false,audioContext=null,lastDamage=0;
const botNames=['Thanh Phong','Bắc Hải','Hổ Vệ','Tử Long','Bạch Mã','Đông Phong','Giang Đông','Hắc Kỵ','Bá Vương','Vân Trường','Tây Lương','Long Hồn','Vô Danh','Phi Tướng','Ngọa Long','Kiêu Hùng','Xích Thố','Thiết Vệ','Lạc Dương','Tử Nghĩa','Thương Long','Nhạn Môn','Thần Võ','Kiếm Khách'];
function resize(){W=innerWidth;H=innerHeight;dpr=Math.max(1,Math.min(devicePixelRatio||1,isTouch?1.75:2,Math.sqrt(3000000/(W*H))));canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();document.body.classList.toggle('touch',isTouch);
function startingXP(level){let total=0;for(let l=1;l<Math.min(level,20);l++)total+=needXp({level:l});return total}
function entity(x,y,level,name,isPlayer=false){return{x,y,level,name,isPlayer,team:'neutral',weapon:LootRules.makeWeapon(),inventory:[],dragonCount:0,robotSummon:0,skillCooldown:0,skillBuff:0,skillEffect:0,swingDuration:.32,attackDamage:18,attackKind:'normal',clashSeq:0,clashEffect:0,clashX:x,clashY:y,clashAngle:0,clashExtension:1,joinTarget:null,joinTime:0,enlistTarget:null,angle:rand(0,TAU),hp:100+level*12,maxHp:100+level*12,xp:0,totalXp:startingXP(level),bountyXp:0,droppedXp:0,killerId:null,cooldown:0,swing:0,hitSet:new Set(),invincible:isPlayer?4:2,dash:0,sprinting:false,stamina:100,alive:true,phase:rand(0,TAU),aiTime:0,brain:null,target:null,moving:0,kills:0,respawn:0}}
// Scale the complete model as well as its existing level-dependent proportions.
// Physics, weapon arcs, pickup radius and drawing all use the same world-space size.
const bodyScale=e=>e.level===21?RobotRules.scale:1+.025*(clamp(e.level,1,21)-1);
const modelRadius=e=>17+e.level*1.35;
const modelReach=e=>48+e.level*3.6;
const radius=e=>modelRadius(e)*bodyScale(e);
const reach=e=>(e.weapon?Math.hypot(weaponStats(e).reach+2,modelRadius(e)*.6+7):modelReach(e))*bodyScale(e);
const sizeMultiplier=e=>radius(e)/radius({level:1});
const needXp=e=>{const n=clamp(e.level,1,20)-1;return 150+60*n+15*n*n};
const SPRINT_SPEED=1.65,SPRINT_XP_PER_SECOND=10,MAX_XP_RESERVE=4060;
let controlSource='mouse',joyPointer=null,joyBounds=null,attackPointer=null,sprintPointer=null,lastHudKey='',lastRankKey='';
function inputChanged(){window.netGame?.inputChanged?.()}
function movementKey(e){return ({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyQ:'q',KeyE:'e',KeyF:'f',Space:' '})[e.code]||(e.key.length===1?e.key.toLowerCase():e.key)}
function movementIntent(){
 let x=0,y=0,angle=player.angle;
 if(touch.active){x=touch.x;y=touch.y;if(Math.hypot(x,y)>.05)angle=Math.atan2(y,x)}else{
  x=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0);y=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
  if(mouse.active){const mx=mouse.x-(W/2+player.x-camera.x),my=mouse.y-(H/2+player.y-camera.y),m=Math.hypot(mx,my);if(m>3)angle=Math.atan2(my,mx);if(!x&&!y&&controlSource!=='keyboard'&&m>35){x=mx/m*clamp((m-35)/80,0,1);y=my/m*clamp((m-35)/80,0,1)}}else if(x||y)angle=Math.atan2(y,x);
 }
 const length=Math.hypot(x,y);if(length>.05){x/=Math.max(1,length);y/=Math.max(1,length)}else{x=y=0}
 return {x,y,angle,sprint:mouse.sprint||touch.sprint};
}
function joystickVector(x,y,range=35){const length=Math.hypot(x,y);if(length<=4)return{x:0,y:0};const magnitude=Math.min(1,(length-4)/(range-4));return{x:x/length*magnitude,y:y/length*magnitude}}
function clearControls(){keys={};mouse.down=false;mouse.active=false;resetSprint();touch.active=false;touch.x=touch.y=0;joyPointer=null;joyBounds=null;attackPointer=null;sprintPointer=null;$('stick').style.transform='none';window.netGame?.stopInput?.();inputChanged()}
function setInputDevice(touchMode){if(isTouch===touchMode)return;clearControls();isTouch=touchMode;document.body.classList.toggle('touch',isTouch);joyBounds=null;resize()}
function followCamera(dt,rate=12){const alpha=1-Math.exp(-Math.max(0,dt)*rate);camera.x+=(player.x-camera.x)*alpha;camera.y+=(player.y-camera.y)*alpha}
function resetSprint(){mouse.sprint=false;touch.sprint=false;if(player)player.sprinting=false}
function keepInBounds(e){const inset=radius(e)+8;e.x=clamp(e.x,inset,WORLD-inset);e.y=clamp(e.y,inset,WORLD-inset)}
function addOrb(x,y,value=2,pickupDelay=0){orbs.push({x:clamp(x,30,WORLD-30),y:clamp(y,30,WORLD-30),value,phase:rand(0,TAU),pickupAt:pickupDelay>0?elapsed+pickupDelay:0})}
function collectXPOrbs(actors,dt,now=elapsed){
 for(const e of actors){if(!e.alive)continue;
 for(let i=orbs.length-1;i>=0;i--){let orb=orbs[i];if((orb.pickupAt||0)>now)continue;let d=Math.hypot(e.x-orb.x,e.y-orb.y);if(d<radius(e)+48){orb.x+=(e.x-orb.x)*dt*9;orb.y+=(e.y-orb.y)*dt*9;if(d<radius(e)+10){gainXP(e,orb.value);orbs.splice(i,1);if(e.isPlayer&&Math.random()<.3)tone(520+Math.random()*300,.045,'sine',.012)}}}}
}
function safePosition(){for(let i=0;i<35;i++){let p={x:rand(100,WORLD-100),y:rand(100,WORLD-100)};if(!player||dist(p,player)>650)return p}return{x:200,y:200}}
function init(){window.speedTrails?.clear();orbs=[];bots=[];particles=[];texts=[];elapsed=0;killCount=0;player=entity(1800,1800,1,$('nickname').value.trim()||'Lữ khách',true);camera={x:player.x,y:player.y};for(let i=0;i<24;i++){let p=safePosition();bots.push(entity(p.x,p.y,i<8?Math.floor(rand(1,4)):i<18?Math.floor(rand(4,12)):Math.floor(rand(12,21)),botNames[i]));bots[i].enlistTarget=i%6<4?CAMP_ZONES[i%6].team:null}for(let i=0;i<1350;i++)addOrb(rand(60,WORLD-60),rand(60,WORLD-60),Math.random()<.09?7:2);for(let i=0;i<65;i++)addOrb(player.x+rand(-420,420),player.y+rand(-350,350),Math.random()<.15?7:2);mouse.active=false;mouse.down=false;resetSprint();keys={};touch.active=false;lastDamage=0;spawnTreasures();updateHUD()}
function createDecos(){decos=[];let seed=9484;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<950;i++)decos.push({x:rng()*WORLD,y:rng()*WORLD,type:i<90?'tree':i<125?'rock':i<160?'bamboo':i<178?'flag':'grass',size:.65+rng()*.8,rot:rng()*TAU,seed:rng()});for(let i=0;i<36;i++){let a=i/36*TAU;decos.push({x:1800+Math.cos(a)*440,y:1800+Math.sin(a)*440,type:'stone',size:1,rot:a,seed:0})}}
createDecos();decos=decos.filter(d=>!CAMP_ZONES.some(z=>dist(d,z)<CAMP_RADIUS+50));init();
function tone(freq,duration=.09,type='sine',volume=.03){if(!soundEnabled)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();let o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.5),audioContext.currentTime+duration);g.gain.setValueAtTime(volume,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration)}catch{}}
function burst(x,y,color,n=10){for(let i=0;i<n;i++){let a=rand(0,TAU),s=rand(30,150);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.3,.75),max:.75,color,r:rand(2,4)})}}
function floatText(x,y,text,color='#f8dfa0'){texts.push({x,y,text,color,life:1.1})}
function gainXP(e,value){if(!e.alive)return;e.totalXp+=value;if(e.level>=20){e.xp=Math.min(MAX_XP_RESERVE,e.xp+value);return}e.xp+=value;while(e.level<20&&e.xp>=needXp(e)){e.xp-=needXp(e);e.level++;keepInBounds(e);e.maxHp=100+e.level*12;e.hp=e.maxHp;burst(e.x,e.y,'#ffe6a2',25);if(e.isPlayer){announce(HEROES[e.level-1].name,'Tăng sinh lực và kích thước · Giữ nguyên vũ khí');tone(640,.3,'triangle',.05);tone(960,.5,'sine',.04);shake=4;updateHUD()}}if(e.level>=20)e.xp=Math.min(MAX_XP_RESERVE,e.xp)}
function announce(name,sub,kind='TIẾN HÓA VÕ TƯỚNG'){$('announcement').querySelector('small').textContent=kind;$('announcement').querySelector('strong').textContent=name;$('announcement').querySelector('span').textContent=sub;$('announcement').classList.add('show');announcementTime=3.2}
function attack(e){if(window.netGame?.active&&e===player){window.netGame.attackOnce();return}if(!e.alive||e.cooldown>0)return;e.cooldown=1/weaponASPD(e);e.swingDuration=Math.min(.32,e.cooldown*.8);e.swing=e.swingDuration;e.attackDamage=weaponStats(e).atk;e.attackKind='normal';e.hitSet=new Set();if(e.isPlayer)tone(170,.14,'sawtooth',.025)}
function dash(){if(window.netGame?.active){window.netGame.dash();return}if(state!=='playing'||paused||!player.alive||player.stamina<35)return;player.stamina-=35;player.dash=.23;burst(player.x,player.y,'#e6dca5',8);tone(230,.1,'triangle')}
const KILL_XP_SHARE=.2;
function killRewardXP(victim){return 24+victim.level*16}
function killDropXP(victim){return Math.floor(Math.max(0,Number.isFinite(victim.totalXp)?victim.totalXp:0)*KILL_XP_SHARE)}
function scatterKillXP(victim,amount){
 if(amount<=0)return;
 const count=Math.min(amount,Math.max(8,Math.min(32,Math.ceil(amount/50)))),base=Math.floor(amount/count),extra=amount%count;
 for(let i=0;i<count;i++){const angle=(i+Math.random()*.65)*TAU/count,r=rand(85,155);addOrb(victim.x+Math.cos(angle)*r,victim.y+Math.sin(angle)*r,base+(i<extra?1:0),.6)}
}
function kill(victim,killer){if(!victim.alive||!killer.alive||victim===killer)return false;const reward=killRewardXP(victim);victim.bountyXp=reward;victim.droppedXp=killDropXP(victim);victim.killerId=killer.id??null;victim.killerName=killer.name;victim.alive=false;victim.sprinting=false;victim.joinTime=0;victim.joinTarget=null;victim.respawn=5;burst(victim.x,victim.y,HEROES[victim.level-1].color,24);burst(victim.x,victim.y,'#f2db8d',15);for(let i=0;i<14+victim.level;i++)addOrb(victim.x+rand(-70,70),victim.y+rand(-70,70),i<4?7:2);scatterKillXP(victim,victim.droppedXp);if(victim.droppedXp>0)floatText(victim.x,victim.y-74,'EXP RƠI: '+victim.droppedXp+' KN','#f5cf78');killer.kills++;gainXP(killer,reward);if(killer.isPlayer){killCount++;shake=7;tone(100,.22,'triangle',.08);floatText(victim.x,victim.y-50,'HẠ GỤC +'+reward+' KN');feed('Bạn  ⚔  '+victim.name)}else if(dist(victim,player)<650)feed(killer.name+'  ⚔  '+victim.name);if(victim.isPlayer){state='dead';mouse.down=false;setTimeout(()=>{if(state==='dead')showDeath(killer)},500)}}
function feed(s){let d=document.createElement('div');d.textContent=s;$('killfeed').prepend(d);while($('killfeed').children.length>3)$('killfeed').lastChild.remove();setTimeout(()=>d.remove(),4500)}
function moveEntity(e,dx,dy,dt,sprintRequested=false){
 const len=Math.hypot(dx,dy);e.moving=len>.05?1:0;e.sprinting=false;
 if(!e.alive||len<=.05||dt<=0)return;
 dx/=Math.max(1,len);dy/=Math.max(1,len);
 const sprintTime=sprintRequested&&e.dash<=0?Math.min(dt,Math.max(0,e.xp)/SPRINT_XP_PER_SECOND):0;
 const base=(188-e.level*2.2)*(e.isPlayer||e.networkHuman?1:.86);
 const travel=base*(e.dash>0?2.9*dt:dt+(SPRINT_SPEED-1)*sprintTime),x=e.x,y=e.y;
 e.x+=dx*travel;e.y+=dy*travel;keepInBounds(e);
 if(sprintTime>0&&Math.hypot(e.x-x,e.y-y)>.000001){
  e.xp=Math.max(0,e.xp-SPRINT_XP_PER_SECOND*sprintTime);if(e.xp<1e-9)e.xp=0;e.sprinting=e.xp>0;
 }
}
function update(dt){if(window.netGame?.active){window.netGame.update(dt);return}clock+=dt;if(state!=='playing'||paused){for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);return}elapsed+=dt;const intent=movementIntent();player.angle=intent.angle;moveEntity(player,intent.x,intent.y,dt,intent.sprint);if(mouse.down||keys[' '])attack(player);
 const botActors=[player,...bots];
 for(const e of bots){
  if(e.networkHuman)continue; // Human intent is applied only by the authoritative server.
  if(!e.alive){e.respawn-=dt;if(e.respawn<=0){const p=safePosition(),l=Math.max(1,Math.floor(rand(1,Math.min(21,player.level+7))));Object.assign(e,entity(p.x,p.y,l,e.name));e.enlistTarget=Math.random()<.7?CAMP_ZONES[Math.floor(rand(0,4))].team:null}continue}
  updateBot(e,dt,botActors);
 }
 const all=[player,...bots];for(const e of all)updateAllegiance(e,dt);
 const swingStarts=new Map();
 for(const e of all){if(!e.alive)continue;e.cooldown=Math.max(0,e.cooldown-dt);e.invincible=Math.max(0,e.invincible-dt);e.dash=Math.max(0,e.dash-dt);e.clashEffect=Math.max(0,(e.clashEffect||0)-dt);e.robotSummon=Math.max(0,(e.robotSummon||0)-dt);e.stamina=Math.min(100,e.stamina+20*dt);if((!e.isPlayer&&!e.networkHuman)||elapsed-(e.networkHuman?(e.lastDamageAt||0):lastDamage)>6)e.hp=Math.min(e.maxHp,e.hp+dt*2);swingStarts.set(e,e.swing);e.swing=Math.max(0,e.swing-dt)}
 resolveMelee(all,swingStarts,dt);
 collectXPOrbs(all,dt);
 updateTreasures(dt,all);
 // Gentle body separation keeps close combat legible.
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){let a=all[i],b=all[j];if(!a.alive||!b.alive)continue;let d=dist(a,b),r=(radius(a)+radius(b))*.8;if(d<r&&d>0){let push=(r-d)*.35,nx=(b.x-a.x)/d,ny=(b.y-a.y)/d;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;keepInBounds(a);keepInBounds(b)}}
 if(orbs.length<1350&&Math.random()<.8)for(let i=0;i<4;i++)addOrb(rand(40,WORLD-40),rand(40,WORLD-40),Math.random()<.09?7:2);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2;p.vy*=1-dt*2;p.life-=dt}particles=particles.filter(p=>p.life>0);for(const t of texts){t.y-=dt*32;t.life-=dt}texts=texts.filter(t=>t.life>0);followCamera(dt);shake=Math.max(0,shake-dt*20);if(announcementTime>0){announcementTime-=dt;if(announcementTime<=0)$('announcement').classList.remove('show')}uiTick+=dt;if(uiTick>.15){uiTick=0;updateHUD()}}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function poly(c,points,fill,stroke){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.stroke()}
function drawSidearm(c,hero,r){
 if(hero.sidearm==='bow'){
  // Carried bow and quiver only; this update does not introduce ranged attacks.
  c.strokeStyle='#402f23';c.lineWidth=5;c.beginPath();c.moveTo(-r*.75,-r*1.15);c.quadraticCurveTo(-r*2.1,0,-r*.75,r*1.15);c.stroke();
  c.strokeStyle='#d7b77c';c.lineWidth=2;c.beginPath();c.moveTo(-r*.75,-r*1.15);c.quadraticCurveTo(-r*2.1,0,-r*.75,r*1.15);c.stroke();
  line(c,[[-r*.75,-r*1.15],[-r*.75,r*1.15]],'#e4dbb8',1);
  line(c,[[-r*.95,-r*.4],[-r*.8,r*.55]],'#79573b',11);
  for(let i=0;i<3;i++){let x=-r*.98+i*4;line(c,[[x,-r*.4],[x-3,-r*.9]],'#bca77d',1.5);poly(c,[[x-5,-r*.9],[x-3,-r*1.03],[x+1,-r*.9]],'#d8d6b6')}
 }else if(hero.sidearm==='sword'){
  c.save();c.translate(-r*.45,-r*.88);c.rotate(-2.6);
  line(c,[[0,0],[r*1.15,0]],'#243f3c',7);
  line(c,[[3,-2],[r*1.1,-2]],'#82a498',1.5);
  line(c,[[r*.9,-4],[r*.9,4]],'#c7b37a',3);
  line(c,[[-2,-8],[-2,8]],'#d1bf80',3);
  line(c,[[-15,0],[-3,0]],'#6d5340',5);
  ellipse(c,-17,0,3,3,'#b9aa76');c.restore();
 }
}
function drawWarrior(c,e,x,y,scale=1,portrait=false){const hero=HEROES[e.level-1],r=modelRadius(e),worldRadius=radius(e),a=portrait?-.7:e.angle; c.save();c.translate(x,y);c.scale(scale*bodyScale(e),scale*bodyScale(e));if(!portrait){ellipse(c,3,8,r*1.2,r*.65,'#27392845');if(e.isPlayer){c.strokeStyle='#f4df9c99';c.lineWidth=1.3;c.beginPath();c.ellipse(0,5,r+9,(r+9)*.78,0,0,TAU);c.stroke()}if((e.invincible>0||isCampProtected(e))&&state==='playing'){c.strokeStyle='#d5ead482';c.lineWidth=2;c.beginPath();c.arc(0,0,r+12,0,TAU);c.stroke()}}
 c.rotate(a);if(!portrait&&(e.level===21||e.skillEffect>0)){c.save();c.strokeStyle=e.level===21?'#f9d47b':'#ffe6ab';c.globalAlpha=e.skillEffect>0?.8:.5;c.lineWidth=2;c.beginPath();if(e.skillEffectKind==='pierce'&&e.skillEffect>0){c.moveTo(0,0);c.lineTo(reach(e)/bodyScale(e)*2.2,0)}else c.arc(0,0,e.skillEffect>0?(e.skillEffectKind==='flurry'?r*1.6:reach(e)/bodyScale(e)*1.3):r*1.4,0,TAU);c.stroke();c.restore()}let bob=portrait?0:Math.sin(clock*12+e.phase)*e.moving*2;
 if(e.level===21)drawRobot(c,e,r,portrait);else drawChibiWarrior(c,e,r,a,bob,portrait);
 c.save();const pose=e.swing>0&&!portrait?strikePose(e,1-e.swing/(e.swingDuration||.32)):!portrait&&e.clashEffect>.14?{angle:e.clashAngle,extension:e.clashExtension||1}:{angle:e.angle+.42,extension:1};c.rotate(portrait ? .42 : pose.angle-e.angle);c.translate(2,r*.6);c.scale(pose.extension,1);ellipse(c,12,5,6,5,e.level===21?'#6c8993':'#d0b183');if(e.weapon?.rarity>0)line(c,[[10,7],[weaponStats(e).reach-4,7]],weaponStats(e).color+'66',7);const held=e.weapon?weaponStats(e):LootRules.stats(LootRules.makeWeapon(Math.min(19,e.level-1)));c.save();c.translate(10,7);c.scale(held.size,held.size);c.translate(-10,-7);weapon(c,{level:held.profile+1},held.baseReach-10);c.restore();c.restore();c.restore();
 if(!portrait){c.save();c.strokeStyle=teamOf(e).color+'bb';c.lineWidth=e.isPlayer?2:1.5;c.beginPath();c.ellipse(x,y+5,worldRadius+6,(worldRadius+6)*.78,0,0,TAU);c.stroke();if(e.joinTarget){c.strokeStyle=KINGDOMS[e.joinTarget].color;c.lineWidth=4;c.beginPath();c.arc(x,y,worldRadius+13,-Math.PI/2,-Math.PI/2+TAU*e.joinTime/JOIN_SECONDS);c.stroke()}c.restore()}
 if(!portrait&&e.swing>0){c.save();c.translate(x,y);let progress=1-e.swing/(e.swingDuration||.32);const pose=strikePose(e,progress);let current=pose.angle,trailReach=reach(e)*pose.extension;c.beginPath();c.arc(0,0,trailReach,current-.85,current);c.strokeStyle=`rgba(255,230,164,${(1-progress)*.7})`;c.lineWidth=12*(1-progress)+2;c.stroke();c.beginPath();c.arc(0,0,trailReach+4,current-.6,current);c.strokeStyle='#fff2c4bb';c.lineWidth=2;c.stroke();c.restore()}
 if(!portrait){drawClashEffect(c,e);c.textAlign='center';c.font='500 10px "Be Vietnam Pro",sans-serif';c.fillStyle=e.isPlayer?'#fff2b9':'#f2ecd3';c.shadowColor='#1c2e22';c.shadowBlur=4;c.fillText(e.name,x,y-worldRadius-31);c.shadowBlur=0;drawTeamBadge(c,teamOf(e).id,x-c.measureText(e.name).width/2-13,y-worldRadius-35,6);c.font='8px "Be Vietnam Pro",sans-serif';c.fillStyle=e.isPlayer?'#f5d38b':e.level>player.level+3?'#f0ba96':'#d0d9b9';c.fillText('Lv.'+e.level+' · '+hero.name+(e.networkHuman&&!e.isPlayer?' · ONLINE':''),x,y-worldRadius-19);if(e.hp<e.maxHp){c.fillStyle='#23362ae0';c.fillRect(x-21,y+worldRadius+10,42,3);c.fillStyle=e.isPlayer?'#b6d18d':'#d29872';c.fillRect(x-21,y+worldRadius+10,42*Math.max(0,e.hp/e.maxHp),3)}}}
function drawDeco(d,paint=ctx){const ctx=paint;ctx.save();ctx.translate(d.x,d.y);ctx.scale(d.size,d.size);if(d.type==='tree'){ellipse(ctx,9,16,46,24,'#2e442a28');line(ctx,[[0,12],[0,-20]],'#5c6140',9);for(let i=0;i<5;i++){let a=i*2.4+d.seed;ellipse(ctx,Math.cos(a)*20,Math.sin(a)*16-12,30,24,i%2?'#4d6540':'#526d43')}ellipse(ctx,-8,-18,28,21,'#657a4c');line(ctx,[[-19,-23],[-7,-28],[7,-25]],'#82915a66',2)}else if(d.type==='rock'||d.type==='stone'){let s=d.type==='stone'?.5:1;ctx.scale(s,s);ellipse(ctx,4,8,22,12,'#384b302c');poly(ctx,[[-19,4],[-17,-10],[-5,-19],[12,-14],[23,2],[12,12],[-11,13]],'#8b9070','#6c785b');poly(ctx,[[-17,-10],[-5,-19],[12,-14],[5,-3]],'#a7a78a');line(ctx,[[-10,4],[4,7],[14,3]],'#788467',2)}else if(d.type==='bamboo'){for(let i=0;i<4;i++){let xx=i*9-15;line(ctx,[[xx,20],[xx-3,-35-i*6]],'#526b3b',4);for(let j=0;j<4;j++){let yy=-j*13;line(ctx,[[xx-3,yy],[xx+3,yy]],'#a1a46b',2);poly(ctx,[[xx,yy],[xx-23,yy-10],[xx-12,yy-12]],'#536d3d');poly(ctx,[[xx,yy-4],[xx+22,yy-19],[xx+12,yy-5]],'#6e8248')}}}else if(d.type==='flag'){line(ctx,[[0,20],[0,-48]],'#5b6545',3);poly(ctx,[[2,-46],[31,-42],[27,-12],[2,-17]],d.seed>.5?'#9b6545':'#506e60','#c1ae7444');ctx.fillStyle='#e1c58a';ctx.font='15px serif';ctx.fillText(d.seed>.5?'吳':'蜀',7,-24);ellipse(ctx,1,21,11,4,'#4b5d3733')}else{ctx.rotate(d.rot);line(ctx,[[-5,3],[-8,-5],[-2,0],[0,-8],[3,0],[8,-5]],d.seed>.6?'#9b9e6c66':'#5d743d88',1)}ctx.restore()}
// Cached parchment terrain avoids per-frame noise generation.
const ground=document.createElement('canvas');ground.width=ground.height=256;const gc=ground.getContext('2d');gc.fillStyle='#81865a';gc.fillRect(0,0,256,256);for(let i=0;i<4500;i++){gc.fillStyle=Math.random()>.5?'#c6b77e0b':'#243d280d';gc.fillRect(Math.random()*256,Math.random()*256,Math.random()*3+1,Math.random()*2+1)}let groundPattern=ctx.createPattern(ground,'repeat');
const decoSprites=new Map();let mapPaintAt=-1,vignetteCache=null,vignetteSize='';
function drawCachedDeco(d){
 if(d.type==='grass'||d.type==='stone'){drawDeco(d);return}
 let sprite=decoSprites.get(d);if(!sprite){sprite=document.createElement('canvas');sprite.width=160;sprite.height=192;const paint=sprite.getContext('2d');paint.translate(80,104);drawDeco({...d,x:0,y:0},paint);if(decoSprites.size>=64)decoSprites.delete(decoSprites.keys().next().value);decoSprites.set(d,sprite)}else{decoSprites.delete(d);decoSprites.set(d,sprite)}ctx.drawImage(sprite,d.x-80,d.y-104);
}
function render(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.save();let sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;ctx.translate(W/2-camera.x+sx,H/2-camera.y+sy);ctx.fillStyle=groundPattern;ctx.fillRect(camera.x-W/2-15,camera.y-H/2-15,W+30,H+30);
 // Winding dust roads and an old ceremonial arena.
 ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,2100);ctx.bezierCurveTo(700,1700,1100,2200,1800,1800);ctx.bezierCurveTo(2500,1300,3100,1900,3600,1400);ctx.strokeStyle='#b4a77335';ctx.lineWidth=115;ctx.stroke();ctx.beginPath();ctx.moveTo(1400,0);ctx.bezierCurveTo(1900,900,1500,2100,2300,3600);ctx.strokeStyle='#b5a67426';ctx.lineWidth=85;ctx.stroke();
 ctx.strokeStyle='#cec49524';ctx.lineWidth=2;ctx.beginPath();ctx.arc(1800,1800,435,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(1800,1800,410,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(1800,1800,145,0,TAU);ctx.stroke();ctx.save();ctx.translate(1800,1800);ctx.rotate(-.2);ctx.fillStyle='#434f3520';ctx.textAlign='center';ctx.font='100px serif';ctx.fillText('三國',0,35);ctx.restore();
 // World border.
 ctx.fillStyle='#354c35';ctx.fillRect(-300,-300,WORLD+600,300);ctx.fillRect(-300,WORLD,WORLD+600,300);ctx.fillRect(-300,0,300,WORLD);ctx.fillRect(WORLD,0,300,WORLD);ctx.strokeStyle='#ccbb824f';ctx.lineWidth=9;ctx.strokeRect(12,12,WORLD-24,WORLD-24);
 const visible=(x,y,pad=100)=>Math.abs(x-camera.x)<W/2+pad&&Math.abs(y-camera.y)<H/2+pad;
 for(const zone of CAMP_ZONES)if(visible(zone.x,zone.y,CAMP_RADIUS+70))drawCampGround(zone);
 for(const d of decos)if((d.type==='grass'||d.type==='stone')&&visible(d.x,d.y))drawDeco(d);
 for(const o of orbs){if(!visible(o.x,o.y,20))continue;let r=o.pickupAt?6:o.value>=7?5:3.2,y=o.y+Math.sin(clock*2+o.phase)*1.7;ellipse(ctx,o.x+1,y+3,r+1,2,'#3f512e25');ctx.save();ctx.translate(o.x,y);ctx.rotate(Math.PI/4);ctx.fillStyle=o.value>=7?'#f4d584':'#dce1ac';ctx.strokeStyle=o.value>=7?'#a8914b':'#98af7d';ctx.lineWidth=1;ctx.fillRect(-r,-r,r*2,r*2);ctx.strokeRect(-r,-r,r*2,r*2);ctx.fillStyle='#ffffdb88';ctx.fillRect(-r+1,-r+1,r*.8,r*.8);ctx.restore()}
 for(const d of drops)if(visible(d.x,d.y,90))drawTreasureDrop(d);
 window.speedTrails?.draw(ctx);
 let objects=decos.filter(d=>d.type!=='grass'&&d.type!=='stone'&&visible(d.x,d.y)).map(d=>({y:d.y,draw:()=>drawCachedDeco(d)}));for(const e of [player,...bots])if(e.alive&&visible(e.x,e.y,reach(e)+60))objects.push({y:e.y,draw:()=>drawWarrior(ctx,e,e.x,e.y)});for(const zone of CAMP_ZONES)if(visible(zone.x,zone.y,160))objects.push({y:zone.y,draw:()=>drawCampFlag(zone)});for(const c of chests)if(c.alive&&visible(c.x,c.y,90))objects.push({y:c.y,draw:()=>drawTreasure(c)});objects.sort((a,b)=>a.y-b.y);for(const o of objects)o.draw();
 for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ellipse(ctx,p.x,p.y,p.r,p.r,p.color)}ctx.globalAlpha=1;for(const t of texts){ctx.globalAlpha=clamp(t.life*2,0,1);ctx.textAlign='center';ctx.fillStyle=t.color;ctx.font='700 14px "Be Vietnam Pro",sans-serif';ctx.shadowColor='#304027';ctx.shadowBlur=4;ctx.fillText(t.text,t.x,t.y);ctx.shadowBlur=0}ctx.globalAlpha=1;
 // Spawn protection / dash feedback.
 if(player.alive&&(player.invincible>0||isCampProtected(player))&&state==='playing'){ctx.textAlign='center';ctx.fillStyle='#fff0bd';ctx.font='9px "Be Vietnam Pro",sans-serif';ctx.fillText(isCampProtected(player)?'VÙNG AN TOÀN':'BẢO HỘ XUẤT TRẬN',player.x,player.y+radius(player)+28)}
 ctx.restore();const size=W+':'+H+':'+dpr;if(vignetteSize!==size){vignetteSize=size;vignetteCache=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.75);vignetteCache.addColorStop(0,'#112b1a00');vignetteCache.addColorStop(1,'#142a2240')}ctx.fillStyle=vignetteCache;ctx.fillRect(0,0,W,H);if(player.alive&&player.hp<player.maxHp*.28&&state==='playing'){ctx.strokeStyle=`rgba(185,69,46,${.2+Math.sin(clock*5)*.08})`;ctx.lineWidth=18;ctx.strokeRect(0,0,W,H)}if(clock-mapPaintAt>=.1||mapPaintAt<0){mapPaintAt=clock;renderMap()}}
function renderMap(){
 const c=mapCtx,s=150/WORLD;c.clearRect(0,0,150,150);c.fillStyle='#60724c';c.fillRect(0,0,150,150);c.strokeStyle='#d9c88a1f';c.lineWidth=1;
 for(let i=1;i<4;i++){c.beginPath();c.moveTo(i*37.5,0);c.lineTo(i*37.5,150);c.moveTo(0,i*37.5);c.lineTo(150,i*37.5);c.stroke()}
 c.strokeStyle='#d4c48b55';c.beginPath();c.arc(75,75,18,0,TAU);c.stroke();
 for(const z of CAMP_ZONES){const t=KINGDOMS[z.team];c.fillStyle=t.color+'33';c.beginPath();c.arc(z.x*s,z.y*s,CAMP_RADIUS*s,0,TAU);c.fill();drawTeamBadge(c,z.team,z.x*s,z.y*s,5)}
 c.strokeStyle='#e5dbb85c';c.strokeRect((camera.x-W/2)*s,(camera.y-H/2)*s,W*s,H*s);
 for(const chest of chests)if(chest.alive){c.fillStyle=['#c7ba95','#9ac785','#91c4e1','#c59ada','#f2c778'][chest.level-1];c.fillRect(chest.x*s-1.5,chest.y*s-1.5,3,3)}
 for(const b of bots)if(b.alive)drawTeamBadge(c,b.team,b.x*s,b.y*s,1.8,false);
 drawTeamBadge(c,player.team,player.x*s,player.y*s,3.2,false);
 c.strokeStyle='#fff3bf';c.lineWidth=1;c.beginPath();c.arc(player.x*s,player.y*s,6,0,TAU);c.stroke();
}
function formatTime(t){return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0')}
function updateHUD(){
 const ranking=[player,...bots].filter(e=>e.alive).sort((a,b)=>b.level-a.level||b.totalXp-a.totalXp),near=nearestDrop(player),camp=playerCamp(),worldTime=window.netGame?.active?window.netGame.worldElapsed:elapsed;
 const key=JSON.stringify([player.name,player.level,Math.ceil(player.hp),player.maxHp,Math.round(player.stamina*10),Math.floor(player.xp),Math.round(player.xp/Math.max(1,needXp(player))*1000),player.totalXp,player.alive,player.weapon,player.dragonCount,player.inventory,Math.ceil(player.skillCooldown),player.skillBuff>0,player.swing>0,player.team,player.joinTarget,Math.round(player.joinTime*10),player.sprinting,Math.floor(elapsed),Math.floor(worldTime||0),chests.filter(c=>c.alive).length,killCount,isTouch,near?.id,near?.weapon,camp?.team,bagOpen,ranking.length,ranking.indexOf(player),ranking.slice(0,5).map(e=>[e.id,e.name,e.level,e.team])]);
 if(key===lastHudKey)return;lastHudKey=key;paintHUD(ranking);
}
function paintHUD(ranking){let h=HEROES[player.level-1];$('heroName').textContent=h.name;const equipped=weaponStats(player);$('weaponName').textContent=equipped.name+' · '+equipped.rarityName;$('weaponName').style.color=equipped.color;updateLootHUD();$('levelSeal').textContent=player.level;updateCaptureHUD();$('playerName').textContent=player.name;$('hpFill').style.width=Math.max(0,player.hp/player.maxHp*100)+'%';$('hpText').textContent=Math.ceil(Math.max(0,player.hp))+' / '+player.maxHp;$('staminaFill').style.width=player.stamina+'%';$('hpFill').style.background=player.hp<player.maxHp*.3?'#cf8162':'#99bb86';$('xpLabel').innerHTML=player.level<20?'CẤP '+String(player.level).padStart(2,'0')+' <i>→</i> CẤP '+String(player.level+1).padStart(2,'0'):'CẤP '+player.level+(player.level===21?' · CƠ GIÁP ẨN':' · CHIẾN THẦN');$('xpValue').textContent=player.level<20?Math.floor(player.xp)+' / '+needXp(player)+' KN':Math.floor(player.xp)+' KN DỰ TRỮ';$('xpFill').style.width=(player.xp/(player.level>=20?MAX_XP_RESERVE:needXp(player))*100)+'%';$('nextHero').textContent=player.level<20?HEROES[player.level].name:player.level===21?'Đã mở cấp ẩn':'7 ngọc rồng → Lv21';$('kills').textContent=killCount;$('timer').textContent=formatTime(elapsed);$('population').textContent=ranking.length;const rankKey=JSON.stringify(ranking.slice(0,5).map(e=>[e.id,e.name,e.level,e.team,e.isPlayer]));if(rankKey!==lastRankKey){lastRankKey=rankKey;$('ranks').replaceChildren();for(let i=0;i<5&&i<ranking.length;i++){let e=ranking[i],row=document.createElement('div');row.className='rank-row';let p=document.createElement('span');p.className='pos';p.textContent=String(i+1).padStart(2,'0');let n=document.createElement('span');n.className='name';n.textContent=e.name+(e.isPlayer?' (Bạn)':'');let l=document.createElement('b');l.textContent='Lv.'+e.level;const badge=document.createElement('span');badge.className='rank-team';badge.textContent=teamOf(e).code;badge.style.color=teamOf(e).color;badge.title=teamOf(e).name;row.append(p,badge,n,l);$('ranks').append(row)}}$('yourRank').textContent='#'+(ranking.indexOf(player)+1)+'  '+player.name+' · '+player.totalXp+' KN đã nhận';$('sprintStatus').textContent=player.sprinting?'ĐANG CHẠY ×1,65 · −10 KN/s':player.xp<=0?'Hết KN để chạy nhanh · Nhặt ngọc để nạp':(isTouch?'Giữ CHẠY':'Giữ chuột phải')+': ×1,65 · −10 KN/s';$('sprintStatus').classList.toggle('running',player.sprinting);$('sprintButton').setAttribute('aria-pressed',String(player.sprinting));$('sprintButton').style.opacity=player.xp<=0?'.45':'1';$('dashButton').style.opacity=player.stamina<35?'.4':'1';$('dashButton').style.borderColor=player.stamina>=99?'#e5cb83':'#d6c58b66'}
function openModal(html){paused=true;clearControls();$('modalContent').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){$('modal').classList.add('hidden');paused=false;mouse.active=false;$('pause').textContent='II'}
function showLevels(){
 openModal('<div class="eyebrow">CON ĐƯỜNG VÕ TƯỚNG</div><h2>20 bậc tiến hóa &amp; tướng ẩn</h2><p>Lên cấp tăng sinh lực và hình dáng, không tăng ATK/ASPD và không đổi trang bị. Vũ khí minh họa dưới đây là tư liệu Diễn Nghĩa; trong trận phải phá rương rồi nhặt. Cấp ẩn 21 chỉ mở bằng 7 ngọc rồng.</p><div class="level-grid">'+HEROES.slice(0,20).map((h,i)=>'<button class="hero-tile '+(player.level===i+1?'current':'')+'" data-hero="'+i+'" aria-label="Xem binh khí của '+h.name+'"><span class="num">'+String(i+1).padStart(2,'0')+'</span><canvas id="portrait'+i+'" width="180" height="164" aria-hidden="true"></canvas><strong>'+h.name+'</strong><small>'+h.weapon+'</small><span class="progression-meta">'+(i<19?needXp(h).toLocaleString('vi-VN')+' KN → '+(i+2):'CẤP TỐI ĐA')+'</span></button>').join('')+'<button class="hero-tile" id="robotLore" aria-label="Xem tạo hình robot ẩn Lv21"><span class="num">21</span><canvas id="portraitRobot" width="180" height="164" aria-hidden="true"></canvas><strong>Long Thần Cơ Giáp</strong><small>ROBOT KHỔNG LỒ · TƯỚNG ẨN</small><span class="progression-meta">7 NGỌC RỒNG · XEM TẠO HÌNH</span></button></div><p style="font-size:10px">Vũ khí chính tham chiếu bản Diễn Nghĩa 120 hồi; hình vẽ được cách điệu. Bốn cấp lính đầu và thứ tự tiến hóa là quy ước gameplay, không phải thứ hạng lịch sử.</p>');
 HEROES.slice(0,20).forEach((h,i)=>{let c=$('portrait'+i).getContext('2d');c.scale(2,2);let e=entity(0,0,i+1,'');e.weapon=LootRules.makeWeapon(i);drawWarrior(c,e,31,46,Math.min(.9,21/radius(e)),true)});
 const rc=$('portraitRobot').getContext('2d');rc.scale(2,2);drawWarrior(rc,entity(0,0,21,''),45,41,.2,true);$('robotLore').onclick=showRobot;
 $('modalContent').querySelectorAll('[data-hero]').forEach(button=>button.onclick=()=>showWeaponLore(Number(button.dataset.hero)));
}
function showWeaponLore(index){
 const h=HEROES[index],chapter=String(h.chapter).padStart(3,'0');
 const source=h.chapter?'<a class="source-link" href="https://zh.wikisource.org/wiki/三國演義/第'+chapter+'回" target="_blank" rel="noopener noreferrer">Đọc nguyên tác · Hồi '+h.chapter+' ↗</a>':'';
 openModal('<div class="eyebrow">BINH KHÍ · CẤP '+h.level+'</div><h2>'+h.name+'</h2><div class="weapon-detail"><canvas id="weaponPortrait" width="640" height="400" aria-label="'+h.name+' cầm '+h.weapon+'"></canvas><div><h3>'+h.weapon+'</h3><canvas id="weaponStudy" width="640" height="240" style="display:block;width:100%;max-width:320px;height:auto;background:#182d24;border:1px solid #c9b57c33;border-radius:4px" aria-label="Hình dáng '+h.weapon+' của '+h.name+'"></canvas><p style="font-size:11px;color:#acbba6">Tạo hình cách điệu: '+WEAPON_PROFILES[index].description+'</p><p class="progression-stats">Kích thước ×'+sizeMultiplier(h).toFixed(2)+' · '+(h.level<20?needXp(h).toLocaleString('vi-VN')+' KN để lên cấp '+(h.level+1):'Đã đạt cấp tối đa')+'</p><p>'+h.lore+'</p>'+(h.sidearm?'<p class="sidearm-note">Trang bị phụ: '+(h.sidearm==='bow'?'cung và ống tên':'Thanh Công kiếm')+'. Hiện chỉ thể hiện trên nhân vật; đòn đánh vẫn dùng '+h.weapon.toLowerCase()+'.</p>':'')+source+'</div></div><button class="primary" id="backToLevels">← DANH SÁCH 20 BẬC</button>');
 const c=$('weaponPortrait').getContext('2d');c.scale(2,2);const e=entity(0,0,h.level,'');e.weapon=LootRules.makeWeapon(index);drawWarrior(c,e,115,115,Math.min(1.05,170/(reach(e)+30)),true);
 const study=$('weaponStudy').getContext('2d'),profile=WEAPON_PROFILES[index];
 study.scale(2,2);study.translate(18,60);const fit=Math.min(275/modelReach(h),45/Math.max(12,profile.width+3));study.scale(fit,fit);study.translate(0,-7);weapon(study,h,modelReach(h)-10);
 $('backToLevels').onclick=showLevels;
 $('modal').querySelector('.modal-card').scrollTop=0;
}
function showHelp(){openModal('<div class="eyebrow">BINH PHÁP · TRANG BỊ</div><h2>Phá rương, chọn binh khí</h2><div class="help-list">'+(isTouch?'<b>Joystick</b> di chuyển/hướng đánh · <b>CHÉM</b> tấn công.<br><b>CHẠY</b> tiêu hao KN · <b>LƯỚT</b> tiêu hao thể lực.<br>Tự nhặt vũ khí/ngọc rồng khi đi sát · <b>TÚI</b> đổi đồ tại vòng cờ · Nút kỹ năng dùng skill vũ khí.<br>':'<b>WASD / mũi tên</b> di chuyển, thả phím để dừng; chuột ngắm.<br>Di chuột để chạy theo chuột; đưa chuột sát nhân vật để dừng.<br><b>Click trái / Space</b> chém · <b>Chuột phải</b> chạy −10 KN/s · <b>Shift</b> lướt.<br><b>F</b> mở túi tại vòng cờ · <b>Q</b> kỹ năng vũ khí · <b>E</b> tiến hóa · <b>Esc/P</b> menu.<br>')+'</div><p><b>Cấp nhân vật:</b> 1–20 bằng EXP; chỉ tăng sinh lực, kích thước và hình dáng, không tăng ATK/ASPD, không tự đổi vũ khí. Khởi đầu cầm khúc gỗ trắng. EXP mỗi cấp tăng 50%: 150 + 60 × (cấp − 1) + 15 × (cấp − 1)²; tổng từ Lv1 đến Lv20 là 44.745 KN. Cơ thể lớn hơn làm tầm vũ khí lớn theo tỷ lệ mô hình. Lên cấp hồi đầy máu. Chạy nhanh vẫn tốn 10 KN hiện tại/giây, không tụt cấp.</p><p><b>Hạ gục:</b> người kết liễu chỉ nhận ngay thưởng cơ bản (24 + 16 × cấp đối thủ). Phần 20% tổng EXP đối thủ (làm tròn xuống) rơi thành ngọc EXP lớn quanh xác, không cộng thẳng. Ví dụ tổng 5.000 KN rơi thêm đúng 1.000 KN. Sau 0,6s ai tới nhặt đều được, kể cả BOT hoặc người thứ ba; chỉ nhận giá trị viên đã nhặt. Tính cả EXP đã dùng lên cấp; chạy nhanh không giảm phần này. Đối thủ chưa có EXP không rơi phần 20%. Ngọc EXP thường khi chết vẫn giữ nguyên. BOT sinh cấp cao có tổng EXP nền tương ứng cấp, không coi là 0 EXP.</p><p><b>Rương:</b> Tối đa 15 rương trên bản đồ, máu cấp 1–5 lần lượt 36 / 72 / 144 / 540 / 900. Đầu trận có 15 rương random, không cố định cấp. Tỉ lệ Lv1/Lv2/Lv3/Lv4/Lv5 là 70% / 15% / 10% / 4% / 1%, áp dụng cả đợt đầu và các ô bù thường; không tăng theo thời gian. Phá rương luôn rơi 1 vũ khí; rương cấp cao tăng tỉ lệ phẩm hiếm. Vũ khí đỏ CHỈ rơi từ rương Lv3/4/5 (0,5% / 1% / 3%). Lv1/Lv2 không rơi vũ khí đỏ; phần xác suất đỏ cũ chuyển sang cam: Lv1 Tím/Cam 0,45% / 0,05%, Lv2 1,8% / 0,2%. Ngọc rồng vẫn có thể rơi từ mọi cấp rương. Mỗi 60 giây theo giờ chung của bản đồ, bù các rương đã phá tại vị trí mới. Rương chưa phá giữ nguyên cấp/máu. Mốc cố định theo đợt bù 60s, không tính đợt đầu: đợt 5/10/15… bảo đảm 1 rương Lv4; đợt 10/20/30… bảo đảm thêm 1 Lv5. Rương ra sớm không reset mốc. Hai bảo đảm có thể cùng đợt. Nếu không đủ ô đã phá, giữ phần bảo đảm chờ đợt có ô, ưu tiên Lv5; không thay rương sống hoặc vượt 15. Những ô bảo đảm là ngoại lệ của tỉ lệ random. Người vào phòng muộn dùng cùng nhịp với mọi người. Đồng hồ BÙ SAU ở gần nút TÚI. Vũ khí: trắng → lục → lam → tím → cam → đỏ. ATK, ASPD và tầm gốc theo loại/phẩm vũ khí. Cùng loại, phẩm càng cao vũ khí càng to: trắng ×1,00; lục ×1,08; lam ×1,16; tím ×1,25; cam ×1,36; đỏ ×1,50 (lớn nhất). Cả chiều dài, bề rộng, tầm đánh và hitbox chặn đều theo đúng hình vẽ, phóng quanh tay cầm chứ không phóng tay. Đi sát là tự nhặt, không cần F/NHẶT. Trắng–tím chỉ tự thay khi phẩm cao hơn (khúc gỗ được đổi sang vũ khí trắng); phẩm ngang/thấp hơn giữ trên đất. Vàng/cam và đỏ tự cất vào túi 24 ô, không tự trang bị. Ngọc rồng cũng tự nhặt. Túi đầy thì vũ khí hiếm ở lại trên đất. Vào vòng cờ bất kỳ sẽ hiện túi; chọn món để trang bị, hoặc F/TÚI để mở lại. Chỉ đổi khi còn sống và đang trong vòng cờ, không cần chờ gia nhập phe. Vũ khí vàng/đỏ cũ trở về túi; đồ thường cũ rơi xuống đất, trừ khúc gỗ. Giữ nguyên hồi chiêu, hủy buff/đòn cũ. Rời cờ tự đóng túi. Túi không dừng trận; chết/tái xuất/rời phòng mất trang bị và túi.</p><p><b>Cam/đỏ:</b> mỗi vũ khí có 1 skill theo loại: Xuyên trận (đâm xa), Hoành tảo (quét vòng) hoặc Liên kích (ASPD ×1,30 trong 3s). Cam hồi 12s, đỏ 10s. Skill và đòn thường đều tuân thủ đồng đội/vùng an toàn. Không mất KN để dùng skill. Xuyên trận/Hoành tảo gây ATK ×1,20 (cam) hoặc ×1,35 (đỏ), có nhịp vung vũ khí thay vì sát thương tức thì. Chờ hết đòn chém hiện tại mới dùng hai skill này.</p><p><b>Cân bằng &amp; chặn:</b> ATK được cân theo tốc độ đánh, không tăng theo số thứ tự binh khí hay LV tướng. Đòn thường tối đa 53 ATK, skill tấn công tối đa 72; HP Lv1/20 là 112/340. Hai bên cùng chém (Click/Space hoặc CHÉM) lệch nhịp tối đa khoảng 0,09s, trong pha ra đòn và vũ khí thực sự chạm nhau sẽ CHẶN: hủy cả hai đòn, không mất máu; mỗi bên bật lùi 32 đơn vị ra xa nhau. Người trong vòng cờ không bị đẩy, vị trí luôn giới hạn trong bản đồ. Chém thường hoặc skill đâm/quét đều có thể bị chặn. Chém trễ, sai hướng, chưa chạm vũ khí hoặc đứng yên không chặn được; không hoàn lại sát thương đã trúng trước đó. Vẫn mất thời gian hồi đòn/skill, không có lá chắn bất tử trước người thứ ba.</p><p><b>Ngọc rồng:</b> vật phẩm đỏ rơi thêm, độc lập với vũ khí, tính theo người phá rương. Tỉ lệ mỗi rương: 0 viên 0,1%; 1 viên 0,2%; 2 viên 0,4%; 3 viên 0,8%; 4 viên 1,6%; 5 viên 3,2%; 6 viên 6,4%. Nhặt đủ 7 viên sẽ triệu hồi Long Thần Cơ Giáp khổng lồ (Lv21) và hồi đầy 352 HP. Robot lớn khoảng 1,7 lần Lv20, hitbox/tầm vũ khí theo kích thước thật; giữ nguyên ATK/ASPD, trang bị, túi và quốc gia. Hiệu ứng triệu hồi 2,4s không dừng trận, không tạo bất tử hoặc thêm BOT. Xem tạo hình trong bảng tiến hóa. Không tăng cấp 21 bằng EXP. Vũ khí trên đất tồn tại 120s, ngọc rồng 300s. Chết/tái xuất hoặc rời phòng sẽ mất tiến độ và trang bị.</p><p><b>BOT chiến thuật:</b> có tính cách và độ trễ phản ứng, biết chọn trận, đi vòng giữ tầm đánh, rút về cờ khi yếu, chọn đồ/EXP/rương theo lợi ích. Dùng kỹ năng, lướt và chạy bằng tài nguyên thật; không tăng chỉ số hoặc đọc lệnh điều khiển của bạn. BOT vẫn phải đứng cờ đủ 5s, tuân thủ đồng đội và vùng an toàn.</p><p><b>Quốc gia:</b> ở trong vòng cờ 5s để gia nhập/đổi phe. Đồng đội không gây sát thương; trung gian không phải đồng đội. Trong mọi vòng cờ đều được bảo vệ ngay. BOT tạm dừng được, ONLINE không dừng máy chủ khi mở menu.</p><button class="primary" id="resumeHelp">ĐÃ RÕ →</button>');$('resumeHelp').onclick=closeModal}
function showDeath(killer){let h=HEROES[player.level-1];openModal('<div class="eyebrow">MỘT TRẬN CHIẾN KHÉP LẠI</div><h2>Bại trận, không bại chí.</h2><p>Bạn đã ngã xuống trên chiến trường. Tái xuất sẽ đặt lại cấp, trang bị và ngọc rồng của lượt này.</p><div class="result-stats"><span><strong>'+player.level+'</strong>CẤP ĐỘ</span><span><strong>'+killCount+'</strong>HẠ GỤC</span><span><strong>'+formatTime(elapsed)+'</strong>SINH TỒN</span></div><p>Võ tướng đạt được: <b style="color:#e6be72">'+h.name+'</b><br>Nhặt ngọc, giữ khoảng cách và chọn thời điểm vung đao.</p><button class="primary" id="restart">TÁI XUẤT GIANG HỒ <span>→</span></button>');$('restart').onclick=startGame}
function startGame(){if(window.netGame?.active)window.netGame.leave();init();state='playing';paused=false;$('startScreen').classList.add('hidden');$('modal').classList.add('hidden');$('announcement').classList.remove('show');$('pause').textContent='II';$('killfeed').replaceChildren();tone(420,.18,'triangle');announce('Dân binh','Tự nhặt vũ khí · Vàng/đỏ vào túi · Về cờ để trang bị');last=performance.now()}
function togglePause(){if(window.netGame?.active){window.netGame.menu();return}if(state!=='playing')return;if(!$('modal').classList.contains('hidden')){closeModal();return}openModal('<div class="eyebrow">NGHỈ BINH</div><h2>Chiến trường tạm dừng</h2><p>Trận đấu sẽ tiếp tục khi bạn sẵn sàng.</p><button class="primary" id="resume">TIẾP TỤC <span>→</span></button>');$('resume').onclick=closeModal;$('pause').textContent='▶'}
$('campsButton').onclick=showKingdoms;$('startButton').onclick=startGame;$('previewLevels').onclick=showLevels;$('evolution').onclick=showLevels;$('help').onclick=showHelp;$('pause').onclick=togglePause;$('closeModal').onclick=()=>{if(state==='dead'&&!window.netGame?.active){state='menu';$('startScreen').classList.remove('hidden')}closeModal()};$('sound').onclick=()=>{soundEnabled=!soundEnabled;$('sound').style.color=soundEnabled?'#e6be72':'#eee8d6';$('sound').textContent=soundEnabled?'♫':'♪';$('sound').title=soundEnabled?'Tắt âm thanh':'Bật âm thanh';$('sound').setAttribute('aria-label',$('sound').title);tone(440,.12)};
addEventListener('keydown',e=>{if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&document.activeElement.closest?.('#inventoryPanel'))return;if(document.activeElement.tagName==='INPUT'){if(e.key==='Enter')startGame();return}let k=movementKey(e);if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)){setInputDevice(false);controlSource='keyboard'}if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k))e.preventDefault();if(!e.repeat){if(k==='Escape'&&bagOpen&&$('modal').classList.contains('hidden')){closeBag();return}if(k==='Escape'||k==='p')togglePause();if(k==='e'&&state==='playing'){if($('modal').classList.contains('hidden'))showLevels();else closeModal()}if(k==='Shift')dash();if(state==='playing'&&!paused){if(k==='f')openBag();if(k==='q')useWeaponSkill(player)}}keys[k]=true;inputChanged()});addEventListener('keyup',e=>{keys[movementKey(e)]=false;inputChanged()});addEventListener('blur',()=>{clearControls();if(state==='playing'&&!paused)togglePause()});document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){window.speedTrails?.clear();clearControls();if(state==='playing'&&!paused)togglePause()}});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;setInputDevice(false);if(e.clientX!==mouse.x||e.clientY!==mouse.y)controlSource='mouse';mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;mouse.sprint=!!(e.buttons&2);inputChanged()});
canvas.addEventListener('pointerleave',()=>{mouse.active=false;mouse.down=false;mouse.sprint=false;inputChanged()});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;setInputDevice(false);mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;controlSource='mouse';if(e.button===2){mouse.sprint=true}else if(e.button===0){mouse.down=true;if(state==='playing'&&!paused)attack(player)}inputChanged()});
canvas.addEventListener('mousedown',e=>{if(e.button===2){e.preventDefault();mouse.sprint=true}else if(e.button===0&&mouse.sprint){mouse.down=true;if(state==='playing'&&!paused)attack(player)}});
addEventListener('mouseup',e=>{if(e.button===2)mouse.sprint=false;if(e.button===0)mouse.down=false});
addEventListener('pointerup',e=>{if(e.pointerType!=='touch'){mouse.down=!!(e.buttons&1);mouse.sprint=!!(e.buttons&2);inputChanged()}});
canvas.addEventListener('pointercancel',()=>{mouse.down=false;resetSprint();inputChanged()});canvas.addEventListener('contextmenu',e=>e.preventDefault());
const joy=$('joystick');function moveJoy(e){if(e.pointerId!==joyPointer)return;const r=joyBounds||(joyBounds=joy.getBoundingClientRect());let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.hypot(x,y),m=35;if(d>m){x=x/d*m;y=y/d*m}const vector=joystickVector(x,y);touch.active=true;touch.x=vector.x;touch.y=vector.y;controlSource='touch';mouse.active=false;$('stick').style.transform=`translate(${x}px,${y}px)`;inputChanged()}
joy.addEventListener('pointerdown',e=>{e.preventDefault();if(joyPointer!==null)return;joyPointer=e.pointerId;joyBounds=joy.getBoundingClientRect();joy.setPointerCapture(e.pointerId);moveJoy(e)});joy.addEventListener('pointermove',moveJoy);function releaseJoy(e){if(e.pointerId!==joyPointer)return;joyPointer=null;joyBounds=null;touch.active=false;touch.x=touch.y=0;$('stick').style.transform='none';inputChanged()}for(const event of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(event,releaseJoy);addEventListener('resize',()=>{joyBounds=null});
$('attackButton').addEventListener('pointerdown',e=>{e.preventDefault();if(attackPointer!==null)return;attackPointer=e.pointerId;$('attackButton').setPointerCapture(e.pointerId);if(state==='playing'&&!paused){attack(player);mouse.down=true;inputChanged()}});for(const event of ['pointerup','pointercancel','lostpointercapture'])$('attackButton').addEventListener(event,e=>{if(e.pointerId!==attackPointer)return;attackPointer=null;mouse.down=false;inputChanged()});$('dashButton').addEventListener('pointerdown',e=>{e.preventDefault();dash()});
$('lootButton').addEventListener('click',()=>{if(state==='playing'&&!paused)openBag()});$('skillButton').addEventListener('click',()=>{if(state==='playing'&&!paused)useWeaponSkill(player)});
const sprintButton=$('sprintButton');
sprintButton.addEventListener('pointerdown',e=>{e.preventDefault();if(sprintPointer!==null)return;sprintPointer=e.pointerId;sprintButton.setPointerCapture(e.pointerId);if(state==='playing'&&!paused)touch.sprint=true;inputChanged()});
for(const event of ['pointerup','pointercancel','lostpointercapture'])sprintButton.addEventListener(event,e=>{if(e.pointerId!==sprintPointer)return;sprintPointer=null;touch.sprint=false;inputChanged()});
addEventListener('pointerdown',e=>{if(e.pointerType==='touch')setInputDevice(true)});
if(window.bash){window.bash.ready.then(()=>{if(window.bash.user?.username&&state==='menu')$('nickname').value=window.bash.user.username.slice(0,18)}).catch(()=>{})}
// Cosmetic only: these samples never participate in collision, XP or networking.
class SpeedTrailFX{
 constructor(){this.samples=new Map();this.ghosts=[];this.dust=[]}
 clear(){this.samples.clear();this.ghosts.length=0;this.dust.length=0}
 update(actors,dt,{enabled=true,lowDetail=false,view=null}={}){
  if(!Number.isFinite(dt)||dt<=0)return;
  dt=Math.min(dt,.1);
  for(const g of this.ghosts)g.life-=dt;
  this.ghosts=this.ghosts.filter(g=>g.life>0);
  for(const p of this.dust){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt}
  this.dust=this.dust.filter(p=>p.life>0);
  const seen=new Set(),ghostCap=lowDetail?48:80,dustCap=lowDetail?120:200;
  for(const e of actors){
   if(!e.alive)continue;seen.add(e);
   const previous=this.samples.get(e);this.samples.set(e,{x:e.x,y:e.y,wait:previous?.wait||0});
   if(!previous||!enabled)continue;
   const dx=e.x-previous.x,dy=e.y-previous.y,d=Math.hypot(dx,dy);
   const boost=e.dash>0||e.trailDash?'dash':e.sprinting?'sprint':null;
   if(!boost||d<.2||d>140){this.samples.get(e).wait=0;continue}
   if(view&&(Math.abs(e.x-view.x)>view.width/2+180||Math.abs(e.y-view.y)>view.height/2+180))continue;
   const sample=this.samples.get(e);sample.wait=Math.max(0,previous.wait-dt);
   if(sample.wait>0)continue;
   sample.wait=boost==='dash'?.043:lowDetail?.085:.065;
   const nx=dx/d,ny=dy/d,r=radius(e),dash=boost==='dash',color=dash?'#c5e6d2':'#efd39b';
   const x=e.x-nx*r*1.2,y=e.y-ny*r*1.2,life=dash?.3:.24;
   this.ghosts.push({x,y,r,angle:e.angle,direction:Math.atan2(dy,dx),life,max:life,color,robe:HEROES[e.level-1].color,dash});
   const count=lowDetail?2:3;
   for(let i=0;i<count;i++){
    const side=(i-(count-1)/2)*r*.45+rand(-2,2),life=rand(.27,.43);
    this.dust.push({x:x-ny*side,y:y+nx*side,vx:-nx*(dash?65:35)-ny*rand(-9,9),vy:-ny*(dash?65:35)+nx*rand(-9,9),life,max:life,r:rand(2,4.3)*Math.min(1.5,r/22),color:'#d4bd8a'});
   }
  }
  for(const e of this.samples.keys())if(!seen.has(e))this.samples.delete(e);
  if(this.ghosts.length>ghostCap)this.ghosts.splice(0,this.ghosts.length-ghostCap);
  if(this.dust.length>dustCap)this.dust.splice(0,this.dust.length-dustCap);
 }
 draw(c){
  c.save();
  for(const g of this.ghosts){
   const fade=g.life/g.max,r=g.r;
   c.save();c.translate(g.x,g.y);c.rotate(g.angle);c.globalAlpha=fade*fade*(g.dash?.35:.27);
   // A simplified body/cape silhouette, never a duplicate damaging weapon.
   poly(c,[[-r*.4,-r*.7],[-r*1.35,-r*.65],[-r*1.55,0],[-r*1.35,r*.65],[-r*.4,r*.7]],g.robe);
   ellipse(c,0,0,r*.75,r*.86,g.robe);ellipse(c,r*.25,0,r*.36,r*.42,g.color);
   c.strokeStyle=g.color;c.lineWidth=1.2;c.beginPath();c.ellipse(0,0,r*.78,r*.9,0,0,TAU);c.stroke();c.restore();
   c.save();c.translate(g.x,g.y);c.rotate(g.direction);c.globalAlpha=fade*fade*.8;c.lineCap='round';
   for(const side of [-1,1]){c.strokeStyle=g.color;c.lineWidth=g.dash?2.4:1.5;c.beginPath();c.moveTo(-r*.4,side*r*.6);c.lineTo(-r*(g.dash?2.3:1.7),side*r*.65);c.stroke()}c.restore();
  }
  for(const p of this.dust){const fade=p.life/p.max;c.globalAlpha=fade*fade*.42;ellipse(c,p.x,p.y,p.r*(1.8-fade),p.r*.65*(1.8-fade),p.color)}
  c.restore();
 }
}
window.speedTrails=new SpeedTrailFX();
function loop(t){let dt=Math.min(Math.max(0,(t-last)/1000)||.016,.1);last=t;if(window.netGame?.active)update(dt);else{const steps=Math.max(1,Math.ceil(dt/.025));for(let i=0;i<steps;i++)update(dt/steps)}window.speedTrails.update([player,...bots],dt,{enabled:state==='playing'&&!paused||!!window.netGame?.active,lowDetail:isTouch||W<650,view:{x:camera.x,y:camera.y,width:W,height:H}});render();requestAnimationFrame(loop)}requestAnimationFrame(loop);
