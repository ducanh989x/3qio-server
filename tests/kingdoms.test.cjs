const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context=vm.createContext({console,Math,assert,burst(){},announce(){},feed(){},tone(){},updateHUD(){}});
vm.runInContext(readFileSync(require('node:path').join(__dirname,'../kingdoms.js'),'utf8'),context);
vm.runInContext(`
const ids=Object.keys(KINGDOMS);
let checks=0;
for(const a of ids)for(const b of ids){
 const expected=a==='neutral'||b==='neutral'||a!==b;
 assert.equal(canAttack({team:a},{team:b}),expected,a+' vs '+b);checks++;
}
const self={team:'neutral'};assert.equal(canAttack(self,self),false);checks++;
function recruit(x,y){return {x,y,team:'neutral',alive:true,joinTarget:null,joinTime:0,isPlayer:false,enlistTarget:null}}
for(const zone of CAMP_ZONES){
 const e=recruit(zone.x,zone.y);
 updateAllegiance(e,4.99);assert.equal(e.team,'neutral');
 updateAllegiance(e,.01);assert.equal(e.team,zone.team);assert.equal(e.joinTime,0);
 updateAllegiance(e,20);assert.equal(e.joinTarget,null);checks+=4;
}
const first=CAMP_ZONES[0],second=CAMP_ZONES[1],e=recruit(first.x,first.y);
updateAllegiance(e,3);e.x=first.x+CAMP_RADIUS+1;updateAllegiance(e,.1);
assert.equal(e.joinTime,0);assert.equal(e.joinTarget,null);
e.x=first.x;updateAllegiance(e,2);assert.equal(e.team,'neutral');
e.x=second.x;e.y=second.y;updateAllegiance(e,1);assert.equal(e.joinTime,1);assert.equal(e.joinTarget,second.team);
updateAllegiance(e,4);assert.equal(e.team,second.team);
e.x=first.x;e.y=first.y;updateAllegiance(e,4.9);assert.equal(e.team,second.team);
updateAllegiance(e,.1);assert.equal(e.team,first.team);checks+=8;
const dead=recruit(first.x,first.y);updateAllegiance(dead,4);dead.alive=false;updateAllegiance(dead,1);
assert.equal(dead.team,'neutral');assert.equal(dead.joinTime,0);assert.equal(dead.joinTarget,null);checks+=3;
const boundary=recruit(first.x+CAMP_RADIUS,first.y);assert.equal(campAt(boundary).team,first.team);
boundary.x+=.001;assert.equal(campAt(boundary),null);checks+=2;
// Safe-circle protection is positional and independent of team / enlistment.
for(const zone of CAMP_ZONES)for(const attackerTeam of ids)for(const victimTeam of ids){
 const attacker={x:1800,y:1800,team:attackerTeam};
 const victim={x:zone.x,y:zone.y,team:victimTeam};
 assert.equal(isCampProtected(victim),true);
 assert.equal(canAttack(attacker,victim),false);checks+=2;
 victim.x=zone.x+CAMP_RADIUS;assert.equal(canAttack(attacker,victim),false);checks++;
 victim.x+=.001;
 assert.equal(canAttack(attacker,victim),attackerTeam==='neutral'||victimTeam==='neutral'||attackerTeam!==victimTeam);checks++;
}
const safeAttacker={x:first.x,y:first.y,team:'neutral'},outsideVictim={x:1800,y:1800,team:'neutral'};
assert.equal(canAttack(safeAttacker,outsideVictim),true);checks++;
console.log('Kingdom rules: '+checks+' assertions passed');
`,context);
