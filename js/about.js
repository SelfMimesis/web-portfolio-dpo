import { animateMobileChapter } from './mobile-story.js';
import { prepareToolMarks, initToolHover } from './about-tool-hover.js';
import { initCraftLettering } from './about-craft.js';
import { initScreenInteraction } from './about-interaction.js';
import { whenNear } from './scene-loading.js';

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
  prepareToolMarks(section);
  stage.querySelector('.about-visuals').removeAttribute('aria-hidden');
  visuals.forEach((visual, i) => { if (i !== 3) visual.setAttribute('aria-hidden', 'true'); });
  // Compact layouts keep each illustration next to its text, in reading order.
  chapters.forEach((chapter, i) => {
    const illustration = document.createElement('div');
    illustration.className = 'about-inline-visual';
    if (i !== 3) illustration.setAttribute('aria-hidden', 'true');
    illustration.append(visuals[i].cloneNode(true));
    chapter.prepend(illustration);
  });
  section.querySelectorAll('.interaction-window').forEach(win => { win.inert = true; });
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
  initToolHover(section, gsap);
  const animateTools = (visual, trigger) => {
    const logos = visual.querySelectorAll('.about-tool-mark');
    if (!logos.length) return;
    gsap.timeline({
      scrollTrigger: { trigger, start: 'top 85%', end: 'bottom 20%', scrub: .7, refreshPriority: -1, invalidateOnRefresh: true }
    }).fromTo(logos, {
      y: i => 12 + (i % 3) * 3, rotation: 0, scale: .9, opacity: .15
    }, {
      y: 0, rotation: 0, scale: 1, opacity: .84, stagger: .045, duration: .65, ease: 'power2.out'
    }).to(logos, { duration: .6 })
      .to(logos, {
        y: i => i % 2 ? -3 : 3, rotation: 0,
        stagger: .025, duration: 1.2, ease: 'sine.inOut'
      });
    const sheet = visual.querySelector('.about-tool-sheet');
    const leds = gsap.fromTo(sheet, { '--led-x': '-15%' }, {
      '--led-x': '115%', duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true
    });
    let inView = false;
    const syncLEDs = () => leds.paused(!inView || document.hidden);
    ScrollTrigger.create({
      trigger, start: 'top 85%', end: 'bottom 20%', refreshPriority: -1,
      onToggle: self => { inView = self.isActive; syncLEDs(); },
      onRefresh: self => { inView = self.isActive; syncLEDs(); }
    });
    document.addEventListener('visibilitychange', syncLEDs);
    return () => document.removeEventListener('visibilitychange', syncLEDs);
  };
  media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference),(pointer:coarse) and (max-width:1024px) and (prefers-reduced-motion: no-preference), (max-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    const cleanup = chapters.map((chapter, index) => animateMobileChapter(
      chapter, '.about-inline-visual', 'h3, :scope > p, .production-copy > p, .about-tags, .about-link', { animateVisual: ![1, 2, 3, 4].includes(index) }
    ));
    const tools = chapters[1].querySelector('.about-inline-visual');
    cleanup.push(animateTools(tools, tools));
    return () => cleanup.forEach(remove => remove());
  });
  media.add('(min-width: 901px) and (min-height: 651px) and (prefers-reduced-motion: no-preference) and (pointer:fine),(min-width:1025px) and (min-height: 651px) and (prefers-reduced-motion: no-preference)', () => {
    let cleanupTools = () => {};
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
      // Copy stays fully readable; the illustrations carry the chapter motion.
      if (index === 1) cleanupTools = animateTools(visuals[index], chapter);
      else if (![2, 3, 4].includes(index)) gsap.fromTo(visuals[index].children, { y: 20 }, {
        y: -20, stagger: .06, ease: 'none',
        scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      return trigger;
    });
    show(0);
    return () => {
      cleanupTools();
      section.classList.remove('is-animated');
      triggers = [];
      progress.style.removeProperty('transform');
      active = -1;
      setChapter(0);
    };
  });
  whenNear(section.querySelector('#about-craft'), () => initCraftLettering(section));
  whenNear(section.querySelector('#about-digital'), () => initScreenInteraction(section));
}
