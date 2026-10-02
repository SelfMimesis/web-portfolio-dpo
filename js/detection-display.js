import { createHandSurface, drawHandSurface, handLandmarks } from './hand-geometry.js';
import { createMorphGeometry, drawMorphGeometry } from './detection-geometry.js';
import { drawDetectorCursor } from './detector-cursor.js';
// Procedural scene geometry: no camera, external images or tracking service.
export function createDetectionDisplay(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let w = 1, h = 1, ratio = 1;
  const hand = createHandSurface(), morph = createMorphGeometry();
  const line = (points, colour = '#89927a45', close = false, fill = null) => {
    if (!points.length) return;
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    if (close) ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.strokeStyle = colour; ctx.lineWidth = .65; ctx.stroke();
  };
  const label = (text, x, y, colour = '#a5b197', align = 'left') => {
    ctx.font = `${w < 350 ? 7 : 9}px "Courier New",monospace`;
    ctx.textAlign = align; ctx.fillStyle = colour;
    ctx.fillText(text, Math.max(8, Math.min(w - 8, x)), Math.max(10, Math.min(h - 26, y)));
  };
  const dot = (p, colour = '#bdc9af', size = 2) => { ctx.fillStyle = colour; ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size); };
  const brackets = (x, y, width, height, colour = '#bdc9af', length = 9) => {
    for (const [cx, cy, sx, sy] of [[x,y,1,1],[x+width,y,-1,1],[x,y+height,1,-1],[x+width,y+height,-1,-1]]) {
      line([{x:cx,y:cy+sy*length},{x:cx,y:cy},{x:cx+sx*length,y:cy}], colour);
    }
  };
  function resize(width, height) {
    w = width; h = height; ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function draw(state) {
    ctx.clearRect(0, 0, w, h);
    const pointer = { x: state.x * w, y: state.y * h };
    const capture = 1 - state.pulse;
    const pitch = (state.y - .5) * .24 + .12, yaw = (state.x - .5) * .85;
    const handWidth = Math.min(w * .34, h * .37), handHeight = Math.min(h * .37, w * .34);
    const center = { x: w * .43 + (state.x - .5) * 9, y: h * .47 };
    const project = p => {
      const x = p.x * Math.cos(yaw) + p.z * Math.sin(yaw), z = p.z * Math.cos(yaw) - p.x * Math.sin(yaw);
      return { x: center.x + x * handWidth, y: center.y + (p.y * Math.cos(pitch) - z * Math.sin(pitch) - p.z * .13) * handHeight };
    };
    // Low-contrast pixel field and registration ticks, with no background animation.
    for (let i = 0; i < 105; i++) {
      const x = ((i * 127.7) % 997) / 997 * w, y = ((i * 73.9) % 601) / 601 * h;
      ctx.fillStyle = i % 4 ? '#a5b19715' : '#a5b19739'; ctx.fillRect(x, y, 1, 1);
    }
    const anchors = Array.from({length: 10}, (_, i) => ({
      x: w * (.08 + (i * .317 % .84)), y: h * (.08 + (i * .227 % .78))
    }));
    anchors.forEach((p, i) => {
      line([p, pointer], i % 3 ? '#89927a36' : '#acb69658'); dot(p, '#aab99a70', 1.5);
      if (i % 2 === 0) label(`${(p.x/w).toFixed(2)},${(p.y/h).toFixed(2)}`,p.x+4,p.y-5,'#7c8672');
    });
    // A live triangulated cage connects input space with the detected geometry.
    const cage = Array.from({length: 7}, (_, i) => {
      const angle = i / 7 * Math.PI * 2 + yaw * .4;
      const radius = Math.min(w,h) * (.17 + (i%3)*.025);
      return { x: Math.max(15,Math.min(w-15,pointer.x*.62+center.x*.38+Math.cos(angle)*radius)), y: Math.max(18,Math.min(h-38,pointer.y*.62+center.y*.38+Math.sin(angle)*radius)) };
    });
    line(cage,'#a8b39455',true,'#a6b59403');
    cage.forEach((p,i) => { line([p,cage[(i+2)%7]],'#8e9c8040'); line([p,pointer],'#b7bdad3c'); dot(p,'#c1d99b',2); });
    const scanY = center.y + (state.scanning ? state.scanProgress * 2 - 1 : Math.sin((state.time || 0) * 1.15)) * handHeight * 1.08;
    drawHandSurface(ctx, hand, project, state.view === 'mesh', scanY);
    const features = handLandmarks.map(project);
    features.forEach((p,i)=>{dot(p,'#e4e8d860',1.5);if(state.view==='mesh')line([p,cage[i]],'#b6c5a32a');});
    const bx=center.x-handWidth*1.06, by=center.y-handHeight*1.13, bw=handWidth*2.12,bh=handHeight*2.26;
    ctx.strokeStyle='#a4b48e30';ctx.lineWidth=.5;ctx.strokeRect(bx,by,bw,bh);
    brackets(bx,by,bw,bh,'#bbcba49c');
    label('HAND_01 / DEPTH',bx,by-8,'#cdd6bf');
    label(`LANDMARKS ${features.length.toString().padStart(2,'0')}`,bx,by+bh+13,'#899578');
    // Eighty triangular faces continuously interpolate between asymmetric volumes.
    const size = Math.min(w,h)*.132;
    const object = {x:w*.8+(state.x-.5)*w*.045,y:h*.66+(state.y-.5)*h*.03};
    drawMorphGeometry(ctx,morph,object,size,state.time||0,state.x);
    brackets(object.x-size*1.5,object.y-size*1.65,size*3,size*3.3,'#8e9e7e80',6);
    label('OBJECT_02 / 80F',object.x-size*1.5,object.y-size*1.65-7,'#a5b394');
    line([object,pointer],'#a5c78258');
    // The scan plane remains independent of the pointer's measurement guides.
    const scanGlow = ctx.createLinearGradient(0,scanY-15,0,scanY+3);
    scanGlow.addColorStop(0,'#c8d9b000');scanGlow.addColorStop(1,'#c8d9b022');
    ctx.fillStyle=scanGlow;ctx.fillRect(bx,scanY-15,bw,18);
    line([{x:bx-5,y:scanY},{x:bx+bw+5,y:scanY}],'#c8d9b060');
    state.marks.forEach((mark,i)=>{
      const p={x:mark.x*w,y:mark.y*h};
      brackets(p.x-14,p.y-14,28,28,'#e27655ee',5);dot(p,'#f09a74',3);
      label(`C${String(mark.id).padStart(2,'0')}`,p.x+18,p.y+19,'#ec9575');
      if(i)line([{x:state.marks[i-1].x*w,y:state.marks[i-1].y*h},p],'#e27655cc');
    });
    if(state.marks.length>2)line(state.marks.map(p=>({x:p.x*w,y:p.y*h})),'#e27655ba',true,'#d94b2b18');
    if(state.pulse>0&&state.marks.length){
      const p=state.marks[state.marks.length-1],r=8+capture*24;
      ctx.strokeStyle=`rgba(193,217,155,${state.pulse})`;ctx.lineWidth=.8;
      // Two complete, concentric rings: a short, symmetric confirmation pulse.
      for(const radius of [r,r*.62]){
        ctx.beginPath();ctx.arc(p.x*w,p.y*h,radius,0,Math.PI*2);ctx.stroke();
      }
    }
    label(`NDC ${(state.x*2-1).toFixed(3)} / ${(state.y*2-1).toFixed(3)}`,w-15,16,'#929f81','right');
    drawDetectorCursor(ctx, w, h, state);
  }
  return {resize,draw};
}
