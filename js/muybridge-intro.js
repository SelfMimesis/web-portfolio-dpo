import { state } from './state.js';

// Source-space pixels, checked against the supplied 2500 × 1559 scan.
// Only the image interiors are replaced: printed numbers, rails and borders stay still.
// All sampling windows have the same aspect ratio; no pose is stretched to fit.
export const MUYBRIDGE_CONFIG = {
  source: new URL('../assets/graphic-props/mubridge-scaled-2-scaled.webp', import.meta.url).href,
  sourceSize: [2500, 1559],
  plate: [116, 36, 2284, 1208],
  cells: [
    [163, 113, 500, 278], [728, 113, 500, 278],
    [1292, 105, 500, 278], [1855, 105, 500, 278],
    [169, 503, 500, 278], [728, 503, 500, 278],
    [1292, 503, 500, 278], [1855, 498, 500, 278],
    [171, 900, 500, 278], [729, 900, 500, 278],
    [1291, 900, 500, 278], [1853, 900, 500, 278]
  ],
  runningFrames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  phaseOffsets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0],
  pixelsPerFrame: 18,
  impulseGain: 4, // Scroll distance adds velocity; there is no autonomous idle playback.
  maxFps: 28,
  friction: 2.2, // Exponential drag per second; a strong gesture coasts for about 2 seconds.
  stopFps: .2,
  beatStarts: [0, .43, .65, .83],
  arrivalEnd: .26,
  scrollDistance: () => Math.min(3900, Math.max(3100, innerHeight * 4))
};

const records = new WeakMap();
const passages = [
  ['GRAPHIC PROPS', ['I design graphic props for film and create printed surfaces for the art department.']],
  ['PRINTED ILLUSIONS', ['A floor. A texture. A trompe-l’œil perspective.', 'Printed images that turn a set into a believable place.']],
  ['STILL IMAGES', ['At the dawn of cinema, Muybridge revealed movement through a sequence of still photographs.']],
  ['LIVING WORLDS', ['Like Muybridge, I see my work as bringing still images to life — giving a film set the details that make its world feel real.']]
];

export function mountMuybridgeIntro(panel) {
  const config = MUYBRIDGE_CONFIG;
  const [px, py, pw, ph] = config.plate;
  panel.classList.add('panel--muybridge');
  panel.setAttribute('aria-label', 'Still images. Living worlds.');
  panel.insertAdjacentHTML('beforeend', `<div class="muybridge-layout">
    <figure class="muybridge-figure">
      <div class="muybridge-plate" style="aspect-ratio:${pw}/${ph};--source-width:${config.sourceSize[0] / pw * 100}%;--source-left:${-px / pw * 100}%;--source-top:${-py / ph * 100}%" role="img" aria-label="Twelve photographs of a horse and rider, arranged in four columns and three rows within Muybridge’s original dark-bordered plate. A contemporary animation cycles eleven galloping poses in each cell.">
        <img class="muybridge-source" src="${config.source}" width="${config.sourceSize[0]}" height="${config.sourceSize[1]}" alt="" decoding="async">
        <canvas class="muybridge-canvas" width="${pw}" height="${ph}" aria-hidden="true"></canvas>
      </div>
      <div class="muybridge-image-tools"><span aria-hidden="true">1878 / SCROLL TO ANIMATE</span><button class="muybridge-toggle" type="button" disabled>Pause motion</button></div>
      <figcaption>Eadweard Muybridge — The Horse in Motion.<br>Sequence photographed in 1878. Contemporary animation.</figcaption>
    </figure>
    <div class="muybridge-narrative">
      <span class="muybridge-label">GRAPHIC PROPS / ART DEPARTMENT</span>
      <h3 class="muybridge-statement" aria-label="Still images. Living worlds.">Still images.<br><em class="muybridge-kinetic">Living worlds.</em></h3>
      <div class="muybridge-copy">${passages.map(([label, paragraphs], i) => `<section class="muybridge-beat" data-beat="${i}" aria-label="${label}">
        <span class="muybridge-passage-label">0${i + 1} / ${label}</span>
        <div class="muybridge-body">${paragraphs.map(text => `<p>${text}</p>`).join('')}
        ${i === 3 ? '<a class="muybridge-explore" href="#art-graphic-story">Explore the work →</a>' : ''}</div>
      </section>`).join('')}</div>
    <nav class="muybridge-steps" aria-label="Introduction passages">${passages.map(([label], i) => `<button type="button" data-step="${i}" aria-label="${label}">0${i + 1}</button>`).join('')}</nav></div>
  </div>`);
  const image = panel.querySelector('img');
  // Reuse both the element and its one decode promise across world switches.
  const ready = image.decode().then(() => {
    if (image.naturalWidth !== config.sourceSize[0] || image.naturalHeight !== config.sourceSize[1]) throw new Error('Unexpected Muybridge source dimensions');
    return image;
  }).catch(() => null);
  records.set(panel, { image, ready, userPaused: false, travel: 0 });
}

