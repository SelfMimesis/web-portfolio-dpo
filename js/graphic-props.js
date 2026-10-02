import { propEnvelopeMarkup, createPropEnvelope } from './prop-envelope.js';

const asset = name => new URL(`../assets/graphic-props/${name}`, import.meta.url).href;

export const GRAPHIC_PROPS_CONFIG = {
  storyDistance: () => Math.max(4800, innerHeight * 6),
  finalDistance: () => Math.max(3800, innerHeight * 4.5)
};

const props = [
  { key: 'note', title: 'A note.', emphasis: 'A rendezvous.', text: 'A few handwritten words. A time, a place, a reason for the next scene to happen.', file: 'story-note.jpg', width: 2200, height: 1518, alt: 'Yellow paper note handwritten in blue ink: Mañana. Dos de la tarde. Miss Eva.', caption: '01 / HANDWRITTEN NOTE', direction: 1 },
  { key: 'passport', title: 'A passport.', emphasis: 'Another life.', text: 'A name, a face, a stamp. An entire identity, ready to pass from one hand to another.', file: 'story-passport.jpg', width: 2400, height: 1868, alt: 'Open aged Italian identity document with a portrait, handwritten details and an ink stamp.', caption: '02 / IDENTITY DOCUMENT', direction: -1 },
  { key: 'photograph', title: 'A photograph.', emphasis: 'A shared past.', text: 'A family that existed before the camera started rolling. A printed memory that gives the characters a past.', file: 'story-family.jpg', width: 2400, height: 1620, alt: 'Period family photograph with adults and children, printed with a pale border.', caption: '03 / FAMILY PHOTOGRAPH', direction: 1 }
];

export function mountGraphicProps(cover, finale) {
  const story = document.createElement('section');
  story.className = 'graphic-story';
  story.id = 'art-graphic-story';
  story.setAttribute('aria-label', 'Graphic props: a note, a passport, a photograph');
  story.innerHTML = props.map(prop => `<article class="graphic-beat graphic-beat--${prop.key}">
    <div class="graphic-beat-copy"><span class="graphic-eyebrow">GRAPHIC PROPS / ${prop.caption}</span>
      <h2>${prop.title}<br><i>${prop.emphasis}</i></h2><p>${prop.text}</p>
      <span class="graphic-reading-cue" aria-hidden="true">PAPER HOLDS A STORY <span>${prop.direction > 0 ? '↓' : '↑'}</span></span>
    </div>
    <figure class="graphic-object" style="--paper-ratio:${prop.width / prop.height}"><span class="graphic-paper"><img src="${asset(prop.file)}" width="${prop.width}" height="${prop.height}" alt="${prop.alt}" decoding="async"></span><figcaption>${prop.caption} / DESIGNED FOR CAMERA</figcaption></figure>
  </article>`).join('');
  cover.append(story);
  finale.classList.add('panel--graphic-finale');
  finale.innerHTML = `<div class="panel-meta"><span>ART DEPARTMENT / 02</span><span>GRAPHIC PROPS / IN THE FRAME</span></div>
    <div class="graphic-finale-layout"><div class="graphic-finale-copy">
      <span class="graphic-eyebrow">THE DETAILS THAT MAKE A WORLD</span>
      <h2>Small details.<br><i>A whole world.</i></h2>
      <p class="graphic-finale-lead">Before an actor touches a prop, it already has a story.</p>
      <div class="graphic-finale-body"><p>Paper, typography, colour and drawings belong to the same world as the set and the costume. They give actors something believable to handle, and the camera something real to discover.</p>
      <p>Sometimes they move the story forward. Sometimes they simply belong. In a close-up or at the edge of the frame, every detail helps the fiction feel lived in.</p></div>
      <span class="graphic-final-signoff">RESEARCH → DESIGN → PRINT → ON SET</span>
    </div>${propEnvelopeMarkup()}</div>`;
}

