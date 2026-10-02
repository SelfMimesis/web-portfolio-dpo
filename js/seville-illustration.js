export async function createSevilleIllustration(space,onLayout){
  const {default:borders}=await import('../assets/interfaces/world-lines.js');
  const canvas=document.createElement('canvas');canvas.className='seville-canvas';canvas.setAttribute('aria-hidden','true');
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
  space.prepend(canvas);
  const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;
  const map=atlas.getContext('2d');map.fillStyle='#eee9d9';map.fillRect(0,0,1024,512);map.fillStyle='#454e3b';
  borders.forEach(ring=>{for(const shift of [-1024,0,1024]){
    map.beginPath();let previous;
    ring.forEach(([lon,lat],i)=>{let x=(lon+180)/360*1024;if(previous!==undefined){while(x-previous>512)x-=1024;while(x-previous< -512)x+=1024;}previous=x;const y=(90-lat)/180*512;if(i)map.lineTo(x+shift,y);else map.moveTo(x+shift,y);});map.closePath();map.fill();
  }});
  const pixels=map.getImageData(0,0,1024,512).data;
  const globe=document.createElement('canvas');globe.width=globe.height=180;
  const globeCtx=globe.getContext('2d'),globeImage=globeCtx.createImageData(180,180);
  let lastGlobe=-1,width=0,height=0,dead=false;
  const ink='#363c30',accent='#d45b3a',paper='#dedbd0';
  const phases=[-2.25,-.6,.85,2.2,3.02],radii=[184,254,254,230,254];
  const point=(a,r)=>({x:Math.cos(a)*r,y:Math.sin(a)*r*.9});
  const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);};
  const orbit=(radius,rotation,dashed=false)=>{
    ctx.save();ctx.rotate(rotation);ctx.beginPath();
    for(let i=0;i<=240;i++){
      const a=i*Math.PI/120,r=radius+Math.sin(a*31)*.22+Math.cos(a*53)*.16;
      const x=Math.cos(a)*r,y=Math.sin(a)*r*.9;
      if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
    }
    ctx.setLineDash(dashed?[2,5]:[]);ctx.stroke();ctx.restore();
  };
  const drawGlobe=(time)=>{
    if(Math.abs(time-lastGlobe)<.07)return;lastGlobe=time;
    const out=globeImage.data,turn=time*.16+.15;
    for(let y=0;y<180;y++)for(let x=0;x<180;x++){
      const nx=(x-89.5)/89,ny=(89.5-y)/89,d=nx*nx+ny*ny,index=(y*180+x)*4;
      if(d>1){out[index+3]=0;continue;}
      const nz=Math.sqrt(1-d),lat=Math.asin(ny),lon=Math.atan2(nx,nz)+turn;
      const mx=((Math.floor((lon+Math.PI)/(2*Math.PI)*1024)%1024)+1024)%1024,my=Math.min(511,Math.max(0,Math.floor((Math.PI/2-lat)/Math.PI*512)));
      const land=pixels[(my*1024+mx)*4]<120,colour=land?[68,76,58]:[234,227,207];
      const grain=((x*17+y*31)%13)/13*.045,shade=.86+nz*.14-grain;
      out[index]=colour[0]*shade;out[index+1]=colour[1]*shade;out[index+2]=colour[2]*shade;out[index+3]=255;
    }
    globeCtx.putImageData(globeImage,0,0);
    globeCtx.strokeStyle='#414b3940';globeCtx.lineWidth=.65;
    const project=(lat,lon)=>{const z=Math.cos(lat)*Math.cos(lon+turn);return{x:90+Math.cos(lat)*Math.sin(lon+turn)*89,y:90-Math.sin(lat)*89,z};};
    const curve=(points)=>{globeCtx.beginPath();let drawing=false;points.forEach(p=>{if(p.z<0){drawing=false;return;}if(drawing)globeCtx.lineTo(p.x,p.y);else globeCtx.moveTo(p.x,p.y);drawing=true;});globeCtx.stroke();};
    for(let lat=-60;lat<=60;lat+=30)curve(Array.from({length:121},(_,i)=>project(lat*Math.PI/180,i*Math.PI/60)));
    for(let lon=0;lon<360;lon+=30)curve(Array.from({length:61},(_,i)=>project(-Math.PI/2+i*Math.PI/60,lon*Math.PI/180)));
  };
  return{
    draw(state){
      if(dead||!space.clientWidth||!space.clientHeight)return;
      const dpr=Math.min(devicePixelRatio,2);
      if(width!==space.clientWidth||height!==space.clientHeight){width=space.clientWidth;height=space.clientHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const scale=Math.min(width/640,height/680),cx=width/2,cy=height/2;
      ctx.translate(cx,cy);ctx.scale(scale,scale);
      const rotation=Math.sin(state.time*.18)*.035+state.tiltY*.3;
      ctx.strokeStyle='#363c3036';ctx.lineWidth=.8;orbit(184,-rotation);orbit(254,rotation,true);
      ctx.strokeStyle='#363c301a';ctx.lineWidth=.6;orbit(266,rotation);
      // Short moving registration marks make the printed rings feel alive.
      for(let i=0;i<4;i++){
        const a=state.time*.09+i*Math.PI/2,p=point(a,266);
        ctx.strokeStyle=i===0?accent:'#363c3055';ctx.beginPath();ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.stroke();
      }
      const layout=[];
      radii.forEach((base,i)=>{
        const e=Math.max(0,state.levels[i]),a=phases[i]+state.time*.045*(i===0?1.15:1),radius=base-(i===4?49*e:0);
        const p=point(a,radius),r=[15,12,11,14,17][i]+(i===4?57:23)*e;
        p.x+=Math.sin(state.time*.55+i)*3+state.tiltY*20;p.y+=Math.cos(state.time*.45+i)*3+state.tiltX*20;
        // A fine radial connection appears under the pointer, with a travelling cue.
        if(e>.01){
          ctx.save();ctx.globalAlpha=Math.min(1,e)*.55;ctx.strokeStyle=accent;ctx.setLineDash([2,5]);ctx.lineDashOffset=-state.globeTime*13;
          ctx.beginPath();ctx.moveTo(p.x*.38,p.y*.38);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();
        }
        circle(p.x,p.y,r+6);ctx.fillStyle=paper;ctx.fill();ctx.strokeStyle=e>.01?accent:'#363c3045';ctx.lineWidth=.7;ctx.stroke();
        circle(p.x,p.y,r);ctx.fillStyle=i===0||e>.01&&i!==4?accent:ink;ctx.fill();
        if(i===4&&e>.001){drawGlobe(state.globeTime);ctx.save();circle(p.x,p.y,r);ctx.clip();ctx.globalAlpha=Math.min(1,e);ctx.drawImage(globe,p.x-r,p.y-r,r*2,r*2);ctx.restore();}
        // Slightly offset fine lines retain the engraved / ink-registration character.
        if(e>.01){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(state.globeTime*.25);ctx.strokeStyle=accent;ctx.lineWidth=.65;ctx.beginPath();ctx.ellipse(0,0,r+13,(r+13)*.45,.3,0,Math.PI*2);ctx.stroke();ctx.restore();}
        layout.push({x:cx+p.x*scale,y:cy+p.y*scale,radius:(r+7)*scale});
      });onLayout(layout);
    },
    destroy(){dead=true;canvas.remove();}
  };
}
