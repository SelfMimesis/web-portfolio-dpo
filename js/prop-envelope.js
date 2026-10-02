// Cool blue / warm red, then green / magenta. Small stock tickets sit in front.
const labels = [
  { key: 'marino', name: 'El Marino', source: new URL('../assets/graphic-props/labels/el-marino.png', import.meta.url).href, width: 960, height: 521, pocket: 0, x: .23, y: .23, rotation: -15, delay: .12, bend: -.10 },
  { key: 'fluorescencia', name: 'Fluorescencia · Industrias', source: new URL('../assets/graphic-props/labels/fluorescencia.png', import.meta.url).href, width: 960, height: 514, pocket: 0, x: .60, y: .14, rotation: 8, delay: .62, bend: .10 },
  { key: 'pesca', name: 'Hilo para la pesca', source: new URL('../assets/graphic-props/labels/hilo-pesca.png', import.meta.url).href, width: 960, height: 974, pocket: 1, x: .75, y: .38, rotation: 17, delay: .35, bend: .16 },
  { key: 'cola', name: 'Cola especial · José Pla', source: new URL('../assets/graphic-props/labels/cola-jose-pla.png', import.meta.url).href, width: 960, height: 1052, pocket: 1, x: .24, y: .49, rotation: -12, delay: .83, bend: -.21 },
  { key: 'mariquilla', name: 'La Mariquilla · Pimentón', source: new URL('../assets/graphic-props/labels/mariquilla.png', import.meta.url).href, width: 960, height: 1186, pocket: 0, x: .49, y: .44, rotation: 7, delay: 1.02, bend: .08 },
  { key: 'pilar', name: 'Pilar Gómez Angulo · Velas de cera', source: new URL('../assets/graphic-props/labels/pilar-angulo.png', import.meta.url).href, width: 960, height: 1438, pocket: 1, x: .86, y: .67, rotation: 14, delay: 1.22, bend: .19 },
  { key: 'modelo', name: 'Marca registrada · Modelo, calidad, color', source: new URL('../assets/graphic-props/labels/precio-modelo.png', import.meta.url).href, width: 960, height: 340, pocket: 0, x: .33, y: .81, rotation: -9, delay: 1.48, bend: -.16, small: true },
  { key: 'precio', name: 'Ref. · Precio', source: new URL('../assets/graphic-props/labels/precio-azul.png', import.meta.url).href, width: 960, height: 1211, pocket: 1, x: .62, y: .85, rotation: 12, delay: 1.69, bend: -.12, small: true }
];

const pockets = [{ x: .27 }, { x: .73 }];

export function propEnvelopeMarkup() {
  return `<div class="graphic-collection prop-envelope" aria-label="Two translucent paper envelopes with eight period labels">
    <div class="envelope-stage" id="graphic-label-archive">
      ${pockets.map((p, i) => `<div class="envelope-back-wrap envelope-shell envelope-shell--${i}" aria-hidden="true"><div class="envelope-back"></div><div class="envelope-flap"></div></div>`).join('')}
      ${labels.map((label, i) => `<figure class="envelope-label envelope-label--${label.key}${label.small ? ' envelope-label--ticket' : ''}" style="--label-x:${label.x * 100}%;--label-y:${label.y * 100}%;--label-angle:${label.rotation}deg;--label-order:${30 + i}">
        <span class="envelope-label-paper"><img src="${label.source}" width="${label.width}" height="${label.height}" alt="${label.name} — original period prop label" decoding="async"></span><figcaption>${label.name}</figcaption>
      </figure>`).join('')}
      ${pockets.map((p, i) => `<div class="envelope-front-wrap envelope-shell envelope-shell--${i}" aria-hidden="true"><div class="envelope-front"><span class="envelope-seam"></span><span class="envelope-bottom-fold"></span></div></div>`).join('')}
    </div>
    <div class="envelope-footer"><span>02 ENVELOPES / 08 PRINTED DETAILS</span><button class="envelope-toggle" type="button" aria-expanded="true" aria-controls="graphic-label-archive">Close archive ↓</button></div>
  </div>`;
}

const cubic = (a, b, c, d, t) => (1-t)**3*a + 3*(1-t)**2*t*b + 3*(1-t)*t*t*c + t**3*d;
const clamp = value => Math.max(0, Math.min(1, value));
const setter = (element, key) => gsap.quickSetter(element, key, key === 'x' || key === 'y' ? 'px' : key.startsWith('rotation') ? 'deg' : undefined);