export function createMuybridgeIntro(section, { vertical = false, seekBeat, explore } = {}) {
  const panel = section.querySelector('.panel--muybridge');
  const record = records.get(panel);
  if (!record) return null;
  const config = MUYBRIDGE_CONFIG;
  const figure = panel.querySelector('figure');
  const narrative = panel.querySelector('.muybridge-narrative');
  const kinetic = panel.querySelector('.muybridge-kinetic');
  const canvas = panel.querySelector('canvas');
  const button = panel.querySelector('.muybridge-toggle');
  const beats = [...panel.querySelectorAll('.muybridge-beat')];
  const steps = [...panel.querySelectorAll('[data-step]')];
  const cover = section.querySelector('.panel--hero');
  const heading = cover.querySelector('.world--art h1');
  const composition = cover.querySelector('.world--art .art-composition');
  const coverCopy = cover.querySelector('.world--art .world-bottom');
  let ctx;
  try { ctx = canvas.getContext('2d', { alpha: false }); } catch { ctx = null; }
  const events = new AbortController();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false, ready = false, visible = false, beat = -1;
  let lastScroll = scrollY, lastFrame = -1, paintCount = 0, progress = 0;
  let velocity = 0, frameRequest = 0, previousTime = 0;
  let coverTimeline, animationContext;
  const textTimelines = [];

  panel.classList.toggle('muybridge-desktop', !vertical);
  cover.classList.add('has-art-intro');
  if (window.gsap && !motion.matches) {
    animationContext = gsap.context(() => {
      if (!vertical) {
        coverTimeline = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'power1.inOut' } })
          .addLabel('make-room', 0)
          .fromTo(heading, { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none' }, 'make-room')
          .fromTo(coverCopy, { y: 0 }, { y: () => innerHeight }, 'make-room')
          .fromTo(figure, { x: () => Math.min(240, innerWidth * .18), autoAlpha: 0 },
            { x: 0, autoAlpha: 1, ease: 'sine.inOut' }, 'make-room')
          .fromTo(narrative, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'sine.inOut' }, 'make-room');
        // Independent translate leaves each card's original rotation and float intact.
        [
          ['.archive-paper', -1, -.45],
          ['.type-sheet', 1, -.65],
          ['.portrait-card', .15, -1.4],
          ['.cinema-ticket', .8, 1],
          ['.composition-caption', -1, .25]
        ].forEach(([selector, x, y]) => {
          coverTimeline.fromTo(composition.querySelector(selector),
            { '--cover-exit-x': '0px', '--cover-exit-y': '0px' },
            { '--cover-exit-x': () => `${innerWidth * x}px`, '--cover-exit-y': () => `${innerHeight * y}px` }, 'make-room');
        });
      }
      beats.forEach(element => {
        const timeline = gsap.timeline({ paused: true })
          .fromTo(element.querySelectorAll('.muybridge-passage-label, p, .muybridge-explore'),
            { autoAlpha: 0, filter: 'blur(3px)' },
            { autoAlpha: 1, filter: 'blur(0px)', duration: .7, stagger: .08, ease: 'sine.inOut' });
        textTimelines.push(timeline);
      });
    }, cover);
  }

  function drawStatic() {
    kinetic.style.removeProperty('--frame-x');
    kinetic.style.removeProperty('--frame-skew');
    kinetic.style.removeProperty('--frame-echo');
    if (!ready || !ctx || canvas.dataset.frames === 'original') return;
    ctx.drawImage(record.image, ...config.plate, 0, 0, canvas.width, canvas.height);
    canvas.dataset.frames = 'original'; lastFrame = -1;
  }
  function drawFrame(tick) {
    // A stepped registration shift and a faint double exposure share the horse clock.
    const phase = Math.floor(tick / 2) % 8;
    const shift = [-3, -1, 1, 3, 4, 2, 0, -2][phase];
    kinetic.style.setProperty('--frame-x', `${shift}px`);
    kinetic.style.setProperty('--frame-skew', `${shift * .3}deg`);
    kinetic.style.setProperty('--frame-echo', `${-shift * 2}px`);
    kinetic.dataset.frame = String(phase);
    const frames = config.phaseOffsets.map(phase => config.runningFrames[(tick + phase) % config.runningFrames.length]);
    config.cells.forEach(([x, y, width, height], i) => {
      ctx.drawImage(record.image, ...config.cells[frames[i]], x - config.plate[0], y - config.plate[1], width, height);
    });
    canvas.dataset.frames = frames.join(',');
    canvas.dataset.tick = String(tick);
    canvas.dataset.paints = String(++paintCount);
    lastFrame = tick;
  }
  function enabled() {
    return !disposed && ready && ctx && visible && (vertical || progress >= config.arrivalEnd) && !record.userPaused && !motion.matches && !document.hidden && state.activeWorld === 'art' && !section.hidden;
  }
  function sync() {
    const arriving = !vertical && progress < config.arrivalEnd;
    button.disabled = !ready || !ctx || motion.matches || arriving;
    button.textContent = motion.matches ? 'Motion off' : arriving ? 'Scroll to animate' : record.userPaused ? 'Enable motion' : 'Pause motion';
    panel.dataset.motionEnabled = String(!!enabled());
    if (!enabled()) stopInertia();
    if (arriving || motion.matches) drawStatic();
  }
  function stopInertia() {
    cancelAnimationFrame(frameRequest); frameRequest = 0; velocity = 0;
    panel.dataset.moving = 'false'; panel.dataset.inertiaSpeed = '0';
  }
  function coast(now) {
    frameRequest = 0;
    if (!enabled()) { stopInertia(); return; }
    const dt = Math.min(.05, Math.max(0, (now - previousTime) / 1000));
    previousTime = now;
    const slower = velocity * Math.exp(-config.friction * dt);
    // Integrate exponential drag exactly, independent of screen refresh rate.
    record.travel += (velocity - slower) / config.friction * config.pixelsPerFrame;
    velocity = slower;
    const tick = Math.floor(record.travel / config.pixelsPerFrame);
    if (tick !== lastFrame) drawFrame(tick);
    panel.dataset.inertiaSpeed = velocity.toFixed(3);
    if (velocity <= config.stopFps) { stopInertia(); return; }
    frameRequest = requestAnimationFrame(coast);
  }
  function setBeat(index) {
    if (beat === index) return;
    beat = index; panel.dataset.beat = String(index);
    beats.forEach((element, i) => {
      element.hidden = !vertical && i !== index;
      element.inert = !vertical && i !== index;
    });
    steps.forEach((step, i) => {
      if (i === index) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    sync();
  }
  const clamp = value => Math.max(0, Math.min(1, value));
  function update(value) {
    const arrivalChanged = (progress >= config.arrivalEnd) !== (value >= config.arrivalEnd);
    progress = value;
    if (vertical) return;
    coverTimeline?.progress(clamp(value / config.arrivalEnd));
    panel.inert = value < .015;
    const index = config.beatStarts.reduce((current, start, i) => value >= start ? i : current, 0);
    setBeat(index);
    if (arrivalChanged) sync();
    const start = config.beatStarts[index], end = config.beatStarts[index + 1] ?? 1;
    const local = (value - start) / (end - start);
    textTimelines[index]?.progress(clamp(local / .34));
    if (window.gsap) gsap.set(beats[index], {
      opacity: index < 3 ? 1 - clamp((local - .9) / .1) : 1
    });
  }
  function updateMobile() {
    const readingLine = Math.max(innerHeight * .64, figure.getBoundingClientRect().bottom + 45);
    setBeat(beats.reduce((current, element, i) => element.getBoundingClientRect().top < readingLine ? i : current, 0));
    beats.forEach((element, i) => {
      const top = element.getBoundingClientRect().top;
      textTimelines[i]?.progress(clamp((readingLine - top) / 160));
    });
  }
  function onScroll() {
    const current = scrollY, delta = Math.abs(current - lastScroll); lastScroll = current;
    if (vertical) updateMobile();
    // A gesture injects momentum. Only its decaying tail uses the shared clock.
    if (!delta || !enabled()) return;
    velocity = Math.min(config.maxFps, velocity + delta / config.pixelsPerFrame * config.impulseGain);
    panel.dataset.moving = 'true'; panel.dataset.inertiaSpeed = velocity.toFixed(3);
    if (!frameRequest) { previousTime = performance.now(); frameRequest = requestAnimationFrame(coast); }
  }
  const visibility = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio > .05;
    lastScroll = scrollY; sync();
  }, { threshold: [0, .05] });
  visibility.observe(figure);
  button.addEventListener('click', () => { record.userPaused = !record.userPaused; sync(); }, { signal: events.signal });
  panel.querySelector('.muybridge-explore').addEventListener('click', event => { event.preventDefault(); explore?.(); }, { signal: events.signal });
  steps.forEach((step, i) => step.addEventListener('click', () => seekBeat?.(i), { signal: events.signal }));
  document.addEventListener('visibilitychange', () => { lastScroll = scrollY; sync(); }, { signal: events.signal });
  window.addEventListener('scroll', onScroll, { passive: true, signal: events.signal });
  if (vertical) window.addEventListener('resize', updateMobile, { signal: events.signal });
  setBeat(0); update(0);
  record.ready.then(image => {
    if (disposed || !image || !ctx) return;
    ready = true;
    canvas.dataset.frames = ''; drawStatic(); panel.classList.add('muybridge-ready');
    if (vertical) updateMobile();
    sync();
  });
  return {
    update,
    refresh() { coverTimeline?.invalidate(); update(progress); },
    destroy() {
      disposed = true; stopInertia(); events.abort(); visibility.disconnect();
      animationContext?.revert();
      kinetic.style.removeProperty('--frame-x'); kinetic.style.removeProperty('--frame-skew'); kinetic.style.removeProperty('--frame-echo');
      beats.forEach(element => { element.hidden = false; element.inert = false; element.style.removeProperty('opacity'); element.style.removeProperty('transform'); });
      panel.inert = false; panel.dataset.motionEnabled = 'false';
      panel.classList.remove('muybridge-desktop'); cover.classList.remove('has-art-intro');
    }
  };
}
