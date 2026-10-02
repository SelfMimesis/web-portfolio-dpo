import { state } from './state.js';
import { animateMobileChapter } from './mobile-story.js';
import { setWorldLinkDescent, setWorldLinkPause } from './world-links.js';
import { createDevSceneTimelines } from './scene-timelines.js';
import { createMuybridgeIntro, MUYBRIDGE_CONFIG } from './muybridge-intro.js';
import { createGraphicProps, GRAPHIC_PROPS_CONFIG } from './graphic-props.js';
import { createSelectedFilms, filmHoldDistance } from './selected-films.js';

let context;
let observer;
let animation;
let mobileCleanup = [];
let horizontalDistance = 0;
let openingPause = 0;
let servicePause = 0;
let universePause = 0;
let funPause = 0;
let introPause = 0;
let artIntro;
let graphicProps;
let graphicStoryPause = 0;
let graphicFinalPause = 0;
let selectedFilms;
let filmPauses = [];
let filmPauseTotal = 0;

let scenes;
let progressUI;
let panels = [];
let panelOffsets = [];
let panelWidth = 0;
let vertical = false;
let previousPanel = -1;
const endPause = () => Math.min(1100, Math.max(600, innerHeight * .95));
const names = { art: ['MOTION / PAPER STORIES', 'GRAPHIC PROPS', 'SELECTED FILMS / VÍRGENES', 'NEXT WORLD'], dev: ['COVER', 'ONSET PLAYBACK', 'INTERFACES', 'LETS HAVE FUN', 'NEXT WORLD'] };
const lastPanel = () => names[state.activeWorld].length - 1;
export function updateProgress(progress) {
  state.scrollProgress = progress;
  state.currentPanel = Math.min(lastPanel(), Math.round(progress * lastPanel()));
  if(!vertical&&panelOffsets.length){
    const x=progress*horizontalDistance;
    state.currentPanel=panelOffsets.reduce((best,offset,i)=>Math.abs(offset-x)<Math.abs(panelOffsets[best]-x)?i:best,0);
  }
  progressUI.line.style.transform = `scaleX(${progress})`;
  if (previousPanel === state.currentPanel) return;
  previousPanel = state.currentPanel;
  progressUI.index.textContent = String(state.currentPanel + 1).padStart(2, '0');
  progressUI.title.textContent = names[state.activeWorld]?.[state.currentPanel] || 'INTRO';
  panels.forEach((panel, i) => {
    panel.classList.toggle('is-active', i === state.currentPanel);
    // Offscreen controls must not move the pinned track when focused.
    panel.inert = !vertical && i !== state.currentPanel;
  });
}
function initScrollytelling(world) {
  const section = document.querySelector(`.scrolly--${world}`);
  const track = section.querySelector('.horizontal-track');
  panels = [...track.children]; previousPanel = -1;
  vertical = document.body.classList.contains('vertical-mode');
  document.querySelector('.progress-total').textContent = String(panels.length).padStart(2, '0');
  progressUI = { index: document.querySelector('.progress-index'), title: document.querySelector('.progress-title'), line: document.querySelector('.progress-line i') };
  document.querySelector('.progress-world').textContent = world === 'art' ? 'ART →' : 'DIGITAL PROPS →';
  updateProgress(0);
  if (world === 'art') artIntro = createMuybridgeIntro(section, {
    vertical,
    seekBeat: index => {
      const trigger = animation?.scrollTrigger;
      const start = MUYBRIDGE_CONFIG.beatStarts[index];
      const end = MUYBRIDGE_CONFIG.beatStarts[index + 1] ?? 1;
      if (trigger) window.scrollTo({ top: trigger.start + introPause * (start + (end - start) * .45), behavior: 'instant' });
    },
    explore: () => {
      const trigger = animation?.scrollTrigger;
      if (trigger) window.scrollTo({ top: trigger.start + introPause + graphicStoryPause * .16, behavior: 'smooth' });
      else section.querySelector('.graphic-story').scrollIntoView({ behavior: state.reducedMotion ? 'instant' : 'smooth' });
    }
  });
  if (world === 'art') graphicProps = createGraphicProps(section, {
    vertical, reducedMotion: state.reducedMotion,
    seekFinal: progress => {
      const trigger = animation?.scrollTrigger;
      if (trigger) window.scrollTo({ top: trigger.start + introPause + graphicStoryPause + panelWidth + graphicFinalPause * progress, behavior: 'smooth' });
    }
  });
  if (world === 'art') selectedFilms = createSelectedFilms(section, {
    vertical, reducedMotion: state.reducedMotion,
    seekFilm: progress => {
      const trigger = animation?.scrollTrigger, pause = filmPauses[0];
      if (trigger && pause) window.scrollTo({ top: trigger.start + pause.start + pause.length * progress, behavior: 'smooth' });
    }
  });
  if (vertical) {
    // Tall chapters may never occupy 45% of their own height on a phone.
    // Follow the reading line instead of the proportion of the whole chapter.
    let progressFrame;
    const measureProgress = () => {
      progressFrame = null;
      const readingLine = document.querySelector('.site-header').offsetHeight + innerHeight * .2;
      let index = 0;
      panels.forEach((panel, i) => { if (panel.getBoundingClientRect().top <= readingLine) index = i; });
      updateProgress(index / lastPanel());
    };
    const scheduleProgress = () => { progressFrame ??= requestAnimationFrame(measureProgress); };
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    observer = { disconnect() { window.removeEventListener('scroll', scheduleProgress); cancelAnimationFrame(progressFrame); } };
    measureProgress();
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
        if (!state.reducedMotion) mobileCleanup = panels.filter((panel, i) => !panel.classList.contains('film-journey') && !panel.classList.contains('panel--hero') && !panel.classList.contains('panel--muybridge') && !panel.classList.contains('panel--graphic-finale') && !(world === 'dev' && i < 3)).map(panel => animateMobileChapter(
          panel, '.art-composition, .dev-composition, .process-board, .workflow, .system-diagram',
          'h2, p, .intro-tags, .project-meta, .archive-entry, .tool-list details'
        ));
        const finalPanel = track.lastElementChild;
        // On mobile the full-width destination follows the editorial introduction.
        // Hold only the button, so the introduction remains in normal vertical flow.
        const pauseTarget = state.isMobile ? finalPanel.querySelector('.world-link') : finalPanel;
        const headerHeight = () => state.isMobile ? document.querySelector('.site-header').offsetHeight : 0;
        const canPin = !state.reducedMotion && (!state.isMobile || innerHeight >= 600) && pauseTarget.offsetHeight <= innerHeight - headerHeight() + 1;
        ScrollTrigger.create({
          trigger: pauseTarget, start: canPin && state.isMobile ? () => `top top+=${headerHeight()}` : 'bottom bottom', end: () => `+=${canPin ? endPause() : 1}`,
          pin: canPin ? pauseTarget : false, pinSpacing: true, refreshPriority: 90, invalidateOnRefresh: true,
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
    let totalDistance = 1;
    let serviceStart = 0;
    let universeStart = 0;
    let funStart = 0;
    const clamp = value => Math.max(0,Math.min(1,value));
    const travel = progress => {
      const offset=progress*totalDistance-openingPause;
      const held=servicePause ? Math.max(0,Math.min(servicePause,offset-serviceStart)) : 0;
      const universeHeld=universePause ? Math.max(0,Math.min(universePause,offset-servicePause-universeStart)) : 0;
      const funHeld=funPause ? Math.max(0,Math.min(funPause,offset-servicePause-universePause-funStart)) : 0;
      const introHeld = introPause ? Math.max(0, Math.min(introPause, offset)) : 0;

      const storyHeld = Math.max(0, Math.min(graphicStoryPause, offset - introPause));
      const finalHeld = Math.max(0, Math.min(graphicFinalPause, offset - introPause - graphicStoryPause - panelWidth));
      const filmsHeld = filmPauses.reduce((sum, pause) => sum + Math.max(0, Math.min(pause.length, progress * totalDistance - pause.start)), 0);
      return clamp((offset-held-universeHeld-funHeld-introHeld-storyHeld-finalHeld-filmsHeld)/horizontalDistance);
    };
    const distance = () => {
      // Geometry changes on refresh/resize, not on every scroll frame.
      panelWidth = section.clientWidth;
      track.style.setProperty('--panel-width', `${panelWidth}px`);
      horizontalDistance = Math.max(0, track.scrollWidth - panelWidth);
      panelOffsets = panels.map(panel => panel.offsetLeft);
      openingPause = world === 'dev' ? Math.max(600, innerHeight * .9) : 0;
      serviceStart = panelWidth;
      const serviceCount=section.querySelectorAll('.playback-service').length;
      servicePause = world === 'dev' ? Math.max(serviceCount*700,innerHeight*(serviceCount+.4)) : 0;
      universeStart = panelWidth * 1.5;
      funStart = panelOffsets[panels.findIndex(panel => panel.classList.contains('panel--fun'))] || panelWidth * 3;
      universePause = world === 'dev' ? Math.max(7000,innerHeight*10.5) : 0;
      funPause = world === 'dev' ? Math.max(3500,innerHeight*4.5)*2 : 0;
      introPause = world === 'art' ? MUYBRIDGE_CONFIG.scrollDistance() : 0;
      graphicStoryPause = world === 'art' ? GRAPHIC_PROPS_CONFIG.storyDistance() : 0;
      graphicFinalPause = world === 'art' ? GRAPHIC_PROPS_CONFIG.finalDistance() : 0;
      filmPauseTotal = 0;
      filmPauses = world === 'art' ? panels.filter(panel => panel.classList.contains('film-journey')).map(panel => {
        const pause = { start: introPause + graphicStoryPause + graphicFinalPause + panel.offsetLeft + filmPauseTotal, length: filmHoldDistance(panel), panel };
        filmPauseTotal += pause.length;
        return pause;
      }) : [];
      totalDistance = horizontalDistance + openingPause + servicePause + universePause + funPause + introPause + graphicStoryPause + graphicFinalPause + filmPauseTotal + endPause();
      return horizontalDistance;
    };
    distance();
    const updatePause = self => setWorldLinkPause(section, (self.progress*totalDistance-openingPause-servicePause-universePause-funPause-introPause-graphicStoryPause-graphicFinalPause-filmPauseTotal-horizontalDistance)/endPause());
    animation = gsap.fromTo(track, { x: 0 }, {
      x: () => -distance(),
      // Finish the journey before releasing the pin: the remaining scroll is a reading pause.
      ease: travel,
      // Created after About: measure this upstream pin first, including its spacing.
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${distance() + openingPause + servicePause + universePause + funPause + introPause + graphicStoryPause + graphicFinalPause + filmPauseTotal + endPause()}`,
        pin: section.querySelector('.scrolly-sticky'), scrub: .75,
        invalidateOnRefresh: true, refreshPriority: 100,
        onToggle: self => { document.querySelector('.scroll-progress').hidden = !self.isActive; },
        onUpdate: self => { updatePause(self); setWorldLinkDescent(section, self.progress >= 1); },
        onRefresh: self => {
          artIntro?.refresh();
          graphicProps?.refresh();
          selectedFilms?.refresh();
          document.querySelector('.scroll-progress').hidden = !self.isActive;
          updatePause(self);
          setWorldLinkDescent(section, self.progress >= 1, true);
        }
      },
      onUpdate() {
        const progress = travel(this.progress());
        scenes?.updateCover(openingPause ? this.progress()*totalDistance/openingPause : 1);
        artIntro?.update(clamp(this.progress() * totalDistance / introPause));
        graphicProps?.update((this.progress() * totalDistance - introPause) / graphicStoryPause);
        graphicProps?.updateFinal((this.progress() * totalDistance - introPause - graphicStoryPause - panelWidth) / graphicFinalPause);
        filmPauses.forEach((pause, index) => selectedFilms?.update(index, (this.progress() * totalDistance - pause.start) / pause.length));

        updateProgress(progress); scenes?.update(progress*horizontalDistance/(panelWidth*(panels.length-1)));
        scenes?.updateServices(servicePause ? clamp((this.progress()*totalDistance-openingPause-serviceStart)/servicePause) : 0);
        scenes?.updateUniverse(universePause ? clamp((this.progress()*totalDistance-openingPause-servicePause-universeStart)/universePause) : 0);
        const funHeld=funPause ? clamp((this.progress()*totalDistance-openingPause-servicePause-universePause-funStart)/funPause) : 0;
        const funArrival=clamp((progress*horizontalDistance-funStart+panelWidth)/panelWidth);
        scenes?.updateFun(funPause ? funArrival*.32+clamp(funHeld*2)*.68 : 0,clamp((funHeld-.45)/.55));
      }
    });
    scenes?.update(0);
  }, section);
  refreshScrollTriggers();
}
export function initArtScrollytelling() { initScrollytelling('art'); }
export function initDevScrollytelling() { initScrollytelling('dev'); }
export function destroyScrollTriggers() {
  selectedFilms?.destroy(); selectedFilms = null; filmPauses = []; filmPauseTotal = 0;
  artIntro?.destroy(); artIntro = null;
  scenes?.destroy(); scenes = null;
  context?.revert(); context = null; animation = null;
  graphicProps?.destroy(); graphicProps = null;
  mobileCleanup.forEach(remove => remove()); mobileCleanup = [];
  observer?.disconnect(); observer = null;
  document.querySelectorAll('.scrolly').forEach(section => { setWorldLinkDescent(section, false, true); setWorldLinkPause(section, 0, false); });
  document.querySelectorAll('.panel').forEach(panel => { panel.inert = false; });
  document.querySelectorAll('.horizontal-track').forEach(track => track.style.removeProperty('--panel-width'));
  panels = []; panelOffsets = []; previousPanel = -1;
}
export function refreshScrollTriggers() { window.ScrollTrigger?.refresh(); }
export function nextPanel() {
  goToPanel(state.currentPanel + 1);
}
export function goToPanel(index) {
  const trigger = animation?.scrollTrigger;
  if (!trigger) {
    const panels = document.querySelectorAll('.scrolly:not([hidden]) .panel');
    (panels[index] || document.querySelector('#about'))?.scrollIntoView({ behavior: state.reducedMotion ? 'instant' : 'smooth' });
    return;
  }
  const next = index > lastPanel()
    ? document.querySelector('#about').getBoundingClientRect().top + window.scrollY - document.querySelector('.site-header').offsetHeight
    : trigger.start + openingPause + (index>=1?introPause+graphicStoryPause:0) + (index>=2?graphicFinalPause:0) + filmPauses.filter(pause => panels.indexOf(pause.panel) < index).reduce((sum, pause) => sum + pause.length, 0) + (index>=2?servicePause+universePause:0) + (index===3?funPause*.4:index>3?funPause:0) + panels[index].offsetLeft;
  window.scrollTo({ top: next, behavior: state.reducedMotion ? 'instant' : 'smooth' });
}
