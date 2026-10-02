// Drafting-style pointer: fine guides, ruler ticks and a compact coordinate label.
export function drawDetectorCursor(ctx, width, height, state) {
  const cursor = state.cursor;
  const live = cursor?.visible;
  const x = Math.max(0, Math.min(width, (live ? cursor.x : state.x) * width));
  const y = Math.max(0, Math.min(height, (live ? cursor.y : state.y) * height));
  const accent = '#f57a50';
  const compact = width < 350;
  ctx.save();
  ctx.lineWidth = .6;
  ctx.strokeStyle = live ? '#d6dfc547' : '#a5b19724';
  ctx.beginPath();
  ctx.moveTo(0, y); ctx.lineTo(width, y);
  ctx.moveTo(x, 0); ctx.lineTo(x, height);
  for (let tick = 12; tick < width; tick += 8) {
    ctx.moveTo(tick, 0); ctx.lineTo(tick, tick % 40 === 12 ? 7 : 3);
  }
  for (let tick = 12; tick < height - 28; tick += 8) {
    ctx.moveTo(0, tick); ctx.lineTo(tick % 40 === 12 ? 7 : 3, tick);
  }
  ctx.stroke();
  ctx.strokeStyle = live ? accent : '#c1d99b70';
  ctx.lineWidth = live ? 1.4 : .9;
  const arm = cursor?.pressed ? 8 : 5;
  ctx.beginPath();
  ctx.moveTo(x-arm,y); ctx.lineTo(x+arm,y);
  ctx.moveTo(x,y-arm); ctx.lineTo(x,y+arm);
  if (live) {
    ctx.moveTo(x,0); ctx.lineTo(x,8);
    ctx.moveTo(0,y); ctx.lineTo(8,y);
  }
  ctx.stroke();
  if (!live) { ctx.restore(); return; }

  const font = compact ? 8 : 9;
  const lineHeight = font + 3;
  ctx.font = `${font}px "Courier New",monospace`;
  const coordinateWidth = ctx.measureText('X:0000PX').width;
  const toRight = x + coordinateWidth + 20 < width;
  const coordinateX = toRight ? x+10 : x-10;
  const coordinateY = Math.max(8, Math.min(height-lineHeight*2-30,y+8));
  const align = toRight ? 'left' : 'right';
  // Keep moving coordinates legible over the scene's fixed measurement labels.
  ctx.fillStyle = '#182017e0';
  ctx.fillRect((align === 'right' ? coordinateX-coordinateWidth : coordinateX)-3, coordinateY-2, coordinateWidth+6, lineHeight*2+2);
  ctx.fillStyle = '#d4ddc7'; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillText(`X:${Math.round(x)}PX`,coordinateX,coordinateY);
  ctx.fillText(`Y:${Math.round(y)}PX`,coordinateX,coordinateY+lineHeight);
  ctx.restore();
}
