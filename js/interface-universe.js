import land from '../assets/interfaces/world-lines.js';

const clamp = value => Math.max(0, Math.min(1, value));
const skin = 'assets/interfaces/skin-60/';

export function mountInterfaceUniverse(panel) {
  panel.classList.add('panel--interfaces');
  const host = document.createElement('div');
  host.className = 'interface-universe';
  host.innerHTML = `
    <div class="interface-orbit">
      <figure class="orbit-interface orbit-winamp" role="img" aria-label="Winamp with the original Necromech skin, animated spectrum and equalizer">
        <div class="winamp-main">
          <img src="${skin}main.png" width="275" height="116" alt="">
          <span class="winamp-track">1. NECROMECH — SPECTRAL REALM</span>
          <span class="winamp-time">02:47</span><span class="winamp-rate">128 &nbsp; 44</span>
          <div class="winamp-spectrum">${Array.from({length:19},(_,i)=>`<i style="--bar:${20+(i*37)%80}%"></i>`).join('')}</div>
          <div class="winamp-controls"></div><div class="winamp-seek"><i></i></div>
        </div>
        <div class="winamp-equalizer"><div class="winamp-eq-surface"></div><div class="winamp-sliders">${Array.from({length:10},()=>'<i></i>').join('')}</div></div>
        <div class="winamp-playlist"><div class="winamp-playlist-title">≡ &nbsp; WINAMP PLAYLIST &nbsp; ≡</div><ol><li class="selected"><span>Necromech · Spectral realm</span><b>4:38</b></li><li><span>Ozar Midrashim</span><b>6:52</b></li><li><span>The drowned abbey</span><b>3:24</b></li><li><span>Through the looking glass</span><b>5:17</b></li></ol><div class="winamp-playlist-foot">+ ADD &nbsp; − REM &nbsp; SEL <span>04 / 20:11</span></div></div>
        <figcaption>03 / NECROMECH <span>WINAMP · 2003</span></figcaption>
      </figure>
      <figure class="orbit-interface orbit-terminal" role="img" aria-label="Vintage computer screen with a rotating wireframe world, simulated attack markers and geographic coordinates">
        <div class="crt-bezel"><div class="crt-screen">
          <div class="crt-heading"><span>EARTH / GLOBAL WATCH</span><b>THREAT MONITOR</b></div>
          <div class="crt-display"><canvas class="threat-globe" width="560" height="560"></canvas><div class="crt-telemetry"><strong>ORBITAL STATION</strong><span>NORAD #25544</span><span>FILE: EVENTS.DAT</span><br><b data-threat-city>SEATTLE / USA</b><span>LAT <em data-threat-lat>+47.61°</em></span><span>LON <em data-threat-lon>−122.33°</em></span><span>ALT <em>227.47 NM</em></span><span>INCL <em>51.6324°</em></span><br><b class="crt-warning">ATTACK DETECTED</b><span>VECTOR <em data-threat-vector>04 / 09</em></span><span class="crt-yellow">TRACKING ACTIVE</span><br><span>GRID 10.0°</span><span class="crt-yellow">EARTH4 &nbsp; 2.30</span></div></div>
          <div class="crt-log"><span data-threat-log>ACQUIRING SIGNAL_</span><span>SIMULATION</span></div>
        </div><div class="crt-hardware"><span>VECTOR SYSTEMS &nbsp; / &nbsp; VT–86</span><i></i><span>POWER</span></div></div>
        <figcaption>02 / GLOBAL WATCH <span>VECTOR CRT · 1986</span></figcaption>
      </figure>
      <figure class="orbit-interface orbit-aero" role="img" aria-label="Original glass music console with raised controls and abstract album artwork">
        <div class="aero-window"><div class="aero-title"><span>◉ &nbsp; SOUND STUDY</span><span class="aero-window-buttons">STEREO / 03</span></div>
          <div class="aero-menu">SOUND COLLECTION &nbsp; / &nbsp; VOLUME 01</div>
          <div class="aero-toolbar"><span class="aero-round">◀</span><span class="aero-play">Ⅱ</span><span class="aero-round">▶</span><div class="aero-now"><b>Blue horizon</b><span>Atmospheres — A new beginning</span><div class="aero-meter"><i></i></div></div><span class="aero-search">⌕ &nbsp; Search music</span></div>
          <div class="aero-library"><aside><b>EXPLORE</b><span class="aero-selected">Soundscapes</span><span>Sessions</span><span>Frequencies</span></aside><div class="aero-content"><div class="aero-coverflow"><div class="aero-album aero-album--left"><span>WATER<br>COLOURS</span></div><div class="aero-album aero-album--main"><span class="aero-orb"></span><b>blue horizon</b><small>A T M O S P H E R E S</small></div><div class="aero-album aero-album--right"><span>O P E N<br>S K I E S</span></div></div><div class="aero-song-row aero-song-row--head"><span>Name</span><span>Time</span></div><div class="aero-song-row aero-song-row--active"><span>♫ &nbsp; Blue horizon</span><span>4:32</span></div><div class="aero-song-row"><span>02 &nbsp; A new beginning</span><span>3:48</span></div><div class="aero-song-row"><span>03 &nbsp; Clear water</span><span>5:06</span></div></div></div>
          <div class="aero-status"><span>3 songs, 13.4 minutes</span><span>◈ &nbsp; Connected</span></div>
        </div><figcaption>01 / SOUND STUDY <span>AERO · 2005</span></figcaption>
      </figure>
    </div>`;
  const orbit=host.querySelector('.interface-orbit');
  orbit.prepend(host.querySelector('.orbit-aero'));
  orbit.append(host.querySelector('.orbit-winamp'));
  panel.querySelector('.dev-composition').replaceWith(host);
  drawGlobe(host.querySelector('canvas'), 0);
}

