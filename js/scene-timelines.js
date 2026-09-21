import { driveLCD } from './lcd-display.js';

const clamp = value => Math.max(0, Math.min(1, value));

// Local progress has a readable middle: arrival 0–.32, hold .32–.68,
// departure .68–1. The parent owns pinning, distance and the scroll clock.
export function createDevSceneTimelines(section, { mobile = false } = {}) {
  const panels = [...section.querySelector('.horizontal-track').children].slice(0, 3);
  const lcd = panels[1].querySelector('[data-lcd-mode="scene"]');
  const entries = [];
  const panelCount = section.querySelector('.horizontal-track').children.length;
  let frame;
  let frameTimeline;
  let coverTimeline;
  const story = panels[0].querySelector('.cover-story');
  let lastChapter = -1;
  let lastLCD = -1;
  const titles = ['WORLD / 01', 'SIGNAL / 02', 'ORBIT / 03'];
  const context = gsap.context(() => {
    if (story) {
      coverTimeline = gsap.timeline({paused:true})
        .fromTo(story,{autoAlpha:0,y:32,scale:.97,clipPath:'inset(0 0 100% 0)'},{autoAlpha:1,y:0,scale:1,clipPath:'inset(0 0 0% 0)',duration:.25,ease:'power2.out'},.025)
        .fromTo(story.querySelector('h3'),{y:18,opacity:0},{y:0,opacity:1,duration:.25},.12)
        .fromTo(story.querySelector('.cover-story-signal'),{opacity:.12},{opacity:1,duration:.12,ease:'steps(3)'},.35)
        .fromTo(story.querySelector('.cover-story-statement'),{y:12,opacity:0},{y:0,opacity:1,duration:.2},.42)
        .fromTo(story.querySelectorAll('li'),{x:16,opacity:0},{x:0,opacity:1,stagger:.09,duration:.16},.56)
        .fromTo(story.querySelector('.cover-story-progress i'),{scaleX:0},{scaleX:1,duration:1,ease:'none'},0);
    }
    panels.forEach((panel, index) => {
      const title = panel.querySelector(index === 0 ? '.world--dev h2' : 'h2');
      const visual = panel.querySelector(index === 1 ? '.signal-instrument' : '.dev-composition');
      const timeline = gsap.timeline({ paused: true });
      const distance = mobile ? 24 : 65;
      if (index !== 0) timeline.fromTo(title, { x: -distance, opacity: .18 }, { x: 0, opacity: 1, duration: .32, ease: 'power2.out' }, 0);
      timeline.fromTo(visual, { y: index === 0 ? 0 : 28, scale: index === 0 ? 1 : .92 }, { y: 0, scale: 1, duration: .38, ease: 'power2.out' }, 0);
      timeline.to(title, { x: distance * .5, opacity: .25, duration: .32, ease: 'power1.in' }, .68);
      timeline.to(visual, { y: -24, scale: mobile ? .98 : .94, duration: .32, ease: 'none' }, .68);
      entries.push({ timeline, progress: -1 });
    });
    if (!mobile) {
      frame = document.createElement('div');
      frame.className = 'scene-registration';
      frame.setAttribute('aria-hidden', 'true');
      frame.innerHTML = '<span class="registration-label">WORLD / 01</span><span class="registration-axis">+<br>+<br>+</span><span class="registration-note">DPO — SCREEN STUDIES / 001—003</span>';
      section.querySelector('.scrolly-sticky').append(frame);
      frameTimeline = gsap.timeline({ paused: true })
        .fromTo(frame, { opacity: 0, scaleX: .86, scaleY: .82 }, { opacity: .65, scaleX: 1, scaleY: 1, duration: .7, ease: 'power1.inOut' }, .12)
        .to(frame, { opacity: .65, duration: 1.3 }, .82)
        .to(frame, { opacity: 0, scale: 1.035, duration: .6, ease: 'power1.in' }, 2.12);
    }
  }, section);
  const label = frame?.querySelector('.registration-label');
  function updatePanel(index, progress) {
    const entry = entries[index];
    const next = clamp(progress);
    if (entry.progress === next) return;
    entry.progress = next;
    entry.timeline.progress(next);
    if (mobile && index === 0) coverTimeline?.progress(clamp((next-.5)*4));
    if (index === 1) {
      // Quantized physical poses: scroll never interpolates pixels or coordinates.
      const nextFrame = Math.min(17, Math.floor(next * 18));
      if (nextFrame !== lastLCD) {
        lastLCD = nextFrame;
        driveLCD(lcd, nextFrame, nextFrame < 2 || nextFrame > 16 ? 'off' : nextFrame < 4 ? 'boot' : 'ready');
      }
    }
  }
  return {
    updateCover(progress) { coverTimeline?.progress(clamp(progress)); },
    updatePanel,
    update(progress) {
      const position = progress * (panelCount - 1);
      entries.forEach((entry, i) => updatePanel(i, (position - i + 1) / 2));
      frameTimeline?.time(Math.min(position, frameTimeline.duration()));
      const chapter = Math.min(2, Math.round(position));
      if (label && chapter !== lastChapter) { lastChapter = chapter; label.textContent = titles[chapter]; }
    },
    destroy() {
      context.revert(); frame?.remove(); driveLCD(lcd, 0);
    }
  };
}
