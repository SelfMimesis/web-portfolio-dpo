// Sample the ungraded photograph; colour lives in the glyphs, not a tinted overlay.
export function createSkillsASCII(section){
  const photo=section.querySelector('.skills-photo'),img=photo.querySelector('img');
  const canvas=document.createElement('canvas');canvas.className='skills-ascii';canvas.setAttribute('aria-hidden','true');photo.append(canvas);
  const ctx=canvas.getContext('2d'),sample=document.createElement('canvas'),read=sample.getContext('2d',{willReadFrequently:true});
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(any-pointer: fine)');
  let enabled=false,visible=false,inside=false,raf=0,last=0,alpha=0,w=0,h=0,pixels,cols=0,rows=0;
  const target={x:0,y:0},cursor={x:0,y:0};
  const cell=10,chars=' .:;+*#%@';
  // Hand-traced silhouette in the original photo's 2048 x 1152 reference space.
  // The same cover crop as the image keeps the exclusion aligned on resize.
  const silhouette=[[1457,355],[1455,329],[1465,309],[1492,291],[1521,281],[1548,284],[1567,297],[1579,319],[1581,350],[1586,379],[1586,410],[1594,426],[1630,440],[1680,465],[1701,484],[1720,531],[1744,591],[1758,635],[1780,680],[1803,737],[1823,793],[1852,846],[1864,877],[1854,900],[1834,924],[1816,923],[1806,910],[1795,901],[1784,873],[1771,829],[1750,788],[1729,750],[1709,708],[1686,665],[1678,650],[1668,703],[1662,758],[1658,817],[1657,856],[1650,876],[1651,933],[1658,1003],[1670,1073],[1680,1152],[1567,1152],[1548,1102],[1522,1041],[1504,1003],[1518,1064],[1530,1124],[1526,1152],[1435,1152],[1436,1134],[1451,1109],[1437,1058],[1421,1009],[1416,955],[1417,898],[1423,845],[1433,799],[1436,771],[1429,751],[1434,693],[1434,621],[1430,562],[1406,562],[1380,566],[1356,561],[1343,553],[1341,536],[1350,508],[1363,480],[1380,452],[1391,431],[1397,405],[1409,376],[1425,359],[1443,357],[1459,374]];
  // Background enclosed by the raised forearm, hand, jaw and shirt.
  const armGap=[[1461,417],[1468,430],[1482,442],[1501,451],[1505,459],[1478,463],[1455,475],[1434,482],[1411,488],[1415,473],[1423,453],[1429,441],[1443,436],[1453,427]];
  let subjectMask;
  function resize(){
    const box=photo.getBoundingClientRect();w=box.width;h=box.height;
    if(!w||!h||!img.naturalWidth)return;
    const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    cols=Math.ceil(w/cell);rows=Math.ceil(h/cell);sample.width=cols;sample.height=rows;
    const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/scale,sh=h/scale;
    const offsetX=(img.naturalWidth-sw)*.65,offsetY=(img.naturalHeight-sh)*.5;
    subjectMask=new Path2D();
    for(const outline of [silhouette,armGap]){
      outline.forEach(([x,y],index)=>subjectMask[index?'lineTo':'moveTo']((x/2048*img.naturalWidth-offsetX)*scale,(y/1152*img.naturalHeight-offsetY)*scale));
      subjectMask.closePath();
    }
    read.drawImage(img,(img.naturalWidth-sw)*.65,(img.naturalHeight-sh)*.5,sw,sh,0,0,cols,rows);
    pixels=read.getImageData(0,0,cols,rows).data;
  }
  function stop(){cancelAnimationFrame(raf);raf=0;alpha=0;ctx.clearRect(0,0,w,h);}
  function draw(time){
    raf=0;
    if(!enabled||!visible||document.hidden)return stop();
    if(time-last<32&&!motion.matches){raf=requestAnimationFrame(draw);return;}last=time;
    alpha=motion.matches?(inside?1:0):alpha+((inside?1:0)-alpha)*.16;
    cursor.x+=(target.x-cursor.x)*.22;cursor.y+=(target.y-cursor.y)*.22;
    ctx.clearRect(0,0,w,h);
    if(!pixels||alpha<.008){if(inside)raf=requestAnimationFrame(draw);return;}
    const t=motion.matches?0:time*.0006,radius=Math.min(235,w*.23);
    ctx.font='11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let row=Math.max(0,Math.floor((cursor.y-radius*1.3)/cell));row<Math.min(rows,(cursor.y+radius*1.3)/cell);row++){
      for(let col=Math.max(0,Math.floor((cursor.x-radius*1.3)/cell));col<Math.min(cols,(cursor.x+radius*1.3)/cell);col++){
        const x=(col+.5)*cell,y=(row+.5)*cell,dx=x-cursor.x,dy=y-cursor.y,a=Math.atan2(dy,dx);
        const edge=radius*(1+.12*Math.sin(a*3+t*2)+.075*Math.cos(a*5-t*1.4));
        const distance=Math.hypot(dx,dy)/edge;if(distance>=1)continue;
        const fade=Math.min(1,(1-distance)/.48),i=(row*cols+col)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
        const luminance=(r*.2126+g*.7152+b*.0722)/255;
        ctx.globalAlpha=alpha*fade*fade*(3-2*fade);
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        ctx.fillText(chars[Math.max(2,Math.min(chars.length-1,Math.floor(luminance*chars.length)))],x,y);
      }
    }
    ctx.globalAlpha=1;
    if(subjectMask){
      ctx.save();ctx.globalCompositeOperation='destination-out';
      ctx.fillStyle='#000';ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.lineJoin='round';
      ctx.fill(subjectMask,'evenodd');ctx.stroke(subjectMask);ctx.restore();
    }
    if(!motion.matches&&(inside||alpha>.008))raf=requestAnimationFrame(draw);
  }
  const kick=()=>{if(!raf&&enabled&&visible&&!document.hidden)raf=requestAnimationFrame(draw);};
  function move(event){
    if(!enabled||!fine.matches||event.pointerType==='touch')return;
    const box=photo.getBoundingClientRect();target.x=event.clientX-box.left;target.y=event.clientY-box.top;
    if(!inside){cursor.x=target.x;cursor.y=target.y;}inside=true;kick();
  }
  const leave=()=>{inside=false;if(motion.matches)stop();else kick();};
  const visibility=()=>{if(document.hidden)stop();else if(inside)kick();};
  section.addEventListener('pointermove',move);section.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){inside=false;stop();}},{threshold:.1});observer.observe(section);
  const ro=new ResizeObserver(()=>{if(enabled)resize();});ro.observe(photo);img.addEventListener('load',resize);
  return{update(active){if(active===enabled)return;enabled=active;if(active)resize();else{inside=false;stop();}},destroy(){stop();observer.disconnect();ro.disconnect();img.removeEventListener('load',resize);section.removeEventListener('pointermove',move);section.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);canvas.remove();}};
}
