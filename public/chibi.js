// Cosmetic-only chibi silhouettes. Weapon grip, blade pose and physics stay untouched.
const CHIBI_STYLES=Object.freeze([
 ['#b6c88b','#73874e','#f6ce9e','rag',''],
 ['#edc44b','#ffe16c','#f5c391','bandana',''],
 ['#7faab0','#a8bec7','#f1c69e','pot',''],
 ['#be875b','#8dabb5','#eac196','captain','moustache'],
 ['#bb8750','#70513f','#bd805e','bear','short'],
 ['#7eab70','#689361','#edbf94','elder','stubble'],
 ['#65b790','#4b947a','#ffdab3','youth',''],
 ['#7b9ed0','#5c83b7','#efbd92','coin','moustache'],
 ['#df9565','#ba654c','#e4a87b','scar','moustache'],
 ['#e6a05b','#edd1a1','#e7b486','bald','white'],
 ['#87bcc6','#e9e7d4','#e3b88d','wrap','moustache'],
 ['#629ed1','#5e8caf','#edc198','chevron','short'],
 ['#bb7ad2','#704f9d','#eeb787','bells',''],
 ['#e98673','#c45658','#f2c39a','ribbon',''],
 ['#e1b74f','#d8a941','#efc79f','archer','white'],
 ['#dce4e7','#e8f3ef','#ffdab9','horse',''],
 ['#e6a24d','#566e60','#c18c6b','tiger','round'],
 ['#a9e1e5','#e0f2f3','#ffe0bf','dragon',''],
 ['#5bb685','#428562','#d87963','sage','long'],
 ['#db796a','#e7bc58','#f4c4a1','phoenix','']
].map(([coat,cap,skin,kind,beard])=>Object.freeze({coat,cap,skin,kind,beard})));
function chibiStar(c,x,y,r,color){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,s=i%2?r*.43:r;p.push([x+Math.cos(a)*s,y+Math.sin(a)*s])}poly(c,p,color)}
function drawChibiWarrior(c,e,r,a,bob,portrait){
 const s=CHIBI_STYLES[e.level-1],ink='#3b333b',gold='#ffe09a',t=portrait?0:clock,phase=e.phase||0,step=portrait?0:Math.sin(t*12+phase)*(e.moving||0),hurt=!portrait&&e.hp<e.maxHp*.3,shout=!portrait&&e.swing>0,dazed=!portrait&&e.clashEffect>.1;
 c.save();c.lineWidth=1.8;c.lineJoin='round';c.lineCap='round';
 // Squashy boots, little mittens, bright tunic and a readable toy-like outline.
 if(e.level>=4){poly(c,[[-r*.35,-r*.66],[-r*1.13,-r*.8],[-r*(1.3+.04*Math.sin(t*5+phase)),0],[-r*1.12,r*.8],[-r*.35,r*.66]],s.coat,ink);line(c,[[-r*.7,-r*.5],[-r*1.07,0],[-r*.7,r*.5]],gold,1.7)}
 drawSidearm(c,HEROES[e.level-1],r);
 for(const sign of [-1,1]){ellipse(c,-r*.42+step*sign*2,sign*r*.66,r*.35,r*.22,ink);ellipse(c,-r*.35+step*sign*2,sign*r*.65,r*.27,r*.13,'#6c5260');ellipse(c,-r*.12,sign*r*.68,r*.30,r*.24,ink);ellipse(c,-r*.08,sign*r*.68,r*.23,r*.17,s.coat)}
 ellipse(c,-r*.18,0,r*.69,r*.77,ink);ellipse(c,-r*.17,-r*.02,r*.61,r*.66,s.coat);
 line(c,[[-r*.65,-r*.38],[-r*.2,0],[-r*.65,r*.38]],e.level>=7?gold:'#f7e6b6',r*.10);line(c,[[-r*.57,-r*.47],[-r*.57,r*.47]],'#725050',r*.13);ellipse(c,-r*.57,0,r*.12,r*.13,gold);ellipse(c,-r*.57,0,r*.055,r*.06,'#b18046');
 if(s.kind==='rag'){poly(c,[[-r*.57,-r*.5],[-r*.35,-r*.47],[-r*.39,-r*.23],[-r*.6,-r*.28]],'#e5d3ab',ink);line(c,[[-r*.56,-r*.44],[-r*.42,-r*.35]],'#8d8166',1)}
 if(s.kind==='tiger')for(const sign of [-1,1])for(let i=0;i<3;i++)ellipse(c,-r*.13+i*r*.13,sign*r*.7,r*.045,r*.06,ink);
 if(s.kind==='bells')for(const sign of [-1,1]){ellipse(c,-r*.25,sign*r*.78,r*.16,r*.17,ink);ellipse(c,-r*.25,sign*r*.78,r*.12,r*.13,'#ffe09a');line(c,[[-r*.3,sign*r*.78],[-r*.2,sign*r*.78]],'#a46c3d',1.4)}
 // Keep faces upright for readability on phones; torso/weapon still face the true aim.
 c.save();c.translate(r*.12,bob*.35);c.rotate(-a);
 const R=r;c.scale(R,R);c.lineWidth=.047;
 const oval=(x,y,rx,ry,fill)=>ellipse(c,x,y,rx,ry,fill),stroke=(p,col=ink,w=.045)=>line(c,p,col,w);
 if(['bandana','youth','ribbon','dragon'].includes(s.kind)){poly(c,[[-.53,-.43],[-1,-.19],[-.84,-.03],[-.55,-.22]],s.kind==='dragon'?'#54bed1':s.cap,ink);poly(c,[[.48,-.42],[.96,-.23],[.85,-.02],[.53,-.19]],s.cap,ink)}
 oval(-.68,.02,.17,.21,ink);oval(.68,.02,.17,.21,ink);oval(-.68,.02,.11,.14,s.skin);oval(.68,.02,.11,.14,s.skin);oval(0,-.04,.73,.72,ink);oval(0,-.04,.67,.66,s.skin);oval(-.25,-.36,.22,.15,'#ffffff22');
 // Hair under the headgear, plus character-specific hat silhouettes.
 if(s.kind==='bald'){oval(-.51,-.37,.16,.26,'#f4ebd2');oval(.51,-.37,.16,.26,'#f4ebd2');oval(0,-.45,.48,.23,s.skin);oval(-.15,-.53,.17,.06,'#fff6df88')}
 else{
  const cloth=['rag','bandana','elder','youth','wrap','bells','ribbon','archer','sage'].includes(s.kind);
  oval(0,-.50,.71,.39,ink);oval(0,-.51,.65,.32,s.cap);
  if(cloth){stroke([[-.60,-.37],[0,-.31],[.60,-.37]],s.kind==='bandana'?'#fff1a1':gold,.09);oval(.03,-.87,.19,.14,ink);oval(.03,-.88,.14,.09,s.cap)}
  else{poly(c,[[-.64,-.39],[-.63,-.66],[-.34,-.88],[0,-.98],[.34,-.88],[.63,-.66],[.64,-.39],[.34,-.48],[0,-.33],[-.34,-.48]],s.cap,ink);stroke([[0,-.9],[0,-.44]],gold,.075);stroke([[-.5,-.52],[-.25,-.59]],'#ffffff99',.045);stroke([[.5,-.52],[.25,-.59]],'#ffffff99',.045)}
 }
 if(s.kind==='rag'){poly(c,[[-.39,-.78],[-.12,-.8],[-.1,-.59],[-.36,-.57]],'#e6d5b1',ink);stroke([[-.34,-.72],[-.17,-.64]],'#8d8166',.025)}
 if(s.kind==='bandana'){oval(0,-.40,.13,.12,'#f9edaf');stroke([[-.04,-.44],[.04,-.36]],'#c59537',.035)}
 if(s.kind==='pot'){for(const x of [-.39,0,.39])oval(x,-.46,.045,.045,gold)}
 if(s.kind==='captain'||s.kind==='chevron'){poly(c,[[-.15,-.86],[0,-1.18],[.18,-.91],[.12,-.68]],s.kind==='captain'?'#f58a6d':'#f9e6ae',ink);poly(c,[[-.18,-.44],[0,-.57],[.18,-.44],[0,-.29]],gold,ink)}
 if(s.kind==='bear'){poly(c,[[-.42,-.64],[-.2,-.92],[.04,-.67],[.23,-.88],[.45,-.62]],'#463b34',ink)}
 if(s.kind==='elder'){stroke([[-.57,-.3],[-.45,-.19]],'#f4e2bd',.09);stroke([[.57,-.3],[.45,-.19]],'#f4e2bd',.09)}
 if(s.kind==='youth'){poly(c,[[-.34,-.8],[-.18,-1.03],[.02,-.83],[.20,-1.01],[.34,-.79]],'#374c43',ink)}
 if(s.kind==='coin'){oval(0,-.48,.19,.17,ink);oval(0,-.48,.14,.12,gold);poly(c,[[-.035,-.52],[.035,-.52],[.035,-.44],[-.035,-.44]],'#8e6e45')}
 if(s.kind==='scar'){stroke([[.35,-.15],[.48,.12]],'#a65b4d',.04);stroke([[.38,-.07],[.46,-.10]],'#a65b4d',.025)}
 if(s.kind==='wrap'){for(let i=0;i<3;i++)stroke([[-.55,-.68+i*.1],[.55,-.58+i*.1]],'#aaaf9b',.025)}
 if(s.kind==='bells'){oval(-.61,.23,.12,.14,gold);oval(.61,.23,.12,.14,gold);stroke([[-.68,.23],[-.55,.23]],'#a37342',.03);stroke([[.55,.23],[.68,.23]],'#a37342',.03)}
 if(s.kind==='ribbon'){poly(c,[[.35,-.6],[.7,-1.04],[.72,-.67],[.91,-.85],[.77,-.4]],'#f4cc8a',ink)}
 if(s.kind==='archer'){stroke([[-.49,-.57],[.54,-.92]],'#805d44',.045);poly(c,[[.36,-.99],[.62,-.96],[.50,-.74]],'#f9e4b4',ink)}
 if(s.kind==='horse'){poly(c,[[.2,-.84],[.37,-1.2],[.63,-1.12],[.79,-.84],[.53,-.96],[.39,-.68]],'#f8f9e9',ink);stroke([[.37,-1.1],[.49,-.91]],'#c7d8dc',.035)}
 if(s.kind==='tiger'){poly(c,[[-.55,-.62],[-.59,-.94],[-.31,-.75]],'#e9b15d',ink);poly(c,[[.55,-.62],[.59,-.94],[.31,-.75]],'#e9b15d',ink);stroke([[-.12,-.54],[0,-.43],[.12,-.54]],'#403c36',.06)}
 if(s.kind==='dragon'){poly(c,[[0,-.93],[.14,-1.24],[.42,-1.1],[.3,-.81]],'#59c7db',ink);stroke([[.15,-1.12],[.24,-.94]],'#eefcfa',.045)}
 if(s.kind==='sage'){poly(c,[[-.48,-.67],[-.40,-1.04],[.40,-1.04],[.48,-.67]],s.cap,ink);oval(0,-.64,.13,.12,gold)}
 if(s.kind==='phoenix'){
  poly(c,[[-.51,-.63],[-.58,-.91],[-.26,-.79],[0,-1.09],[.26,-.79],[.58,-.91],[.51,-.63]],gold,ink);oval(0,-.72,.12,.13,'#ef846c');
  for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*.4,-.85);c.bezierCurveTo(sign*.62,-1.4,sign*1.15,-1.35,sign*1.08,-.76);c.strokeStyle=ink;c.lineWidth=.12;c.stroke();c.strokeStyle='#e99a69';c.lineWidth=.075;c.stroke();oval(sign*1.08,-.78,.12,.16,'#ffe7a0');stroke([[sign*.95,-.83],[sign*1.16,-.73]],'#c66c52',.025)}
 }
 // Blush, expressive brows, glinting eyes, and funny but non-flashing reactions.
 oval(-.45,.18,.16,.095,'#ec8e8580');oval(.45,.18,.16,.095,'#ec8e8580');
 const brow=s.kind==='bald'||s.kind==='archer'||s.kind==='elder'?'#f7e6c7':ink;
 for(const sign of [-1,1]){
  const ex=sign*.25,ey=-.06,blink=!portrait&&Math.sin(t*1.6+phase)>.996;
  if(dazed)chibiStar(c,ex,ey,.14,gold);else if(blink)stroke([[ex-.10,ey],[ex+.10,ey]],ink,.045);else{oval(ex,ey,.098,hurt?.13:.115,ink);oval(ex-.027,ey-.043,.033,.039,'#fff7e3')}
  stroke([[sign*.12,-.24+(shout?.09:0)],[sign*.38,-.26-(hurt?.055:0)]],brow,s.kind==='tiger'?.105:.065);
 }
 oval(0,.13,s.kind==='tiger'?.13:.085,.065,s.kind==='tiger'?'#e58572':'#d28c75');
 if(s.beard==='short'||s.beard==='round'||s.beard==='stubble'){oval(0,.42,s.beard==='round'?.50:.41,s.beard==='round'?.30:.22,s.beard==='stubble'?'#8b8270':ink);oval(0,.28,.28,.13,s.skin)}
 if(s.beard==='white'){poly(c,[[-.45,.24],[-.4,.58],[-.23,.74],[0,.95],[.23,.74],[.4,.58],[.45,.24],[0,.38]],'#f8f0d9',ink);stroke([[-.22,.46],[0,.74],[.22,.46]],'#d2cbb3',.035)}
 if(s.beard==='long'){poly(c,[[-.41,.23],[-.36,.66],[-.16,.91],[0,1.05],[.16,.91],[.36,.66],[.41,.23],[0,.36]],'#34483e',ink);stroke([[-.2,.43],[-.12,.75]],'#657761',.035);stroke([[.2,.43],[.12,.75]],'#657761',.035)}
 if(s.beard==='moustache'||s.beard==='long'){for(const sign of [-1,1]){c.beginPath();c.moveTo(0,.23);c.quadraticCurveTo(sign*.20,.36,sign*.34,.20);c.strokeStyle=ink;c.lineWidth=.075;c.stroke()}}
 if(hurt||shout){oval(0,.34,.13,shout?.14:.10,ink);if(shout)oval(0,.40,.07,.04,'#f49a96')}
 else{c.beginPath();c.moveTo(-.14,.30);c.quadraticCurveTo(0,.44,.14,.30);c.strokeStyle=ink;c.lineWidth=.04;c.stroke();if(['rag','bear','bells'].includes(s.kind))poly(c,[[-.06,.33],[.04,.33],[.04,.41],[-.06,.39]],'#fff4d5')}
 if(hurt||(!portrait&&e.sprinting)){c.save();c.translate(.67,-.30);poly(c,[[0,-.15],[-.09,.01],[-.06,.12],[.06,.12],[.09,.01]],'#9ce6ef',ink);c.restore()}
 c.restore();c.restore();
}
