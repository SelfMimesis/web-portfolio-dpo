export const state = { activeWorld: null, hoveredWorld: null, scrollProgress: 0, currentPanel: 0, transitionInProgress: false, isMobile: false, reducedMotion: false };
export function syncPreferences() {
  state.isMobile = matchMedia('(max-width: 700px)').matches;
  state.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.toggle('vertical-mode', state.isMobile || state.reducedMotion || !window.ScrollTrigger || !window.gsap);
}
