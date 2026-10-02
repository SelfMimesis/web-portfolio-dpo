// Anatomical contour and depth field, modelled after the supplied palm reference.
// The final image is still drawn exclusively as horizontal surface contours.
const outline = [
  [152,550],
  [151,518,149,483,140,462], [116,439,106,405,102,375],
  [94,340,96,299,103,278], [101,244,96,180,102,150],
  [105,127,118,129,124,148], [134,178,137,219,143,240],
  [145,249,150,250,150,240], [139,206,130,157,124,126],
  [119,104,116,83,129,72], [140,62,152,71,157,86],
  [166,122,169,179,179,229], [181,242,188,240,187,226],
  [182,183,170,122,164,82], [159,62,165,46,178,43],
  [194,39,203,55,208,74], [220,118,226,184,238,229],
  [241,239,247,240,247,226], [241,183,229,136,219,107],
  [211,85,209,75,219,71], [233,65,244,89,250,105],
  [262,137,270,182,277,217], [280,237,282,254,285,259],
  [295,250,301,231,307,218], [317,198,336,189,346,198],
  [351,205,343,226,340,242], [335,274,342,308,350,336],
  [362,375,352,413,331,439], [315,460,307,485,304,508],
  [307,526,313,541,315,550], [263,554,205,551,152,550]
];

const curve = (commands, steps = 12) => {
  const points = [commands[0]];
  for (const [cx,cy,dx,dy,x,y] of commands.slice(1)) {
    const [ax,ay] = points[points.length - 1];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      points.push([u*u*u*ax+3*u*u*t*cx+3*u*t*t*dx+t*t*t*x,
        u*u*u*ay+3*u*u*t*cy+3*u*t*t*dy+t*t*t*y]);
    }
  }
  return points;
};
const distance = (x, y, points) => {
  let squared = Infinity;
  for (let i = 1; i < points.length; i++) {
    const [ax,ay] = points[i-1], [bx,by] = points[i];
    const dx = bx-ax, dy = by-ay;
    const t = Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy || 1)));
    squared = Math.min(squared,(x-ax-t*dx)**2+(y-ay-t*dy)**2);
  }
  return Math.sqrt(squared);
};
const bump = (x,y,cx,cy,rx,ry) => Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2));
const position = (x,y,z) => ({x:(x-224)/224,y:(y-298)/248,z:z/105});

export const handLandmarks = [[112,145],[137,78],[180,52],[224,80],[337,203]]
  .map(([x,y]) => position(x,y,17));

let cachedSurface;
export function createHandSurface() {
  if (cachedSurface) return cachedSurface;
  const boundary = curve(outline);
  const mask = new Path2D();
  mask.moveTo(...outline[0]);
  outline.slice(1).forEach(segment => mask.bezierCurveTo(...segment));
  mask.closePath();
  const context = document.createElement('canvas').getContext('2d');
  const folds = [
    // Life line wraps around the raised thumb pad; head and heart lines cross the palm.
    [[[279,272],[230,292,199,369,227,439],[238,462,260,471,278,475]],2.5,12],
    [[[127,316],[166,294,217,301,273,267]],2.1,9],
    [[[134,278],[161,265,174,260,199,266],[221,269,244,251,258,246]],1.8,8],
    [[[179,426],[174,374,204,346,214,303]],1.3,5],
    [[[154,484],[186,501,237,491,290,488]],2,6],
    [[[155,500],[195,518,250,505,298,510]],1.4,4],
    [[[306,274],[318,281,332,286,342,279]],1.5,7],
    [[[302,285],[315,294,328,296,340,290]],1,4],
    // Flexion folds of the fingers, in their individual local directions.
    [[[101,204],[112,208,125,204,133,200]],1.4,5],
    [[[128,159],[140,162,152,158,167,151]],1.5,7],
    [[[139,206],[151,211,164,204,175,200]],1.7,7],
    [[[169,132],[183,137,199,131,219,127]],1.5,7],
    [[[180,191],[195,198,213,192,231,185]],1.8,8],
    [[[227,153],[241,157,255,151,264,146]],1.4,6],
    [[[239,202],[253,207,266,201,274,195]],1.7,7]
  ].map(([path,width,amount]) => ({points:curve(path,8),width,amount}));
  const depth = (x, y) => {
    if (!context.isPointInPath(mask,x,y)) return null;
    const edge = distance(x,y,boundary);
    const rim = Math.sqrt(1-Math.exp(-edge/9));
    let z = 28*rim;
    z += 40*bump(x,y,285,370,49,86); // thenar eminence
    z += 23*bump(x,y,143,372,34,93); // little-finger side of the palm
    z += 13*bump(x,y,181,450,43,46); // heel
    z -= 12*bump(x,y,204,335,46,58); // cupped central palm
    z += 12*bump(x,y,323,240,20,48); // thumb pulp
    for (const [cx,cy] of [[149,260],[186,248],[229,241]]) z += 12*bump(x,y,cx,cy,19,22);
    // Each crease displaces the surface itself and therefore bends the scan lines.
    let crease = 0;
    for (const fold of folds) crease += fold.amount*Math.exp(-((distance(x,y,fold.points)/fold.width)**2));
    z = Math.max(0,(z-crease)*rim);
    const shade = Math.max(.15,Math.min(.95,.40+z/105-crease/65+(224-x)/700));
    return {...position(x,y,z),shade};
  };
  return cachedSurface = Array.from({ length: 100 }, (_, row) =>
    Array.from({ length: 145 }, (_, col) => depth(90+col*1.9,41+row*5.15)));
}

export function drawHandSurface(ctx, rows, project, mesh, scan) {
  ctx.lineWidth = .55;
  // Keep separate strokes legible even inside the short desktop viewport.
  const height = Math.abs(project({x:0,y:1,z:0}).y-project({x:0,y:-1,z:0}).y);
  const step = mesh ? 4 : height < 150 ? 2 : 1;
  for (let r = 0; r < rows.length; r += step) {
    for (let c = 1; c < rows[r].length; c++) {
      const a = rows[r][c - 1], b = rows[r][c];
      if (!a || !b) continue;
      const p = project(a), q = project(b);
      const glow = Math.exp(-(((q.y - scan) / 13) ** 2));
      ctx.strokeStyle = `rgba(204,222,179,${Math.min(1, b.shade * (mesh ? .60 : .83) + glow * .5)})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      if (mesh && c % 4 === 0 && rows[r + step]?.[c]) {
        const next = project(rows[r + step][c]);
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(next.x, next.y);
        if (rows[r + step][c - 4]) {
          const diagonal = project(rows[r + step][c - 4]);
          ctx.lineTo(diagonal.x, diagonal.y); ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      }
    }
  }
}
