import { state, syncPreferences } from './state.js';
import { initNavigation, selectWorld } from './navigation.js';
import { initHeroSelector } from './animations.js';
import { initCursor } from './cursor.js';
import { initThreeScene } from './three-scene.js';
import { initAboutStory } from './about.js';
import { initFilmography } from './filmography.js';
import { buildWorldLinks, initWorldLinks } from './world-links.js';
import { initLCDDisplays } from './lcd-display.js';

function buildScenes() {
  const art = document.querySelector('.art-composition').outerHTML;
  const dev = document.querySelector('.dev-composition').outerHTML;
  const scenes = {
    art: [
      ['INTRO', '<h2>Believable worlds.<br><i>Unreal</i> details.</h2><p>Graphic design for film. Objects that tell a story, even when the camera isn’t looking.</p><div class="intro-tags">PRODUCTION GRAPHICS / PROPS / BRANDS<br>SIGNAGE / PRINTED MATTER / FICTIONAL IDENTITIES</div><span class="scene-number">→</span>'],
      ['SELECTED WORK', `<div class="feature-layout"><div><h2>The Grand.<br>A world<br>on paper.</h2><p>A fictional cinema, built through the things it leaves behind.</p><div class="project-meta"><span>PROJECT — THE GRAND</span><span>PRODUCTION — CONCEPT STUDY</span><span>YEAR — 2026 / ROLE — GRAPHIC DESIGN</span></div></div>${art}</div>`],
      ['PROJECT DETAIL', `<div class="feature-layout">${art}<div><h2>The smallest<br>details.<br>The whole story.</h2><p>A ticket. An envelope. A letter that never gets read. Each piece shares the same visual history, from its typography to the marks of daily use.</p><div class="project-meta">01 / PAPER GOODS & FICTIONAL IDENTITY</div></div></div>`],
      ['PROCESS', '<h2>Before the <i>take.</i></h2><p>Research becomes a visual language. That language becomes something you can hold.</p><div class="process-board"><div class="process-item">01 / RESEARCH<strong>Aa 09</strong><p>Type, period & place</p></div><div class="process-item">02 / PROP GRAPHICS<strong>GRAND<br>CINEMA</strong></div><div class="process-item">03 / PAPERWORK<strong>Scene<br>024 / B</strong></div><div class="process-item">04 / ON SET<strong>✓</strong><p>Ready for camera</p></div></div>'],
      ['ARCHIVE', '<h2>Other <i>stories.</i></h2><div class="archive-list">' + ['The Grand', 'Department of Fiction', 'Night Service', 'Ordinary Objects'].map((name, i) => `<button class="archive-entry" data-preview="${name}" aria-expanded="false" aria-controls="archive-detail">00${i + 1} — ${name.toUpperCase()}<span>CONCEPT / 2026 ↗</span></button>`).join('') + '</div><div class="archive-preview" aria-hidden="true">The Grand</div><div id="archive-detail" class="archive-detail" hidden></div>']
    ],
    dev: [
      ['INTRO', '<h2>Imagined worlds.<br><i>Working</i> screens.</h2><p>Digital props for film. The apps, terminals and interfaces that belong inside the story.</p><div class="intro-tags">FICTIONAL APPS / SCREEN GRAPHICS / COCKPIT DISPLAYS<br>DESIGNED TO BE PART OF THE PICTURE.</div><span class="scene-number">→</span>'],
      ['SELECTED WORK', `<div class="feature-layout"><div><h2>ORBIT.<br>The flight<br><i>deck.</i></h2><p>A spacecraft cockpit concept. Navigation, telemetry and a pilot’s view into an imagined universe.</p><div class="project-meta"><span>PROJECT — ORBIT / FLIGHT DECK</span><span>PRODUCTION — CONCEPT STUDY</span><span>YEAR — 2026 / ROLE — DIGITAL PROP DESIGN</span></div></div>${dev}</div>`],
      ['INTERACTION', '<h2>Every touch.<br>Part of the <i>story.</i></h2><p>A message arrives. A pilot changes course. A terminal reveals a clue. The interface follows the action and gives each moment its visual rhythm.</p><div class="workflow"><div>01 / STORY<strong>A reason to look</strong></div><span>→</span><div>02 / ACTION<strong>A gesture on screen</strong></div><span>→</span><div>03 / RESPONSE<strong>The next story beat</strong></div></div>'],
      ['PLAYBACK', '<h2>Made for the <i>frame.</i></h2><p>From the first screen to the final cue: a study in readable graphics, deliberate timing and repeatable screen states.</p><div class="system-diagram"><div>01 / CONTEXT<b>World & character ↓</b></div><div>02 / DESIGN<b>Screen language →</b></div><div>03 / ACTION<b>Touch & response ↓</b></div><div>06 / FRAME<b>The screen in the story ✓</b></div><div>05 / RESET<b>Back to the first cue ←</b></div><div>04 / CUE<b>Motion & timing ↓</b></div></div>'],
      ['ARCHIVE', '<h2>Other <i>screens.</i></h2><div class="tool-list"><details><summary>01 — ORBIT<span>COCKPIT / 2026 / CONCEPT +</span></summary><p>A spacecraft flight deck with navigation graphics, a flight reticle and fictional telemetry. A visual concept for a screen seen inside the story.</p></details><details><summary>02 — Signal<span>PHONE APP / 2026 / CONCEPT +</span></summary><p>A fictional messaging app study: conversations, incoming calls and notifications designed around a character’s story.</p></details><details><summary>03 — Night Terminal<span>TERMINAL / 2026 / CONCEPT +</span></summary><p>A fictional computer terminal study with searches, records and access screens that reveal information as a scene unfolds.</p></details><details><summary>04 — Vital Signs<span>MONITOR / 2026 / CONCEPT +</span></summary><p>A fictional medical display study using waveforms and invented readings as screen graphics for a film scene.</p></details></div>']
    ]
  };
  for (const [world, items] of Object.entries(scenes)) {
    document.querySelector(`.${world}-track`).innerHTML = '<article class="panel panel--hero" aria-label="1: Cover"></article>' + items.map(([name, content], i) => `<article class="panel" aria-label="${i + 2}: ${name}"><div class="panel-meta"><span>${world === 'art' ? 'ART DEPARTMENT →' : '→ DIGITAL PROPS'} / 0${i + 2}</span><span>${name} — CONCEPT PORTFOLIO</span></div>${content}</article>`).join('');
  }
  document.querySelectorAll('.archive-entry').forEach(button => {
    const preview = () => { document.querySelector('.archive-preview').textContent = button.dataset.preview; };
    button.addEventListener('pointerenter', preview); button.addEventListener('focus', preview);
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.archive-entry').forEach(item => item.setAttribute('aria-expanded', 'false'));
      button.setAttribute('aria-expanded', String(opening));
      const detail = document.querySelector('#archive-detail'); detail.hidden = !opening;
      detail.textContent = `${button.dataset.preview} — A fictional production graphics study exploring typography, printed props and the visual identity of an imagined world. Placeholder project for this first prototype.`;
    });
  });
}
export function initApp() {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  syncPreferences(); buildScenes(); buildWorldLinks(); initLCDDisplays(); initNavigation(); initWorldLinks(); initHeroSelector(selectWorld); initCursor(); initThreeScene();
  initAboutStory();
  initFilmography();
  const world = location.hash.slice(1);
  if (['art', 'dev'].includes(world)) selectWorld(world, false);
}
if (document.readyState === 'complete') initApp(); else window.addEventListener('load', initApp, { once: true });