// Natural Earth boundaries in longitude/latitude, projected onto a rotating sphere.
const sites = [
  ['SEATTLE / USA',-122.33,47.61],['LONDON / UK',-.12,51.51],['TOKYO / JP',139.69,35.68],
  ['SYDNEY / AU',151.21,-33.87],['RIO / BR',-43.17,-22.91],['CAIRO / EG',31.24,30.04]
];
// Static grid coordinates are shared by all frames of the rotating globe.
const globeGrid = [
  ...Array.from({length:11},(_,j)=>Array.from({length:181},(_,i)=>[-180+i*2,-75+j*15])),
  ...Array.from({length:24},(_,j)=>Array.from({length:91},(_,i)=>[-180+j*15,-90+i*2]))
];
function drawGlobe(canvas, progress) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = canvas.width, r = size * .435, center = size / 2;
  const turn = progress * (sites.length - 1), from = Math.floor(turn), mix = turn - from;
  const target = sites[from], next = sites[Math.min(sites.length - 1, from + 1)];
  let delta = next[1] - target[1];
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  const longitude = target[1] + delta * mix, tilt = .23;
  const project = ([lon,lat]) => {
    const a = (lon-longitude)*Math.PI/180, b = lat*Math.PI/180;
    const x = Math.cos(b)*Math.sin(a), y = Math.sin(b), z = Math.cos(b)*Math.cos(a);
    return [center+r*x, center-r*(y*Math.cos(tilt)-z*Math.sin(tilt)), y*Math.sin(tilt)+z*Math.cos(tilt)];
  };
  const line = (points, color, width=1) => {
    ctx.beginPath(); let pen = false;
    points.forEach(point => { const [x,y,z] = project(point); if (z < 0) { pen=false; return; } if (pen) ctx.lineTo(x,y); else ctx.moveTo(x,y); pen=true; });
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  };
  ctx.clearRect(0,0,size,size);
  ctx.strokeStyle='#172bd4'; ctx.lineWidth=1; ctx.beginPath();ctx.arc(center,center,r,0,Math.PI*2);ctx.stroke();
  globeGrid.forEach(points=>line(points,'#192597'));
  land.forEach(points=>line(points,'#00a896',1));
  sites.forEach(([name,lon,lat],i)=>{
    const [x,y,z]=project([lon,lat]); if(z<0)return;
    const pulse=(progress*15+i*.17)%1;
    ctx.strokeStyle=i===Math.round(turn)?'#ff5e50':'#699444'; ctx.globalAlpha=.9-pulse*.6;
    ctx.beginPath();ctx.arc(x,y,5+pulse*25,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle='#ffff78';ctx.fillRect(x-2,y-2,4,4);ctx.font='11px monospace';ctx.fillText(name.split(' /')[0],x+8,y-5);
    const source=project([lon-55,Math.min(70,lat+35)]);
    if(source[2]>0){ctx.strokeStyle='#cb404e';ctx.beginPath();ctx.moveTo(source[0],source[1]);ctx.quadraticCurveTo((source[0]+x)/2,y-75,x,y);ctx.stroke();}
  });
  const host=canvas.closest('.orbit-terminal'), active=sites[Math.round(turn)];
  host.querySelector('[data-threat-city]').textContent=active[0];
  host.querySelector('[data-threat-lat]').textContent=`${active[2]>0?'+':''}${active[2].toFixed(2)}°`;
  host.querySelector('[data-threat-lon]').textContent=`${active[1]>0?'+':''}${active[1].toFixed(2)}°`;
  host.querySelector('[data-threat-vector]').textContent=`0${Math.round(turn)+1} / 06`;
  host.querySelector('[data-threat-log]').textContent=`TRACK ${String(Math.floor(progress*864)).padStart(4,'0')} / SIGNAL INTERCEPTED`;
}

