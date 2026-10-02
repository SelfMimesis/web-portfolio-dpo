import {Game} from './src/game/Game.js';
import {GAME_STATES} from './src/game/constants.js';
const canvas=document.querySelector('canvas');
const game=new Game(canvas,canvas.getContext('2d',{alpha:false}));
window.shipExplorerGame=game;
let active=false;
function activate(next){
  if(next===active)return;active=next;
  if(next)game.start();
  else{cancelAnimationFrame(game.frameId);game.frameId=0;game.keys.clear();game.activePointers.clear();game.pointer.isDown=false;game.pointer.justPressed=false;}
}
window.addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==location.origin)return;
  if(event.data?.type==='portfolio-game-active' && typeof event.data.active==='boolean')activate(event.data.active);
  if(event.data?.type==='portfolio-game-start'){
    activate(true);game.startRun();canvas.focus({preventScroll:true});
  }
});
window.addEventListener('wheel',event=>{
  event.preventDefault();parent.postMessage({type:'ship-explorer-scroll',delta:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)},location.origin);
},{passive:false});
window.addEventListener('keydown',event=>{
  if(event.key==='Tab' || event.key==='PageDown' || event.key==='PageUp'){
    event.preventDefault();
    parent.postMessage({type:'ship-explorer-leave',back:event.shiftKey||event.key==='PageUp',scroll:event.key!=='Tab'},location.origin);
  }
  if(event.key==='Enter'&&game.state===GAME_STATES.TITLE){event.preventDefault();game.startRun();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)activate(false);});
await document.fonts.load('10px Automatron');
game.changeState(GAME_STATES.TITLE);game.render(1);
parent.postMessage({type:'ship-explorer-ready'},location.origin);
