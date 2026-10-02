import { createDetectionDisplay } from './detection-display.js';
import { initDetectorTerminal } from './detector-terminal.js';

export function initScreenInteraction(section) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  const chapter = section.querySelector('#about-digital');
  const session = { paused: false, closed: false, view: 'tracking', clicks: 0, marks: [], events: [], x: .69, y: .39, time: 0 };
  section.querySelectorAll('.interaction-window').forEach((win, index) => {
    const panel = win.querySelector('.detector-workspace');
    panel.id = 'vision-panel-' + index;
    win.querySelectorAll('[role="tab"]').forEach(tab => {
      tab.id = 'vision-' + index + '-' + tab.dataset.view;
      tab.setAttribute('aria-controls', panel.id);
    });
    win.inert = true;
    win.parentElement.querySelector('.detector-reopen').tabIndex = -1;
  });
  gsap.matchMedia().add({
    desktop: '(min-width:901px) and (min-height:651px) and (pointer:fine),(min-width:1025px) and (min-height:651px)',
    compact: '(max-width:900px),(pointer:coarse) and (max-width:1024px), (max-height:650px)',
    reduced: '(prefers-reduced-motion:reduce)'
  }, context => {
    const reduced = context.conditions.reduced;
    const desktop = context.conditions.desktop && !reduced;
    const win = section.querySelector(desktop ? '.about-stage .interaction-window' : '#about-digital .interaction-window');
    const field = win.querySelector('.detector-field');
    const display = createDetectionDisplay(win.querySelector('canvas'));
    if (!display) return;
    const panel = win.querySelector('.detector-workspace'), archive = win.querySelector('.detector-event-view');
    const tabs = [...win.querySelectorAll('[role="tab"]')], tablist = win.querySelector('.detector-tabs');
    const pauseButton = win.querySelector('.detector-pause'), closeButton = win.querySelector('.detector-close');
    const reopen = win.parentElement.querySelector('.detector-reopen');
    const readout = Object.fromEntries([...win.querySelectorAll('[data-readout]')].map(el => [el.dataset.readout, el]));
    const status = win.querySelector('.detector-state'), cue = win.querySelector('.detector-instruction');
    const announcement = win.querySelector('.detector-announcement');
    const state = { x: session.x, y: session.y, hover: false, marks: session.marks, pulse: 0, scanning: false, scanProgress: 0, view: session.view, time: session.time,
      cursor: { x: session.x, y: session.y, visible: false, pressed: false, input: 'mouse' } };
    const clearCursor = () => {
      state.cursor.visible = state.cursor.pressed = state.hover = false;
      field.classList.remove('has-technical-cursor');
    };
    const target = { x: state.x, y: state.y }, velocity = { x: 0, y: 0 };
    const pose = { x: 0, y: 0, rotationX: 0, rotationY: 0, rotation: 0 };
    const poseTarget = { ...pose }, poseVelocity = { ...pose };
    const poseSetters = Object.fromEntries(Object.keys(pose).map(key => [key, gsap.quickSetter(win, key, key.startsWith('rotation') ? 'deg' : 'px')]));
    let active = false, running = false, width = 0, height = 0, lastHUD = 0, renderElapsed = 0, disposed = false;
    let pulseTween, windowTween, terminal;
    const format = value => (value >= 0 ? '+' : '') + value.toFixed(2);
    const pixel = value => String(Math.round(value)).padStart(3, '0');
    const canRun = () => active && !session.paused && !session.closed && !document.hidden;
    const backdrop = win.parentElement.querySelector('.detector-backdrop');
    const backdropImage = backdrop.querySelector('img'), backdropStill = backdrop.querySelector('canvas');
    const syncBackdrop = () => {
      terminal?.setActive(canRun());
      const frozen = reduced || !canRun();
      if (frozen && backdropImage.complete && backdropImage.naturalWidth && (!backdropImage.hidden || !backdropStill.dataset.captured)) {
        backdropStill.width = 600;
        backdropStill.height = Math.round(600 * backdropImage.naturalHeight / backdropImage.naturalWidth);
        backdropStill.getContext('2d')?.drawImage(backdropImage, 0, 0, backdropStill.width, backdropStill.height);
        backdropStill.dataset.captured = 'true';
      }
      backdropImage.hidden = frozen; backdropStill.hidden = !frozen;
    };
    backdropImage.addEventListener('load', syncBackdrop);
    const hud = () => {
      readout.position.textContent = pixel(state.x * width) + ' : ' + pixel(state.y * height);
      readout.vector.textContent = format(state.x * 2 - 1) + ' / ' + format(state.y * 2 - 1);
      readout.clicks.textContent = String(session.clicks).padStart(3, '0');
      win.dataset.pointerX = state.x.toFixed(3); win.dataset.pointerY = state.y.toFixed(3);
      win.dataset.clicks = session.clicks;
      session.x = state.x; session.y = state.y;
    };
    const draw = () => { if (session.view !== 'events') display.draw(state); win.style.setProperty('--capture', state.pulse); hud(); };
    const stop = () => { gsap.ticker.remove(tick); running = false; win.dataset.tracking = 'false'; };
    const tick = (_time, delta) => {
      if (!canRun()) { stop(); return; }
      state.time += Math.min(delta / 1000, .05);
      session.time = state.time;
      const dt = Math.min(delta / 1000, .034) / 2;
      for (let step = 0; step < 2; step++) {
        for (const key of ['x', 'y']) {
          velocity[key] += ((target[key] - state[key]) * 190 - velocity[key] * 23) * dt;
          state[key] += velocity[key] * dt;
        }
        for (const key of Object.keys(pose)) {
          poseVelocity[key] += ((poseTarget[key] - pose[key]) * 135 - poseVelocity[key] * 18) * dt;
          pose[key] += poseVelocity[key] * dt;
        }
      }
      Object.keys(pose).forEach(key => poseSetters[key](pose[key]));
      win.style.setProperty('--glass-x', (50 + pose.rotationY * 5) + '%');
      win.style.setProperty('--capture', state.pulse);
      renderElapsed += delta;
      if (session.view !== 'events' && renderElapsed >= 32) { display.draw(state); renderElapsed = 0; }
      if (performance.now() - lastHUD > 90) { hud(); lastHUD = performance.now(); }
      const pointerSettled = Math.abs(target.x - state.x) + Math.abs(target.y - state.y) + Math.abs(velocity.x) + Math.abs(velocity.y) < .0005;
      const frameSettled = Object.keys(pose).every(key => Math.abs(poseTarget[key] - pose[key]) + Math.abs(poseVelocity[key]) < .025);
      if (pointerSettled && frameSettled && state.pulse < .001 && session.view === 'events') { Object.assign(state, target); draw(); stop(); }
    };
    const wake = () => {
      if (!canRun()) return;
      if (reduced) { Object.assign(state, target); draw(); return; }
      if (!running) { running = true; win.dataset.tracking = 'true'; gsap.ticker.add(tick); }
    };
    const measure = () => {
      if (disposed || !field.clientWidth || !field.clientHeight) return;
      width = field.clientWidth; height = field.clientHeight;
      display.resize(width, height); draw();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(field);
    const access = () => {
      win.inert = !active || session.closed;
      reopen.tabIndex = active && session.closed ? 0 : -1;
      syncBackdrop();
    };
    const baseCue = () => {
      cue.textContent = session.paused ? 'PAUSED / RESUME FROM THE TITLE BAR' : matchMedia('(hover:none)').matches ? 'TAP TO POSITION / MARK' : '↗ MOVE TO TRACK · CLICK TO MARK';
    };
    const updatePause = () => {
      win.classList.toggle('is-paused', session.paused); win.dataset.paused = String(session.paused);
      pauseButton.setAttribute('aria-pressed', String(session.paused));
      pauseButton.setAttribute('aria-label', session.paused ? 'Resume simulation' : 'Pause simulation');
      pauseButton.title = session.paused ? 'Resume simulation' : 'Pause simulation';
      pauseButton.textContent = session.paused ? '▷' : 'Ⅱ';
      status.textContent = session.paused ? 'PAUSED' : state.scanning ? 'SCANNING' : 'STANDBY';
      baseCue();
    };
    const updateLogs = () => {
      const list = records => records.map(text => { const li = document.createElement('li'); li.textContent = text; return li; });
      win.querySelector('.detector-log ol').replaceChildren(...list(session.events.length ? session.events.slice(0, 2) : ['AWAITING INPUT_', '—']));
      archive.querySelector('ol').replaceChildren(...list(session.events.length ? session.events : ['No detections yet. Click in Tracking or Mesh to record a point.']));
      win.querySelector('.detector-tab-count').textContent = String(session.clicks).padStart(2, '0');
    };
    const selectView = (view, focus = false) => {
      if (view === 'events') clearCursor();
      session.view = state.view = view; win.dataset.view = view;
      tabs.forEach(tab => {
        const selected = tab.dataset.view === view;
        tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
        if (selected) { panel.setAttribute('aria-labelledby', tab.id); if (focus) tab.focus({ preventScroll: true }); }
      });
      field.hidden = view === 'events'; archive.hidden = view !== 'events';
      archive.tabIndex = view === 'events' ? 0 : -1;
      measure(); draw(); wake();
    };
    const togglePause = () => {
      session.paused = !session.paused;
      if (session.paused) { clearCursor(); draw(); }
      if (session.paused) { stop(); pulseTween?.pause(); } else { pulseTween?.resume(); wake(); }
      updatePause();
      syncBackdrop();
      announcement.textContent = session.paused ? 'Simulation paused.' : 'Simulation resumed.';
    };
    const close = () => {
      if (session.closed) return;
      clearCursor();
      session.closed = true; stop(); pulseTween?.pause(); windowTween?.kill(); win.inert = true; syncBackdrop();
      const complete = () => {
        win.hidden = true; reopen.hidden = false; access();
        if (active) reopen.focus({ preventScroll: true });
      };
      if (reduced) complete();
      else windowTween = gsap.to(win, { opacity: 0, scale: .94, duration: .23, ease: 'power2.in', onComplete: complete });
    };
    const open = () => {
      session.closed = false; windowTween?.kill(); win.hidden = false; reopen.hidden = true; access(); measure();
      gsap.set(win, { opacity: 1, scale: 1 });
      if (!reduced) windowTween = gsap.fromTo(win, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .35, ease: 'power3.out' });
      if (!session.paused) { pulseTween?.resume(); wake(); }
      if (active) pauseButton.focus({ preventScroll: true });
    };
    const point = event => {
      if (event.isTrusted && event.target === field) return { x: event.offsetX / field.clientWidth, y: event.offsetY / field.clientHeight };
      const bounds = field.getBoundingClientRect();
      return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    };
    const moveTo = (x, y) => {
      if (!canRun()) return;
      target.x = gsap.utils.clamp(.045, .955, x); target.y = gsap.utils.clamp(.065, .86, y);
      state.hover = true; status.textContent = state.scanning ? 'SCANNING' : 'TRACKING'; wake();
    };
    const move = event => {
      if (!canRun()) return;
      const p = point(event);
      state.cursor.x = gsap.utils.clamp(0, 1, p.x);
      state.cursor.y = gsap.utils.clamp(0, 1, p.y);
      state.cursor.input = event.pointerType === 'touch' ? 'touch' : 'mouse';
      state.cursor.visible = state.cursor.input === 'mouse';
      field.classList.toggle('has-technical-cursor', state.cursor.visible);
      moveTo(p.x, p.y);
    };
    const shellMove = event => {
      if (!canRun() || reduced || event.pointerType === 'touch') return;
      const bounds = win.parentElement.getBoundingClientRect();
      const x = gsap.utils.clamp(-.5, .5, (event.clientX - bounds.left) / bounds.width - .5);
      const y = gsap.utils.clamp(-.5, .5, (event.clientY - bounds.top) / bounds.height - .5);
      Object.assign(poseTarget, { x: x * 20, y: y * 14, rotationX: -y * 10, rotationY: x * 12, rotation: x * .9 });
      wake();
    };
    const shellLeave = () => {
      if (!canRun()) return;
      Object.keys(poseTarget).forEach(key => { poseTarget[key] = 0; });
      wake();
    };
    const leave = () => { clearCursor(); if (!canRun()) return; status.textContent = state.scanning ? 'SCANNING' : 'STANDBY'; draw(); wake(); };
    const click = event => {
      if (!canRun()) return;
      if (event.detail) { const p = point(event); moveTo(p.x, p.y); }
      session.clicks++; state.marks.push({ x: target.x, y: target.y, id: session.clicks });
      if (reduced) { state.time += .7; session.time = state.time; }
      if (state.marks.length > 4) state.marks.shift();
      const position = pixel(target.x * width) + ',' + pixel(target.y * height);
      session.events.unshift('#' + String(session.clicks).padStart(3, '0') + ' LOCK [' + position + ']');
      session.events.length = Math.min(session.events.length, 16);
      updateLogs(); hud();
      announcement.textContent = 'Detection ' + session.clicks + ' marked at ' + position + '.';
      status.textContent = 'CAPTURED'; pulseTween?.kill();
      if (!reduced) {
        state.pulse = 1;
        pulseTween = gsap.to(state, { pulse: 0, duration: .52, ease: 'power2.out' });
      }
      terminal.scan();
      wake();
    };
    const keydown = event => {
      const directions = { ArrowLeft: [-.045, 0], ArrowRight: [.045, 0], ArrowUp: [0, -.045], ArrowDown: [0, .045] };
      if (!directions[event.key]) return;
      event.preventDefault(); if (!canRun()) return;
      cue.textContent = 'ARROWS TO TRACK · ENTER TO MARK';
      const [x, y] = directions[event.key]; moveTo(target.x + x, target.y + y);
      Object.assign(state.cursor, { x: target.x, y: target.y, visible: true, input: 'keyboard' });
      field.classList.remove('has-technical-cursor');
      if (reduced) draw();
    };
    const focus = () => {
      if (field.matches(':focus-visible') && canRun()) {
        cue.textContent = 'ARROWS TO TRACK · ENTER TO MARK';
        Object.assign(state.cursor, { x: target.x, y: target.y, visible: true, input: 'keyboard' });
        field.classList.remove('has-technical-cursor');
        state.hover = true; status.textContent = state.scanning ? 'SCANNING' : 'TRACKING'; wake();
      }
    };
    const handlers = { pointerenter: move, pointermove: move, pointerleave: leave, pointercancel: leave, click, keydown, focus,
      blur: () => { baseCue(); leave(); },
      pointerdown: event => { if (!canRun()) return; baseCue(); move(event); state.cursor.pressed = true; wake(); },
      pointerup: () => { state.cursor.pressed = false; wake(); }
    };
    Object.entries(handlers).forEach(([name, handler]) => field.addEventListener(name, handler));
    const tabClick = event => { const tab = event.target.closest('[data-view]'); if (tab) selectView(tab.dataset.view); };
    const tabKey = event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = tabs.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectView(tabs[next].dataset.view, true);
    };
    tablist.addEventListener('click', tabClick); tablist.addEventListener('keydown', tabKey);
    pauseButton.addEventListener('click', togglePause); closeButton.addEventListener('click', close); reopen.addEventListener('click', open);
    win.addEventListener('pointermove', shellMove); win.addEventListener('pointerleave', shellLeave);
    terminal = initDetectorTerminal(win, session, () => {
      status.textContent = 'CODE INPUT';
      if (reduced) { state.time += .12; session.time = state.time; }
      wake();
    }, canRun, (progress, scanning) => {
      state.scanProgress = progress; state.scanning = scanning;
      status.textContent = scanning ? 'SCANNING' : 'SCAN COMPLETE';
      wake();
    });
    win.hidden = session.closed; reopen.hidden = !session.closed;
    gsap.set(win, { opacity: 1, scale: 1 });
    updatePause(); updateLogs(); selectView(session.view); access();
    const sync = self => {
      active = self.isActive; access();
      if (!canRun()) { clearCursor(); stop(); pulseTween?.pause(); } else { pulseTween?.resume(); draw(); wake(); }
    };
    ScrollTrigger.create({ trigger: desktop ? chapter : win.parentElement.parentElement, start: desktop ? 'top 48%' : 'top bottom', end: desktop ? 'bottom 48%' : 'bottom top', refreshPriority: -1, onToggle: sync, onRefresh: sync });
    const visibility = () => {
      if (document.hidden) clearCursor();
      if (!canRun()) { stop(); pulseTween?.pause(); } else { pulseTween?.resume(); wake(); }
      syncBackdrop();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true; stop(); pulseTween?.kill(); windowTween?.kill(); resize.disconnect(); win.inert = true; reopen.tabIndex = -1;
      clearCursor();
      terminal.destroy(); backdropImage.removeEventListener('load', syncBackdrop);
      Object.entries(handlers).forEach(([name, handler]) => field.removeEventListener(name, handler));
      tablist.removeEventListener('click', tabClick); tablist.removeEventListener('keydown', tabKey);
      pauseButton.removeEventListener('click', togglePause); closeButton.removeEventListener('click', close); reopen.removeEventListener('click', open);
      win.removeEventListener('pointermove', shellMove); win.removeEventListener('pointerleave', shellLeave);
      document.removeEventListener('visibilitychange', visibility);
      Object.keys(pose).forEach(key => poseSetters[key](0)); win.style.removeProperty('--glass-x'); win.style.removeProperty('--capture');
    };
  });
}
