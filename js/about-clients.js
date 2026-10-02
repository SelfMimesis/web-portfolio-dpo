export function initAboutClients() {
  const section = document.querySelector('.about-clients');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  const journey = document.querySelector('.about-journey');
  const copy = document.querySelector('.production-copy');
  const stage = section.querySelector('.clients-stage');
  const panel = section.querySelector('.clients-panel');
  const viewport = section.querySelector('.clients-viewport');
  const track = section.querySelector('.clients-grid');
  const marks = [...track.children];
  const counter = section.querySelector('.clients-count');
  const progress = section.querySelector('.clients-progress i');
  const previous = section.querySelector('.clients-prev');
  const next = section.querySelector('.clients-next');
  // The offscreen end of the rail should already be decoded when it scrolls in.
  const preload = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    section.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    preload.disconnect();
  }, { rootMargin: '600px' });
  preload.observe(section);

  gsap.matchMedia().add({
    desktop: '(min-width: 901px) and (min-height: 651px) and (pointer:fine),(min-width:1025px) and (min-height: 651px)',
    reduced: '(prefers-reduced-motion: reduce)',
    motion: '(prefers-reduced-motion: no-preference)'
  }, context => {
    const motion = context.conditions.motion;
    const updateControls = offset => {
      const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const seen = Math.min(marks.length, Math.max(1, Math.floor((offset + viewport.clientWidth + 1) / marks[0].offsetWidth)));
      counter.textContent = `${String(seen).padStart(2, '0')} / 08`;
      previous.setAttribute('aria-disabled', String(offset < 1));
      next.setAttribute('aria-disabled', String(offset >= max - 1));
    };
    if (!motion) {
      const update = () => updateControls(viewport.scrollLeft);
      const move = direction => viewport.scrollBy({ left: direction * marks[0].offsetWidth, behavior: 'instant' });
      const back = () => move(-1), forward = () => move(1);
      const navigate = event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || event.key === 'End') viewport.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: 'instant' });
        else move(event.key === 'ArrowRight' ? 1 : -1);
      };
      const observer = new ResizeObserver(update); observer.observe(viewport);
      viewport.addEventListener('scroll', update); viewport.addEventListener('keydown', navigate);
      previous.addEventListener('click', back); next.addEventListener('click', forward);
      update();
      return () => {
        observer.disconnect(); viewport.removeEventListener('scroll', update); viewport.removeEventListener('keydown', navigate);
        previous.removeEventListener('click', back); next.removeEventListener('click', forward);
      };
    }
    const desktop = context.conditions.desktop;
    const illustration = document.querySelector(desktop ? '.about-stage' : '#about-production .about-inline-visual');
    let travel = 0, distance = 0, hold = 0, top = 0;
    section.classList.add('has-scroll-clients');
    viewport.scrollLeft = 0;
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - viewport.clientWidth);
      distance = Math.max(innerHeight * .65, travel * .8);
      hold = gsap.utils.clamp(220, 360, innerHeight * .32);
      const header = document.querySelector('.site-header').offsetHeight;
      top = Math.max(header + 24, (innerHeight - stage.offsetHeight) / 2);
      // Reading room for Netflix at the start and the final logos before the credits.
      section.style.height = `${stage.offsetHeight + hold + distance + innerHeight * .25}px`;
      section.style.setProperty('--clients-top', `${top}px`);
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);
    // Hand off the two-column About composition to a full-width client section.
    const entrance = gsap.timeline({ scrollTrigger: {
      id: 'about-clients-entry', trigger: journey, start: 'bottom 92%', end: () => `bottom top+=${top - 24}`,
      scrub: .4, refreshPriority: -3, invalidateOnRefresh: true
    } });
    entrance.fromTo(copy, { autoAlpha: 1, y: 0, filter: 'blur(0px)' }, {
      autoAlpha: 0, y: -48, filter: 'blur(3px)', duration: .58, ease: 'power2.inOut'
    }, 0);
    if (desktop) {
      // Keep the pinned frame's transform untouched; lift only the artwork inside it.
      entrance.fromTo(illustration, { autoAlpha: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0%)' }, {
        autoAlpha: 0, filter: 'blur(3px)', clipPath: 'inset(0% 0% 12% 0%)', duration: .58, ease: 'power2.inOut'
      }, 0).fromTo(illustration.querySelector('.about-visuals'), { y: 0, scale: 1 }, {
        y: -32, scale: .98, duration: .58, ease: 'power2.inOut'
      }, 0);
    } else {
      // On stacked layouts the illustration leaves before the longer text does.
      const header = () => document.querySelector('.site-header').offsetHeight;
      gsap.fromTo(illustration, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)' }, {
        autoAlpha: 0, y: -24, scale: .98, filter: 'blur(3px)', ease: 'power2.inOut',
        scrollTrigger: { trigger: illustration, start: () => `bottom top+=${header() + 180}`,
          end: () => `bottom top+=${header() + 16}`, scrub: .4, refreshPriority: -3, invalidateOnRefresh: true }
      });
    }
    entrance.fromTo(stage, { autoAlpha: 0, y: 64, clipPath: 'inset(0% 0% 18% 0%)' }, {
      autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .58, ease: 'power2.out'
    }, .42);

    // Keep the first group centered before starting the horizontal movement.
    const timeline = gsap.timeline({ scrollTrigger: {
      id: 'about-clients', trigger: section,
      start: () => section.getBoundingClientRect().top + window.scrollY - top + hold,
      end: () => `+=${distance}`,
      scrub: .5, refreshPriority: -3, invalidateOnRefresh: true
    } });
    const updateCount = () => {
      updateControls(timeline.progress() * travel);
    };
    timeline.fromTo(track, { x: 0 }, { x: () => -travel, duration: 1, ease: 'none', onUpdate: updateCount }, 0)
      .fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'none' }, 0);
    updateCount();
    const go = target => {
      const trigger = timeline.scrollTrigger;
      window.scrollTo({ top: target <= 0 ? trigger.start - hold : trigger.start + gsap.utils.clamp(0, 1, target) * distance, behavior: 'smooth' });
    };
    const move = direction => go(timeline.scrollTrigger.progress + direction * marks[0].offsetWidth / Math.max(1, travel));
    const back = () => move(-1), forward = () => move(1);
    const navigate = event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') go(event.key === 'Home' ? 0 : 1);
      else move(event.key === 'ArrowRight' ? 1 : -1);
    };
    viewport.addEventListener('keydown', navigate);
    previous.addEventListener('click', back); next.addEventListener('click', forward);
    // Animate the inner panel so sticky positioning and the horizontal rail remain independent.
    gsap.timeline({ scrollTrigger: {
      id: 'about-clients-exit', trigger: document.querySelector('.filmography'),
      start: 'top 85%', end: 'top 52%', scrub: .35, refreshPriority: -3, invalidateOnRefresh: true,
      onUpdate: self => { panel.inert = self.progress >= .98; }
    } })
      .fromTo(panel, { autoAlpha: 1, y: 0, scale: 1 }, { autoAlpha: 0, y: -24, scale: .985, duration: .85, ease: 'power2.inOut' }, 0)
      .fromTo(marks, { y: 0 }, { y: -30, duration: .5, stagger: .04, ease: 'power2.in' }, .08)
      .fromTo(section.querySelector('.clients-heading'), { y: 0 }, { y: -12, duration: .5, ease: 'power2.in' }, 0)
      .fromTo(section.querySelector('.clients-footer'), { y: 0 }, { y: 12, duration: .5, ease: 'power2.in' }, .1);
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      viewport.removeEventListener('keydown', navigate);
      previous.removeEventListener('click', back); next.removeEventListener('click', forward);
      panel.inert = false;
      section.classList.remove('has-scroll-clients');
      section.style.removeProperty('height');
      section.style.removeProperty('--clients-top');
      counter.textContent = '08 / 08';
    };
  });
}
