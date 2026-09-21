export function createPosterCarousel(rows, onNavigate) {
  const gsap = window.gsap;
  const gallery = document.createElement('aside');
  gallery.className = 'credits-posters';
  gallery.setAttribute('aria-label', 'Production posters');
  gallery.innerHTML = '<div class="poster-eyebrow"><span>ON SCREEN</span><span class="poster-number">01 / 13</span></div><div class="poster-stack"></div><div class="poster-caption"><span class="poster-title"></span><span class="poster-edition"></span></div><div class="poster-controls"><button type="button" class="poster-prev" aria-label="Previous production">←</button><button type="button" class="poster-alternate" hidden>ALT. POSTER</button><button type="button" class="poster-next" aria-label="Next production">→</button></div>';
  const stack = gallery.querySelector('.poster-stack');
  const title = gallery.querySelector('.poster-title');
  const number = gallery.querySelector('.poster-number');
  const edition = gallery.querySelector('.poster-edition');
  const previous = gallery.querySelector('.poster-prev');
  const next = gallery.querySelector('.poster-next');
  const alternate = gallery.querySelector('.poster-alternate');
  const details = document.createElement('div');
  details.className = 'poster-details';
  details.innerHTML = '<span class="poster-dates"></span><span class="poster-company"></span><span class="poster-director"></span>';
  title.after(details);
  const dates = details.querySelector('.poster-dates');
  const company = details.querySelector('.poster-company');
  const director = details.querySelector('.poster-director');
  stack.tabIndex = 0;
  stack.setAttribute('role', 'group');
  stack.setAttribute('aria-label', 'Production posters. Swipe or use left and right arrow keys to browse.');
  const slides = rows.map((row, index) => {
    const slide = document.createElement('figure');
    slide.className = 'poster-slide';
    slide.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    if (index === 0) img.fetchPriority = 'high';
    img.src = row.dataset.poster;
    img.alt = `Poster for ${row.querySelector('strong').textContent}`;
    img.decoding = 'async';
    img.loading = index < 2 ? 'eager' : 'lazy';
    if (index === 0) {
      // The head preload starts this download before the app initializes.
      // Decode the exact carousel image early, not on its first scroll frame.
      img.decode().catch(() => {}).finally(() => {
        img.dataset.posterReady = String(img.complete && img.naturalWidth > 0);
      });
    }
    slide.append(img);
    stack.append(slide);
    return slide;
  });
  let active = -1;
  let variant = false;
  let transition;
  const navigate = index => onNavigate(Math.max(0, Math.min(rows.length - 1, index)));
  let gesture;
  stack.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { x: event.clientX, y: event.clientY };
    if (event.isTrusted) stack.setPointerCapture(event.pointerId);
  });
  stack.addEventListener('pointerup', event => {
    if (!gesture) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y) * 1.3) navigate(active + (x < 0 ? 1 : -1));
  });
  stack.addEventListener('pointercancel', () => { gesture = null; });
  stack.addEventListener('dragstart', event => event.preventDefault());
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    navigate(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  previous.addEventListener('click', () => onNavigate(Math.max(0, active - 1)));
  next.addEventListener('click', () => onNavigate(Math.min(rows.length - 1, active + 1)));
  alternate.addEventListener('click', () => {
    variant = !variant;
    const img = slides[active].querySelector('img');
    img.src = variant ? rows[active].dataset.posterAlt : rows[active].dataset.poster;
    img.alt = `${variant ? 'International poster' : 'Poster'} for ${rows[active].querySelector('strong').textContent}`;
    alternate.setAttribute('aria-pressed', String(variant));
    edition.textContent = variant ? 'INTERNATIONAL ARTWORK' : '';
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(img, { opacity: .4, scale: .98 }, { opacity: 1, scale: 1, duration: .45, overwrite: true });
  });
  function show(index, immediate = false) {
    if (index === active && !immediate) return;
    const oldIndex = active;
    const direction = index > active ? 1 : -1;
    transition?.kill();
    const outgoing = slides[oldIndex];
    const incoming = slides[index];
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== index));
      if (i !== index && i !== oldIndex) gsap.set(slide, { autoAlpha: 0 });
    });
    if (variant && outgoing) {
      outgoing.querySelector('img').src = rows[oldIndex].dataset.poster;
      outgoing.querySelector('img').alt = `Poster for ${rows[oldIndex].querySelector('strong').textContent}`;
    }
    active = index;
    variant = false;
    title.textContent = rows[index].querySelector('strong').textContent;
    dates.textContent = rows[index].querySelector('td').textContent;
    company.textContent = rows[index].querySelector('th span').textContent;
    director.textContent = `DIR. ${rows[index].querySelector('td:last-child').textContent}`;
    number.textContent = `${String(index + 1).padStart(2, '0')} / ${rows.length}`;
    edition.textContent = '';
    alternate.hidden = !rows[index].dataset.posterAlt;
    alternate.setAttribute('aria-pressed', 'false');
    previous.disabled = index === 0;
    next.disabled = index === rows.length - 1;
    // Prepare the neighbouring images before the next scroll transition.
    [index - 1, index, index + 1].forEach(i => {
      if (slides[i]) slides[i].querySelector('img').loading = 'eager';
    });
    gsap.set(incoming, { zIndex: 2 });
    if (outgoing) gsap.set(outgoing, { zIndex: 1 });
    if (immediate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(incoming, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotationY: 0, rotationZ: 0, scale: 1 });
      gsap.set(incoming.querySelector('img'), { scale: 1, opacity: 1 });
      gsap.set(title, { opacity: 1, y: 0 });
      return;
    }
    transition = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (outgoing) transition.to(outgoing, {
      xPercent: -12 * direction, yPercent: -3 * direction, rotationY: 9 * direction,
      scale: .94, autoAlpha: 0, duration: .5
    }, 0);
    transition.fromTo(incoming, {
      autoAlpha: 0, xPercent: 22 * direction, yPercent: 5 * direction,
      rotationY: -13 * direction, rotationZ: 1.5 * direction, scale: .94
    }, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotationY: 0, rotationZ: 0, scale: 1, duration: .75 }, .04)
      .fromTo(incoming.querySelector('img'), { scale: 1.035 }, { scale: 1, duration: .95 }, .04)
      .fromTo(title, { opacity: .2, y: 7 }, { opacity: 1, y: 0, duration: .4 }, .12);
  }
  function reset() {
    transition?.kill();
    gsap.killTweensOf([title, ...slides, ...slides.map(slide => slide.querySelector('img'))]);
    active = -1;
    variant = false;
    slides.forEach((slide, i) => { slide.querySelector('img').src = rows[i].dataset.poster; });
  }
  return { element: gallery, show, reset };
}
