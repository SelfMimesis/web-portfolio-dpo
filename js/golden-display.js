// One small SVG morph per visible terminal. Geometry is sampled once, never on scroll.
const PHI = (1 + Math.sqrt(5)) / 2;
const names = ['FIBONACCI', 'TRIANGULATION', 'GOLDEN SPIRAL', 'DIAMOND', 'NESTED CIRCLES', 'ARCS'];

function compositions() {
  const squares = [];
  let x = 0, y = 0, w = 200 * PHI, h = 200;
  for (let i = 0; i < 9; i++) {
    const s = Math.min(w, h), dir = i % 4;
    const sx = dir === 2 ? x + w - s : x;
    const sy = dir === 3 ? y + h - s : y;
    squares.push({ x: sx, y: sy, s });
    if (dir === 0) { x += s; w -= s; }
    if (dir === 1) { y += s; h -= s; }
    if (dir === 2) w -= s;
    if (dir === 3) h -= s;
  }
  const spiral = 'M0 200 ' + squares.map(({ x, y, s }, i) => {
    const end = [[x+s,y],[x+s,y+s],[x,y+s],[x,y]][i%4];
    return `A${s} ${s} 0 0 1 ${end[0]} ${end[1]}`;
  }).join(' ');
  const triangles = squares.map(({x,y,s},i) => `M${x} ${y+s}L${x+s} ${y}L${x+s} ${y+s}${i%2 ? `L${x} ${y}` : ''}`).join(' ');
  const diamonds = squares.map(({x,y,s}) => `M${x} ${y+s/2}L${x+s/2} ${y}L${x+s} ${y+s/2}L${x+s/2} ${y+s}Z`).join(' ');
  const circles = squares.map(({x,y,s}) => `M${x} ${y+s/2}a${s/2} ${s/2} 0 1 0 ${s} 0a${s/2} ${s/2} 0 1 0 ${-s} 0`).join(' ');
  const arcs = squares.map(({x,y,s}) => `M${x} ${y+s}A${s} ${s} 0 0 0 ${x+s} ${y}M${x} ${y}A${s} ${s} 0 0 1 ${x+s} ${y+s}`).join(' ');
  // A true logarithmic spiral: radius shrinks by φ every quarter-turn.
  const points = Array.from({length:200},(_,i) => {
    const a = i / 199 * Math.PI * 5;
    const r = 200 * Math.exp(-Math.log(PHI) * a / (Math.PI/2));
    return [r*Math.cos(a),r*Math.sin(a)];
  });
  const xs=points.map(p=>p[0]), ys=points.map(p=>p[1]);
  const minX=Math.min(...xs),minY=Math.min(...ys);
  const scale=Math.min(323.607/(Math.max(...xs)-minX),200/(Math.max(...ys)-minY));
  const smooth = points.map(([px,py],i)=>`${i?'L':'M'}${(px-minX)*scale} ${(py-minY)*scale}`).join(' ');
  return [spiral, triangles, smooth, diamonds, circles, arcs];
}

export function initGoldenDisplays() {
  if (!window.gsap) return; // The inline SVG is the accessible, static fallback.
  const paths = compositions();
  const probe = document.createElementNS('http://www.w3.org/2000/svg','path');
  const samples = paths.map(d => {
    probe.setAttribute('d',d);
    const length=probe.getTotalLength();
    return Array.from({length:180},(_,i)=>probe.getPointAtLength(length*i/179));
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controllers = new Map();
  document.querySelectorAll('.golden-display').forEach(svg => {
    const line=svg.querySelector('.golden-line'), deck=svg.closest('.flight-deck');
    const label=deck.querySelector('[data-golden-label]'), readout=deck.querySelector('[data-golden-state]');
    const proxy={mix:0};
    const show = i => {
      line.setAttribute('d',paths[i]);
      label.textContent=`0${i+1} / ${names[i]}`;
      readout.textContent=`0${i+1} / 06`;
      svg.dataset.geometry=String(i);
    };
    const timeline=gsap.timeline({paused:true,repeat:-1});
    for(let i=0;i<paths.length;i++) {
      const next=(i+1)%paths.length, from=samples[i], to=samples[next];
      timeline.to(proxy,{mix:1,duration:1.65,delay:2.3,ease:'sine.inOut',
        onStart:()=>{proxy.mix=0;},
        onUpdate:()=>line.setAttribute('d',from.map((p,j)=>`${j?'L':'M'}${(p.x+(to[j].x-p.x)*proxy.mix).toFixed(2)} ${(p.y+(to[j].y-p.y)*proxy.mix).toFixed(2)}`).join(' ')),
        onComplete:()=>{show(next);proxy.mix=0;}
      });
    }
    show(0);
    controllers.set(svg,{timeline,show,visible:false});
  });
  const sync=()=>controllers.forEach(({timeline,show,visible})=>{
    if(reduced.matches){timeline.pause(0);show(0);}
    else if(visible&&!document.hidden)timeline.play();
    else timeline.pause();
  });
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{controllers.get(entry.target).visible=entry.isIntersecting&&entry.intersectionRatio>.1;});
    sync();
  },{threshold:[0,.1]});
  controllers.forEach((_,svg)=>observer.observe(svg));
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    observer.disconnect();controllers.forEach(({timeline})=>timeline.kill());
    reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);
  });
}
