export function initFooterDog() {
  const footer = document.querySelector('main > footer');
  if (!footer || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  document.body.classList.add('has-footer-dog');
  const layer = document.createElement('div');
  layer.className = 'footer-dog-layer';
  layer.innerHTML = `
    <div class="footer-dog" hidden aria-hidden="true" role="img" lang="es" aria-label="Un perrito te ofrece una flor y dice: te amo lucia eres la mejor estas buenisima te amo">
      <svg class="footer-dog-art" viewBox="0 180 1440 996" width="1440" height="996" aria-hidden="true">
        <defs>
          <clipPath id="footer-dog-body-clip"><path d="M0 0H995V520H895L860 860L785 880L850 1050L855 1224H0Z"/></clipPath>
          <clipPath id="footer-dog-arm-clip"><path d="M995 435H1285V1224H805V1040L930 942L985 915L945 780V595H995Z"/></clipPath>
          <filter id="footer-dog-eye-soft"><feGaussianBlur stdDeviation="8"/></filter>
          <mask id="footer-dog-eye-mask" maskUnits="userSpaceOnUse" x="385" y="515" width="245" height="190">
            <ellipse cx="505" cy="612" rx="104" ry="70" fill="white" filter="url(#footer-dog-eye-soft)"/>
          </mask>
        </defs>
        <image data-src="assets/responsive/footer-dog-dog-cutout-480.webp" width="1285" height="1224" clip-path="url(#footer-dog-body-clip)"/>
        <image class="footer-dog-wink" data-src="assets/responsive/footer-dog-dog-wink-480.webp" width="1285" height="1224" preserveAspectRatio="none" mask="url(#footer-dog-eye-mask)" opacity="0"/>
        <g class="footer-dog-arm"><image data-src="assets/responsive/footer-dog-dog-cutout-480.webp" width="1285" height="1224" clip-path="url(#footer-dog-arm-clip)"/></g>
      </svg>
      <p class="footer-dog-message" aria-hidden="true">
        <svg class="footer-dog-bubble" viewBox="0 0 260 146" focusable="false" aria-hidden="true">
          <path/>
        </svg>
        <span>te amo lucia eres la mejor estas buenisima te amo</span>
      </p>
    </div>`;
  footer.after(layer);
  const dog = layer.querySelector('.footer-dog');
  const arm = layer.querySelector('.footer-dog-arm');
  const wink = layer.querySelector('.footer-dog-wink');
  const message = layer.querySelector('.footer-dog-message');
  let assets;
  const prepare = () => assets ||= Promise.all(['dog-cutout-480.webp', 'dog-wink-480.webp'].map(file => {
    const image = new Image();
    image.src = `assets/responsive/footer-dog-${file}`;
    return image.decode();
  })).then(() => {
    layer.querySelectorAll('[data-src]').forEach(image => image.setAttribute('href', image.dataset.src));
  });
  // Load the cutouts near the contact section, before the footer comes into view.
  const preload = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { prepare().catch(() => {}); preload.disconnect(); }
  }, { rootMargin: '900px' });
  preload.observe(document.querySelector('#contact') || footer);
  const measure = () => {
    dog.style.setProperty('--dog-footer-bottom', `${footer.offsetHeight + 8}px`);
    if (!message.offsetWidth) return;
    // Keep the curved tip aimed at the face as the longer bubble changes width.
    const tip = Math.max(35, Math.min(215, (message.offsetWidth - dog.offsetWidth * .62) / message.offsetWidth * 260));
    const left = tip + 7, right = tip + 28;
    const edge = x => 55 + 53 * Math.sqrt(1 - ((x - 130) / 128) ** 2);
    message.querySelector('path').setAttribute('d', `M130 2A128 53 0 ${right < 130 ? 1 : 0} 1 ${right} ${edge(right)}Q${tip + 4} 117 ${tip} 140Q${tip - 1} 122 ${left} ${edge(left)}A128 53 0 ${left > 130 ? 1 : 0} 1 130 2Z`);
  };
  const resize = new ResizeObserver(measure);
  resize.observe(footer);
  measure();

  gsap.matchMedia().add({ reduced: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    const reduced = context.conditions.reduced;
    let wanted = false, disposed = false, entrance, departure;
    const below = () => dog.offsetHeight + footer.offsetHeight + message.offsetHeight + 32;
    const setPhase = phase => { dog.dataset.phase = phase; };
    const hide = () => {
      if (!wanted && (dog.hidden || dog.dataset.phase === 'leaving')) return;
      wanted = false;
      entrance?.kill(); departure?.kill();
      dog.setAttribute('aria-hidden', 'true');
      if (dog.hidden) return;
      setPhase('leaving');
      departure = gsap.to(dog, {
        y: below(), rotation: 3, duration: reduced ? 0 : .45, ease: 'power2.in',
        onComplete: () => { dog.hidden = true; setPhase('hidden'); }
      });
    };
    const show = () => {
      if (wanted || disposed) return;
      wanted = true;
      prepare().then(() => {
        if (!wanted || disposed) return;
        entrance?.kill(); departure?.kill();
        const wasHidden = dog.hidden;
        dog.hidden = false;
        measure();
        dog.setAttribute('aria-hidden', 'false');
        gsap.set(arm, { svgOrigin: '815 1150' });
        gsap.set(wink, { opacity: 0 });
        if (reduced) {
          gsap.set(dog, { y: 0, rotation: 0 });
          gsap.set(arm, { rotation: -6 });
          gsap.set(message, { autoAlpha: 1, scale: 1, y: 0, rotation: -4 });
          setPhase('visible');
          return;
        }
        if (wasHidden) {
          gsap.set(dog, { y: below(), rotation: 4 });
          gsap.set(arm, { rotation: 14 });
        }
        gsap.set(message, { autoAlpha: 0, scale: .6, y: 12, rotation: -8 });
        setPhase('entering');
        entrance = gsap.timeline({ onComplete: () => setPhase('visible') })
          .to(dog, { y: 0, rotation: 0, duration: .7, ease: 'back.out(.7)' }, 0)
          .call(() => setPhase('offering'), [], .48)
          .to(arm, { rotation: -9, duration: .75, ease: 'back.out(1.35)' }, .48)
          .to(message, { autoAlpha: 1, scale: 1, y: 0, rotation: -4, duration: .45, ease: 'back.out(1.6)' }, .72)
          .to(arm, { rotation: -6, duration: .4, ease: 'sine.inOut' }, 1.22)
          .call(() => setPhase('wink'), [], 1.28)
          .to(wink, { opacity: 1, duration: .09 }, 1.28)
          .to(wink, { opacity: 0, duration: .12 }, 1.65);
      }).catch(() => { wanted = false; });
    };
    ScrollTrigger.create({
      id: 'footer-dog', trigger: footer, start: 'top bottom-=8', end: 'bottom top',
      onEnter: show, onLeave: hide, onLeaveBack: hide,
      onUpdate: self => { if (self.direction < 0) hide(); else if (self.isActive) show(); },
      onRefresh: self => { if (self.isActive) show(); else hide(); }
    });
    const visibility = () => {
      if (document.hidden) { entrance?.pause(); departure?.pause(); }
      else { entrance?.resume(); departure?.resume(); }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true;
      entrance?.kill(); departure?.kill();
      document.removeEventListener('visibilitychange', visibility);
      dog.hidden = true;
      dog.setAttribute('aria-hidden', 'true');
    };
  });
}
