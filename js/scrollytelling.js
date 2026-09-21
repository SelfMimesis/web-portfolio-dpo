import { state } from './state.js';
import { animateMobileChapter } from './mobile-story.js';
import { setWorldLinkDescent } from './world-links.js';
let context;
let observer;
let animation;
let mobileCleanup = [];
let horizontalDistance = 0;
const endPause = () => Math.min(520, Math.max(260, innerHeight * .48));
const names = { art: ['COVER', 'INTRO', 'SELECTED WORK', 'PROJECT DETAIL', 'PROCESS', 'ARCHIVE', 'NEXT WORLD'], dev: ['COVER', 'INTRO', 'SELECTED WORK', 'INTERACTION', 'PLAYBACK', 'ARCHIVE', 'NEXT WORLD'] };
const lastPanel = () => names[state.activeWorld].length - 1;
export function updateProgress(progress) {
  state.scrollProgress = progress;
  state.currentPanel = Math.min(lastPanel(), Math.round(progress * lastPanel()));
  document.querySelector('.progress-index').textContent = String(state.currentPanel + 1).padStart(2, '0');
  document.querySelector('.progress-title').textContent = names[state.activeWorld]?.[state.currentPanel] || 'INTRO';
  document.querySelector('.progress-line i').style.transform = `scaleX(${progress})`;
  document.querySelectorAll('.scrolly:not([hidden]) .panel').forEach((panel, i) => {
    panel.classList.toggle('is-active', i === state.currentPanel);
    // Offscreen controls must not move the pinned track when focused.
    panel.inert = !document.body.classList.contains('vertical-mode') && i !== state.currentPanel;
  });
}
function initScrollytelling(world) {
  const section = document.querySelector(`.scrolly--${world}`);
  const track = section.querySelector('.horizontal-track');
  document.querySelector('.progress-world').textContent = world === 'art' ? 'ART →' : 'DIGITAL PROPS →';
  updateProgress(0);
  if (document.body.classList.contains('vertical-mode')) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) updateProgress([...track.children].indexOf(entry.target) / lastPanel());
    }), { threshold: .45 });
    [...track.children].forEach(panel => observer.observe(panel));
    if (window.gsap && window.ScrollTrigger) {
      context = gsap.context(() => {
        if (!state.reducedMotion) mobileCleanup = [...track.children].filter(panel => !panel.classList.contains('panel--hero')).map(panel => animateMobileChapter(
          panel, '.art-composition, .dev-composition, .process-board, .workflow, .system-diagram',
          'h2, p, .intro-tags, .project-meta, .archive-entry, .tool-list details'
        ));
        const finalPanel = track.lastElementChild;
        const canPin = !state.reducedMotion && finalPanel.offsetHeight <= innerHeight + 1;
        ScrollTrigger.create({
          trigger: finalPanel, start: 'bottom bottom', end: () => `+=${canPin ? endPause() : 1}`,
          pin: canPin ? finalPanel : false, refreshPriority: 90, invalidateOnRefresh: true,
          onUpdate: self => setWorldLinkDescent(section, self.progress >= 1),
          onRefresh: self => setWorldLinkDescent(section, self.progress >= 1, true)
        });
      }, section);
    }
    refreshScrollTriggers();
    return;
  }
  context = gsap.context(() => {
    let travelFraction = 1;
    const distance = () => {
      track.style.setProperty('--panel-width', `${section.clientWidth}px`);
      horizontalDistance = Math.max(0, track.scrollWidth - section.clientWidth);
      travelFraction = horizontalDistance / (horizontalDistance + endPause());
      return horizontalDistance;
    };
    distance();
    animation = gsap.fromTo(track, { x: 0 }, {
      x: () => -distance(),
      // Finish the journey before releasing the pin: the remaining scroll is a reading pause.
      ease: progress => Math.min(1, progress / travelFraction),
      // Created after About: measure this upstream pin first, including its spacing.
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${distance() + endPause()}`,
        pin: section.querySelector('.scrolly-sticky'), scrub: .75,
        invalidateOnRefresh: true, refreshPriority: 100,
        onToggle: self => { document.querySelector('.scroll-progress').hidden = !self.isActive; },
        onUpdate: self => setWorldLinkDescent(section, self.progress >= 1),
        onRefresh: self => {
          document.querySelector('.scroll-progress').hidden = !self.isActive;
          setWorldLinkDescent(section, self.progress >= 1, true);
        }
      },
      onUpdate() { updateProgress(Math.min(1, this.progress() / travelFraction)); }
    });
  }, section);
  refreshScrollTriggers();
}
export function initArtScrollytelling() { initScrollytelling('art'); }
export function initDevScrollytelling() { initScrollytelling('dev'); }
export function destroyScrollTriggers() {
  context?.revert(); context = null; animation = null;
  mobileCleanup.forEach(remove => remove()); mobileCleanup = [];
  observer?.disconnect(); observer = null;
  document.querySelectorAll('.scrolly').forEach(section => setWorldLinkDescent(section, false, true));
  document.querySelectorAll('.panel').forEach(panel => { panel.inert = false; });
  document.querySelectorAll('.horizontal-track').forEach(track => track.style.removeProperty('--panel-width'));
}
export function refreshScrollTriggers() { window.ScrollTrigger?.refresh(); }
export function nextPanel() {
  const trigger = animation?.scrollTrigger;
  if (!trigger) {
    const panels = document.querySelectorAll('.scrolly:not([hidden]) .panel');
    (panels[state.currentPanel + 1] || document.querySelector('#about'))?.scrollIntoView({ behavior: state.reducedMotion ? 'instant' : 'smooth' });
    return;
  }
  const next = state.currentPanel >= lastPanel()
    ? document.querySelector('#about').getBoundingClientRect().top + window.scrollY - document.querySelector('.site-header').offsetHeight
    : trigger.start + horizontalDistance * (state.currentPanel + 1) / lastPanel();
  window.scrollTo({ top: next, behavior: state.reducedMotion ? 'instant' : 'smooth' });
}
