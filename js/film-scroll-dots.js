// Scroll progress follows a damped spring; the ticker sleeps once it settles.
export function createFilmScrollDots(element, { count, seek, reducedMotion = false, axis = 'x' }) {
  const events = new AbortController();
  element.classList.add('film-scroll-dots');
  element.classList.toggle('film-scroll-dots--vertical', axis === 'y');
  element.innerHTML = Array.from({ length: count }, (_, i) => `<button type="button" aria-label="Ver imagen ${i + 1} de ${count}" data-dot="${i}"><span></span></button>`).join('') + '<i class="film-dot-follower" aria-hidden="true"></i>';
  const dots = [...element.querySelectorAll('button')], follower = element.querySelector('i');
  const setPosition = gsap.quickSetter(follower, axis, 'px');
  let position = 0, velocity = 0, target = 0, ticking = false;
  const tick = (_time, delta) => {
    const dt = Math.min(delta / 1000, .032);
    velocity += (target - position) * 180 * dt;
    velocity *= Math.exp(-17 * dt);
    position += velocity * dt;
    if (Math.abs(target - position) < .05 && Math.abs(velocity) < .1) {
      position = target; velocity = 0; ticking = false; gsap.ticker.remove(tick);
    }
    setPosition(position);
  };
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => seek(i / (count - 1)), { signal: events.signal });
    dot.addEventListener('keydown', event => {
      const nextKey = axis === 'y' ? 'ArrowDown' : 'ArrowRight';
      const previousKey = axis === 'y' ? 'ArrowUp' : 'ArrowLeft';
      const next = event.key === nextKey ? Math.min(count - 1, i + 1) : event.key === previousKey ? Math.max(0, i - 1) : null;
      if (next === null) return;
      event.preventDefault(); dots[next].focus({ preventScroll: true }); seek(next / (count - 1));
    }, { signal: events.signal });
  });
  return {
    update(progress, instant = false) {
      const value = Math.max(0, Math.min(1, progress)), active = Math.round(value * (count - 1));
      dots.forEach((dot, i) => { dot.setAttribute('aria-current', i === active ? 'true' : 'false'); });
      const first = dots[0], last = dots[count - 1];
      target = axis === 'y'
        ? first.offsetTop + first.offsetHeight / 2 + (last.offsetTop - first.offsetTop) * value
        : first.offsetLeft + first.offsetWidth / 2 + (last.offsetLeft - first.offsetLeft) * value;
      if (instant || reducedMotion) { position = target; velocity = 0; setPosition(position); return; }
      if (!ticking && Math.abs(target - position) > .05) { ticking = true; gsap.ticker.add(tick); }
    },
    destroy() { events.abort(); gsap.ticker.remove(tick); element.replaceChildren(); }
  };
}
