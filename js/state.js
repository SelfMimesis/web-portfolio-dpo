// Temporary phone mode: keep vertical navigation after rotating a touch device.
export const COMPACT_QUERY = '(max-width: 700px), (pointer: coarse) and (max-width: 1024px)';
export const WIDE_QUERY = '(min-width: 701px) and (pointer: fine), (min-width: 1025px)';
export const state = { activeWorld: null, hoveredWorld: null, scrollProgress: 0, currentPanel: 0, transitionInProgress: false, isMobile: false, reducedMotion: false };
export function syncPreferences() {
  state.isMobile = matchMedia(COMPACT_QUERY).matches;
  state.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.toggle('vertical-mode', state.isMobile || state.reducedMotion || !window.ScrollTrigger || !window.gsap);
}
