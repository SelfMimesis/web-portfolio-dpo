import { animateMobileChapter } from './mobile-story.js';

export function initAboutStory() {
  const section = document.querySelector('.about-story');
  if (!section) return;
  const journey = section.querySelector('.about-journey');
  const stage = section.querySelector('.about-stage');
  const chapters = [...section.querySelectorAll('.about-chapter')];
  const visuals = [...stage.querySelectorAll('.about-visual')];
  const links = [...stage.querySelectorAll('.about-chapters a')];
  const counter = stage.querySelector('.about-counter');
  const progress = stage.querySelector('.about-progress i');
  let triggers = [];
  let active = -1;
  const setChapter = index => {
    if (active === index) return;
    active = index;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  };
  // Compact layouts keep each illustration next to its text, in reading order.
  chapters.forEach((chapter, i) => {
    const illustration = document.createElement('div');
    illustration.className = 'about-inline-visual';
    illustration.setAttribute('aria-hidden', 'true');
    illustration.append(visuals[i].cloneNode(true));
    chapter.prepend(illustration);
  });
  links.forEach((link, index) => link.addEventListener('click', event => {
    event.preventDefault();
    const trigger = triggers[index];
    const offset = document.querySelector('.site-header').offsetHeight + 24;
    const top = trigger ? trigger.start + window.innerHeight * .48 - offset : chapters[index].getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    const heading = chapters[index].querySelector('h3');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }));
  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const media = gsap.matchMedia();
  media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference), (max-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    const cleanup = chapters.map(chapter => animateMobileChapter(
      chapter, '.about-inline-visual', 'h3, p, .about-tags, .about-link'
    ));
    return () => cleanup.forEach(remove => remove());
  });
  media.add('(min-width: 901px) and (min-height: 651px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-animated');
    active = -1;
    gsap.set(visuals, { autoAlpha: 0 });
    gsap.set(visuals[0], { autoAlpha: 1 });
    const headerOffset = () => document.querySelector('.site-header').offsetHeight + 24;
    ScrollTrigger.create({
      trigger: journey,
      start: () => `top top+=${headerOffset()}`,
      end: () => `+=${Math.max(0, journey.offsetHeight - stage.offsetHeight)}`,
      pin: stage, pinSpacing: false, invalidateOnRefresh: true,
      onUpdate: self => { progress.style.transform = `scaleX(${self.progress})`; }
    });
    const show = index => {
      setChapter(index);
      gsap.to(visuals, { autoAlpha: i => i === index ? 1 : 0, duration: .4, overwrite: 'auto' });
    };
    triggers = chapters.map((chapter, index) => {
      const trigger = ScrollTrigger.create({
        trigger: chapter, start: 'top 48%', end: 'bottom 48%',
        onEnter: () => show(index), onEnterBack: () => show(index),
        onRefresh: self => { if (self.isActive) show(index); }
      });
      gsap.from(chapter.querySelectorAll('h3, p, .about-tags'), {
        y: 30, opacity: .25, stagger: .08, ease: 'none',
        scrollTrigger: { trigger: chapter, start: 'top 85%', end: 'top 30%', scrub: .6 }
      });
      gsap.fromTo(visuals[index].children, { y: 20 }, {
        y: -20, stagger: .06, ease: 'none',
        scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      return trigger;
    });
    show(0);
    return () => {
      section.classList.remove('is-animated');
      triggers = [];
      progress.style.removeProperty('transform');
      active = -1;
      setChapter(0);
    };
  });
}
