// Call inside a GSAP context so navigation and media changes revert every tween.
export function animateMobileChapter(chapter, visualSelector, textSelector, { animateVisual = true } = {}) {
  const gsap = window.gsap;
  chapter.classList.add('has-mobile-story');
  const visual = chapter.querySelector(visualSelector);
  if (visual && animateVisual) {
    // One reversible timeline: enter from the left, hold, then leave to the right.
    gsap.timeline({
      scrollTrigger: { trigger: visual, start: 'top 98%', end: 'bottom top', scrub: .35, invalidateOnRefresh: true }
    }).fromTo(visual, { xPercent: -12, scale: .94, rotation: -2, opacity: .3, clipPath: 'inset(0 24% 0 0)' },
      { xPercent: 0, scale: 1, rotation: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power2.out' })
      .to(visual, { xPercent: 0, duration: 2.5 })
      .to(visual, { xPercent: 10, rotation: 1.5, opacity: .4, duration: 1, ease: 'power1.in' });
    // The inner artwork moves at a different speed from its frame.
    const artwork = visual.querySelector('.about-visual, .portrait-card, .flight-deck');
    if (artwork) gsap.fromTo(artwork, { x: -12 }, {
      x: 12, ease: 'none',
      scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: .5 }
    });
  }
  // Keep reading copy still and fully opaque. The artwork and progress meter
  // carry the scroll animation; text never fades while a visitor is reading.
  const text = [...chapter.querySelectorAll(textSelector)].filter(element => !visual?.contains(element));
  gsap.set(text, { opacity: 1, x: 0, y: 0 });
  const meter = document.createElement('div');
  meter.className = 'mobile-chapter-progress';
  meter.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('i');
  meter.append(fill);
  chapter.prepend(meter);
  gsap.fromTo(fill, { scaleX: 0 }, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: chapter, start: 'top 65%', end: 'bottom 65%', scrub: true }
  });
  return () => { meter.remove(); chapter.classList.remove('has-mobile-story'); };
}