export function createGraphicProps(section, { vertical, reducedMotion, seekFinal }) {
  const story = section.querySelector('.graphic-story');
  const beats = [...story.querySelectorAll('.graphic-beat')];
  const intro = section.querySelector('.art-cover-intro');
  const finale = section.querySelector('.panel--graphic-finale');
  const envelope = createPropEnvelope(finale.querySelector('.prop-envelope'), { vertical, reducedMotion, seekFinal });
  let timeline;
  let stopPhysics = () => {};
  const clamp = value => Math.max(0, Math.min(1, value));
  const context = window.gsap?.context(() => {
    if (reducedMotion) return;
    stopPhysics = createPaperPhysics(story, beats);
    if (vertical) {
      gsap.to(intro.querySelector('.muybridge-layout'), { opacity: 0, ease: 'none', scrollTrigger: { trigger: story, start: 'top 85%', end: 'top 35%', scrub: true } });
      beats.forEach((beat, i) => {
        const direction = props[i].direction;
        gsap.timeline({ scrollTrigger: { trigger: beat, start: 'top 85%', end: 'bottom top', scrub: .5 } })
          .fromTo(beat.querySelector('.graphic-object'), { y: -direction * 60, x: direction * 12, rotation: -direction * 4, rotationX: 8, rotationY: direction * 9, scale: .975, transformPerspective: 1100 },
            { y: 0, x: 0, rotation: -direction * 1, rotationX: 2, rotationY: -direction * 4, scale: 1, duration: 1.2, ease: 'power3.out' })
          .to(beat.querySelector('.graphic-object'), { y: direction * 38, rotation: direction * 1.5, rotationY: direction * 3, scale: 1.018, duration: 1.5, ease: 'sine.inOut' });
      });
      return;
    }
    timeline = gsap.timeline({ paused: true });
    timeline.fromTo(intro, { autoAlpha: 1 }, { autoAlpha: 0, duration: .65, ease: 'none' }, 0);
    beats.forEach((beat, i) => {
      const start = .45 + i * 2.8;
      const copy = beat.querySelector('.graphic-beat-copy');
      const object = beat.querySelector('.graphic-object');
      const swing = i === 1 ? -1 : 1;
      gsap.set(beat, { autoAlpha: 0 });
      timeline.fromTo(copy, { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: .5 }, start)
        .fromTo(object, { y: () => -props[i].direction * innerHeight, x: swing * 32, rotation: -swing * 5, rotationX: 11, rotationY: swing * 13, scale: .975, autoAlpha: 0, transformPerspective: 1200 },
          { y: 0, x: 0, rotation: -swing * 1.2, rotationX: 2.5, rotationY: -swing * 5, scale: 1, autoAlpha: 1, duration: 1.35, ease: 'power3.out' }, start + .1)
        .to(object, { y: () => props[i].direction * innerHeight, x: -swing * 24, rotation: swing * 3, rotationX: -5, rotationY: swing * 7, scale: 1.018, autoAlpha: 0, duration: .95, ease: 'power2.in' }, start + 1.8);
      if (i < beats.length - 1) timeline.to(copy, { autoAlpha: 0, y: -18, duration: .45 }, start + 2.35);
    });
  }, section);
  return {
    update(progress) {
      if (!timeline) return;
      const value = clamp(progress);
      timeline.progress(value);
      // Visibility is a function of story time, not a cached tween start value.
      // This also hides later beats after a refresh followed by reverse scrolling.
      const time = timeline.time();
      beats.forEach((beat, i) => {
        const active = time >= .45 + i * 2.8 && (i === beats.length - 1 || time < .45 + (i + 1) * 2.8);
        beat.style.visibility = active ? 'inherit' : 'hidden';
        beat.style.opacity = active ? '1' : '0';
      });
      story.inert = progress <= 0;
      // The Muybridge controller owns its own inert flag before this handoff.
      if (progress > 0) intro.inert = true;
      story.dataset.beat = String(Math.min(2, Math.max(0, Math.floor((timeline.time() - .45) / 2.8))));
    },
    updateFinal(progress) { envelope.update(clamp(progress)); },
    refresh() { timeline?.invalidate(); envelope.refresh(); },
    destroy() { stopPhysics(); context?.revert(); envelope.destroy(); story.inert = false; intro.inert = false; }
  };
}

// A damped angular spring adds a short, real-time tail to the scroll timeline.
// It acts on the inner paper only; the outer figure retains reversible travel.
function createPaperPhysics(story, beats) {
  const springs = beats.map((beat, index) => {
    const paper = beat.querySelector('.graphic-paper');
    gsap.set(paper, { transformPerspective: 850, transformOrigin: '50% 42%' });
    return { beat, paper, angle: 0, speed: 0, sign: index === 1 ? -1 : 1,
      rotate: gsap.quickSetter(paper, 'rotation', 'deg'),
      pitch: gsap.quickSetter(paper, 'rotationX', 'deg'),
      slide: gsap.quickSetter(paper, 'x', 'px') };
  });
  let previousScroll = scrollY, running = false;
  const events = new AbortController();
  const paint = spring => {
    spring.rotate(spring.angle);
    spring.pitch(spring.angle * .7);
    spring.slide(spring.angle * .8);
  };
  function stop() {
    gsap.ticker.remove(tick); running = false;
    springs.forEach(spring => { spring.angle = spring.speed = 0; paint(spring); });
  }
  function tick(_time, delta) {
    // Clamp after a suspended tab, then substep for stable integration.
    const dt = Math.min(delta / 1000, .04) / 3;
    let moving = false;
    springs.forEach(spring => {
      for (let step = 0; step < 3; step++) {
        spring.speed += (-105 * spring.angle - 24 * spring.speed) * dt;
        spring.angle += spring.speed * dt;
      }
      if (Math.abs(spring.angle) < .008 && Math.abs(spring.speed) < .04) spring.angle = spring.speed = 0;
      else moving = true;
      paint(spring);
    });
    if (!moving) stop();
  }
  window.addEventListener('scroll', () => {
    const delta = Math.max(-160, Math.min(160, scrollY - previousScroll));
    previousScroll = scrollY;
    if (!delta || document.hidden || story.closest('.scrolly').hidden) return;
    let kicked = false;
    springs.forEach(spring => {
      const bounds = spring.paper.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight || getComputedStyle(spring.beat).visibility === 'hidden') return;
      spring.speed = Math.max(-28, Math.min(28, spring.speed + delta * .055 * spring.sign));
      kicked = true;
    });
    if (kicked && !running) { running = true; gsap.ticker.add(tick); }
  }, { passive: true, signal: events.signal });
  document.addEventListener('visibilitychange', () => { previousScroll = scrollY; if (document.hidden) stop(); }, { signal: events.signal });
  return () => { events.abort(); stop(); };
}
