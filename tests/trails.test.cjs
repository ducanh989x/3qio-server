'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const vm=require('node:vm');const {readFileSync}=require('node:fs');const {join}=require('node:path');
const source=readFileSync(join(__dirname,'../game.js'),'utf8');
function fx(){const c=vm.createContext({Math,Map,Set,Number,TAU:Math.PI*2,rand:(a,b)=>(a+b)/2,radius:e=>18+e.level,HEROES:Array.from({length:20},()=>({color:'#698967'}))});vm.runInContext(source.slice(source.indexOf('function ellipse('),source.indexOf('function drawSidearm(')),c);vm.runInContext(source.slice(source.indexOf('class SpeedTrailFX{'),source.indexOf('window.speedTrails=new SpeedTrailFX();')),c);return vm.runInContext('new SpeedTrailFX()',c)}
const actor=()=>({x:1000,y:1000,level:5,angle:0,alive:true,dash:0,sprinting:true,xp:50,hp:160});
test('ghosts and dust originate behind actual movement, not weapon facing',()=>{
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1]]){
  const f=fx(),e=actor();f.update([e],.016);e.x+=dx*10;e.y+=dy*10;const before=JSON.stringify(e);f.update([e],.016);
  assert.equal(f.ghosts.length,1);assert.ok(f.dust.length>0);const g=f.ghosts[0];assert.ok((e.x-g.x)*dx+(e.y-g.y)*dy>0);assert.equal(g.angle,0);assert.equal(JSON.stringify(e),before);
 }
});
test('no trail for normal movement, standing still, disabled effects or teleport',()=>{
 for(const kind of ['normal','standing','disabled','teleport']){
  const f=fx(),e=actor();f.update([e],.016);if(kind!=='standing')e.x+=kind==='teleport'?500:10;if(kind==='normal')e.sprinting=false;
  f.update([e],.016,{enabled:kind!=='disabled'});assert.equal(f.ghosts.length,0,kind);assert.equal(f.dust.length,0,kind);
 }
});
test('dash is brighter/longer, trails fade out after stop and samples clean up',()=>{
 const f=fx(),e=actor();e.sprinting=false;e.dash=.2;f.update([e],.016);e.x+=10;f.update([e],.016);assert.equal(f.ghosts[0].dash,true);assert.equal(f.ghosts[0].max,.3);
 e.dash=0;for(let i=0;i<6;i++)f.update([], .1);assert.equal(f.ghosts.length,0);assert.equal(f.dust.length,0);assert.equal(f.samples.size,0);
});
test('mobile/desktop budgets bound effects even in a crowded fight; rendering balances canvas state',()=>{
 for(const lowDetail of [false,true]){
  const f=fx(),actors=Array.from({length:100},actor);f.update(actors,.016,{lowDetail});
  for(let i=0;i<30;i++){actors.forEach(e=>e.x+=10);f.update(actors,.016,{lowDetail});assert.ok(f.ghosts.length<=(lowDetail?48:80));assert.ok(f.dust.length<=(lowDetail?120:200))}
  const stack=[];const target={globalAlpha:1,save(){stack.push(this.globalAlpha)},restore(){this.globalAlpha=stack.pop()}};
  const c=new Proxy(target,{get(t,k){return k in t?t[k]:(...args)=>{for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value))}}});
  f.draw(c);assert.equal(stack.length,0);assert.equal(c.globalAlpha,1);f.clear();assert.equal(f.ghosts.length,0);assert.equal(f.dust.length,0);assert.equal(f.samples.size,0);
 }
});
