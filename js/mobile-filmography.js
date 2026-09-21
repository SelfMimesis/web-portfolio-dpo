export function initMobileFilmography({ section, stage, viewport, body, rows, carousel, setNavigation }) {
  const gsap = window.gsap;
  const media = gsap.matchMedia();
  media.add({ mobile: '(max-width: 700px)', tall: '(min-height: 650px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions.mobile) return;
    const pinned = context.conditions.tall && context.conditions.motion;
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
    let trigger;
    const show = index => {
      if (index === active) return;
      carousel.show(index, active < 0);
      active = index;
    };
    show(0);
    setNavigation(index => {
      if (!trigger) { show(index); return; }
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * index / (rows.length - 1),
        behavior: 'smooth'
      });
    });
    if (pinned) {
      trigger = ScrollTrigger.create({
        trigger: stage,
        start: () => `top top+=${document.querySelector('.site-header').offsetHeight + 12}`,
        end: () => `+=${(rows.length - 1) * Math.max(280, innerHeight * .5)}`,
        pin: stage, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => show(Math.round(self.progress * (rows.length - 1))),
        onRefresh: self => show(Math.round(self.progress * (rows.length - 1)))
      });
    }
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
