const destinations = ['Madrid', 'Andalusia', 'Spain', 'Europe', 'International'];
const initial = [[.32,.3],[.84,.32],[.73,.8],[.22,.77],[.13,.47]];

export function initSevilleOrbits(section) {
  const { gsap, ScrollTrigger } = window;
  section.querySelectorAll('.about-visual--network').forEach(visual => {
    visual.removeAttribute('aria-hidden');visual.inert = true;
    visual.innerHTML = `<div class="seville-space" role="group" aria-label="Connections from Seville. Explore each destination.">
      <div class="seville-flat-ring"></div><div class="seville-flat-ring seville-flat-ring--outer"></div>
      <div class="seville-home">Sevilla<span>37° N / 05° W</span></div>
      ${destinations.map((name,i) => `<button class="seville-world" type="button" data-destination="${i}" aria-label="${name === 'International' ? 'International: explore the globe' : 'Explore ' + name}" aria-pressed="false" style="left:${initial[i][0]*100}%;top:${initial[i][1]*100}%"><span class="seville-fallback-ball" aria-hidden="true"></span><span class="seville-world-label">${name}</span></button>`).join('')}
      <span class="seville-space-caption">LOCAL ROOTS. WORLDWIDE CONNECTIONS.</span>
    </div>`;
  });
  if (!gsap || !ScrollTrigger) return;
  gsap.matchMedia().add({desktop:'(min-width:901px) and (min-height:651px) and (pointer:fine),(min-width:1025px) and (min-height:651px)',compact:'(max-width:900px),(pointer:coarse) and (max-width:1024px), (max-height:650px)',reduced:'(prefers-reduced-motion:reduce)'}, context => {
    const reduced=context.conditions.reduced,desktop=context.conditions.desktop&&!reduced;
    const visual=section.querySelector(desktop?'.about-stage .about-visual--network':'#about-production .about-visual--network');
    const space=visual.querySelector('.seville-space'),buttons=[...space.querySelectorAll('.seville-world')];
    const state={time:0,globeTime:0,tiltX:0,tiltY:0,levels:{0:0,1:0,2:0,3:0,4:0}};
    let active=false,disposed=false,loading=false,scene,running=false,elapsed=0;
    let hovered=-1,focused=-1,pinned=-1,selected=-1;
    const canRun=()=>active&&!document.hidden&&!disposed;
    const draw=()=>{if(canRun())scene?.draw(state);};
    const layout=points=>points.forEach((p,i)=>{
      const button=buttons[i];button.style.left=p.x+'px';button.style.top=p.y+'px';
      button.style.setProperty('--ball-size',Math.max(44,p.radius*2+8)+'px');
      button.style.setProperty('--label-offset',Math.max(24,p.radius+12)+'px');
    });
    const load=async()=>{
      if(loading||disposed)return;loading=true;
      try{
        const {createSevilleIllustration}=await import('./seville-illustration.js');
        const created=await createSevilleIllustration(space,layout);
        if(disposed){created.destroy();return;}
        scene=created;space.classList.add('has-illustration');visual.dataset.renderer='canvas';draw();sync();
      }catch{if(!disposed)visual.dataset.renderer='fallback';}
    };
    const tick=(_time,delta)=>{
      if(!canRun()){stop();return;}
      if(selected<0)state.time+=Math.min(delta/1000,.04);
      state.globeTime+=Math.min(delta/1000,.04);elapsed+=delta;
      if(elapsed>=32){draw();elapsed=0;}
    };
    const stop=()=>{gsap.ticker.remove(tick);running=false;visual.dataset.orbiting='false';};
    const sync=()=>{
      visual.inert=!active;
      if(!canRun()){stop();return;}
      load();draw();
      if(scene&&!reduced&&!running){running=true;visual.dataset.orbiting='true';gsap.ticker.add(tick);}
    };
    const choose=()=>{
      const next=hovered>=0?hovered:focused>=0?focused:pinned;
      if(next===selected)return;
      selected=next;visual.dataset.selected=selected<0?'':destinations[selected];
      buttons.forEach((button,i)=>{
        button.classList.toggle('is-expanded',i===selected);button.setAttribute('aria-pressed',String(i===pinned));
        gsap.to(state.levels,{[i]:i===selected?1:0,duration:reduced?0:.7,ease:'back.out(1.25)',overwrite:'auto',onUpdate:draw});
      });draw();
    };
    const listeners=[];
    const listen=(target,type,handler)=>{target.addEventListener(type,handler);listeners.push(()=>target.removeEventListener(type,handler));};
    buttons.forEach((button,i)=>{
      listen(button,'pointerenter',event=>{if(event.pointerType!=='touch'){hovered=i;choose();}});
      listen(button,'pointerleave',()=>{hovered=-1;choose();});
      listen(button,'focus',()=>{if(button.matches(':focus-visible')){focused=i;choose();}});
      listen(button,'blur',()=>{focused=-1;choose();});
      listen(button,'click',()=>{pinned=pinned===i?-1:i;focused=-1;choose();buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===pinned)));});
      listen(button,'keydown',event=>{if(event.key==='Escape'){pinned=focused=hovered=-1;choose();button.blur();}});
    });
    listen(space,'pointermove',event=>{
      if(reduced||!canRun()||event.pointerType==='touch')return;
      const r=space.getBoundingClientRect();
      gsap.to(state,{tiltY:(event.clientX-r.left-r.width/2)/r.width*.14,tiltX:(event.clientY-r.top-r.height/2)/r.height*.1,duration:.9,ease:'power3.out',overwrite:'auto'});
    });
    listen(space,'pointerleave',()=>gsap.to(state,{tiltX:0,tiltY:0,duration:.9,overwrite:'auto'}));
    listen(document,'visibilitychange',sync);
    const resize=new ResizeObserver(draw);resize.observe(space);
    ScrollTrigger.create({trigger:desktop?section.querySelector('#about-production'):visual.parentElement,start:desktop?'top 48%':'top bottom',end:desktop?'bottom 48%':'bottom top',refreshPriority:-1,onToggle:self=>{active=self.isActive;sync();},onRefresh:self=>{active=self.isActive;sync();}});
    return()=>{
      disposed=true;stop();listeners.forEach(remove=>remove());resize.disconnect();
      gsap.killTweensOf(state);gsap.killTweensOf(state.levels);scene?.destroy();space.classList.remove('has-illustration');
      visual.inert=true;delete visual.dataset.renderer;delete visual.dataset.selected;
      buttons.forEach(button=>{button.classList.remove('is-expanded');button.setAttribute('aria-pressed','false');});
    };
  });
}
