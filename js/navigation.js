import { state, syncPreferences, COMPACT_QUERY } from './state.js';
import { resetHero, expandHero } from './animations.js';
import { initArtScrollytelling, initDevScrollytelling, destroyScrollTriggers, nextPanel } from './scrollytelling.js';
import { updateThreeScene } from './three-scene.js';
import { bootLCD } from './lcd-display.js';
import { startScrollCue, armScrollCue, clearScrollCue } from './cursor.js';
const hero = () => document.querySelector('.hero-selector');
let homeSlot;
let syncNavigationMarker = () => {};
let restoring = false;
let savedView;
let scrollTimer;
const afterLayout = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

function captureView() {
  const view = { y: scrollY, width: innerWidth, height: innerHeight, world: state.activeWorld };
  const pin = window.ScrollTrigger?.getAll().find(trigger => trigger.pin && trigger.trigger?.matches('.scrolly:not([hidden])'));
  if (pin && scrollY >= pin.start && scrollY < pin.end) {
    return { ...view, journey: (scrollY - pin.start) / (pin.end - pin.start), panel: state.currentPanel };
  }
  const candidates = [...document.querySelectorAll('.scrolly:not([hidden]) .panel, #about, .about-chapter, .about-clients, .filmography, #contact')];
  const top = document.querySelector('.site-header').offsetHeight;
  const element = candidates.filter(node => {
    const bounds = node.getBoundingClientRect();
    return bounds.height && bounds.top <= top + 8 && bounds.bottom > top;
  }).pop();
  if (element) {
    view.target = element.id ? `#${element.id}` : element.matches('.panel')
      ? `.scrolly--${state.activeWorld} .panel:nth-child(${[...element.parentElement.children].indexOf(element) + 1})`
      : element.matches('.about-clients') ? '.about-clients' : '.filmography';
    view.fraction = (scrollY - (element.getBoundingClientRect().top + scrollY)) / Math.max(1, element.offsetHeight);
  }
  return view;
}
function rememberView() {
  if (restoring || state.transitionInProgress) return;
  savedView = captureView();
  history.replaceState({ ...history.state, portfolio: savedView }, '', location.href);
}
function pushLocation(hash) {
  history.pushState({ portfolio: captureView() }, '', hash);
  savedView = captureView();
}
async function restoreView(view, hash = location.hash) {
  restoring = true;
  const world = view?.world ?? (['#art', '#dev'].includes(hash) ? hash.slice(1) : null);
  if (world && state.activeWorld !== world) await selectWorld(world, false);
  else if (!world && state.activeWorld) resetToHome(false);
  await afterLayout();
  window.ScrollTrigger?.refresh();
  let top = view?.y;
  if (view && (view.width !== innerWidth || view.height !== innerHeight)) {
    const pin = window.ScrollTrigger?.getAll().find(trigger => trigger.pin && trigger.trigger?.matches('.scrolly:not([hidden])'));
    if (view.journey !== undefined && pin) top = pin.start + view.journey * (pin.end - pin.start);
    else {
      const element = view.target ? document.querySelector(view.target) : document.querySelector(`.scrolly--${world} .panel:nth-child(${(view.panel || 0) + 1})`);
      if (element) top = element.getBoundingClientRect().top + scrollY + (view.fraction || 0) * element.offsetHeight;
    }
  }
  if (top === undefined) {
    const element = document.getElementById(hash.slice(1));
    top = element && !['#art', '#dev', '#home'].includes(hash) ? element.getBoundingClientRect().top + scrollY - document.querySelector('.site-header').offsetHeight : 0;
  }
  window.scrollTo({ top, behavior: 'instant' });
  window.ScrollTrigger?.update();
  await afterLayout();
  restoring = false;
  rememberView();
}
export async function restoreInitialNavigation() {
  await restoreView(history.state?.portfolio, location.hash);
}

function visitSection(target, hash) {
  rememberView();
  pushLocation(hash);
  target.scrollIntoView({ behavior: state.reducedMotion ? 'instant' : 'smooth' });
  target.tabIndex = -1; target.focus({ preventScroll: true });
}

