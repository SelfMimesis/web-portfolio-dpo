// Fixed LCD positions: only segment states change, never their coordinates.
const WIDTH = 12;
const HEIGHT = 16;
const DIGITS = ['1111110', '0110000', '1101101', '1111001', '0110011', '1011011', '1011111', '1110000', '1111111', '1111011'];
const controllers = new WeakMap();

const LETTERS = {
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  N: ['10001','11001','11001','10101','10011','10011','10001'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  R: ['11110','10001','10001','11110','10100','10010','10001']
};
function enterMarkup() {
  return `<svg class="lcd-enter" viewBox="0 0 290 70" focusable="false">${[...'ENTER'].map((letter, index) => LETTERS[letter].map((row, y) => [...row].map((on, x) => `<rect x="${index * 60 + x * 10}" y="${y * 10}" width="8" height="8" data-letter="${on}" data-lcd-state="${on === '1' ? 'dim' : 'off'}"/>`).join('')).join('')).join('')}</svg>`;
}

function numberMarkup() {
  const segments = ['3,1 11,1 13,3 11,5 3,5 1,3', '12,4 14,6 14,12 12,14 10,12 10,6', '12,15 14,17 14,23 12,25 10,23 10,17', '3,24 11,24 13,26 11,28 3,28 1,26', '1,15 3,17 3,23 1,25 -1,23 -1,17', '1,4 3,6 3,12 1,14 -1,12 -1,6', '3,12 11,12 13,14 11,16 3,16 1,14'];
  return [0, 1].map(digit => `<g transform="translate(${digit * 19 + 2} 0)">${segments.map((points, segment) => `<polygon points="${points}" data-digit="${digit}" data-segment="${segment}" data-lcd-state="off"/>`).join('')}</g>`).join('');
}

export function lcdDisplayMarkup(label = 'DIGITAL PROPS', mode = 'route') {
  return `<span class="lcd-display" data-lcd-mode="${mode}" aria-hidden="true">
    <span class="lcd-topline"><span>GRAPHIC.SYS</span><span data-lcd-status>READY</span></span>
    <span class="lcd-heading">${label}</span>
    <span class="lcd-instruments"><svg class="lcd-matrix" viewBox="0 0 120 160" focusable="false">${Array.from({ length: WIDTH * HEIGHT }, (_, i) => `<rect x="${i % WIDTH * 10 + 1}" y="${Math.floor(i / WIDTH) * 10 + 1}" width="8" height="8" data-pixel="${i}" data-lcd-state="off"/>`).join('')}</svg>
    <span class="lcd-readout"><span>FRAME</span><svg class="lcd-number" viewBox="0 0 40 30" focusable="false">${numberMarkup()}</svg><span class="lcd-axis">+<br>│<br>+<br>│<br>+</span><span>LINK<br>[ OK ]</span></span></span>
    ${enterMarkup()}
    <span class="lcd-bus">${Array.from({ length: 8 }, (_, i) => `<i data-bus="${i}" data-lcd-state="dim"></i>`).join('')}</span>
    <span class="lcd-bottomline"><span>MEMORY / 024</span><span>[<span data-lcd-phase>ON</span>]</span></span>
  </span>`;
}

function framePixels(frame) {
  const pixels = new Set();
  const add = (x, y) => { if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) pixels.add(y * WIDTH + x); };
  // Original directional glyph in six physical positions, above a printed-style skyline.
  const x = 1 + frame % 6;
  const y = 3 + Math.floor(frame / 6) % 3;
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 2], [0, 2], [1, 2], [2, 3], [1, 3], [0, 4], [1, 4]].forEach(([dx, dy]) => add(x + dx, y + dy));
  for (let column = 0; column < WIDTH; column++) {
    const height = [2, 4, 3, 1, 3, 5, 2, 3, 1, 4, 2, 3][column];
    for (let row = 0; row < height; row++) add(column, HEIGHT - row - 1);
  }
  return pixels;
}

