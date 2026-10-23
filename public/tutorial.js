/* First-visit UI preference only: no account, match progress or trusted identity. */
(() => {
 'use strict';
 const SEEN='3qio.tutorial.seen.v1';
 let shell=null,index=0,returnFocus=null,background=[],lastTouch=false;
 const sword='<path d="M91 50l43-43 13 3 3 13-43 43m-28-30 38 38m-29-9-12 12m-5-5 10 10"/>';
 function illustration(){const shapes=[isTouch?'<circle cx="85" cy="32" r="24"/><circle cx="85" cy="32" r="9"/><path d="M124 32h34m-10-10 10 10-10 10"/>':'<text x="110" y="42" text-anchor="middle" fill="currentColor" stroke="none" font-size="28">W A S D</text>',sword,'<path d="M67 29h80v31H67zM67 29V17q40-23 80 0v12M104 29v12h8V29"/>','<text x="110" y="42" text-anchor="middle" fill="currentColor" stroke="none" font-size="26">1 → 20 → 21</text>','<path d="M89 60V5l53 4-12 14 12 13-53-4M77 60h25"/>'];return '<svg viewBox="0 0 220 72" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+shapes[index]+'</svg>'}
 const steps=()=>[
  {title:'Di chuyển & ngắm',art:isTouch?'◉ → ◉':'W A S D',body:isTouch?'<p>Kéo <b>joystick bên trái</b> để di chuyển và chọn hướng đánh. Thả tay để dừng.</p><p>Các nút chiến đấu nằm bên phải, trong tầm ngón tay.</p>':'<p>Dùng <b>WASD / phím mũi tên</b> để đi; thả phím để dừng. Di chuột để ngắm.</p><p>Chuột cũng có thể dẫn đường: đưa con trỏ sát nhân vật để dừng chạy theo chuột.</p>'},
  {title:'Chém, lướt, chạy',art:'⚔',body:isTouch?'<p><b>CHÉM</b> để tấn công. <b>LƯỚT</b> để né, tiêu hao thể lực.</p><p>Giữ <b>CHẠY</b> để tăng tốc: tốn <b>10 EXP/giây</b> khi đang di chuyển.</p>':'<p><b>Click trái / Space</b> để chém. <b>Shift</b> để lướt né, tiêu hao thể lực.</p><p>Giữ <b>chuột phải</b> để chạy nhanh: tốn <b>10 EXP/giây</b> khi đang di chuyển.</p>'},
  {title:'Phá rương, nhặt binh khí',art:'◇ → ⚔',body:'<p>Chém rương, rồi đi sát đồ rơi để <b>tự nhặt</b>. Phẩm cao hơn sẽ tự trang bị.</p><p><b>Cam/Đỏ</b> còn lại được giữ trong túi. Chỉ Cam/Đỏ có kỹ năng riêng theo vũ khí, dùng '+(isTouch?'<b>nút kỹ năng</b>':'<b>Q</b>')+'.</p>'},
  {title:'Nhặt EXP, tiến hóa',art:'1 → 20 → 21',body:'<p>Nhặt <b>ngọc EXP</b> để lên cấp, hồi đầy máu và tăng kích thước/tầm đánh. Cấp không tăng ATK hoặc tốc độ đánh của trang bị.</p><p>Nhặt đủ <b>7 ngọc rồng</b> trong một lượt để hóa robot Lv21. Không lên Lv21 chỉ bằng EXP.</p>'},
  {title:'Về cờ để an toàn',art:'⚑',body:'<p>Vào <b>bất kỳ vòng cờ</b> được bảo vệ ngay. Đứng đủ <b>5 giây</b> để gia nhập/đổi phe; đồng đội không gây sát thương cho nhau.</p><p>Trong cờ, dùng '+(isTouch?'<b>TÚI</b>':'<b>F / TÚI</b>')+' để chọn đồ đã cất. Minimap đánh dấu rương hiếm: <b><span class="tutorial-diamond" aria-hidden="true"></span> tím Lv4 · <svg class="tutorial-map-star" viewBox="0 0 20 20" aria-hidden="true"><path fill="#ffda76" d="m10 1 2.7 5.6 6.2.9-4.5 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2-4.5-4.4 6.2-.9z"/></svg> vàng Lv5</b>.</p><p class="tutorial-caution">Chết hoặc rời trận sẽ mất tiến độ và trang bị của lượt đó.</p>'}
 ];
 function render(focus=false){
  if(!shell)return;lastTouch=isTouch;const all=steps(),step=all[index];
  shell.querySelector('#tutorialStep').textContent='Bước '+(index+1)+' / '+all.length;
  shell.querySelector('#tutorialDevice').textContent=isTouch?'Cảm ứng':'Bàn phím / chuột';
  shell.querySelector('#tutorialTitle').textContent=step.title;
  shell.querySelector('#tutorialArt').innerHTML=illustration();
  shell.querySelector('#tutorialText').innerHTML=step.body;
  shell.querySelector('#tutorialProgress').replaceChildren(...all.map((_,i)=>{const bar=document.createElement('i');bar.classList.toggle('done',i<=index);return bar}));
  shell.querySelector('#tutorialBack').disabled=index===0;
  shell.querySelector('#tutorialNext').textContent=index===all.length-1?'ĐÃ HIỂU →':'TIẾP THEO →';
  shell.querySelector('#tutorialOnline').hidden=!window.netGame?.active;
  shell.querySelector('[role="dialog"]').setAttribute('aria-describedby',window.netGame?.active?'tutorialStep tutorialOnline':'tutorialStep');
  if(focus){shell.querySelector('.tutorial-body').scrollTop=0;shell.querySelector('#tutorialTitle').focus({preventScroll:true})}
 }
 function close(){
  if(!shell)return;
  try{localStorage.setItem(SEEN,'1')}catch{}
  shell.remove();shell=null;for(const [node,inert] of background)node.inert=inert;background=[];
  const focus=returnFocus?.isConnected&&returnFocus!==document.body&&returnFocus.getClientRects().length?returnFocus:document.getElementById(state==='menu'?'startButton':'pause');
  focus?.focus({preventScroll:true});returnFocus=null;
 }
 function open(){
  if(shell||state==='dead')return;
  if(state==='playing'&&!paused)showPauseMenu();
  clearControls();returnFocus=document.activeElement;index=0;
  shell=document.createElement('div');shell.id='basicTutorial';shell.className='tutorial-shell';
  shell.innerHTML='<section class="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorialTitle" aria-describedby="tutorialStep tutorialOnline"><header><div><span id="tutorialStep" aria-live="polite"></span><small id="tutorialDevice"></small></div><button id="tutorialSkip" type="button">Bỏ qua ×</button></header><div id="tutorialProgress" aria-hidden="true"></div><div class="tutorial-body"><h2 id="tutorialTitle" tabindex="-1"></h2><div id="tutorialArt" aria-hidden="true"></div><div id="tutorialText"></div></div><p id="tutorialOnline" class="tutorial-caution" hidden>ONLINE vẫn chạy. Ngoài vòng cờ, bạn vẫn có thể bị đánh khi đọc hướng dẫn.</p><footer><button id="tutorialBack" type="button">← TRƯỚC</button><button id="tutorialNext" type="button">TIẾP THEO →</button></footer><small class="tutorial-note">Chỉ tự hiện lần đầu trên trình duyệt này. Có thể xem lại ở Hướng dẫn cơ bản.</small></section>';
  background=[...document.body.children].map(node=>[node,node.inert]);for(const [node] of background)node.inert=true;
  document.body.append(shell);
  shell.querySelector('#tutorialSkip').onclick=close;
  shell.querySelector('#tutorialBack').onclick=()=>{if(index>0){index--;render(true)}};
  shell.querySelector('#tutorialNext').onclick=()=>{if(index===steps().length-1)close();else{index++;render(true)}};
  render(true);
 }
 // Capture gameplay keys before game.js; never send actions while reading.
 addEventListener('keydown',event=>{
  if(!shell)return;event.stopImmediatePropagation();
  if(event.key==='Escape'){event.preventDefault();close();return}
  if(isTouch){setInputDevice(false);render(false)}
  if(event.key==='Tab'){
   const buttons=[...shell.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1),active=document.activeElement;
   if(event.shiftKey&&(active===first||!buttons.includes(active))){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&(active===last||!buttons.includes(active))){event.preventDefault();first.focus()}
  }
 },true);
 addEventListener('keyup',event=>{if(shell)event.stopImmediatePropagation()},true);
 addEventListener('pointerdown',()=>{if(shell&&lastTouch!==isTouch)render(false)});
 document.getElementById('tutorialOpen').onclick=open;
 window.basicTutorial=Object.freeze({open,close});
 let seen=false;try{seen=localStorage.getItem(SEEN)==='1'}catch{}
 if(!seen)requestAnimationFrame(()=>{if(state==='menu'&&!window.netGame?.active&&document.getElementById('modal').classList.contains('hidden'))open()});
})();
