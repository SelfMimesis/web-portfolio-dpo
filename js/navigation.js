import { state, syncPreferences } from './state.js';
import { resetHero, expandHero } from './animations.js';
import { initArtScrollytelling, initDevScrollytelling, destroyScrollTriggers, nextPanel } from './scrollytelling.js';
import { updateThreeScene } from './three-scene.js';
import { bootLCD } from './lcd-display.js';
import { startScrollCue, armScrollCue, clearScrollCue } from './cursor.js';
const hero = () => document.querySelector('.hero-selector');
let homeSlot;
let syncNavigationMarker = () => {};

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
  state.transitionInProgress = true;
  document.body.classList.add('is-transitioning');
  startScrollCue(world);
  if (source?.querySelector('.lcd-display')) await bootLCD(source);
  destroyScrollTriggers();
  if (state.activeWorld) restoreHero();
  document.querySelectorAll('.scrolly').forEach(s => { s.hidden = true; if (window.gsap) gsap.set(s, { clearProps: 'transform,opacity' }); });
  window.scrollTo({ top: 0, behavior: 'instant' });
  hero().hidden = false;
  await expandHero(world);
  state.activeWorld = world;
  state.scrollProgress = 0;
  state.currentPanel = 0;
  const selectedSection = document.querySelector(`.scrolly--${world}`);
  selectedSection.querySelector('.panel--hero').append(hero());
  selectedSection.hidden = false;
  syncPreferences();
  updateNavigation();
  updateThreeScene(world);
  document.body.classList.remove('is-transitioning');
  (world === 'art' ? initArtScrollytelling : initDevScrollytelling)();
  state.transitionInProgress = false;
  syncNavigationMarker();
  armScrollCue();
  focusScene(selectedSection);
  if (updateHash) history.pushState(null, '', `#${world}`);
}
export function resetToHome(updateHash = true) {
  if (state.transitionInProgress) return;
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
  if (updateHash) history.pushState(null, '', '#home');
  document.querySelector('.wordmark').focus({ preventScroll: true });
}
export function initNavigation() {
  homeSlot = document.createComment('Home cover returns here between journeys');
  hero().before(homeSlot);
  initSectionMarker();
  document.querySelectorAll('[data-world]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (state.transitionInProgress) return;
    if (link.classList.contains('is-descending')) {
      const about = document.querySelector('#about');
      about.scrollIntoView({ behavior: state.reducedMotion ? 'instant' : 'smooth' });
      about.tabIndex = -1; about.focus({ preventScroll: true });
      history.pushState(null, '', '#about');
    } else selectWorld(link.dataset.world, true, link);
  }));
  document.querySelector('.wordmark').addEventListener('click', event => { event.preventDefault(); resetToHome(); });
  document.querySelector('.next-panel').addEventListener('click', nextPanel);
  document.querySelectorAll('.site-header nav a:not([data-world]), [data-about]').forEach(link => link.addEventListener('click', event => {
    if (state.transitionInProgress) { event.preventDefault(); return; }
    event.preventDefault();
    const target = document.querySelector(link.hash);
    target.scrollIntoView({ behavior: state.reducedMotion ? 'instant' : 'smooth' });
    target.tabIndex = -1; target.focus({ preventScroll: true });
    history.pushState(null, '', link.hash);
  }));
  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1);
    if (['art', 'dev'].includes(hash)) selectWorld(hash, false);
    else if (!hash || hash === 'home') resetToHome(false);
    else document.getElementById(hash)?.scrollIntoView();
  });
  document.querySelector('.contact-button').addEventListener('click', event => {
    const note = document.querySelector('#contact-note'); note.hidden = !note.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!note.hidden));
  });
  ['(max-width: 700px)', '(min-height: 600px)', '(prefers-reduced-motion: reduce)'].forEach(query => matchMedia(query).addEventListener('change', () => {
    destroyScrollTriggers(); syncPreferences();
    if (!state.activeWorld) resetHero();
    if (state.activeWorld) (state.activeWorld === 'art' ? initArtScrollytelling : initDevScrollytelling)();
    updateThreeScene(state.activeWorld);
  }));
}