function initSectionMarker() {
  const header = document.querySelector('.site-header');
  const links = [...header.querySelectorAll('nav a')];
  const about = document.querySelector('#about');
  const contact = document.querySelector('#contact');
  let marked;
  let observer;
  let headerHeight = -1;
  syncNavigationMarker = () => {
    if (state.transitionInProgress) return;
    const aboutBounds = about.getBoundingClientRect();
    const contactBounds = contact.getBoundingClientRect();
    const visible = bounds => bounds.top < innerHeight - 1 && bounds.bottom > headerHeight;
    // About includes its opening, five chapters and the entire filmography.
    // Keep it selected until its last visible portion passes under the header.
    const section = visible(aboutBounds) ? 'about' : visible(contactBounds) ? 'contact' : state.activeWorld;
    header.classList.toggle('is-digital',section==='dev');
    if (marked === section) return;
    marked = section;
    links.forEach(link => {
      if (link.hash === `#${section}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const observe = () => {
    const height = header.offsetHeight;
    if (height === headerHeight) return;
    headerHeight = height;
    observer?.disconnect();
    observer = new IntersectionObserver(syncNavigationMarker, {
      rootMargin: `-${headerHeight}px 0px -1px 0px`, threshold: 0
    });
    observer.observe(about); observer.observe(contact);
    syncNavigationMarker();
  };
  observe();
  // Follow viewport/section geometry without adding a scroll ticker.
  new ResizeObserver(observe).observe(header);
  window.ScrollTrigger?.addEventListener('refresh', syncNavigationMarker);
}
function restoreHero() {
  homeSlot.after(hero());
  resetHero();
}
function updateNavigation() {
  document.querySelector('.world-indicator').textContent = state.activeWorld === 'art' ? 'ART →     PROPS' : state.activeWorld === 'dev' ? 'ART     PROPS →' : 'ART / PROPS →';
  syncNavigationMarker();
  document.querySelector('.scroll-progress').hidden = !state.activeWorld;
  document.querySelector('.scroll-progress').dataset.world = state.activeWorld || 'art';
}
function focusScene(section) {
  const heading = section.querySelector('.world:not([hidden]) h1, .world:not([hidden]) h2') || section.querySelector('h2');
  heading.tabIndex = -1; heading.focus({ preventScroll: true });
}
export async function selectWorld(world, updateHash = true, source = null) {
  if (!['art', 'dev'].includes(world) || state.transitionInProgress) return;
  if (state.activeWorld === world) {
    if (source?.closest('.hero-selector')) nextPanel();
    else window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  if (updateHash) rememberView();
  state.transitionInProgress = true;
  document.querySelector('.site-header').classList.toggle('is-digital',world==='dev');
  document.body.classList.add('is-transitioning');
  if (source?.querySelector('.lcd-display')) await bootLCD(source);
  destroyScrollTriggers();
  if (state.activeWorld) restoreHero();
  document.querySelectorAll('.scrolly').forEach(s => { s.hidden = true; if (window.gsap) gsap.set(s, { clearProps: 'transform,opacity' }); });
  // A previous pin can still have its scroll position cached until the next frame.
  window.ScrollTrigger?.clearScrollMemory();
  window.scrollTo({ top: 0, behavior: 'instant' });
  hero().hidden = false;
  const selectedSection = document.querySelector(`.scrolly--${world}`);
  await expandHero(world, () => {
    state.activeWorld = world;
    state.scrollProgress = 0;
    state.currentPanel = 0;
    selectedSection.querySelector('.panel--hero').prepend(hero());
    selectedSection.hidden = false;
    syncPreferences();
    updateNavigation();
    updateThreeScene(world);
    (world === 'art' ? initArtScrollytelling : initDevScrollytelling)();
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.ScrollTrigger?.update();
    startScrollCue(world);
  });
  document.body.classList.remove('is-transitioning');
  state.transitionInProgress = false;
  // Measure downstream chapters after the cover has finished changing layout.
  window.ScrollTrigger?.refresh();
  syncNavigationMarker();
  armScrollCue();
  focusScene(selectedSection);
  if (updateHash) pushLocation(`#${world}`);
}
export function resetToHome(updateHash = true) {
  if (state.transitionInProgress) return;
  if (updateHash) rememberView();
  if (window.gsap) clearScrollCue();
  destroyScrollTriggers();
  restoreHero();
  document.querySelectorAll('.scrolly').forEach(section => { section.hidden = true; });
  hero().hidden = false;
  Object.assign(state, { activeWorld: null, hoveredWorld: null, scrollProgress: 0, currentPanel: 0 });
  updateNavigation(); updateThreeScene(null);
  window.ScrollTrigger?.refresh();
  window.scrollTo({ top: 0, behavior: 'instant' });
  syncNavigationMarker();
  if (updateHash) pushLocation('#home');
  document.querySelector('.wordmark').focus({ preventScroll: true });
}
export function initNavigation() {
  history.scrollRestoration = 'manual';
  homeSlot = document.createComment('Home cover returns here between journeys');
  hero().before(homeSlot);
  initSectionMarker();
  document.querySelectorAll('[data-world]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (state.transitionInProgress) return;
    if (link.classList.contains('is-descending')) {
      const about = document.querySelector('#about');
      visitSection(about, '#about');
    } else selectWorld(link.dataset.world, true, link);
  }));
  document.querySelector('.wordmark').addEventListener('click', event => { event.preventDefault(); resetToHome(); });
  document.querySelector('.next-panel').addEventListener('click', nextPanel);
  document.querySelectorAll('.site-header nav a:not([data-world]), [data-about]').forEach(link => link.addEventListener('click', event => {
    if (state.transitionInProgress) { event.preventDefault(); return; }
    event.preventDefault();
    const target = document.querySelector(link.hash);
    visitSection(target, link.hash);
  }));
  window.addEventListener('popstate', event => { restoreView(event.state?.portfolio); });
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(rememberView, 120);
  }, { passive: true });
  window.addEventListener('pagehide', rememberView);
  [COMPACT_QUERY, '(min-height: 600px)', '(prefers-reduced-motion: reduce)'].forEach(query => matchMedia(query).addEventListener('change', () => {
    const view = savedView || captureView();
    destroyScrollTriggers(); syncPreferences();
    if (!state.activeWorld) resetHero();
    if (state.activeWorld) (state.activeWorld === 'art' ? initArtScrollytelling : initDevScrollytelling)();
    updateThreeScene(state.activeWorld);
    restoreView(view);
  }));
}
