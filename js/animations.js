import { state } from './state.js';
let entrance;
let releaseComposition = () => {};

// Keep the original DOM (and its running display), rather than crossfading a clone.
function lockComposition(selected) {
  const composition = selected.querySelector('.art-composition, .dev-composition');
  const rect = composition.getBoundingClientRect();
  const parent = selected.getBoundingClientRect();
  const saved = new Map();
  const remember = element => saved.set(element, element.getAttribute('style'));
  remember(composition);
  // The terminal has different cover selectors. Freeze its resting geometry too.
  const terminal = composition.querySelector('.cockpit');
  if (terminal) {
    remember(terminal);
    const style = getComputedStyle(terminal);
    const properties = ['left','top','width','height','max-width','padding','transform','box-shadow'];
    const values = properties.map(property => [property, style.getPropertyValue(property)]);
    values.forEach(([property,value]) => terminal.style.setProperty(property,value,'important'));
  }
  composition.classList.add('is-composition-locked');
  composition.style.setProperty('--cover-left', `${rect.left-parent.left}px`);
  composition.style.setProperty('--cover-top', `${rect.top-parent.top}px`);
  composition.style.setProperty('--cover-width', `${rect.width}px`);
  composition.style.setProperty('--cover-height', `${rect.height}px`);
  releaseComposition = () => {
    window.gsap?.killTweensOf(composition);
    composition.classList.remove('is-composition-locked');
    saved.forEach((style,element) => style === null ? element.removeAttribute('style') : element.setAttribute('style',style));
    releaseComposition = () => {};
  };
  // Preserve the resting position within the selected world, so the artwork
  // follows its heading to the left as that world opens to full width.
  return { composition, left: rect.left-parent.left, top: rect.top-parent.top };
}
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
      if (!window.gsap || state.activeWorld || state.transitionInProgress || state.isMobile || state.reducedMotion) return;
      gsap.to(worlds, { width: '50%', duration: .6, ease: 'power3.out', overwrite: true });
      gsap.to('.center-mark', { left: '50%', duration: .6, overwrite: true });
    });
    element.addEventListener('click', e => { if (!e.target.closest('a,button')) onSelect(world, true, element); });
  }
  if (window.gsap && !state.reducedMotion) entrance = gsap.from('.world h1>span, .world h2>span', { y: 22, opacity: 0, duration: .65, stagger: .035, ease: 'power3.out' });
}
export function resetHero() {
  releaseComposition();
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
  entrance?.revert(); entrance = null;
  const hero = document.querySelector('.hero-selector');
  const selected = hero.querySelector(`.world--${world}`);
  const other = hero.querySelector(`.world--${world === 'art' ? 'dev' : 'art'}`);
  const marker = hero.querySelector('.center-mark');
  // Return from the hover split continuously before measuring the resting layout.
  if (window.gsap && !state.reducedMotion && !state.isMobile) {
    gsap.killTweensOf([selected, other, marker]);
    await gsap.to([selected,other], {width:'50%',duration:.22,ease:'power2.out',overwrite:true});
  }
  const header = document.querySelector('.site-header').offsetHeight;
  const locked = lockComposition(selected);
  if (window.gsap && !state.reducedMotion) {
    gsap.killTweensOf([selected, other, marker]);
    const bounds = hero.getBoundingClientRect();
    const frames = [selected, other].map(element => ({ element, rect: element.getBoundingClientRect() }));
    frames.forEach(({ element, rect }, index) => {
      gsap.set(element, { position: 'absolute', left: rect.left - bounds.left, top: rect.top - bounds.top, width: rect.width, height: rect.height, zIndex: index === 0 ? 2 : 1 });
    });
    gsap.set(hero, { height: bounds.height, minHeight: 0 });
    const timeline = gsap.timeline({ defaults: { duration: .85, ease: 'power3.inOut' } });
    timeline.to(hero, { height: innerHeight }, 0)
      .to(selected, { left: 0, top: header, width: hero.clientWidth, height: innerHeight - header }, 0)
      .to(locked.composition, {'--cover-left':`${locked.left}px`,'--cover-top':`${locked.top}px`}, 0)
      .to(other, { xPercent: world === 'art' ? 100 : -100, opacity: 0, duration: .65 }, 0)
      .to(marker, { opacity: 0, scale: .5, duration: .2 }, 0);
    await timeline;
  }
  locked.composition.style.setProperty('--cover-left',`${locked.left}px`);
  locked.composition.style.setProperty('--cover-top',`${locked.top}px`);
  hero.classList.add('is-journey-cover');
  other.hidden = true;
  marker.hidden = true;
  if (window.gsap) {
    gsap.set([selected, other, marker], { clearProps: 'all' });
    gsap.set(hero, { clearProps: 'height,minHeight' });
  }
}