export function createInterfaceUniverse(section, { mobile=false }={}) {
  const host=section.querySelector('.interface-universe');
  const photo=section.querySelector('.playback-photo');
  const originalParent=host.parentElement, originalNext=host.nextSibling;
  const cards=[...host.querySelectorAll('.orbit-interface')];
  const canvas=host.querySelector('canvas');
  const bars=[...host.querySelectorAll('.winamp-spectrum i')];
  const sliders=[...host.querySelectorAll('.winamp-sliders i')];
  let last=-1;
  if(!mobile){photo.parentElement.append(host);host.classList.add('is-orbiting');photo.classList.add('has-interface-orbit');}
  const measure=()=>{
    if(mobile)return;
    const {offsetLeft:left,offsetTop:top,offsetWidth:width,offsetHeight:height}=photo;
    host.style.left=`${left+width/2}px`;host.style.top=`${top+height*.46}px`;
  };
  const sizing=new ResizeObserver(measure);
  if(!mobile){sizing.observe(photo);sizing.observe(photo.parentElement);ScrollTrigger.addEventListener('refresh',measure);measure();}
  const pose={progress:0};
  const render=()=>{
    const p=pose.progress;
    if(last===p)return;last=p;
    if(!mobile){
      const radius=Math.min(innerWidth*.085,145), height=Math.min(innerHeight*.10,85);
      cards.forEach((card,i)=>{
        // Keep the last foreground pose through the photo fade and track departure.
        const local=Math.min(i===2?.5:1,clamp((p-i*.18)/.64));
        const angle=Math.PI+local*Math.PI*2, depth=(Math.cos(angle)+1)/2;
        const visibility=clamp(local/.08)*clamp((1-local)/.12);
        gsap.set(card,{x:Math.sin(angle)*radius,y:(depth-.5)*height*1.2,
          scale:.3+.7*depth,rotationY:-Math.sin(angle)*27,rotationZ:Math.sin(angle)*-3,
          autoAlpha:visibility*(.12+.88*depth),zIndex:depth>.5?60+Math.round(depth*20):10+Math.round(depth*20)});
      });
    }
    const playbackProgress=Math.min(p,.68);
    const tick=Math.floor(playbackProgress*150);
    bars.forEach((bar,i)=>bar.style.height=`${12+Math.abs(Math.sin(tick*.37+i*1.7))*88}%`);
    sliders.forEach((slider,i)=>slider.style.top=`${20+Math.sin(playbackProgress*14+i*.8)*15}%`);
    host.querySelector('.winamp-time').textContent=`02:${String(10+Math.floor(playbackProgress*48)).padStart(2,'0')}`;
    host.querySelector('.winamp-seek i').style.left=`${playbackProgress*92}%`;
    host.querySelector('.aero-meter i').style.width=`${18+Math.min(p,.68)*75}%`;
    drawGlobe(canvas,p);
  };
  const timeline=gsap.timeline({paused:true}).to(pose,{progress:1,duration:1,ease:'none',onUpdate:render});
  if(!mobile)gsap.set(cards,{xPercent:-50,yPercent:-50,transformPerspective:1100});
  render();
  if(mobile){
    gsap.to(pose,{progress:1,ease:'none',scrollTrigger:{trigger:host,start:'top 85%',end:'bottom 30%',scrub:.65},onUpdate:render});
  }
  return {update(p){timeline.progress(clamp(p));},destroy(){sizing.disconnect();ScrollTrigger.removeEventListener('refresh',measure);timeline.kill();photo.classList.remove('has-interface-orbit');host.classList.remove('is-orbiting');host.style.removeProperty('left');host.style.removeProperty('top');originalParent.insertBefore(host,originalNext);gsap.set(cards,{clearProps:'transform,opacity,visibility,zIndex'});}};
}
