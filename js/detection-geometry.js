const gaussian = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2) - ((y - cy) / sy) ** 2);

export function createHeadSurface() {
  const rows = [];
  for (let row = 0; row < 88; row++) {
    const y = -.995 + row / 87 * 1.99;
    const width = Math.sqrt(1 - y * y) * (y > -.05 ? 1 - (y + .05) * .29 : 1);
    const points = [];
    for (let col = 0; col <= 112; col++) {
      const u = -1 + col / 56, x = u * width;
      const eyes = gaussian(x, y, -.32, -.13, .21, .095) + gaussian(x, y, .32, -.13, .21, .095);
      const nostrils = gaussian(x,y,-.115,.29,.064,.033) + gaussian(x,y,.115,.29,.064,.033);
      const mouth = gaussian(x,y,0,.54,.27,.027);
      let z = Math.sqrt(Math.max(0, 1 - u*u)) * Math.sqrt(1-y*y) * .68;
      z += gaussian(x,y,0,-.52,.64,.4)*.12; // forehead
      z += (gaussian(x,y,-.31,-.28,.26,.075)+gaussian(x,y,.31,-.28,.26,.075))*.16; // brow
      z -= eyes*.32;
      z += gaussian(x,y,0,-.025,.105,.31)*.36; // nasal bridge
      z += gaussian(x,y,0,.195,.15,.10)*.48; // tip
      z += (gaussian(x,y,-.16,.23,.1,.075)+gaussian(x,y,.16,.23,.1,.075))*.12;
      z -= nostrils*.2;
      z += (gaussian(x,y,-.42,.16,.23,.19)+gaussian(x,y,.42,.16,.23,.19))*.13;
      z += gaussian(x,y,0,.47,.28,.05)*.13 + gaussian(x,y,0,.60,.25,.055)*.13;
      z -= mouth*.17;
      z += gaussian(x,y,0,.79,.31,.17)*.17;
      const rim = Math.pow(Math.max(0,1-u*u),.25);
      const shade = Math.max(.035, (.58 + z*.34 - eyes*.82 - nostrils*.95 - mouth*.68) * rim * (1-x*.2));
      points.push({x,y,z,shade});
    }
    rows.push(points);
  }
  return rows;
}

export function drawHeadSurface(ctx, rows, project, mesh) {
  if (mesh) {
    ctx.strokeStyle = '#c1d99b70'; ctx.lineWidth = .6;
    ctx.beginPath();
    for (let row=0;row<rows.length-6;row+=6) for(let col=0;col<112;col+=8) {
      const a=project(rows[row][col]),b=project(rows[row][col+8]),c=project(rows[row+6][col]),d=project(rows[row+6][col+8]);
      ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(d.x,d.y);ctx.lineTo(c.x,c.y);ctx.lineTo(a.x,a.y);ctx.lineTo(d.x,d.y);
    }
    ctx.stroke();
    return;
  }
  // The surface is made exclusively from depth-displaced scan lines.
  // Dark sockets/nostrils interrupt the contour field; there are no drawn facial outlines.
  for (const row of rows) {
    let previous=project(row[0]), bucket=-1;
    for(let col=1;col<row.length;col++) {
      const point=project(row[col]);
      const shade=Math.round(row[col].shade*6)/6;
      if(shade!==bucket) {
        if(bucket>=0)ctx.stroke();
        ctx.beginPath();ctx.moveTo(previous.x,previous.y);
        ctx.strokeStyle='rgba(204,222,179,'+Math.min(.95,shade)+')';
        ctx.lineWidth=.55+shade*.35;bucket=shade;
      }
      ctx.lineTo(point.x,point.y);previous=point;
    }
    ctx.stroke();
  }
}

export function createMorphGeometry() {
  const t=(1+Math.sqrt(5))/2;
  const vertices=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
  const base=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const mids=new Map(), faces=[];
  const normalize=p=>{const length=Math.hypot(...p);return p.map(v=>v/length);};
  vertices.forEach((p,i)=>{vertices[i]=normalize(p);});
  const mid=(a,b)=>{
    const key=Math.min(a,b)+':'+Math.max(a,b);
    if(!mids.has(key)){mids.set(key,vertices.length);vertices.push(normalize(vertices[a].map((v,i)=>(v+vertices[b][i])/2)));}
    return mids.get(key);
  };
  base.forEach(([a,b,c])=>{const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);faces.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);});
  return {vertices,faces};
}

export function drawMorphGeometry(ctx, geometry, origin, size, time, pointer) {
  const turn=time*.27+(pointer-.5)*.7, tilt=.45+Math.sin(time*.32)*.25;
  const points=geometry.vertices.map(([x,y,z],i)=>{
    const azimuth=Math.atan2(z,x);
    const radial=1+.23*Math.sin(azimuth*3+time*.75)*Math.cos(y*4-time*.4)+.12*Math.sin(i*2.4+time);
    const px=x*radial*(1+.22*Math.sin(time*.6)),py=y*radial*(1+.28*Math.cos(time*.5)),pz=z*radial;
    const rx=px*Math.cos(turn)+pz*Math.sin(turn),rz=pz*Math.cos(turn)-px*Math.sin(turn);
    return {x:origin.x+rx*size,y:origin.y+(py*Math.cos(tilt)-rz*Math.sin(tilt))*size,z:py*Math.sin(tilt)+rz*Math.cos(tilt)};
  });
  const sorted=geometry.faces.map(indices=>({indices,z:indices.reduce((sum,i)=>sum+points[i].z,0)/3})).sort((a,b)=>a.z-b.z);
  ctx.lineWidth=.6;
  sorted.forEach(({indices,z})=>{
    ctx.beginPath();indices.forEach((index,i)=>{const p=points[index];if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();
    ctx.fillStyle='rgba(193,217,155,'+Math.max(.012,(z+1.2)*.027)+')';ctx.fill();
    ctx.strokeStyle=z>0?'#c1d99b9c':'#95ab7830';ctx.stroke();
  });
  points.forEach(p=>{if(p.z>0){ctx.fillStyle='#dae6c1';ctx.fillRect(p.x-.8,p.y-.8,1.6,1.6);}});
}
