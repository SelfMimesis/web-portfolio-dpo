// An independent, masked viewer. Page scroll never selects a frame.
export function createFilmCarousel(root, { reducedMotion = false } = {}) {
  const carousel = root.querySelector('.film-carousel');
  const viewport = carousel.querySelector('.film-carousel-window');
  const frames = [...carousel.querySelector('.film-contact-sheet').children];
  const controls = carousel.querySelector('.film-carousel-controls');
  const images = frames.map(frame => frame.querySelector('img'));
  const motion = window.gsap && !reducedMotion;
  root.classList.add('has-manual-carousel');
  const zones = document.createElement('div');
  zones.className = 'film-reel-zones';
  zones.innerHTML = '<button type="button" data-step="-1" aria-label="Fotografía anterior"><span>ANTERIOR</span></button><button type="button" data-step="1" aria-label="Fotografía siguiente"><span>SIGUIENTE</span></button>';
  viewport.append(zones);
  const cursor = document.createElement('div');
  cursor.className = 'film-reel-cursor'; cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span>ANT.</span><span>SIG.</span>';
  carousel.append(cursor);
  controls.innerHTML = frames.map((_, i) => `<button type="button" data-frame="${i}" aria-label="Ver fotografía ${i + 1}: ${images[i].alt}">${String(i + 1).padStart(2, '0')}</button>`).join('') + '<output class="film-reel-status" aria-live="polite" aria-atomic="true"></output>';
  controls.hidden = false;
  const buttons = [...controls.querySelectorAll('button')];
  let index = 0, previous = 0, direction = 1, progress = 1, velocity = 0, ticking = false, disposed = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, visible: false };
  const paint = () => {
    const p = Math.max(0, Math.min(1, progress));
    frames.forEach((frame, i) => {
      frame.style.visibility = i === index || (p < 1 && i === previous) ? 'visible' : 'hidden';
      frame.inert = i !== index; frame.setAttribute('aria-hidden', String(i !== index));
      frame.style.transform = `translateX(${i === index ? direction * (1 - p) * 100 : -direction * p * 100}%)`;
    });
  };
  const tick = (_time, delta) => {
    const dt = Math.min(delta / 1000, .025);
    velocity += ((1 - progress) * 230 - velocity * 29) * dt; progress += velocity * dt;
    if (Math.abs(1 - progress) < .001 && Math.abs(velocity) < .01) { progress = 1; velocity = 0; }
    paint();
    for (const axis of ['x', 'y']) {
      const v = 'v' + axis, t = 't' + axis;
      pointer[v] += ((pointer[t] - pointer[axis]) * 260 - pointer[v] * 27) * dt;
      pointer[axis] += pointer[v] * dt;
    }
    gsap.set(cursor, { x: pointer.x, y: pointer.y, rotation: Math.max(-5, Math.min(5, pointer.vx * .008)) });
    const settled = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) + Math.abs(pointer.vx) + Math.abs(pointer.vy) < .15;
    if (progress === 1 && (settled || !pointer.visible)) { gsap.ticker.remove(tick); ticking = false; }
  };
  const wake = () => { if (motion && !ticking) { gsap.ticker.add(tick); ticking = true; } };
  const size = (animate = false) => {
    const image = images[index], ratio = image.naturalWidth / image.naturalHeight || 2.39;
    const width = Math.min(carousel.clientWidth, innerHeight * .45 * ratio), height = width / ratio;
    if (motion && animate) gsap.to(viewport, { '--viewer-width': `${width}px`, '--viewer-height': `${height}px`, duration: .65, ease: 'power3.inOut', overwrite: true });
    else { window.gsap?.killTweensOf(viewport); viewport.style.setProperty('--viewer-width', `${width}px`); viewport.style.setProperty('--viewer-height', `${height}px`); }
  };
  const update = () => {
    carousel.dataset.frame = index;
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    controls.querySelector('output').textContent = `Fotografía ${index + 1} de ${frames.length}`;
  };
  const choose = (value, step) => {
    const next = (value + frames.length) % frames.length;
    if (next === index) return;
    previous = index; index = next; direction = step || (index > previous ? 1 : -1);
    progress = motion ? 0 : 1; velocity = 0;
    update(); size(true); paint(); wake();
  };
  const click = event => {
    const button = event.target.closest('button');
    if (button?.hasAttribute('data-step')) choose(index + Number(button.dataset.step), Number(button.dataset.step));
    else if (button?.hasAttribute('data-frame')) choose(Number(button.dataset.frame));
  };
  const key = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') choose(0);
    else if (event.key === 'End') choose(frames.length - 1);
    else { const step = event.key === 'ArrowLeft' ? -1 : 1; choose(index + step, step); }
  };
  const leave = () => {
    pointer.visible = false; cursor.classList.remove('is-visible');
    document.body.classList.remove('film-carousel-pointer');
  };
  const move = event => {
    if (event.pointerType === 'touch' || !matchMedia('(any-hover: hover)').matches) return;
    const rect = carousel.getBoundingClientRect(), windowRect = viewport.getBoundingClientRect();
    pointer.tx = event.clientX - rect.left; pointer.ty = event.clientY - rect.top;
    if (!pointer.visible) { pointer.x = pointer.tx; pointer.y = pointer.ty; pointer.vx = pointer.vy = 0; }
    pointer.visible = true;
    cursor.dataset.direction = event.clientX < windowRect.left + windowRect.width / 2 ? 'previous' : 'next';
    cursor.classList.add('is-visible'); document.body.classList.add('film-carousel-pointer');
    if (motion) wake(); else cursor.style.transform = `translate(${pointer.x}px, ${pointer.y}px)`;
  };
  const refresh = () => { if (!disposed) size(); };
  carousel.addEventListener('click', click); carousel.addEventListener('keydown', key);
  viewport.addEventListener('pointermove', move); viewport.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', leave, { passive: true });
  let measuredWidth = carousel.clientWidth;
  const observer = new ResizeObserver(() => {
    if (carousel.clientWidth !== measuredWidth) { measuredWidth = carousel.clientWidth; refresh(); }
  });
  observer.observe(carousel);
  images.forEach(image => { image.loading = 'eager'; image.addEventListener('load', refresh); });
  update(); refresh(); paint();
  return { refresh, destroy() {
    disposed = true; leave(); observer.disconnect(); window.gsap?.ticker.remove(tick);
    window.gsap?.killTweensOf([viewport, cursor]);
    carousel.removeEventListener('click', click); carousel.removeEventListener('keydown', key);
    viewport.removeEventListener('pointermove', move); viewport.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', leave);
    images.forEach(image => image.removeEventListener('load', refresh));
    frames.forEach(frame => { frame.inert = false; frame.removeAttribute('aria-hidden'); frame.style.removeProperty('transform'); frame.style.removeProperty('visibility'); });
    viewport.style.removeProperty('--viewer-width'); viewport.style.removeProperty('--viewer-height');
    controls.replaceChildren(); zones.remove(); cursor.remove();
    root.classList.remove('has-manual-carousel'); delete carousel.dataset.frame;
  } };
}
