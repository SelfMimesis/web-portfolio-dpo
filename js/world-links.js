import { lcdDisplayMarkup, engageLCD } from './lcd-display.js';
const pauseMeters = new WeakMap();

export function buildWorldLinks() {
  for (const world of ['art', 'dev']) {
    const target = world === 'art' ? 'dev' : 'art';
    const digital = target === 'dev';
    const panel = document.createElement('article');
    panel.className = 'panel panel--next';
    panel.setAttribute('aria-label', '7: Next world');
    panel.innerHTML = `
      <div class="panel-meta"><span>${digital ? 'ART DEPARTMENT' : 'DIGITAL PROPS'} / 07</span></div>
      <div class="world-link-intro"><span class="mono">END OF TRANSMISSION / 01—07</span><h2>${digital ? 'Paper ends.<br>The screen<br><i>begins.</i>' : 'Beyond<br>the screen.<br><i>On paper.</i>'}</h2><p>${digital ? 'Another medium.<br>The same instinct for a story.' : 'Objects, identities and printed matter.<br>A world you can hold.'}</p><span class="world-link-route" aria-hidden="true">${digital ? '[ PRINT ] ───── [ SCREEN ]' : '[ SCREEN ] ───── [ PRINT ]'} →</span></div>
      <a class="world-link world-link--${target}" href="#${target}" data-world="${target}" aria-label="${digital ? 'Explore Digital Props' : 'Explore Graphic Design'}">
        <span class="world-link-meta">${digital ? 'DPO / HANDHELD 02' : 'DPO / PRINTED MATTER'}</span>
        ${digital ? `<span class="world-link-hardware"><span class="world-link-device-label">SCREEN SYSTEM / 198X</span>${lcdDisplayMarkup('DIGITAL<br>PROPS')}<span class="world-link-device-label">MONOCHROME / WIDE FIELD</span></span><span class="world-link-keys" aria-hidden="true"><span><i></i>MODE</span><span><i></i>SELECT</span><span><i></i>START</span></span>` : '<span class="world-link-paper"><span class="world-link-registration" aria-hidden="true">+ ───────── +</span><span class="world-link-title">GRAPHIC<br><i>DESIGN</i></span><span class="world-link-specimen" aria-hidden="true">Aa<span>09 / TYPE & MATTER</span></span><span class="world-link-stamp">APPROVED<br>FOR PICTURE</span></span>'}
        <span class="world-link-footer"><span class="world-link-action">${digital ? '[ ENTER SYSTEM ]' : '[ OPEN COLLECTION ]'}</span><span class="world-link-arrow" aria-hidden="true">→</span></span>
        <span class="world-link-code">${digital ? 'FICTIONAL SCREENS / REAL STORIES' : 'PROPS / IDENTITIES / STORIES'}</span>
        <span class="world-link-descent" aria-hidden="true"><span class="mono">NEXT CHAPTER / 08</span><strong>About<br><i>Me.</i></strong><span class="world-link-descent-arrow">↓</span><span class="mono">SCROLL DOWN<br>THE PERSON BEHIND THE WORK</span></span>
        <span class="world-link-scroll" aria-hidden="true" hidden><span class="world-link-scroll-caption"><span>SCROLL TO ABOUT ↓</span><span class="world-link-scroll-value">00%</span></span><span class="world-link-scroll-track"><i></i></span></span>
      </a>
      <a class="world-link-about" href="#about" data-about>Continue to About Me <span aria-hidden="true">↓</span></a>`;
    document.querySelector(`.${world}-track`).append(panel);
  }
  document.querySelector('.progress-total').textContent = '07';
}

// Driven by actual pin distance, so 100% coincides with vertical release.
export function setWorldLinkPause(section, progress, enabled = true) {
  let meter = pauseMeters.get(section);
  if (!meter) {
    const root = section.querySelector('.world-link-scroll');
    if (!root) return;
    meter = { root, fill: root.querySelector('i'), value: root.querySelector('.world-link-scroll-value'), progress: -1, percent: -1 };
    pauseMeters.set(section, meter);
  }
  meter.root.hidden = !enabled;
  const next = Math.max(0, Math.min(1, progress));
  if (next === meter.progress) return;
  meter.progress = next;
  meter.fill.style.transform = `scaleX(${next})`;
  const percent = Math.floor(next * 100);
  if (percent !== meter.percent) {
    meter.percent = percent;
    meter.value.textContent = `${String(percent).padStart(2, '0')}%`;
  }
}

// Keep the destination, accessible name and visual cue in sync, including reverse scroll.
export function setWorldLinkDescent(section, descending, immediate = false) {
  const link = section.querySelector('.world-link');
  if (!link || (link.classList.contains('is-descending') === descending && !immediate)) return;
  link.classList.toggle('is-descending', descending);
  link.href = descending ? '#about' : `#${link.dataset.world}`;
  link.setAttribute('aria-label', descending ? 'Scroll down to About Me' : link.dataset.world === 'dev' ? 'Explore Digital Props' : 'Explore Graphic Design');
  const overlay = link.querySelector('.world-link-descent');
  const contents = [...link.children].filter(child => child !== overlay && !child.classList.contains('world-link-scroll'));
  if (!window.gsap) return;
  const duration = immediate || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .45;
  gsap.to(contents, { opacity: descending ? 0 : 1, y: descending ? -16 : 0, duration, ease: 'power2.out', overwrite: true });
  gsap.to(overlay, { autoAlpha: descending ? 1 : 0, y: descending ? 0 : 28, duration, ease: 'power3.out', overwrite: true });
}

export function initWorldLinks() {
  document.querySelectorAll('.world-link').forEach(link => {
    const set = active => {
      link.classList.toggle('is-engaged', active);
      engageLCD(link, active);
    };
    link.addEventListener('pointerenter', () => set(true));
    link.addEventListener('pointerleave', () => set(link.matches(':focus-visible')));
    link.addEventListener('focus', () => set(true));
    link.addEventListener('blur', () => set(link.matches(':hover')));
  });
}
