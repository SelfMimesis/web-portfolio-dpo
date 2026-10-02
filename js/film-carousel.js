// One masked viewer: explicit navigation never captures or advances page scroll.
export function createFilmCarousel(root, { reducedMotion = false } = {}) {
  const carousel = root.querySelector('.film-carousel');
  const viewport = carousel.querySelector('.film-carousel-window');
  const frames = [...carousel.querySelector('.film-contact-sheet').children];
  const controls = carousel.querySelector('.film-carousel-controls');
  const images = frames.map(frame => frame.querySelector('img'));
  const gsap = window.gsap, motion = !!gsap && !reducedMotion;
  const wrap = value => ((value % frames.length) + frames.length) % frames.length;
  const ratio = image => Number(image.getAttribute('width')) / Number(image.getAttribute('height')) || image.naturalWidth / image.naturalHeight || 2.39;
  const minRatio = Math.min(...images.map(ratio));
  root.classList.add('has-manual-carousel');
  const zones = document.createElement('div');
  zones.className = 'film-reel-zones';
  zones.innerHTML = '<button type="button" data-step="1" aria-label="View the next film still"><span>NEXT →</span></button>';
  viewport.append(zones);
  const cursor = document.createElement('div');
  cursor.className = 'film-reel-cursor'; cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="film-reel-cursor-face"><span>NEXT</span><svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 12h34M25 2l11 10-11 10"/></svg></div>';
  // Fixed to the window, outside transformed/pinned film ancestors.
  document.body.append(cursor);
  const face = cursor.firstElementChild, arrow = cursor.querySelector('svg');
  controls.replaceChildren();
  const buttons = frames.map((_, i) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.frame = i;
    button.setAttribute('aria-label', `View still ${i + 1}: ${images[i].alt}`);
    button.textContent = String(i + 1).padStart(2, '0'); controls.append(button);
    return button;
  });
  const status = document.createElement('output');
  status.className = 'film-reel-status'; status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true'); controls.append(status);
  controls.hidden = false;
  controls.style.setProperty('--frame-count', frames.length);
  let index = 0, requested = 0, requestedDirection = 1, transition, disposed = false, ticking = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, visible: false, clientX: 0, clientY: 0 };
  const update = () => {
    carousel.dataset.frame = index;
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    status.textContent = `Still ${index + 1} of ${frames.length}`;
  };
  const rest = () => frames.forEach((frame, i) => {
    frame.style.visibility = i === index ? 'visible' : 'hidden';
    frame.style.transform = 'translateX(0)';
    frame.style.opacity = '1';
    frame.style.removeProperty('z-index');
    frame.inert = i !== index; frame.setAttribute('aria-hidden', String(i !== index));
  });
  const size = () => {
    const page = carousel.closest('.film-page'), layout = carousel.parentElement;
    const heading = page.querySelector('.film-frames-heading');
    const headingSpace = heading.offsetHeight + parseFloat(getComputedStyle(heading).marginBottom);
    const controlSpace = controls.offsetHeight + 14;
    const available = root.classList.contains('has-film-stage')
      ? Math.max(180, layout.clientHeight - headingSpace - controlSpace)
      : innerHeight * .65;
    // The collection shares its original panoramic format and the editorial rails.
    // The outer space stays reserved, so selecting a frame cannot shift page scroll.
    const width = Math.min(carousel.clientWidth, available * minRatio);
    const tallest = width / minRatio, height = width / ratio(images[index]);
    carousel.style.minHeight = `${tallest + controlSpace}px`;
    carousel.style.setProperty('--viewer-width', `${width}px`);
    viewport.style.setProperty('--viewer-width', `${width}px`);
    return { '--viewer-height': `${height}px`, '--viewer-top': `${(tallest - height) / 2}px` };
  };
  const finish = () => {
    transition = null; carousel.removeAttribute('aria-busy'); rest(); update();
    if (!disposed && requested !== index) navigate();
  };
  const navigate = () => {
    if (disposed || transition || requested === index) return;
    const previous = index, direction = requestedDirection;
    index = requested;
    const geometry = size(); update();
    if (!motion) {
      Object.entries(geometry).forEach(([key, value]) => viewport.style.setProperty(key, value));
      rest(); return;
    }
    const outgoing = frames[previous], incoming = frames[index];
    frames.forEach((frame, i) => {
      frame.style.visibility = i === previous || i === index ? 'visible' : 'hidden';
      frame.inert = i !== index; frame.setAttribute('aria-hidden', String(i !== index));
    });
    // Keep the current still steady beneath a short, slow drift and dissolve.
    // The overlap covers the frame edges throughout; no full-width sweep or zoom.
    gsap.set(outgoing, { xPercent: 0, opacity: 1, zIndex: 1 });
    gsap.set(incoming, { xPercent: direction * 2, opacity: 0, zIndex: 2 });
    carousel.setAttribute('aria-busy', 'true');
    transition = gsap.timeline({ onComplete: finish })
      .to(viewport, { ...geometry, duration: 1.1, ease: 'sine.inOut' }, 0)
      .to(incoming, { xPercent: 0, duration: 1.1, ease: 'sine.out' }, 0)
      .to(incoming, { opacity: 1, duration: 1.05, ease: 'sine.inOut' }, .05)
      .to(outgoing, { opacity: 0, duration: .22, ease: 'sine.inOut' }, .88);
  };
  const choose = (value, direction = 1) => {
    requested = wrap(value); requestedDirection = direction;
    // Finish the current movement, then go to the latest requested destination.
    navigate();
  };
  const click = event => {
    const button = event.target.closest('button');
    if (button?.hasAttribute('data-step')) {
      choose(requested + 1);
      if (motion && pointer.visible) {
        gsap.fromTo(arrow, { x: -6 }, { x: 0, duration: .65, ease: 'elastic.out(1, .4)', overwrite: true });
        gsap.fromTo(face, { scale: .92 }, { scale: 1, duration: .65, ease: 'elastic.out(1, .5)', overwrite: true });
      }
    } else if (button?.hasAttribute('data-frame')) {
      const next = Number(button.dataset.frame); choose(next, next >= index ? 1 : -1);
    }
  };
  const key = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') choose(0, -1);
    else if (event.key === 'End') choose(frames.length - 1);
    else { const step = event.key === 'ArrowLeft' ? -1 : 1; choose(requested + step, step); }
  };
  const leave = () => {
    pointer.visible = false; pointer.vx = pointer.vy = 0;
    cursor.classList.remove('is-visible');
    gsap?.killTweensOf([face, arrow]);
    if (ticking) { gsap.ticker.remove(tick); ticking = false; }
  };
  const hit = () => {
    if (disposed || document.hidden || viewport.closest('[inert]')) return false;
    const element = document.elementFromPoint(pointer.clientX, pointer.clientY);
    return !!element && zones.contains(element);
  };
  const tick = (_time, delta) => {
    // Re-test while hovering: pinned ancestors can move without a pointerleave.
    if (!pointer.visible || !hit()) { leave(); return; }
    let remaining = Math.min(delta / 1000, .05);
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 120); remaining -= dt;
      for (const axis of ['x', 'y']) {
        const v = 'v' + axis;
        pointer[v] += ((pointer['t' + axis] - pointer[axis]) * 360 - pointer[v] * 30) * dt;
        pointer[axis] += pointer[v] * dt;
      }
    }
    const speed = Math.min(1, Math.hypot(pointer.vx, pointer.vy) / 1800);
    gsap.set(cursor, { x: pointer.x, y: pointer.y, rotation: Math.max(-9, Math.min(9, pointer.vx * .009)), scaleX: 1 + speed * .09, scaleY: 1 - speed * .05 });
  };
  const move = event => {
    if (event.pointerType !== 'mouse' || !matchMedia('(any-hover: hover) and (any-pointer: fine)').matches) { leave(); return; }
    pointer.clientX = event.clientX; pointer.clientY = event.clientY;
    if (!hit()) { leave(); return; }
    // Follow beside the native pointer; flip the offset near the viewport edges.
    pointer.tx = event.clientX + (event.clientX + 132 > innerWidth ? -76 : 76);
    pointer.ty = event.clientY + (event.clientY + 66 > innerHeight ? -36 : 36);
    if (!pointer.visible) {
      pointer.x = pointer.tx; pointer.y = pointer.ty; pointer.vx = pointer.vy = 0;
      if (motion) gsap.fromTo(face, { scale: .84 }, { scale: 1, duration: .5, ease: 'back.out(1.7)', overwrite: true });
    }
    pointer.visible = true; cursor.classList.add('is-visible');
    if (motion) { if (!ticking) { gsap.ticker.add(tick); ticking = true; } }
    else { pointer.x = pointer.tx; pointer.y = pointer.ty; cursor.style.transform = `translate(${pointer.x}px, ${pointer.y}px)`; }
  };
  const refresh = () => {
    if (disposed) return;
    leave();
    // Complete an in-flight transition before remeasuring at a breakpoint.
    transition?.kill(); transition = null; index = requested;
    gsap?.killTweensOf(frames); gsap?.set(frames, { xPercent: 0 });
    Object.entries(size()).forEach(([key, value]) => viewport.style.setProperty(key, value));
    carousel.removeAttribute('aria-busy'); update(); rest();
  };
  const bindings = [[carousel, 'click', click], [carousel, 'keydown', key],
    [document, 'pointermove', move], [viewport, 'pointerleave', leave],
    [document.documentElement, 'pointerleave', leave], [document, 'pointercancel', leave],
    [window, 'blur', leave], [window, 'pagehide', leave], [document, 'visibilitychange', leave],
    [document, 'scroll', leave], [window, 'wheel', leave], [window, 'resize', refresh]];
  bindings.forEach(([target, event, handler]) => target.addEventListener(event, handler, { passive: event !== 'keydown', capture: event === 'scroll' }));
  let measuredWidth = carousel.clientWidth;
  const observer = new ResizeObserver(() => {
    if (carousel.clientWidth !== measuredWidth) { measuredWidth = carousel.clientWidth; refresh(); }
  });
  observer.observe(carousel);
  // Intrinsic dimensions are declared in the markup; late loads must not reset motion.
  images.forEach(image => { image.loading = 'eager'; });
  refresh();
  return { refresh, reveal(progress) {
    if (!motion || disposed) return;
    const eased = gsap.parseEase('power2.inOut')(Math.max(0, Math.min(1, progress)));
    gsap.set(carousel, { scale: .84 + eased * .16, transformOrigin: 'center top' });
  }, destroy() {
    disposed = true; leave(); transition?.kill(); observer.disconnect();
    gsap?.killTweensOf([viewport, cursor, face, arrow, ...frames]);
    bindings.forEach(([target, event, handler]) => target.removeEventListener(event, handler, event === 'scroll'));
    frames.forEach(frame => { frame.inert = false; frame.removeAttribute('aria-hidden'); ['transform', 'visibility', 'opacity', 'z-index'].forEach(property => frame.style.removeProperty(property)); });
    for (const name of ['--viewer-width', '--viewer-height', '--viewer-top']) viewport.style.removeProperty(name);
    carousel.style.removeProperty('min-height'); carousel.style.removeProperty('--viewer-width'); carousel.removeAttribute('aria-busy');
    controls.replaceChildren(); controls.style.removeProperty('--frame-count'); zones.remove(); cursor.remove();
    gsap?.set(carousel, { clearProps: 'transform,transformOrigin' });
    root.classList.remove('has-manual-carousel'); delete carousel.dataset.frame;
  } };
}
