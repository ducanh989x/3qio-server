'use strict';
const expNumber=new Intl.NumberFormat('vi-VN');
let onlineStandingsCache={};
function localStandings(){return [player,...bots].filter(e=>e.alive).sort((a,b)=>b.totalXp-a.totalXp||b.kills-a.kills)}
function matchStandings(){return window.netGame?.active?window.netGame.scoreTop10:localStandings().slice(0,10)}
function refreshStandings(){
 const button=$('standingsButton');if(!button)return;
 const online=!!window.netGame?.active,all=online?null:localStandings(),rows=online?window.netGame.scoreTop10:all.slice(0,10),own=online?window.netGame.scoreRank:(all.indexOf(player)+1||null),rank=own?'#'+own:'—',self=e=>online?e.id===player.id:e===player;
 const number=button.querySelector('small');if(number.textContent!==rank)number.textContent=rank;
 let key;if(online&&onlineStandingsCache.rows===rows&&onlineStandingsCache.owner===player.id&&onlineStandingsCache.rank===own)key=onlineStandingsCache.key;else{key=JSON.stringify([online,online?player.id:player.name,own,rows?.map(e=>[e.id,e.name,Math.floor(e.totalXp)])]);if(online)onlineStandingsCache={rows,owner:player.id,rank:own,key}}
 const hint=$('standingsHint');if(hint){const text=online&&!rows?'Cần máy chủ v2.20 để có BXH tổng điểm.':'Xếp theo tổng điểm tích lũy của lượt hiện tại';if(hint.textContent!==text)hint.textContent=text}
 const compact=$('top10Rows');if(compact&&compact.dataset.standingsKey!==key){compact.dataset.standingsKey=key;compact.replaceChildren();if(!rows){const note=document.createElement('p');note.className='top10-empty';note.textContent='Cần server v2.20';compact.append(note)}else for(const[index,e]of rows.entries()){const row=document.createElement('div');row.className='top10-row';row.classList.toggle('is-you',self(e));row.dataset.actorId=e.id||String(index);const pos=document.createElement('span'),name=document.createElement('span'),text=document.createElement('span'),score=document.createElement('b');pos.className='top10-pos';pos.textContent=index+1;name.className='top10-name';text.textContent=e.name;name.title=e.name;name.append(text);score.textContent=expNumber.format(Math.floor(e.totalXp));score.title=score.textContent+' Điểm';row.append(pos,name,score);compact.append(row)}}
 const footer=$('top10Self');if(footer){const text=rank+' · '+player.name;if(footer.textContent!==text)footer.textContent=text}
 // Do not construct tables for hidden/closed details while movement snapshots arrive.
 for(const id of['standingsRows','pauseRanks']){const container=$(id);if(!container||$('modal').classList.contains('hidden')||container.closest('details')&&!container.closest('details').open||container.dataset.standingsKey===key)continue;container.dataset.standingsKey=key;container.replaceChildren();if(!rows){const note=document.createElement('p');note.textContent='Cập nhật máy chủ lên v2.20 để có BXH tổng điểm.';container.append(note);continue}
  const table=document.createElement('table');table.className='match-standings';const head=document.createElement('thead'),header=document.createElement('tr');for(const label of['#','Tên','Điểm']){const cell=document.createElement('th');cell.scope='col';cell.textContent=label;header.append(cell)}head.append(header);table.append(head);const body=document.createElement('tbody');rows.forEach((e,index)=>{const row=document.createElement('tr');row.classList.toggle('is-you',self(e));row.dataset.actorId=e.id||String(index);for(const value of[index+1,e.name,expNumber.format(Math.floor(e.totalXp))]){const cell=document.createElement('td');cell.textContent=String(value);row.append(cell)}body.append(row)});table.append(body);container.append(table);
 }
}
function showMatchStandings(){
 if(state!=='playing'&&state!=='dead')return;
 const online=!!window.netGame?.active;openModal('<div class="eyebrow">BXH · ĐIỂM</div><h2>Top 10 trong trận</h2><p class="standings-warning">'+(online?'ONLINE vẫn chạy; mở BXH không bảo vệ nhân vật.':'Trận đang tạm dừng.')+'</p><p id="standingsHint" role="status"></p><div id="standingsRows"></div><p class="standings-note">Điểm tích lũy của lượt hiện tại, không phải kinh nghiệm dự trữ. Tái xuất đặt lại điểm. Bảng không hiển thị vị trí, HP hoặc trang bị.</p><button id="standingsContinue" class="primary">ĐÓNG BXH →</button>');$('modal').classList.add('standings-modal');refreshStandings();$('standingsContinue').onclick=closeModal;$('standingsContinue').focus?.({preventScroll:true});
}
$('standingsButton').title='BXH Top 10 · Điểm';$('standingsButton').onclick=showMatchStandings;
$('modal').addEventListener('toggle',()=>refreshStandings(),true);
