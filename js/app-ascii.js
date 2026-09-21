let renderProgress = () => {};
export function driveAppGlyph(progress) { renderProgress(progress); }

// Fixed physical LED dots: draw pictures, never interpolate their positions.
export function initAppASCII() {
  const display = document.querySelector('.app-glyph');
  if (!display) return;
  const svg = display.querySelector('svg');
  const dots = new Map();
  for(let y=0;y<25;y++) for(let x=0;x<25;x++) {
    if(Math.hypot(x-12,y-12)>12.3)continue;
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx',String(2+x*4));dot.setAttribute('cy',String(2+y*4));dot.setAttribute('r','1.35');
    svg.append(dot);dots.set(`${x},${y}`,dot);
  }
  const frames=Array.from({length:32},(_,frame)=>{
    const pixels=new Set();
    const point=(x,y)=>pixels.add(`${x},${y}`);
    const line=(x0,y0,x1,y1)=>{
      const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));
      for(let i=0;i<=n;i++)point(Math.round(x0+(x1-x0)*i/(n||1)),Math.round(y0+(y1-y0)*i/(n||1)));
    };
    // Phone silhouette stays physically fixed throughout the interaction.
    line(7,3,17,3);line(6,4,6,20);line(18,4,18,20);line(7,21,17,21);
    line(10,5,14,5);line(11,19,13,19);
    if(frame<12){
      for(const [x,y] of [[9,8],[14,8],[9,13],[14,13]]){
        point(x,y);point(x+1,y);point(x,y+1);point(x+1,y+1);
      }
      if(frame>=4){
        const shift=frame<8?2:0;
        // A stepped pointer approaches the app tile.
        line(14+shift,13+shift,14+shift,18+shift);
        line(14+shift,13+shift,18+shift,17+shift);
        line(14+shift,17+shift,18+shift,17+shift);
      }
    } else if(frame<20){
      const radius=1+Math.floor((frame-12)/2);
      for(let y=6;y<=17;y++)for(let x=8;x<=16;x++){
        if(Math.abs(Math.hypot(x-12,y-12)-radius)<.55)point(x,y);
      }
      point(12,12);
    } else {
      // The app responds: a large confirmation glyph, followed by a live pulse.
      line(8,12,11,15);line(11,15,16,10);
      if(frame%4<2){point(20,7);point(21,6);point(21,8);}
    }
    return pixels;
  });
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let lastFrame=-1, progress=0;
  function draw(){
    const index=reduced.matches?24:Math.min(31,Math.floor(progress*32));
    if(index===lastFrame)return;
    lastFrame=index;
    const active=frames[index], previous=frames[Math.max(0,index-1)];
    dots.forEach((dot,key)=>{
      const state=active.has(key)?'on':previous.has(key)?'ghost':'off';
      if(dot.dataset.led!==state)dot.dataset.led=state;
    });
    display.dataset.frame=String(index);
  }
  renderProgress=value=>{progress=Math.max(0,Math.min(1,value));draw();};
  reduced.addEventListener('change',draw);
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    reduced.removeEventListener('change',draw);renderProgress=()=>{};
  });
  draw();
}