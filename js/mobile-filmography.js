import { COMPACT_QUERY } from './state.js';

export function initMobileFilmography({ section, stage, viewport, body, rows, carousel, setNavigation }) {
  const gsap = window.gsap;
  const media = gsap.matchMedia();
  media.add({ mobile: COMPACT_QUERY }, context => {
    if (!context.conditions.mobile) return;
    // Mobile trial: browsing posters never changes the page's scroll position.
    const pinned = false;
    section.classList.add('is-mobile-credits');
    section.classList.toggle('is-mobile-pinned', pinned);
    const list = document.createElement('details');
    list.className = 'mobile-credits-list';
    const summary = document.createElement('summary');
    summary.textContent = 'VIEW ALL 13 CREDITS';
    list.append(summary, viewport);
    section.querySelector('.credits-frame').after(list);
    const hint = document.createElement('span');
    hint.className = 'poster-gesture-hint';
    hint.textContent = pinned ? 'SCROLL ↓ / SWIPE ↔' : 'SWIPE TO EXPLORE ↔';
    carousel.element.querySelector('.poster-eyebrow').prepend(hint);
    let active = -1;
    const show = index => {
      if (index === active) return;
      carousel.show(index, active < 0);
      active = index;
    };
    show(0);
    setNavigation(show);
    const refresh = () => ScrollTrigger.refresh();
    list.addEventListener('toggle', refresh);
    return () => {
      list.removeEventListener('toggle', refresh);
      body.prepend(viewport);
      list.remove(); hint.remove();
      setNavigation(null);
      carousel.reset();
      section.classList.remove('is-mobile-credits', 'is-mobile-pinned');
    };
  });
}
