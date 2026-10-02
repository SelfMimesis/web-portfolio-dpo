const faces = [
  { name: 'GEORGIA / ITALIC', family: 'Georgia, serif', style: 'italic', size: 218 },
  { name: 'PINYON SCRIPT / ENGLISH ROUNDHAND', family: 'Pinyon Script, cursive', style: 'normal', size: 240 },
  { name: 'MISS FAJARDOSE / ORNAMENTAL SCRIPT', family: 'Miss Fajardose, cursive', style: 'normal', size: 274 }
];

export function initCraftLettering(section) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  const chapter = section.querySelector('#about-craft');
  const media = gsap.matchMedia();
  media.add({
    desktop: '(min-width: 901px) and (min-height: 651px) and (pointer:fine),(min-width:1025px) and (min-height: 651px)',
    compact: '(max-width: 900px),(pointer:coarse) and (max-width:1024px), (max-height: 650px)',
    reduced: '(prefers-reduced-motion: reduce)'
  }, context => {
    if (context.conditions.reduced) return;
    const desktop = context.conditions.desktop;
    const visual = section.querySelector(desktop ? '.about-stage .about-visual--craft' : '#about-craft .about-visual--craft');
    const letter = visual.querySelector('.about-letter');
    const underline = visual.querySelector('.about-underline');
    const pencil = visual.querySelector('.about-pencil');
    const length = underline.getTotalLength();
    const pen = { x: 190, y: 366, angle: -28 };
    const draw = { p: 0 };
    const renderPen = () => pencil.setAttribute('transform', `translate(${pen.x} ${pen.y}) rotate(${pen.angle})`);
    let inView = false;
    let fontsReady = false;
    let disposed = false;
    const timeline = gsap.timeline({ paused: true, repeat: -1 });
    faces.forEach(face => {
      timeline.set(letter, { opacity: 0, fontFamily: face.family, fontStyle: face.style, fontSize: face.size })
        .set(underline, { strokeDashoffset: 1, opacity: 1 })
        .set(draw, { p: 0 })
        .call(() => { visual.dataset.craftFont = face.name; visual.dataset.craftPhase = 'ready'; })
        .to(letter, { opacity: 1, duration: .4 })
        .to({}, { duration: .6 })
        .to(pen, { x: 125, y: 305, angle: -24, duration: .65, ease: 'power2.inOut', onUpdate: renderPen })
        .call(() => { visual.dataset.craftPhase = 'drawing'; })
        .to(draw, { p: 1, duration: 1.35, ease: 'none', onUpdate: () => {
          const point = underline.getPointAtLength(length * draw.p);
          pen.x = point.x; pen.y = point.y; pen.angle = -24 + Math.sin(draw.p * Math.PI) * 5;
          renderPen();
          underline.style.strokeDashoffset = String(1 - draw.p);
        } })
        .to(pen, { x: 190, y: 366, angle: -28, duration: .8, ease: 'power3.inOut', onUpdate: renderPen })
        .call(() => { visual.dataset.craftPhase = 'rest'; })
        .to({}, { duration: 1.1 })
        .to([letter, underline], { opacity: 0, duration: .35 });
    });
    const sync = () => timeline.paused(!inView || document.hidden || !fontsReady);
    ScrollTrigger.create({
      trigger: desktop ? chapter : visual.parentElement,
      start: desktop ? 'top 48%' : 'top 85%',
      end: desktop ? 'bottom 48%' : 'bottom top',
      refreshPriority: -1,
      onToggle: self => { inView = self.isActive; sync(); },
      onRefresh: self => { inView = self.isActive; sync(); }
    });
    Promise.all([
      document.fonts.load('240px "Pinyon Script"'),
      document.fonts.load('274px "Miss Fajardose"')
    ]).then(() => { if (!disposed) { fontsReady = true; sync(); } });
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', sync);
      pencil.setAttribute('transform', 'translate(190 366) rotate(-28)');
      delete visual.dataset.craftFont;
      delete visual.dataset.craftPhase;
    };
  });
}
