import { createPosterCarousel } from './film-posters.js';
import { initMobileFilmography } from './mobile-filmography.js';

export function initFilmography() {
  const section = document.querySelector('.filmography');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  const rows = [...section.querySelectorAll('tbody tr')];
  const stage = section.querySelector('.credits-stage');
  // Animate inside the pin so its measured geometry never changes during the spring.
  const surface = document.createElement('div');
  surface.className = 'credits-surface';
  surface.append(...stage.childNodes);
  stage.append(surface);
  const viewport = section.querySelector('.credits-window');
  const table = section.querySelector('.credits-table');
  const reading = section.querySelector('.credits-reading');
  const count = reading.querySelector('.credits-reading-count');
  const date = reading.querySelector('.credits-reading-date');
  const fill = reading.querySelector('i');
  const paper = section.querySelector('.credits-paper');
  const body = document.createElement('div');
  body.className = 'credits-body';
  viewport.before(body);
  body.append(viewport);
  let scrollTween;
  let mobileNavigate;
  const carousel = createPosterCarousel(rows, index => {
    if (mobileNavigate) { mobileNavigate(index); return; }
    const trigger = scrollTween?.scrollTrigger;
    if (!trigger) return;
    const progress = index / (rows.length - 1);
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * progress, behavior: 'smooth' });
  });
  body.append(carousel.element);
  const indexRail = document.createElement('div');
  indexRail.className = 'credits-index';
  indexRail.setAttribute('aria-hidden', 'true');
  indexRail.innerHTML = rows.map((_, i) => `<span>${String(i + 1).padStart(2, '0')}<i></i></span>`).join('');
  paper.append(indexRail);
  const cells = rows.map(row => [...row.children].map(cell => {
    const content = document.createElement('div');
    content.className = 'credit-cell';
    while (cell.firstChild) content.append(cell.firstChild);
    cell.append(content);
    return content;
  }));
  const media = gsap.matchMedia();
  media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
    reading.hidden = false;
    section.classList.add('is-pinned-credits');
    let active = -1;
    let rowCenters = [];
    let travel = 0;
    let windowHeight = 0;
    let targets = [];
    let labelTween;
    const railItems = [...indexRail.children];
    const railSetters = railItems.map(item => gsap.quickSetter(item.querySelector('i'), 'scaleX'));
    const setters = cells.map(items => items.map(cell => ({
      opacity: gsap.quickSetter(cell, 'opacity'),
      x: gsap.quickSetter(cell, 'x', 'px'),
      y: gsap.quickSetter(cell, 'y', 'px')
    })));
    const pinOffset = () => {
      const header = document.querySelector('.site-header').offsetHeight;
      return header + Math.max(16, (window.innerHeight - header - stage.offsetHeight) / 2);
    };
    const distance = () => Math.max(0, table.offsetHeight - viewport.clientHeight);
    const measure = () => {
      // Offset geometry is independent of the paper's entrance scale.
      rowCenters = rows.map(row => row.offsetTop + row.offsetHeight / 2);
      travel = distance();
      windowHeight = viewport.clientHeight;
      targets = rowCenters.map(center => Math.max(0, Math.min(travel, center - windowHeight * .45)));
    };
    const update = progress => {
      fill.style.transform = `scaleX(${progress})`;
      const position = progress * (rows.length - 1);
      const lower = Math.min(rows.length - 1, Math.floor(position));
      const upper = Math.min(rows.length - 1, lower + 1);
      const phase = position - lower;
      const offset = targets[lower] + (targets[upper] - targets[lower]) * phase;
      gsap.set(table, { y: -offset });
      const target = offset + windowHeight * .45;
      setters.forEach((items, i) => {
        const proximity = Math.max(0, 1 - Math.abs(rowCenters[i] - target) / (windowHeight * .72));
        const entry = Math.max(0, Math.min(1, (rowCenters[i] - offset - windowHeight * .72) / (windowHeight * .35)));
        items.forEach((set, column) => {
          set.opacity(.78 + proximity * .22);
          set.x(entry * (column + 1) * 9);
          set.y(entry * (column + 1) * 4);
        });
        railSetters[i](.25 + proximity * .75);
      });
      const index = Math.min(rows.length - 1, Math.round(position));
      if (index === active) return;
      carousel.show(index, active < 0);
      active = index;
      rows.forEach((row, i) => row.classList.toggle('is-reading', i === index));
      railItems.forEach((item, i) => item.classList.toggle('is-current', i === index));
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${rows.length}`;
      date.textContent = rows[index].querySelector('td').textContent.match(/\d{4}/)?.[0] || '';
      labelTween?.kill();
      labelTween = gsap.fromTo([date, count], { y: 8, opacity: .3 }, {
        y: 0, opacity: 1, duration: .35, stagger: .06, ease: 'power2.out'
      });
    };
    measure();
    const entrance = gsap.timeline({
      scrollTrigger: { trigger: stage, start: 'top 92%', end: () => `top top+=${pinOffset()}`, scrub: .5, invalidateOnRefresh: true }
    });
    entrance.fromTo(paper, { scale: .965, rotation: .5, opacity: .65 }, { scale: 1, rotation: 0, opacity: 1, ease: 'none' })
      .fromTo(reading, { y: 16, opacity: .4 }, { y: 0, opacity: 1, ease: 'none' }, 0)
      .fromTo(section.querySelectorAll('.credits-paper-meta span'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: .08 }, .1)
      .fromTo(railItems, { x: -8, opacity: 0 }, { x: 0, opacity: 1, stagger: .018, ease: 'power2.out' }, .15);
    const playhead = { progress: 0 };
    scrollTween = gsap.to(playhead, {
      progress: 1, ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: () => `top top+=${pinOffset()}`,
        end: () => `+=${Math.max((rows.length - 1) * 180, distance() * 1.3)}`,
        pin: stage, scrub: .5, invalidateOnRefresh: true,
        onRefresh: self => { measure(); update(self.animation?.progress() || 0); }
      },
      onUpdate() { update(playhead.progress); }
    });
    update(0);
    return () => {
      reading.hidden = true;
      carousel.reset();
      scrollTween = null;
      labelTween?.kill();
      gsap.set(table, { clearProps: 'transform' });
      gsap.set(cells.flat(), { clearProps: 'transform,opacity' });
      gsap.set([date, count], { clearProps: 'transform,opacity' });
      railItems.forEach(item => item.classList.remove('is-current'));
      gsap.set(railItems.map(item => item.querySelector('i')), { clearProps: 'transform' });
      section.classList.remove('is-pinned-credits');
      fill.style.removeProperty('transform');
      rows.forEach(row => row.classList.remove('is-reading'));
    };
  });
  initMobileFilmography({ section, stage, viewport, body, rows, carousel, setNavigation: navigate => { mobileNavigate = navigate; } });
  media.add('(prefers-reduced-motion: no-preference) and (min-height: 650px)', () => {
    let expansion;
    let expanded;
    const compactScale = () => innerWidth > 700 ? .88 : .96;
    // Underdamped spring: a restrained overshoot, then a smooth physical settle.
    const spring = t => t === 1 ? 1 : 1 - Math.exp(-8 * t) * (Math.cos(12 * t) + (8 / 12) * Math.sin(12 * t));
    const expand = (active, immediate = false) => {
      if (expanded === active && !immediate) return;
      expanded = active;
      expansion?.kill();
      expansion = gsap.to(surface, {
        scale: active ? 1 : compactScale(), y: active ? 0 : 14,
        rotationX: active ? 0 : 2.5, transformPerspective: 1200,
        duration: immediate ? 0 : active ? 1.35 : .65,
        ease: active ? spring : 'power3.inOut', overwrite: 'auto'
      });
    };
    ScrollTrigger.create({
      trigger: section.querySelector('.filmography-heading'),
      start: () => `bottom top+=${document.querySelector('.site-header').offsetHeight}`,
      onEnter: () => expand(true), onLeaveBack: () => expand(false),
      onRefresh: self => expand(self.scroll() >= self.start, true)
    });
    return () => {
      expansion?.kill();
      gsap.set(surface, { clearProps: 'transform' });
    };
  });
}
