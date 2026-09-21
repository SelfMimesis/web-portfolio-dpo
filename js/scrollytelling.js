import { state } from './state.js';
import { animateMobileChapter } from './mobile-story.js';
import { setWorldLinkDescent, setWorldLinkPause } from './world-links.js';
import { createDevSceneTimelines } from './scene-timelines.js';
let context;
let observer;
let animation;
let mobileCleanup = [];
let horizontalDistance = 0;
let scenes;
let progressUI;
let panels = [];
let previousPanel = -1;
const endPause = () => Math.min(1100, Math.max(600, innerHeight * .95));
const names = { art: ['COVER', 'INTRO', 'SELECTED WORK', 'PROJECT DETAIL', 'PROCESS', 'ARCHIVE', 'NEXT WORLD'], dev: ['COVER', 'INTRO', 'SELECTED WORK', 'INTERACTION', 'PLAYBACK', 'ARCHIVE', 'NEXT WORLD'] };
const lastPanel = () => names[state.activeWorld].length - 1;
export function updateProgress(progress) {
  state.scrollProgress = progress;
  state.currentPanel = Math.min(lastPanel(), Math.round(progress * lastPanel()));
  progressUI.line.style.transform = `scaleX(${progress})`;
  if (previousPanel === state.currentPanel) return;
  previousPanel = state.currentPanel;
  progressUI.index.textContent = String(state.currentPanel + 1).padStart(2, '0');
  progressUI.title.textContent = names[state.activeWorld]?.[state.currentPanel] || 'INTRO';
  panels.forEach((panel, i) => {
    panel.classList.toggle('is-active', i === state.currentPanel);
    // Offscreen controls must not move the pinned track when focused.
    panel.inert = !document.body.classList.contains('vertical-mode') && i !== state.currentPanel;
  });
}
function initScrollytelling(world) {
  const section = document.querySelector(`.scrolly--${world}`);
  const track = section.querySelector('.horizontal-track');
  panels = [...track.children]; previousPanel = -1;
  progressUI = { index: document.querySelector('.progress-index'), title: document.querySelector('.progress-title'), line: document.querySelector('.progress-line i') };
  document.querySelector('.progress-world').textContent = world === 'art' ? 'ART →' : 'DIGITAL PROPS →';
  updateProgress(0);
  if (document.body.classList.contains('vertical-mode')) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      // Pinning wraps the last article in a spacer: use the original article list.
      const index = panels.indexOf(entry.target);
      if (entry.isIntersecting && index >= 0) updateProgress(index / lastPanel());
    }), { threshold: .45 });
    panels.forEach(panel => observer.observe(panel));
    if (window.gsap && window.ScrollTrigger) {
      context = gsap.context(() => {
        if (!state.reducedMotion && world === 'dev') {
          scenes = createDevSceneTimelines(section, { mobile: true });
          panels.slice(0, 3).forEach((panel, index) => ScrollTrigger.create({
            trigger: panel, start: index === 0 ? 'top top' : 'top bottom', end: 'bottom top',
            onUpdate: self => scenes?.updatePanel(index, index === 0 ? .5 + self.progress * .5 : self.progress),
            onRefresh: self => scenes?.updatePanel(index, index === 0 ? .5 + self.progress * .5 : self.progress)
          }));
        }
        if (!state.reducedMotion) mobileCleanup = panels.filter((panel, i) => !panel.classList.contains('panel--hero') && !(world === 'dev' && i < 3)).map(panel => animateMobileChapter(
          panel, '.art-composition, .dev-composition, .process-board, .workflow, .system-diagram',
          'h2, p, .intro-tags, .project-meta, .archive-entry, .tool-list details'
        ));
        const finalPanel = track.lastElementChild;
        const canPin = !state.reducedMotion && finalPanel.offsetHeight <= innerHeight + 1;
        ScrollTrigger.create({
          trigger: finalPanel, start: 'bottom bottom', end: () => `+=${canPin ? endPause() : 1}`,
          pin: canPin ? finalPanel : false, refreshPriority: 90, invalidateOnRefresh: true,
          onUpdate: self => { setWorldLinkPause(section, self.progress, canPin); setWorldLinkDescent(section, self.progress >= 1); },
          onRefresh: self => { setWorldLinkPause(section, self.progress, canPin); setWorldLinkDescent(section, self.progress >= 1, true); }
        });
      }, section);
    }
    refreshScrollTriggers();
    return;
  }
  context = gsap.context(() => {
    if (world === 'dev') scenes = createDevSceneTimelines(section);
    let travelFraction = 1;
    const distance = () => {
      track.style.setProperty('--panel-width', `${section.clientWidth}px`);
      horizontalDistance = Math.max(0, track.scrollWidth - section.clientWidth);
      travelFraction = horizontalDistance / (horizontalDistance + endPause());
      return horizontalDistance;
    };
    distance();
    const updatePause = self => setWorldLinkPause(section, (self.progress - travelFraction) / (1 - travelFraction));
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
        onUpdate: self => { updatePause(self); setWorldLinkDescent(section, self.progress >= 1); },
        onRefresh: self => {
          document.querySelector('.scroll-progress').hidden = !self.isActive;
          updatePause(self);
          setWorldLinkDescent(section, self.progress >= 1, true);
        }
      },
      onUpdate() {
        const progress = Math.min(1, this.progress() / travelFraction);
        updateProgress(progress); scenes?.update(progress);
      }
    });
    scenes?.update(0);
  }, section);
  refreshScrollTriggers();
}
export function initArtScrollytelling() { initScrollytelling('art'); }
export function initDevScrollytelling() { initScrollytelling('dev'); }
export function destroyScrollTriggers() {
  scenes?.destroy(); scenes = null;
  context?.revert(); context = null; animation = null;
  mobileCleanup.forEach(remove => remove()); mobileCleanup = [];
  observer?.disconnect(); observer = null;
  document.querySelectorAll('.scrolly').forEach(section => { setWorldLinkDescent(section, false, true); setWorldLinkPause(section, 0, false); });
  document.querySelectorAll('.panel').forEach(panel => { panel.inert = false; });
  document.querySelectorAll('.horizontal-track').forEach(track => track.style.removeProperty('--panel-width'));
  panels = []; previousPanel = -1;
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