function createLCDDisplay(element) {
  const pixels = [...element.querySelectorAll('[data-pixel]')];
  const digits = [...element.querySelectorAll('[data-digit]')];
  const bus = [...element.querySelectorAll('[data-bus]')];
  const letters = [...element.querySelectorAll('[data-letter]')];
  const status = element.querySelector('[data-lcd-status]');
  const phase = element.querySelector('[data-lcd-phase]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let previous = new Set();
  let frame = 0;
  let timer;
  let visible = false;
  let engaged = false;
  let booting = false;
  const driven = element.dataset.lcdMode === 'scene';
  let lastDriven = '';
  const segment = (node, state) => { if (node.dataset.lcdState !== state) node.dataset.lcdState = state; };
  const render = (next, mode = 'ready') => {
    element.dataset.lcdStage = mode;
    const active = mode === 'off' ? new Set() : framePixels(next);
    pixels.forEach((pixel, i) => segment(pixel, active.has(i) ? 'on' : previous.has(i) && mode !== 'off' && !motion.matches ? 'ghost' : 'off'));
    const value = String(next % 100).padStart(2, '0');
    digits.forEach(node => segment(node, mode !== 'off' && DIGITS[+value[+node.dataset.digit]][+node.dataset.segment] === '1' ? 'on' : 'off'));
    bus.forEach((node, i) => segment(node, mode === 'off' ? 'off' : i <= next % 8 ? 'on' : 'dim'));
    letters.forEach(node => segment(node, node.dataset.letter === '0' || mode === 'off' ? 'off' : engaged ? 'on' : 'dim'));
    status.textContent = mode === 'off' ? 'STANDBY' : mode === 'boot' ? 'LOAD' : engaged ? 'ENTER' : 'READY';
    phase.textContent = mode === 'off' ? '  ' : 'ON';
    previous = active;
  };
  const stop = () => { clearTimeout(timer); timer = null; };
  const schedule = () => {
    stop();
    element.dataset.lcdRunning = 'false';
    if (driven || !visible || document.hidden || motion.matches || booting) return;
    element.dataset.lcdRunning = 'true';
    timer = setTimeout(() => { render(++frame); schedule(); }, engaged ? 100 : 120);
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .2;
    schedule();
  }, { threshold: .2 });
  observer.observe(element);
  document.addEventListener('visibilitychange', schedule);
  const preferenceChanged = () => { render(frame); schedule(); };
  motion.addEventListener('change', preferenceChanged);
  render(0); schedule();
  return {
    // Scroll is the only clock for scene displays. A fixed preceding pose makes
    // persistence deterministic when the user reverses or jumps between chapters.
    setFrame(next, mode = 'ready') {
      const key = `${next}:${mode}`;
      if (!driven || key === lastDriven) return;
      lastDriven = key; frame = next;
      previous = framePixels(Math.max(0, next - 1));
      render(next, mode);
    },
    destroy() {
      stop(); observer.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      motion.removeEventListener('change', preferenceChanged);
      element.dataset.lcdRunning = 'false';
      controllers.delete(element);
    },
    engage(value) { engaged = value; render(frame); schedule(); },
    async boot() {
      if (motion.matches || !window.gsap) return;
      booting = true; stop();
      const sequence = gsap.timeline();
      sequence.call(() => render(frame, 'off'), [], 0)
        .call(() => render(1, 'boot'), [], .12)
        .call(() => render(3, 'boot'), [], .24)
        .call(() => render(5, 'boot'), [], .36)
        .call(() => render(7), [], .48)
        .to({}, { duration: .12 });
      await sequence;
      booting = false; schedule();
    }
  };
}

export function driveLCD(element, frame, mode = 'ready') {
  controllers.get(element)?.setFrame(frame, mode);
}

export function initLCDDisplays() {
  document.querySelectorAll('.lcd-display').forEach(element => {
    if (!controllers.has(element)) controllers.set(element, createLCDDisplay(element));
  });
}

export function engageLCD(container, value) {
  const display = container.querySelector('.lcd-display');
  controllers.get(display)?.engage(value);
}

export async function bootLCD(container) {
  const display = container?.querySelector('.lcd-display');
  await controllers.get(display)?.boot();
}
