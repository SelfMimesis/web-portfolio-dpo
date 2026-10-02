import { mountDigitalSkills } from './digital-skills.js';
const clamp=value=>Math.max(0,Math.min(1,value));
export function mountFunChapter(panel){
  const story=document.createElement('section');story.className='fun-story';story.setAttribute('aria-label','Lets have fun');
  story.innerHTML=`<header class="fun-heading"><span class="fun-kicker">05 / PLAY IS AN INTERACTION</span><h2>Lets have <i>fun</i></h2><p>Move. Play. See what happens.</p></header>
  <div class="fun-console"><div class="fun-console-bar"><span>SHIP EXPLORER / LIVE DEMO</span><span class="fun-status" aria-live="polite">READY TO PLAY</span></div><div class="fun-game"><span class="fun-loading">INITIALISING PLAYFIELD…</span></div><div class="fun-scan" aria-hidden="true"></div></div>
  <footer class="fun-controls"><p>Hold & drag to steer · Space / FIRE to shoot · Shift for turbo</p><div><button type="button" class="fun-start">PLAY / RESTART ↗</button><button type="button" class="fun-continue">KEEP SCROLLING ↓</button></div></footer>`;
  const copy=document.createElement('div');copy.className='fun-copy';
  copy.innerHTML=`<p>I design and build original games and interactive experiences that invite people to become part of the story.</p><p>From the first movement to the smallest response, every mechanic, visual and interaction can be shaped around the world of your project.</p><p>A playful moment can become something memorable: a unique experience that draws people in and takes your project to another level.</p>`;
  story.querySelector('.fun-heading').append(copy);
  const still=document.createElement('figure');still.className='fun-still';
  still.innerHTML=`<div class="fun-still-image"><img alt="On-set camera monitor showing an actor interacting with a handheld screen." src="assets/responsive/interfaces-interactive-on-set-640.webp" srcset="assets/responsive/interfaces-interactive-on-set-640.webp 640w, assets/responsive/interfaces-interactive-on-set-1200.webp 1200w" sizes="(max-width: 700px) 90vw, 40vw" width="2000" height="1500" loading="lazy"></div><figcaption>FROM INTERACTION TO THE SCENE <span>01 / ON SET</span></figcaption>`;
  story.querySelector('.fun-heading').append(still);
  panel.append(story);
  mountDigitalSkills(panel);
  let frame,visible=false,active=false,pendingStart=false;
  const send=()=>frame?.contentWindow?.postMessage({type:'portfolio-game-active',active},location.origin);
  const refresh=()=>{
    active=visible&&!document.hidden&&(document.body.classList.contains('vertical-mode')||story.dataset.playable==='true');
    if((active||pendingStart)&&!frame){
      frame=document.createElement('iframe');frame.title='Ship Explorer — playable game';frame.src='games/ship-explorer/index.html';frame.setAttribute('sandbox','allow-scripts allow-same-origin');
      frame.referrerPolicy='no-referrer';
      frame.allow="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'; usb 'none'";
      story.querySelector('.fun-game').append(frame);frame.addEventListener('load',send);
    }
    send();story.querySelector('.fun-status').textContent=active?'PLAYFIELD ACTIVE':'READY TO PLAY';
  };
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{threshold:.05});observer.observe(story);
  const attributes=new MutationObserver(refresh);attributes.observe(story,{attributes:true,attributeFilter:['data-playable']});
  document.addEventListener('visibilitychange',refresh);
  const start=story.querySelector('.fun-start'),next=story.querySelector('.fun-continue');
  start.addEventListener('click',()=>{pendingStart=true;refresh();frame?.contentWindow?.postMessage({type:'portfolio-game-start'},location.origin);});
  next.addEventListener('click',()=>{
    if(document.body.classList.contains('vertical-mode'))panel.querySelector('.digital-skills')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    else window.scrollBy({top:innerHeight*.8,behavior:'smooth'});
  });
  window.addEventListener('message',event=>{
    if(event.source!==frame?.contentWindow||event.origin!==location.origin)return;
    if(event.data?.type==='ship-explorer-ready'){story.classList.add('game-loaded');send();if(pendingStart){frame.contentWindow.postMessage({type:'portfolio-game-start'},location.origin);pendingStart=false;}}
    if(event.data?.type==='ship-explorer-scroll'&&active&&Number.isFinite(event.data.delta))window.scrollBy(0,Math.max(-innerHeight,Math.min(innerHeight,event.data.delta)));
    if(event.data?.type==='ship-explorer-leave'&&typeof event.data.back==='boolean'&&typeof event.data.scroll==='boolean'){(event.data.back?start:next).focus({preventScroll:true});if(event.data.scroll)window.scrollBy(0,event.data.back?-innerHeight:innerHeight);}
  });
}

