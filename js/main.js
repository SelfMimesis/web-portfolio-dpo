import { state, syncPreferences } from './state.js';
import { initNavigation, selectWorld, restoreInitialNavigation } from './navigation.js';
import { initHeroSelector } from './animations.js';
import { initCursor } from './cursor.js';
import { initThreeScene } from './three-scene.js';
import { initAboutClients } from './about-clients.js';
import { initFooterDog } from './footer-dog.js';
import { initAboutStory } from './about.js';
import { initFilmography } from './filmography.js';
import { buildWorldLinks, initWorldLinks } from './world-links.js';
import { initLCDDisplays } from './lcd-display.js';
import { initAmbientMotion } from './ambient-motion.js';
import { initAppASCII } from './app-ascii.js';
import { initGoldenDisplays } from './golden-display.js';
import { mountPlaybackServices } from './playback-services.js';
import { mountInterfaceUniverse } from './interface-universe.js';
import { mountEverydayApps } from './everyday-apps.js';
import { mountFunChapter } from './fun-chapter.js';
import { mountMuybridgeIntro } from './muybridge-intro.js';
import { mountGraphicProps } from './graphic-props.js';
import { mountSelectedFilms } from './selected-films.js';
import { initContact } from './contact.js';
import { initSceneLoading } from './scene-loading.js';
import { initAccessibleControls } from './accessible-controls.js';

function buildScenes() {
  const dev = document.querySelector('.dev-composition').outerHTML;
  const scenes = {
    art: [['GRAPHIC PROPS', '']],
    dev: [
      ['ONSET PLAYBACK', `<div class="playback-copy"><span class="playback-eyebrow">ON SET / IN THE MOMENT</span><h2 class="playback-title" aria-label="Onset playback. Ready for action.">${['Onset playback.', 'Ready for', 'action.'].map(line => `<span class="playback-line" aria-hidden="true">${line.split(' ').map(word => `<span class="playback-word">${[...word].map(char => `<span class="playback-letter">${char}</span>`).join('')}</span>`).join(' ')}</span>`).join('')}</h2><p>Alongside developing apps, I also have experience as a Lead Standby Motion Graphics operator.</p><span class="playback-cue">STAND-BY → PLAYBACK → ACTION</span></div><figure class="playback-photo"><div class="playback-photo-frame"><img alt="On-set playback workstation with an operator, monitors and control equipment" decoding="async" src="assets/responsive/onset-playback-480.webp" srcset="assets/responsive/onset-playback-480.webp 480w, assets/responsive/onset-playback-960.webp 960w" sizes="(max-width: 700px) 90vw, 35vw" width="1152" height="2048" loading="lazy"><span class="playback-scan" aria-hidden="true"></span></div><figcaption><span>FIELD RECORD / 001</span><span>ONSET PLAYBACK — READY</span></figcaption></figure>`],
      ['INTERFACES', `<div class="feature-layout"><div><h2>Interfaces<br>for every<br><i>universe.</i></h2><p>I create apps for every era — from Windows XP and Frutiger Aero interfaces to futuristic sci-fi espionage systems.</p><div class="project-meta"><span>PAST / PRESENT / IMAGINED FUTURES</span><span>PRODUCTION — CONCEPT STUDY</span><span>YEAR — 2026 / ROLE — DIGITAL PROP DESIGN</span></div></div>${dev}</div>`],
    ]
  };
  for (const [world, items] of Object.entries(scenes)) {
    document.querySelector(`.${world}-track`).innerHTML = '<article class="panel panel--hero" aria-label="1: Cover"></article>' + items.map(([name, content], i) => `<article class="panel" aria-label="${i + 2}: ${name}"><div class="panel-meta"><span>${world === 'art' ? 'ART DEPARTMENT →' : '→ DIGITAL PROPS'} / 0${i + 2}</span><span>${name} — CONCEPT PORTFOLIO</span></div>${content}</article>`).join('');
  }
  const artIntro = document.createElement('section');
  artIntro.className = 'art-cover-intro';
  document.querySelector('.art-track .panel--hero').append(artIntro);
  mountMuybridgeIntro(artIntro);
  const graphicFinale = document.querySelector('.art-track .panel:nth-child(2)');
  graphicFinale.id = 'art-selected-work';
  mountGraphicProps(document.querySelector('.art-track .panel--hero'), graphicFinale);
  mountSelectedFilms(document.querySelector('.art-track'));
  const intro = document.querySelector('.dev-track .panel:nth-child(2)');
  intro.classList.add('panel--playback');
  mountPlaybackServices(intro);
  mountInterfaceUniverse(document.querySelector('.dev-track .panel:nth-child(3)'));
  mountEverydayApps(document.querySelector('.dev-track .panel:nth-child(3)'));
  const funPanel=document.createElement('article');
  funPanel.className='panel panel--fun';funPanel.setAttribute('aria-label','4: Lets have fun');
  document.querySelector('.dev-track .panel:nth-child(3)').after(funPanel);
  mountFunChapter(funPanel);
  intro.querySelector('.panel-meta span:last-child').textContent = 'ONSET PLAYBACK — FIELD RECORD';
}
export function initApp() {
  initAppASCII();
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  syncPreferences(); buildScenes(); buildWorldLinks(); initLCDDisplays(); initAmbientMotion(); initGoldenDisplays(); initNavigation(); initWorldLinks(); initHeroSelector(selectWorld); initCursor(); initThreeScene();
  initAboutStory();
  initFilmography();
  initAboutClients();
  initFooterDog();
  initContact();
  initAccessibleControls();
  initSceneLoading();
  restoreInitialNavigation();
}
// Navigation can start when the document is ready; large images need not block it.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp, { once: true });
else initApp();
// Recheck pin geometry once the initial images/fonts have finished loading.
window.addEventListener('load', () => window.ScrollTrigger?.refresh(), { once: true });
