const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context=vm.createContext({assert,console,Math,TAU:Math.PI*2});
const game=readFileSync(join(__dirname,'../game.js'),'utf8');
vm.runInContext(game.slice(game.indexOf('function ellipse('),game.indexOf('function drawSidearm(')),context);
vm.runInContext(readFileSync(join(__dirname,'../weapons.js'),'utf8'),context);
vm.runInContext(`
let checks=0;
assert.equal(WEAPON_PROFILES.length,20);checks++;
assert.equal(new Set(WEAPON_PROFILES.map(p=>JSON.stringify(p))).size,20);checks++;
const silhouettes=[];
for(let level=1;level<=20;level++){
 const commands=[];let depth=0;
 const c=new Proxy({
  save(){depth++},restore(){depth--},
  createLinearGradient(){return {addColorStop(){}}}
 },{get(target,key){if(key in target)return target[key];return (...args)=>{
  for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),'finite '+key);
  commands.push([key,...args]);
 }}});
 const hero={level},reach=48+level*3.6;
 weapon(c,hero,reach-10);
 assert.equal(depth,0,'balanced canvas state at '+level);checks++;
 assert.ok(commands.length>10,'draws a weapon at '+level);checks++;
 for(const cmd of commands){if(['moveTo','lineTo','quadraticCurveTo','bezierCurveTo'].includes(cmd[0])){
  for(let i=1;i<cmd.length;i+=2){assert.ok(cmd[i]<=reach+.001,'no forward tip beyond combat reach at '+level);}
 }}checks++;
 silhouettes.push(JSON.stringify(commands));
 assert.ok(WEAPON_PROFILES[level-1].description.length>30);checks++;
}
assert.equal(new Set(silhouettes).size,20,'20 different rendered geometries');checks++;
assert.equal(WEAPON_PROFILES[1].kind,'dao');assert.equal(WEAPON_PROFILES[2].kind,'jian');
assert.equal(WEAPON_PROFILES[9].kind,'whip');assert.equal(WEAPON_PROFILES[10].kind,'axe');
assert.equal(WEAPON_PROFILES[16].kind,'serpent');assert.equal(WEAPON_PROFILES[18].kind,'glaive');assert.equal(WEAPON_PROFILES[19].kind,'halberd');checks+=7;
assert.throws(()=>weapon({}, {level:21},100),RangeError);checks++;
console.log('Weapons: '+checks+' assertions passed (20 renderers, finite coordinates, canvas state, reach bounds, distinct silhouettes)');
`,context);
