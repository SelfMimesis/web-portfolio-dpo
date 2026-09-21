import { state } from './state.js';
export function initHeroSelector(onSelect) {
  const worlds = [...document.querySelectorAll('.hero-selector .world')];
  for (const [index, element] of worlds.entries()) {
    const world = index ? 'dev' : 'art';
    element.addEventListener('pointerenter', () => {
      state.hoveredWorld = world;
      if (!window.gsap || state.activeWorld || state.isMobile || state.reducedMotion || state.transitionInProgress || !matchMedia('(hover: hover)').matches) return;
      gsap.to(worlds, { width: i => i === index ? '57%' : '43%', duration: .6, ease: 'power3.out', overwrite: true });
      gsap.to('.center-mark', { left: index ? '43%' : '57%', duration: .6, ease: 'power3.out', overwrite: true });
    });
    element.addEventListener('pointerleave', () => {
      state.hoveredWorld = null;
      if (!window.gsap || state.activeWorld || state.transitionInProgress) return;
      gsap.to(worlds, { width: '50%', duration: .6, ease: 'power3.out', overwrite: true });
      gsap.to('.center-mark', { left: '50%', duration: .6, overwrite: true });
    });
    element.addEventListener('click', e => { if (!e.target.closest('a,button')) onSelect(world, true, element); });
  }
  if (window.gsap && !state.reducedMotion) gsap.from('.world h1>span, .world h2>span', { y: 35, opacity: 0, duration: 1, stagger: .07, ease: 'power4.out' });
}
export function resetHero() {
  const hero = document.querySelector('.hero-selector');
  hero.classList.remove('is-journey-cover');
  hero.querySelectorAll('.world, .center-mark').forEach(element => { element.hidden = false; });
  if (window.gsap) {
    gsap.killTweensOf('.world, .center-mark');
    gsap.set('.world, .center-mark', { clearProps: 'all' });
    gsap.set(hero, { clearProps: 'height,minHeight' });
  }
}

export async function expandHero(world) {
  const hero = document.querySelector('.hero-selector');
  const selected = hero.querySelector(`.world--${world}`);
  const other = hero.querySelector(`.world--${world === 'art' ? 'dev' : 'art'}`);
  const marker = hero.querySelector('.center-mark');
  if (window.gsap && !state.reducedMotion) {
    gsap.killTweensOf([selected, other, marker]);
    const bounds = hero.getBoundingClientRect();
    const header = document.querySelector('.site-header').offsetHeight;
    const frames = [selected, other].map(element => ({ element, rect: element.getBoundingClientRect() }));
    frames.forEach(({ element, rect }, index) => {
      gsap.set(element, { position: 'absolute', left: rect.left - bounds.left, top: rect.top - bounds.top, width: rect.width, height: rect.height, zIndex: index === 0 ? 2 : 1 });
    });
    gsap.set(hero, { height: bounds.height, minHeight: 0 });
    const timeline = gsap.timeline({ defaults: { duration: .85, ease: 'power3.inOut' } });
    timeline.to(hero, { height: innerHeight }, 0)
      .to(selected, { left: 0, top: header, width: hero.clientWidth, height: innerHeight - header }, 0)
      .to(other, { xPercent: world === 'art' ? 100 : -100, opacity: 0, duration: .65 }, 0)
      .to(marker, { opacity: 0, scale: .5, duration: .2 }, 0);
    await timeline;
  }
  hero.classList.add('is-journey-cover');
  other.hidden = true;
  marker.hidden = true;
  if (window.gsap) {
    gsap.set([selected, other, marker], { clearProps: 'all' });
    gsap.set(hero, { clearProps: 'height,minHeight' });
  }
}
