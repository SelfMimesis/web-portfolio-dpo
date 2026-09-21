import { state } from './state.js';
let cueActive = false;
let cueArmed = false;
let cueStart = 0;
let cueTimeline;
let cuePulse;
let suspendCursor = () => {};

export function clearScrollCue() {
  cueTimeline?.kill(); cuePulse?.kill();
  window.removeEventListener('scroll', handleCueScroll);
  cueActive = cueArmed = false;
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;
  if (!window.gsap) { cursor.classList.remove('is-scroll-cue'); return; }
  gsap.killTweensOf(cursor);
  cursor.classList.remove('is-scroll-cue');
  gsap.set(cursor, { opacity: 0, scale: .75, clearProps: 'width,height' });
  gsap.set(cursor.querySelector('.cursor-label'), { y: 0, opacity: 1 });
  gsap.set(cursor.querySelector('.cursor-scroll-icon'), { y: 0, opacity: 0 });
}

function handleCueScroll() {
  if (!cueArmed || Math.abs(scrollY - cueStart) < 8) return;
  cueArmed = false;
  cueTimeline?.kill(); cuePulse?.kill();
  gsap.to('.custom-cursor', { opacity: 0, scale: .85, y: '-=12', duration: state.reducedMotion ? 0 : .5, ease: 'power2.out', onComplete: clearScrollCue });
}

export function startScrollCue(world) {
  if (!window.gsap) return;
  const wasVisible = Number(gsap.getProperty('.custom-cursor', 'opacity')) > .1;
  clearScrollCue();
  suspendCursor();
  const cursor = document.querySelector('.custom-cursor');
  const shape = cursor.querySelector('.cursor-shape');
  const label = cursor.querySelector('.cursor-label');
  const icon = cursor.querySelector('.cursor-scroll-icon');
  cueActive = true;
  cursor.classList.add('is-scroll-cue');
  cursor.dataset.theme = world;
  label.textContent = 'SCROLL';
  const styles = getComputedStyle(document.documentElement);
  const ink = styles.getPropertyValue(world === 'dev' ? '--dark' : '--light').trim();
  const paper = styles.getPropertyValue(world === 'dev' ? '--green' : '--accent').trim();
  const duration = state.reducedMotion ? 0 : .9;
  gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 1, scale: 1 });
  if (!wasVisible) gsap.set(cursor, { x: document.documentElement.clientWidth / 2, y: innerHeight - 138 });
  gsap.set(icon, { color: ink });
  cueTimeline = gsap.timeline();
  cueTimeline.to(cursor, { x: document.documentElement.clientWidth / 2, y: innerHeight - 138, width: 94, height: 76, duration, ease: 'power3.inOut' }, 0)
    .to(shape, { scaleX: 1, scaleY: 1, rotation: 0, clipPath: 'none', borderRadius: world === 'dev' ? '18px' : '38px', backgroundColor: paper, color: ink, duration, ease: 'elastic.out(1, .65)' }, 0)
    .to(label, { color: ink, y: -11, opacity: 1, duration: duration * .6 }, 0)
    .to(cursor.querySelector('.cursor-detail'), { opacity: 0, duration: duration * .3 }, 0)
    .to(icon, { opacity: 1, duration: duration * .4 }, duration * .4);
  if (!state.reducedMotion) cuePulse = gsap.to(icon, { y: 7, duration: .7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: duration });
}

export function armScrollCue() {
  if (!cueActive) return;
  cueStart = scrollY; cueArmed = true;
  window.addEventListener('scroll', handleCueScroll, { passive: true });
}