export function createFunChapter(section,{mobile=false}={}){
  const story=section.querySelector('.fun-story');
  if(mobile)return{update(){},destroy(){story.dataset.playable='false';}};
  story.classList.add('is-fun-pinned');story.inert=true;
  const title=story.querySelector('h2'),consolePanel=story.querySelector('.fun-console');
  const timeline=gsap.timeline({paused:true});
  timeline.fromTo(story,{autoAlpha:0},{autoAlpha:1,duration:.025},0)
    .fromTo(title,{y:55,rotationX:-45,opacity:0},{y:0,rotationX:0,opacity:1,duration:.16,ease:'power3.out'},.09)
    .fromTo(story.querySelectorAll('.fun-kicker,.fun-heading > p'),{y:16,opacity:0},{y:0,opacity:1,stagger:.03,duration:.1},.04)
    .fromTo(consolePanel,{clipPath:'inset(44% 4% 44% 4%)',x:-90,y:65,z:-180,scale:.78,rotationY:24,rotationX:12,rotationZ:-4,opacity:0},{clipPath:'inset(0% 0% 0% 0%)',x:0,y:0,z:0,scale:1,rotationY:0,rotationX:0,rotationZ:0,opacity:1,duration:.25,ease:'power3.out'},.005)
    .fromTo(story.querySelector('.fun-console-bar'),{xPercent:-35,opacity:0},{xPercent:0,opacity:1,duration:.12,ease:'power3.out'},.1)
    .fromTo(story.querySelectorAll('.fun-copy p'),{y:24,opacity:0,filter:'blur(5px)'},{y:0,opacity:1,filter:'blur(0px)',stagger:.16,duration:.1,ease:'power2.out'},.32)
    .to(story.querySelectorAll('.fun-copy p')[0],{y:-15,opacity:0,duration:.05},.45)
    .to(story.querySelectorAll('.fun-copy p')[1],{y:-15,opacity:0,duration:.05},.61)
    .fromTo(story.querySelector('.fun-still'),{clipPath:'inset(0% 100% 0% 0%)',y:22,opacity:0},{clipPath:'inset(0% 0% 0% 0%)',y:0,opacity:1,duration:.18,ease:'power3.inOut'},.35)
    .fromTo(story.querySelector('.fun-still img'),{scale:1.12,xPercent:3},{scale:1,xPercent:0,duration:.4,ease:'power2.out'},.35)
    .fromTo(story.querySelector('.fun-scan'),{top:'0%',opacity:.8},{top:'100%',opacity:0,duration:.18,ease:'none'},.19)
    .fromTo(story.querySelector('.fun-controls'),{y:20,opacity:0},{y:0,opacity:1,duration:.1},.25)
    .to(consolePanel,{y:-35,scale:.94,rotationX:-7,filter:'blur(10px)',opacity:0,clipPath:'inset(8% 0% 8% 0%)',duration:.16,ease:'power2.in'},.82)
    .to(story.querySelectorAll('.fun-heading,.fun-controls'),{y:-30,opacity:0,filter:'blur(6px)',stagger:.025,duration:.12},.83)
    .to(story,{autoAlpha:0,duration:.02},.98);
  let last=0;
  return{update(p){p=clamp(p);if(p===last)return;last=p;timeline.progress(p);const playable=p>=.32&&p<.82;if(story.dataset.playable!==String(playable)){story.dataset.playable=String(playable);story.inert=!playable;}if(p>0&&p<1){const label=section.querySelector('.registration-label');if(label)label.textContent='PLAY / 05';document.querySelector('.progress-title').textContent='LETS HAVE FUN';}},destroy(){timeline.kill();story.classList.remove('is-fun-pinned');story.inert=false;story.dataset.playable='false';}};
}
