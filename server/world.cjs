'use strict';
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sources=['kingdoms.js','weapons.js','loot.js','treasures.js','combat.js','robot.js','ai.js','chibi.js','game.js'].map(file=>new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}));
// Run the exact same combat/evolution rules as solo in an isolated headless room.
// No network-supplied text is ever evaluated. The DOM below is an inert adapter;
// animation callbacks and UI timers are disabled. Only step() advances the world.
function createWorld({botCount=8}={}){
 const noop=()=>{};
 const paint=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createPattern:()=>({}),measureText:s=>({width:String(s).length*6})},{get:(t,k)=>t[k]||noop,set:(t,k,v)=>(t[k]=v,true)});
 const nodes=new Map();
 function node(id){if(nodes.has(id))return nodes.get(id);const classes=new Set();const n={value:'',style:{},children:[],dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,v){v??=!classes.has(x);v?classes.add(x):classes.delete(x);return v}},getContext:()=>paint,addEventListener:noop,setAttribute:noop,querySelector:s=>node(id+s),querySelectorAll:()=>[],append(...v){this.children.push(...v)},prepend(v){this.children.unshift(v)},replaceChildren(...v){this.children=v},remove:noop};nodes.set(id,n);return n}
 const document={getElementById:node,createElement:id=>node('created-'+Math.random()+id),body:node('body'),activeElement:{tagName:'BODY'},addEventListener:noop,hidden:false};
 const context=vm.createContext({console,Math,Set,Map,document,window:{},innerWidth:1280,innerHeight:720,devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener:noop,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0}});
 for(const script of sources)script.runInContext(context,{timeout:3000});
 vm.runInContext(`
 bots=bots.slice(0,${Math.max(0,Math.min(24,botCount))});
 bots.forEach((e,i)=>{e.id='bot-'+i;e.networkHuman=false;e.x=150+i*410;e.y=800+(i%3)*850});
 player.alive=false;player.x=-100000;player.y=-100000;state='playing';paused=false;
 function spawnHuman(e,id,name){
  Object.assign(e,entity(1800+rand(-100,100),1800+rand(-90,90),1,name,false));
  e.networkHuman=true;e.id=id;e.invincible=4;e.spawnAt=elapsed;e.lastDamageAt=elapsed;
  delete e.killerName;e.input={x:0,y:0,angle:0,attack:false,dash:false,sprint:false};return e;
 }
 globalThis.world={
  get actors(){return bots},get orbs(){return orbs},get chests(){return chests},get drops(){return drops},get elapsed(){return elapsed},
  botRules:BotRules,createBotBrain,botThink,updateBot,loot:LootRules,startingXP,killRewardXP,killDropXP,scatterKillXP,collectXPOrbs,applyWeaponDamage,spawnTreasures,updateChestWaves,weaponStats,weaponASPD,pickUp,collectDrop,equipFromBag,collectDragon,breakTreasure,useWeaponSkill,addTreasureDrop,
  addHuman(id,name){const e=spawnHuman({},id,name);bots.push(e);return e},
  removeHuman(e){bots=bots.filter(other=>other!==e)},
  respawn(e){if(e.alive||e.respawn>0)return false;spawnHuman(e,e.id,e.name);return true},
  step(dt){
   player.level=Math.max(1,...bots.filter(e=>e.networkHuman).map(e=>e.level));
   for(const e of bots){if(!e.networkHuman)continue;
    if(!e.alive){e.respawn=Math.max(0,e.respawn-dt);continue}
    const input=e.input;e.angle=input.angle;
    if(input.dash&&e.stamina>=35){e.stamina-=35;e.dash=.23}input.dash=false;
    moveEntity(e,input.x,input.y,dt,input.sprint);if(input.pickup)pickUp(e);if(input.skill)useWeaponSkill(e);input.pickup=false;input.skill=false;
    if(input.attack)attack(e);
   }
   update(dt);
  },
  canObserveActor,clearUtility,combat:CombatRules,needXp,weaponBlade,bladeHitsCircle,bladeContact,resolveMelee,canAttack,updateAllegiance,attack,gainXP,reach,radius,campAt
 };
 `,context,{timeout:3000});
 return context.world;
}
module.exports={createWorld};