export function initCursor() {
  if (!window.gsap) return;
  const gsap = window.gsap;
  const cursor = document.querySelector('.custom-cursor');
  const shape = cursor.querySelector('.cursor-shape');
  const label = cursor.querySelector('.cursor-label');
  const detail = cursor.querySelector('.cursor-detail');
  const media = gsap.matchMedia();

  media.add('(min-width: 701px) and (any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const styles = getComputedStyle(document.documentElement);
    const color = name => styles.getPropertyValue(name).trim();
    const fullShape = 'polygon(50% 0%,100% 0%,100% 42%,100% 100%,61% 100%,61% 100%,39% 100%,39% 100%,0% 100%,0% 42%,0% 0%)';
    const palettes = {
      art: { backgroundColor: color('--accent'), color: '#fff', borderRadius: '50%', borderColor: 'transparent', boxShadow: '0 4px 14px #24251f18' },
      dev: { backgroundColor: color('--green'), color: color('--dark'), borderRadius: '22%', borderColor: color('--green'), boxShadow: 'none' },
      lcd: { backgroundColor: '#d0d5b8', color: '#30392d', borderRadius: '2px', borderColor: '#30392d', boxShadow: '2px 2px 0 #30392d40' }
    };
    const position = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    const setX = gsap.quickSetter(cursor, 'x', 'px');
    const setY = gsap.quickSetter(cursor, 'y', 'px');
    const rotate = gsap.quickSetter(shape, 'rotation', 'deg');
    const scaleX = gsap.quickSetter(shape, 'scaleX');
    const scaleY = gsap.quickSetter(shape, 'scaleY');
    let visible = false;
    let running = false;
    let seeded = false;
    let theme;
    let angle = 0;
    let stretch = 0;
    let lcdTime = 0;
    let radius = cursor.offsetWidth / 2;
    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0, scale: .75 });
    gsap.set(shape, { clipPath: fullShape });

    const stop = () => { gsap.ticker.remove(tick); running = false; };
    suspendCursor = () => {
      stop(); visible = seeded = false; theme = null;
      gsap.killTweensOf([cursor, shape, label, detail]);
    };
    const hide = () => {
      if (cueActive) return;
      if (!visible && !running) return;
      visible = false;
      seeded = false;
      stop();
      gsap.to(cursor, { opacity: 0, scale: .75, duration: .18, overwrite: true });
    };
    function tick(_, deltaMs) {
      if (state.transitionInProgress) { hide(); return; }
      if (theme === 'lcd') {
        lcdTime += deltaMs;
        if (lcdTime < 100) return;
        lcdTime = 0;
        position.x = Math.round(target.x / 8) * 8;
        position.y = Math.round(target.y / 8) * 8;
        position.vx = position.vy = angle = stretch = 0;
        setX(position.x); setY(position.y);
        rotate(0); scaleX(1); scaleY(1);
        stop();
        return;
      }
      // Small integration steps keep the spring stable at different frame rates.
      const elapsed = Math.min(deltaMs / 1000, .064);
      let remaining = elapsed;
      while (remaining > 0) {
        const dt = Math.min(remaining, 1 / 120);
        position.vx += ((target.x - position.x) * 240 - position.vx * 24) * dt;
        position.vy += ((target.y - position.y) * 240 - position.vy * 24) * dt;
        position.x += position.vx * dt;
        position.y += position.vy * dt;
        remaining -= dt;
      }
      const speed = Math.hypot(position.vx, position.vy);
      const desiredAngle = speed > 25 ? Math.atan2(position.vy, position.vx) * 180 / Math.PI : 0;
      const blend = 1 - Math.exp(-16 * elapsed);
      angle += (((desiredAngle - angle + 90) % 180 + 180) % 180 - 90) * blend;
      angle = ((angle + 90) % 180 + 180) % 180 - 90;
      stretch += (Math.min(speed / 3500, .24) - stretch) * blend;
      setX(position.x); setY(position.y);
      rotate(angle); scaleX(1 + stretch); scaleY(1 / (1 + stretch));
      if (speed < .1 && Math.hypot(target.x - position.x, target.y - position.y) < .1 && stretch < .001 && Math.abs(angle % 180) < .1) {
        setX(target.x); setY(target.y);
        rotate(0); scaleX(1); scaleY(1);
        stop();
      }
    }
    const start = () => { if (!running) { gsap.ticker.add(tick); running = true; } };
    const update = element => {
      if (cueActive) return;
      if (state.activeWorld) { hide(); return; }
      if (element?.closest('.wordmark')) {
        stop(); visible = seeded = false;
        gsap.killTweensOf(cursor); gsap.set(cursor, { opacity: 0 });
        return;
      }
      const interactive = element?.closest('a,button,summary,.world');
      if (!interactive || state.transitionInProgress) { hide(); return; }
      // Destination links take precedence over their surrounding section.
      const destination = element.closest('[data-world]')?.dataset.world;
      const nextTheme = element.closest('.world-link--dev') ? 'lcd' : destination || (element.closest('.world--dev,.scrolly--dev') ? 'dev' : 'art');
      if (nextTheme !== theme) {
        theme = nextTheme;
        cursor.dataset.theme = theme;
        const timing = theme === 'lcd' ? { duration: .12, ease: 'steps(1)' } : { duration: .4, ease: 'power3.inOut' };
        gsap.to(shape, { ...palettes[theme], clipPath: fullShape, ...timing, overwrite: 'auto' });
        gsap.to(label, { color: palettes[theme].color, ...timing, overwrite: true });
        gsap.to(detail, { opacity: ['dev', 'lcd'].includes(theme) ? .45 : 0, ...timing, overwrite: true });
      }
      const text = element.closest('nav') ? 'SELECT' : element.closest('.archive-entry,summary') ? 'OPEN' : 'VIEW →';
      if (label.textContent !== text) label.textContent = text;
      const offset = radius + 14;
      const margin = radius * 1.3 + 6;
      target.x = Math.max(margin, Math.min(innerWidth - margin, pointer.x + (pointer.x + offset + margin > innerWidth ? -offset : offset)));
      target.y = Math.max(margin, Math.min(innerHeight - margin, pointer.y + (pointer.y + offset + margin > innerHeight ? -offset : offset)));
      if (!seeded) {
        Object.assign(position, { x: target.x, y: target.y, vx: 0, vy: 0 });
        setX(target.x); setY(target.y);
        angle = stretch = 0;
        rotate(0); scaleX(1); scaleY(1);
        seeded = true;
      }
      if (!visible) {
        visible = true;
        gsap.to(cursor, { opacity: 1, scale: 1, duration: theme === 'art' ? .35 : .1, ease: theme === 'art' ? 'back.out(1.5)' : 'steps(1)', overwrite: true });
      }
      start();
    };
    const move = event => {
      if (event.pointerType !== 'mouse') { hide(); return; }
      pointer.x = event.clientX; pointer.y = event.clientY;
      update(event.target);
    };
    const press = event => {
      if (event.pointerType === 'mouse' && visible) gsap.to(cursor, { scale: theme === 'art' ? .84 : 1, opacity: theme === 'art' ? 1 : .5, duration: .12, ease: theme === 'art' ? 'power2.out' : 'steps(1)', overwrite: 'auto' });
    };
    const release = () => {
      if (visible) gsap.to(cursor, { scale: 1, opacity: 1, duration: theme === 'art' ? .45 : .1, ease: theme === 'art' ? 'elastic.out(1, .45)' : 'steps(1)', overwrite: 'auto' });
    };
    const scroll = () => { if (visible) hide(); };
    const resize = () => { clearScrollCue(); radius = cursor.offsetWidth / 2; hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    const navigation = () => { if (state.transitionInProgress) hide(); };
    const events = [
      [document, 'pointermove', move], [document, 'pointerover', move],
      [document, 'pointerdown', press], [document, 'pointerup', release],
      [document, 'click', navigation],
      [document, 'pointercancel', hide], [document.documentElement, 'pointerleave', hide],
      [window, 'blur', hide], [window, 'scroll', scroll], [window, 'resize', resize],
      [document, 'visibilitychange', visibility]
    ];
    events.forEach(([element, name, handler]) => element.addEventListener(name, handler, { passive: true }));
    return () => {
      clearScrollCue();
      suspendCursor = () => {};
      stop();
      events.forEach(([element, name, handler]) => element.removeEventListener(name, handler));
      gsap.killTweensOf([cursor, shape, label, detail]);
      gsap.set(cursor, { opacity: 0 });
      delete cursor.dataset.theme;
    };
  });
}