export function createPropEnvelope(root, { vertical, reducedMotion, seekFinal } = {}) {
  const stage = root.querySelector('.envelope-stage');
  const cards = [...root.querySelectorAll('.envelope-label')];
  const button = root.querySelector('.envelope-toggle');
  const events = new AbortController();
  const renderers = [];
  const measurements = [];
  let progress = 1, timeline, mobilePin;
  const paintScene = time => renderers.forEach(render => render(time));
  const setProgress = value => {
    progress = Math.max(0, Math.min(1, value));
    root.dataset.open = progress.toFixed(3);
    const expanded = progress > .7;
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? 'Close archive ↓' : 'Open archive ↑';
  };
  const context = window.gsap?.context(() => {
    if (reducedMotion) return;
    root.classList.add('has-envelope-motion');
    const slideEase = gsap.parseEase('power2.inOut');
    // One GSAP clock renders absolute states. Refresh never captures a half-open
    // sleeve as a new starting pose, and reverse scroll follows the same path.
    timeline = gsap.timeline({ paused: true, onUpdate() { paintScene(this.time()); setProgress(this.progress()); } });
    // The sleeves and their open flaps are entirely static CSS. Only labels move.
    cards.forEach((card, i) => {
      const label = labels[i], pocket = pockets[label.pocket];
      // Wide labels are filed lengthwise, so they physically fit the narrow sleeve.
      const storedAngle = i < 2 ? 90 : 0;
      const shell = root.querySelector(`.envelope-back-wrap.envelope-shell--${label.pocket}`);
      let stored;
      const measureStored = () => {
        const width = storedAngle ? card.offsetHeight : card.offsetWidth;
        const height = storedAngle ? card.offsetWidth : card.offsetHeight;
        const padding = Math.max(6, shell.offsetWidth * .08);
        const scale = Math.min(.94, (shell.offsetWidth - padding * 2) / width, (shell.offsetHeight - padding * 2) / height);
        const stackOffset = Math.min((i % 3) * 3, Math.max(0, shell.offsetHeight - padding * 2 - height * scale));
        stored = {
          x: pocket.x,
          y: (shell.offsetTop + shell.offsetHeight - padding - height * scale / 2 - stackOffset) / stage.clientHeight,
          scale
        };
      };
      measureStored();
      measurements.push(measureStored);
      const direction = label.pocket ? 1 : -1;
      gsap.set(card, { left: 0, top: 0, xPercent: -50, yPercent: -50, transformPerspective: 1200, transformOrigin: '50% 50%' });
      const setters = Object.fromEntries(['x', 'y', 'rotation', 'rotationX', 'rotationY', 'scaleX', 'scaleY', 'zIndex'].map(key => [key, setter(card, key)]));
      renderers.push(time => {
        const t = slideEase(clamp((time - 1 - label.delay) / (2.8 + (i % 3) * .22)));
        // Each cubic has its own sideways drift and landing, with no shared lift.
        const x = cubic(stored.x, pocket.x + direction * .19, label.x + label.bend, label.x, t);
        const y = cubic(stored.y, label.small ? -.02 : .23, label.y - .14, label.y, t);
        setters.x(x * stage.clientWidth); setters.y(y * stage.clientHeight);
        setters.rotation(storedAngle * (1-t) + label.rotation * t + Math.sin(t*Math.PI) * direction * (9 + i));
        setters.rotationX(Math.sin(t*Math.PI) * (label.small ? 19 : 12));
        setters.rotationY(Math.sin(t*Math.PI) * direction * 10);
        const scale = stored.scale + (1 - stored.scale) * t;
        setters.scaleX(scale); setters.scaleY(scale);
        setters.zIndex(t > .53 ? 30 + i : 2 + i);
      });
    });
    timeline.to({ time: 0 }, { time: 6.36, duration: 6.36, ease: 'none' });
    timeline.progress(0);
    paintScene(0);
    setProgress(0);
    if (vertical && window.ScrollTrigger) {
      mobilePin = ScrollTrigger.create({
        trigger: root, start: () => `top top+=${document.querySelector('.site-header').offsetHeight + 20}`,
        end: () => `+=${Math.max(1600, innerHeight * 2.5)}`,
        animation: timeline, scrub: .65, pin: true, pinSpacing: true,
        refreshPriority: 95, invalidateOnRefresh: true,
        onRefresh: () => { measurements.forEach(measure => measure()); paintScene(timeline.time()); }
      });
    }
  }, root);
  if (!timeline) { button.hidden = true; setProgress(1); }
  button.addEventListener('click', () => {
    const target = progress > .7 ? 0 : .98;
    if (mobilePin) window.scrollTo({ top: mobilePin.start + (mobilePin.end - mobilePin.start) * target, behavior: 'smooth' });
    else seekFinal?.(target);
  }, { signal: events.signal });
  return {
    update(value) { if (!vertical) timeline?.progress(Math.max(0, Math.min(1, value))); },
    refresh() { if (timeline) { measurements.forEach(measure => measure()); paintScene(timeline.time()); } },
    destroy() { events.abort(); context?.revert(); root.classList.remove('has-envelope-motion'); button.hidden = false; }
  };
}
