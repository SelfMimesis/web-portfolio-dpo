import { driveAppGlyph } from './app-ascii.js';
import { createPlaybackServices } from './playback-services.js';

const clamp = value => Math.max(0, Math.min(1, value));

// Local progress has a readable middle: arrival 0–.32, hold .32–.68,
// departure .68–1. The parent owns pinning, distance and the scroll clock.
export function createDevSceneTimelines(section, { mobile = false } = {}) {
  const panels = [...section.querySelector('.horizontal-track').children].slice(0, 3);
  const entries = [];
  const panelCount = section.querySelector('.horizontal-track').children.length;
  let frame;
  let frameTimeline;
  let coverTimeline;
  let services;
  let universeTimeline;
  let universeProgress = 0;
  const story = panels[0].querySelector('.cover-story');
  let lastChapter = -1;
  const titles = ['WORLD / 01', 'PLAYBACK / 02', 'INTERFACES / 03'];
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
      if (index === 1) {
        const photo=panel.querySelector('.playback-photo');
        services=createPlaybackServices(panel,{mobile});
        if(mobile){
          gsap.from(panel.querySelectorAll('.playback-letter'),{opacity:.15,y:8,stagger:.02,scrollTrigger:{trigger:panel.querySelector('h2'),start:'top 90%',end:'top 40%',scrub:true}});
          gsap.from(photo,{opacity:0,y:30,clipPath:'inset(30% 0 30% 0)',scrollTrigger:{trigger:photo,start:'top 95%',end:'top 45%',scrub:true}});
          entries.push({timeline:gsap.timeline({paused:true}).to({p:0},{p:1,duration:1}),progress:-1});
          return;
        }
        const timeline=gsap.timeline({paused:true})
          .fromTo(panel.querySelectorAll('.playback-letter'),{opacity:.12,y:9},{opacity:1,y:0,duration:.11,stagger:.006,ease:'power2.out'},.06)
          .fromTo(panel.querySelector('.playback-copy p'),{opacity:0,y:18},{opacity:1,y:0,duration:.15},.24)
          .fromTo(panel.querySelector('.playback-cue'),{opacity:.1},{opacity:1,duration:.12,ease:'steps(3)'},.34)
          .fromTo(photo,{autoAlpha:0,y:35,rotateY:-9,scale:.94,clipPath:'inset(49% 0 49% 0)'},{autoAlpha:1,y:0,rotateY:0,scale:1,clipPath:'inset(0% 0 0% 0)',duration:.16,ease:'power2.inOut'},.32)
          .fromTo(photo.querySelector('img'),{scale:1.08},{scale:1,duration:.18,ease:'power2.out'},.32)
          .fromTo(photo.querySelector('.playback-scan'),{yPercent:-100,opacity:0},{yPercent:0,opacity:.7,duration:.16,ease:'none'},.32)
          .to(photo.querySelector('.playback-scan'),{opacity:0,duration:.02},.48)
          .to(panel.querySelector('.playback-copy'),{opacity:.2,y:-18,duration:.16},.84)
          .to(photo,{opacity:.25,y:-20,duration:.16},.84);
        entries.push({timeline,progress:-1});
        return;
      }
      const title = panel.querySelector(index === 0 ? '.world--dev h2' : 'h2');
      const visual = panel.querySelector(index === 1 ? '.signal-instrument' : '.dev-composition');
      const timeline = gsap.timeline({ paused: true });
      const distance = mobile ? 24 : 65;
      if (index !== 0) timeline.fromTo(title, { x: -distance, opacity: .18 }, { x: 0, opacity: 1, duration: .32, ease: 'power2.out' }, 0);
      timeline.fromTo(visual, { y: index === 0 ? 0 : 28, scale: index === 0 ? 1 : .92 }, { y: 0, scale: 1, duration: .38, ease: 'power2.out' }, 0);
      timeline.to(title, { x: distance * .5, opacity: .25, duration: .32, ease: 'power1.in' }, .68);
      timeline.to(visual, { y: -24, scale: mobile ? .98 : .94, duration: .32, ease: 'none' }, .68);
      if(index===0 && story) timeline.fromTo(story,{autoAlpha:1},{autoAlpha:0,duration:mobile?.15:.2,ease:'power1.in',immediateRender:false},mobile?.85:.5);
      entries.push({ timeline, progress: -1 });
    });
    if (!mobile) {
      // Separate opacity layer so the photo's existing entrance remains intact.
      universeTimeline = gsap.timeline({paused:true})
        .to(panels[1].querySelectorAll('.playback-photo > *'),{opacity:0,duration:.6,ease:'power1.inOut'},.1)
        .to({p:0},{p:1,duration:1},0);
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
  function updateCover(progress) {
    const next=clamp(progress);
    coverTimeline?.progress(next);
    // Once the window is visible, scroll advances the phone's fixed LED poses.
    driveAppGlyph(clamp((next-.15)/.85));
  }
  function updatePanel(index, progress) {
    const entry = entries[index];
    const next = clamp(progress);
    if (entry.progress === next) return;
    entry.progress = next;
    entry.timeline.progress(next);
    if(index===1)services?.gradient(next);
    if (mobile && index === 0) updateCover((next-.5)*4);
  }
  return {
    updateCover,
    updateServices(progress){services?.update(progress);},
    updateUniverse(progress){
      const next=clamp(progress);
      if(next===universeProgress)return;
      universeProgress=next;
      universeTimeline?.progress(next);
    },
    updatePanel,
    update(progress) {
      const position = progress * (panelCount - 1);
      entries.forEach((entry, i) => updatePanel(i, (position - i + 1) / 2));
      frameTimeline?.time(Math.min(position, frameTimeline.duration()));
      const chapter = Math.min(2, Math.round(position));
      if (label && chapter !== lastChapter) { lastChapter = chapter; label.textContent = titles[chapter]; }
    },
    destroy() {
      context.revert(); frame?.remove(); driveAppGlyph(0);
    }
  };
}
