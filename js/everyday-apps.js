import {createStoryVideos} from './story-videos.js';
import {createPhoneModel} from './phone-model.js';
const clamp = value => Math.max(0, Math.min(1, value));
const paragraphs = [
  'I design and build applications for the everyday reality of a film shoot, drawing from hands-on experience and a clear understanding of the small technical details that can easily break continuity or create unnecessary problems on set.',
  'I know the kinds of issues that often go unnoticed until they become visible on camera — for example, a message displaying the wrong time, a notification not matching the current moment, or interface details that do not behave as they should within the scene.',
  'I also take copyright and licensing into account from the beginning, creating original interfaces and avoiding protected branding, assets or content that could cause clearance issues for the production.',
  'The result is a set of reliable, believable and production-ready digital tools designed specifically for use on screen and on set.'
];
const clip = () => '<video class="story-media story-video story-video--reel" muted loop playsinline preload="none" poster="assets/video/lighthouse-reel.jpg" data-start="0" data-end="10.033333" aria-label="Lighthouse footage" src="assets/video/lighthouse-reel.mp4"></video>';

export function mountEverydayApps(panel) {
  const story=document.createElement('section');story.className='everyday-story';
  story.setAttribute('aria-label','Everyday Apps for Film Sets');
  story.innerHTML=`<div class="everyday-copy"><span class="everyday-kicker">BUILT AROUND THE SHOOT / 04</span><h2>Everyday Apps <br>for <i>Film Sets</i></h2><div class="everyday-paragraphs">${paragraphs.map((p,i)=>`<p data-everyday-copy="${i}">${p}</p>`).join('')}</div></div>
  <div class="everyday-demo" role="group" aria-label="A mystery unfolds through messages between characters, a missing woman's last post, lighthouse videos and a search through local archives">
    <div class="demo-chrome"><span>ELENA / LAST SEEN 3 DAYS AGO</span><span class="demo-clock"></span></div>
    <div class="demo-morph">
      <div class="app-view app-chat"><div class="chat-heading"><span class="crew-avatar story-avatar story-avatar--mara"></span><div><b>Mara</b><small>online · notifications silenced</small></div><span class="chat-live">●</span></div><div class="chat-date">TODAY / 23:12</div>
      <div class="chat-message"><span>MARA</span><p>I found the place in Elena’s last photo.</p><time></time></div>
      <div class="chat-message chat-message--own"><p>North Point? They closed that road years ago.</p><time></time><b class="chat-read">✓✓</b></div>
      <div class="chat-message"><span>MARA</span><p>Here’s her profile. Look at her last post.</p><div class="chat-profile-link"><span class="chat-profile-url">https://fieldnotes.example/elena.vale</span><div class="chat-profile-preview"><span class="crew-avatar story-avatar story-avatar--elena" aria-hidden="true"></span><div><b>Elena Vale</b><small>@elena.vale · Fieldnotes</small></div></div></div><time></time></div>
      <div class="chat-message chat-message--own"><p>Don’t go there alone. I’m on my way.</p><time></time><b class="chat-read">✓✓</b></div>
      <div class="chat-typing"><i></i><i></i><i></i><span>Mara is typing</span></div><div class="chat-compose"><span>Message Mara…</span><b>↑</b></div></div>
      <div class="app-view app-social"><div class="social-heading"><b>Fieldnotes</b><span class="social-header-icons" aria-hidden="true">♡ &nbsp; ↗</span></div><div class="social-stories"><span class="story-self"><i class="story-avatar story-avatar--you"></i>Your story</span><span><i class="story-avatar story-avatar--elena"></i>Elena</span><span><i class="story-avatar story-avatar--mara"></i>Mara</span><span><i class="story-avatar story-avatar--jonah"></i>Jonah</span><span class="story-seen"><i class="story-avatar story-avatar--nina"></i>Nina</span><span><i class="story-avatar story-avatar--leo"></i>Leo</span></div><div class="social-post"><div class="social-author"><span class="crew-avatar story-avatar story-avatar--elena"></span><div><b>Elena Vale</b><small>NORTH POINT · 3 DAYS AGO</small></div><span>•••</span></div><div class="social-photo"><img class="story-media story-image" src="assets/responsive/video-lighthouse-post-480.webp" srcset="assets/responsive/video-lighthouse-post-480.webp 480w, assets/responsive/video-lighthouse-post-800.webp 800w" sizes="(max-width:700px) 88vw, 330px" alt="Faro sobre un islote rocoso, con textura de tramado" width="1080" height="901" loading="lazy"><span class="social-like-burst" aria-hidden="true">♥</span><span class="social-touch" aria-hidden="true"></span></div><div class="social-actions"><span><span class="social-like-icon" aria-label="Not liked">♡</span> &nbsp; ◯ &nbsp; ↗</span><span>⌑</span></div><p><b>One last stop before I come home.</b> Some places feel like they’ve been waiting for you.</p><div class="social-meta"><span class="social-likes">128 likes</span><span>VIEW 9 COMMENTS</span></div></div><div class="social-comment"><b>Mara</b><span class="social-notification">Elena, please answer your phone.</span></div></div>
      <div class="app-view app-reels"><div class="reel-heading"><span>AFTER DARK</span><span>01 / 03</span></div><div class="reel-viewport">${clip()}<div class="reel-timecode">PLAY ▶ <span>00:00:00</span></div><div class="reel-title">That light<br><i>should be out.</i></div><div class="reel-caption"><b>@northpoint.nights</b><span>The lighthouse has been closed for 27 years.</span><small>NORTH POINT · FOUND FOOTAGE</small></div><div class="reel-actions"><span>♡<small>2.4K</small></span><span>◯<small>186</small></span><span>↗<small>SHARE</small></span></div><div class="reel-progress"><i></i></div></div><div class="reel-next">UP NEXT &nbsp; / &nbsp; THE UPSTAIRS WINDOW <span>↓</span></div></div>
      <div class="app-view app-search"><div class="search-wordmark">Find the<br><i>missing piece.</i></div><div class="set-search"><span>⌕</span><span class="search-query">north point lighthouse 1998</span><b>↵</b></div><div class="search-tabs"><b>ALL</b><span>NEWS</span><span>IMAGES</span><span>MAPS</span></div><div class="search-summary">3 results / local archives</div><div class="set-result"><small>THE COASTAL RECORD / ARCHIVE / 1998</small><h3>Lighthouse keeper vanishes overnight</h3><p>October 17, 1998. The light was still burning when the search party arrived. No one was inside.</p><span>ARCHIVED ARTICLE</span></div><div class="set-result"><small>NORTH POINT / VISITOR INFORMATION</small><h3>North Point lighthouse — access closed</h3><p>The coastal road remains closed. The old footpath can only be reached at low tide.</p></div><div class="set-result"><small>THE COASTAL RECORD / MISSING PERSONS</small><h3>A second disappearance at North Point</h3><p>Elena Vale, 26, was last seen near the headland. Her last photograph was posted three days ago.</p><span>UPDATED TODAY · 22:48</span></div></div>
    </div><div class="demo-footer"><span class="demo-phase">01 / MESSAGES</span><span>NORTH POINT / A FICTIONAL STORY</span><i></i></div>
  </div>`;
  panel.append(story);
  const socialNav=document.createElement('div');socialNav.className='social-bottom-nav';socialNav.setAttribute('aria-hidden','true');
  socialNav.innerHTML='<span>⌂</span><span>⌕</span><span>⊞</span><span>▷</span><span class="story-avatar story-avatar--you"></span>';
  story.querySelector('.app-social').append(socialNav);
  story.querySelectorAll('.app-view').forEach((view,i)=>{const caption=document.createElement('p');caption.className='everyday-step-copy';caption.textContent=paragraphs[i];view.prepend(caption);});
  story.querySelector('.demo-clock').textContent='23:14';
  story.querySelectorAll('time').forEach((time,i)=>time.textContent=['23:12','23:13','23:14','23:14'][i]);
}

