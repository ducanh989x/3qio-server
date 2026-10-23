'use strict';
// Source checkout: build a static root without Python/network tooling.
// Release ZIP: preserve its existing public/ with bundled offline fonts.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),out=path.join(root,'public');
if(!fs.existsSync(path.join(out,'index.html'))){
 fs.mkdirSync(out,{recursive:true});
 for(const name of ['index.html','style.css','kingdoms.css','multiplayer.css','loot.css','game.js','kingdoms.js','weapons.js','loot.js','treasures.js','combat.js','robot.js','ai.js','chibi.js','multiplayer.js','multiplayer-config.js','tutorial.js','tutorial.css','standings.js','standings.css'])fs.copyFileSync(path.join(root,name),path.join(out,name));
 console.log('Prepared public/ for the single-site server.');
}else console.log('Using bundled public/ (fonts and release assets preserved).');
