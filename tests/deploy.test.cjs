'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {createServer}=require('../server/index.cjs'),{WebSocket}=require('ws');
const root=path.join(__dirname,'..'),assets=['index.html','style.css','kingdoms.css','multiplayer.css','loot.css','game.js','kingdoms.js','weapons.js','loot.js','treasures.js','combat.js','robot.js','ai.js','chibi.js','multiplayer.js','multiplayer-config.js'];
function fixture(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'3qio-deploy-'));fs.mkdirSync(path.join(dir,'scripts'));fs.copyFileSync(path.join(root,'scripts/prepare-public.cjs'),path.join(dir,'scripts/prepare-public.cjs'));return dir}
test('Docker preparation builds source checkout public assets and preserves release fonts/config without network tools',()=>{
 const source=fixture(),bundle=fixture();try{
  for(const name of assets)fs.writeFileSync(path.join(source,name),'source '+name);execFileSync(process.execPath,[path.join(source,'scripts/prepare-public.cjs')]);for(const name of assets)assert.equal(fs.readFileSync(path.join(source,'public',name),'utf8'),'source '+name);
  fs.mkdirSync(path.join(bundle,'public'));fs.writeFileSync(path.join(bundle,'public/index.html'),'bundled-font-index');fs.writeFileSync(path.join(bundle,'public/fonts.css'),'bundled-fonts');execFileSync(process.execPath,[path.join(bundle,'scripts/prepare-public.cjs')]);assert.equal(fs.readFileSync(path.join(bundle,'public/index.html'),'utf8'),'bundled-font-index');assert.equal(fs.readFileSync(path.join(bundle,'public/fonts.css'),'utf8'),'bundled-fonts');
  const yaml=fs.readFileSync(path.join(root,'render.yaml'),'utf8');for(const pattern of [/runtime: docker/,/plan: free/,/numInstances: 1/,/healthCheckPath: \/api\/status/])assert.match(yaml,pattern);
 }finally{fs.rmSync(source,{recursive:true,force:true});fs.rmSync(bundle,{recursive:true,force:true})}
});
test('single host serves game and /api/status plus automatic WebSocket; never serves server/config secrets',{timeout:6000},async()=>{
 const dir=fixture(),old=process.env.STATIC_ROOT;let app,ws;
 try{
  fs.mkdirSync(path.join(dir,'public'));fs.writeFileSync(path.join(dir,'public/index.html'),'<h1>Single-site fixture</h1>');process.env.STATIC_ROOT=path.join(dir,'public');app=createServer({port:0,botCount:0});const {port}=await app.listen(),base='http://localhost:'+port;
  assert.match(await (await fetch(base)).text(),/Single-site fixture/);const status=await (await fetch(base+'/api/status')).json();assert.equal(status.matchmaking,true);assert.equal(status.version,'2.9.0');
  for(const route of ['/server/index.cjs','/render.yaml','/scripts/prepare-public.cjs','/.env','/package.json'])assert.equal((await fetch(base+route)).status,404);
  ws=new WebSocket(base.replace('http','ws')+'/ws');const reply=new Promise((resolve,reject)=>{ws.once('message',raw=>resolve(JSON.parse(raw)));ws.once('error',reject)});await new Promise(resolve=>ws.once('open',resolve));ws.send(JSON.stringify({type:'join',rulesVersion:7,matchmaking:'auto',name:'Web Guest'}));assert.equal((await reply).type,'welcome');
 }finally{ws?.terminate();if(app)await app.close();if(old===undefined)delete process.env.STATIC_ROOT;else process.env.STATIC_ROOT=old;fs.rmSync(dir,{recursive:true,force:true})}
});
