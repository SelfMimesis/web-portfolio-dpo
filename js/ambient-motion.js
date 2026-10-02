// One visibility gate for existing decorative CSS loops. No additional clock.
export function initAmbientMotion() {
  const elements = [...document.querySelectorAll('.flight-deck, .portrait-card')];
  const visible = new Set();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => elements.forEach(element => {
    element.classList.toggle('ambient-running', visible.has(element) && !document.hidden && !motion.matches);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > .05) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    sync();
  }, { threshold: [0, .05] });
  elements.forEach(element => observer.observe(element));
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  // This app initializes once. Also release observers if it leaves the document.
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
  }, { once: true });
}