export function createEverydayApps(section,{mobile=false}={}) {
  const story=section.querySelector('.everyday-story'),panel=story.parentElement;
  const original=panel.querySelector('.feature-layout');
  const interfaces=section.querySelector('.interface-universe');
  const views=[...story.querySelectorAll('.app-view')];
  const copy=[...story.querySelectorAll('[data-everyday-copy]')];
  const messages=[...story.querySelectorAll('.chat-message')];
  const pose={progress:0};
  const phone=mobile?null:createPhoneModel(story.querySelector('.everyday-demo'));
  const videos=createStoryVideos(story,{mobile});
  const labels=['MESSAGES','LAST POST','AFTER DARK','THE ARCHIVE'];
  const nodes=new Map(),values=new Map();
  const node=selector=>{if(!nodes.has(selector))nodes.set(selector,story.querySelector(selector));return nodes.get(selector);};
  const write=(selector,value,html=false)=>{
    if(values.get(selector)===value)return;
    values.set(selector,value);node(selector)[html?'innerHTML':'textContent']=value;
  };
  const typingDots=[...story.querySelectorAll('.chat-typing i')];
  let lastLiked;
  let last=-1;
  const paint=()=>{
    const p=pose.progress;phone?.update(p);videos.update(p);
    const phase=clamp((p-.28)/.72)*4;
    const index=Math.min(3,Math.floor(phase));
    if(index!==last){last=index;write('.demo-phase',`0${index+1} / ${labels[index]}`);}
    // Story time is repeatable in both scroll directions, independent of wall-clock time.
    write('.demo-clock',`23:${14+index}`);
    write('.social-notification',phase<1.45?'Elena, please answer your phone.':'Jonah replied: I saw that light last night.');
    const query='north point lighthouse 1998';
    write('.search-query',query.slice(0,Math.floor(clamp((phase-3)/.32)*query.length)));
    const liked=phase>=1.58;
    if(liked!==lastLiked){
      lastLiked=liked;write('.social-likes',liked?'129 likes':'128 likes');
      write('.social-like-icon',liked?'♥':'♡');const heart=node('.social-like-icon');
      heart.setAttribute('aria-label',liked?'Liked':'Not liked');heart.classList.toggle('is-liked',liked);
    }
    const tap=clamp((phase-1.48)/.08),burst=clamp((phase-1.58)/.30);
    gsap.set(node('.social-touch'),{opacity:tap>0&&tap<1?Math.sin(tap*Math.PI)*.8:0,scale:.6+tap*.8});
    gsap.set(node('.social-like-burst'),{opacity:burst>0&&burst<1?Math.min(1,burst*8,(1-burst)*5):0,scale:burst<.3?.4+burst*2.5:1.15-(burst-.3)*.35,rotation:-12+burst*16});
    write('.reel-timecode span',`00:00:${String(Math.floor(clamp(phase-2)*24)).padStart(2,'0')}`);
    const reel=Math.min(2,Math.floor(clamp(phase-2)*3));
    write('.reel-heading>span:last-child',`0${reel+1} / 03`);
    write('.reel-title',['That light<br><i>should be out.</i>','Someone is<br><i>at the window.</i>','I wasn’t<br><i>alone.</i>'][reel],true);
    write('.reel-caption>span',['The lighthouse has been closed for 27 years.','Pause at 00:11. Top floor. Tell me you see it too.','I stopped filming when I heard the footsteps.'][reel]);
    write('.reel-next',['UP NEXT / THE UPSTAIRS WINDOW <span>↓</span>','UP NEXT / FOOTSTEPS <span>↓</span>','REPLAY / THE LIGHTHOUSE <span>↻</span>'][reel],true);
    gsap.set(node('.reel-progress i'),{scaleX:clamp(phase-2)});

    gsap.set(node('.reel-title'),{y:-clamp(phase-2)*25});
    gsap.set(node('.demo-footer>i'),{scaleX:p});
    typingDots.forEach((dot,i)=>dot.style.opacity=String(.25+.75*Math.abs(Math.sin(p*90+i*1.2))));
  };
  const timeline=gsap.timeline({paused:true});
  if(!mobile){
    story.classList.add('is-everyday-pinned');panel.classList.add('has-everyday-story');
    const previous=[original,interfaces,section.querySelector('.panel--playback>.panel-meta'),panel.querySelector('.panel-meta')];
    timeline.fromTo(previous,{autoAlpha:1},{autoAlpha:0,duration:.1,ease:'power1.inOut',immediateRender:false},0)
      .fromTo(story,{autoAlpha:0},{autoAlpha:1,duration:.09},.09)
      .fromTo(story.querySelector('h2'),{y:25,opacity:0},{y:0,opacity:1,duration:.09},.1);
    copy.forEach((p,i)=>{
      timeline.fromTo(p,{autoAlpha:0,y:15},{autoAlpha:1,y:0,duration:.045},.28+i*.18);
      if(i<3)timeline.to(p,{autoAlpha:0,duration:.03},.43+i*.18);
    });
    views.forEach((view,i)=>{
      timeline.fromTo(view,{autoAlpha:0,y:24,scale:.97},{autoAlpha:1,y:0,scale:1,duration:.045},.28+i*.18);
      if(i<3)timeline.to(view,{autoAlpha:0,y:-22,scale:.97,duration:.03},.43+i*.18);
    });
    messages.forEach((message,i)=>timeline.fromTo(message,{opacity:0,y:14,scale:.94},{opacity:1,y:0,scale:1,duration:.024,ease:'power2.out'},.305+i*.029));
    timeline.fromTo(story.querySelector('.social-post'),{clipPath:'inset(0 0 90% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.085},.48);
    story.querySelectorAll('.set-result').forEach((result,i)=>timeline.fromTo(result,{opacity:0,y:14},{opacity:1,y:0,duration:.035},.87+i*.032));
    timeline.to(pose,{progress:1,duration:1,ease:'none',onUpdate:paint},0);
  }else{
    views.forEach(view=>gsap.from(view,{y:24,opacity:.2,scrollTrigger:{trigger:view,start:'top 90%',end:'top 50%',scrub:.6}}));
    gsap.to(pose,{progress:1,ease:'none',scrollTrigger:{trigger:story,start:'top 80%',end:'bottom 40%',scrub:.6},onUpdate:paint});
  }
  return {update(p){timeline.progress(clamp(p));},destroy(){timeline.kill();videos.destroy();phone?.destroy();story.classList.remove('is-everyday-pinned');panel.classList.remove('has-everyday-story');}};
}

export function createPhotoTelemetry(section) {
  const photo=section.querySelector('.playback-photo');
  const layer=document.createElement('div');layer.className='photo-telemetry';layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<pre class="telemetry-top"></pre><pre class="telemetry-left"></pre><pre class="telemetry-right"></pre><pre class="telemetry-bottom"></pre>';
  photo.parentElement.append(layer);
  const fields=[...layer.children];let last=-1;
  const measure=()=>{
    const {offsetLeft:left,offsetTop:top,offsetWidth:width,offsetHeight:height}=photo;
    Object.assign(layer.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`});
  };
  const sizing=new ResizeObserver(measure);sizing.observe(photo);sizing.observe(photo.parentElement);
  ScrollTrigger.addEventListener('refresh',measure);measure();
  return {update(p){
    layer.style.opacity=String(clamp(p*18)*clamp((1-p)/.18));
    const tick=Math.floor(p*500);if(tick===last)return;last=tick;
    fields[0].textContent=`[ TRACK / ${String(tick).padStart(4,'0')} ]\nX ${(37.389+Math.sin(p*12)*.013).toFixed(5)} N\nY ${(-5.984+Math.cos(p*9)*.017).toFixed(5)} W`;
    fields[1].textContent=Array.from({length:13},(_,i)=>`${String((tick+i*17)%999).padStart(3,'0')} ${'▏▎▍▌▋▊▉'[Math.floor((Math.sin(tick*.12+i)+1)*3)]}`).join('\n');
    fields[2].textContent=Array.from({length:11},(_,i)=>`${i%3?'│':'+'} ${'.:+=*#'[Math.floor((Math.cos(tick*.09+i)+1)*2.5)]} ${((tick*7+i*31)%256).toString(16).padStart(2,'0').toUpperCase()}`).join('\n');
    fields[3].textContent=`VECTOR ${String(tick%360).padStart(3,'0')}° / SYNC ${String(tick*3).padStart(4,'0')}\n${Array.from({length:38},(_,i)=>Math.sin(i*.4+tick*.13)>.1?'━':'·').join('')}\n[ PHOTO → INTERFACE → SIGNAL ]`;
  },destroy(){sizing.disconnect();ScrollTrigger.removeEventListener('refresh',measure);layer.remove();}};
}
