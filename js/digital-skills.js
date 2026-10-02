import { createSkillsASCII } from './skills-ascii.js';
const clamp=v=>Math.max(0,Math.min(1,v));
export function mountDigitalSkills(panel){
  const section=document.createElement('section');section.className='digital-skills';section.setAttribute('aria-label','Digital skills, shaped by film');
  section.innerHTML=`<header class="skills-intro"><span>06 / DIGITAL SKILLS — ON-SET EXPERIENCE</span><h2>Creative skills.<br>Technical expertise.<br>On-set <i>experience.</i></h2><span class="skills-scroll">SCROLL TO EXPLORE ↓</span></header><div class="skills-photo"><img alt="Diego working on a futuristic film set." decoding="async" src="assets/responsive/interfaces-digital-skills-640.webp" srcset="assets/responsive/interfaces-digital-skills-640.webp 640w, assets/responsive/interfaces-digital-skills-1280.webp 1280w, assets/responsive/interfaces-digital-skills-1600.webp 1600w" sizes="(max-width: 700px) 90vw, 65vw" width="4032" height="2268" loading="lazy"></div><div class="skills-details"><h3>Digital craft.<br>On-set instinct.</h3><p class="skills-lead">My experience in film connects technical development with the needs of a real shoot. I speak the language of directors and camera crews, turning creative ideas into tools that work in front of the lens.</p><p class="skills-production">Based between Seville and Madrid, I am available for on-site and remote work. I hold a Cambridge C1 English certificate and have experience on international productions. I adapt to tight schedules, changing setups and last-minute requests while maintaining continuity.</p><div class="skills-list"><div><span>01 / CODE & INTERACTION</span><p>Software development · Programming<br>JavaScript · HTML · CSS · React · GSAP<br>Arduino · ProtoPie · Proto.io</p></div><div><span>02 / MOTION & VISUAL DESIGN</span><p>After Effects · Premiere · Resolume<br>Vector design · Digital drawing</p></div></div></div>`;

  panel.append(section);
}
export function createDigitalSkills(section,{mobile=false}={}){
  const el=section.querySelector('.digital-skills');
  if(mobile)return{update(){},destroy(){}};
  el.classList.add('is-skills-pinned');
  const ascii=createSkillsASCII(el);
  const photo=el.querySelector('.skills-photo'),intro=el.querySelector('.skills-intro'),details=el.querySelector('.skills-details');
  const tl=gsap.timeline({paused:true});
  tl.fromTo(el,{yPercent:100,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.17,ease:'power2.out'},0)
    .to(intro,{y:-65,autoAlpha:0,duration:.17},.26)
    .fromTo(photo,{left:'43%',top:'65%',width:'14%',height:'22%'},{left:'0%',top:'0%',width:'100%',height:'100%',duration:.35,ease:'power3.inOut'},.27)
    .fromTo(details,{autoAlpha:0,y:35},{autoAlpha:1,y:0,duration:.14},.59)
    .fromTo(el.querySelectorAll('.skills-list > div'),{y:25,opacity:0},{y:0,opacity:1,stagger:.05,duration:.12},.69)
    .to({}, {duration:.14},.86);
  return{update(p){p=clamp(p);tl.progress(p);ascii.update(p>=.62);el.inert=p===0;if(p>0&&el.closest('.panel').classList.contains('is-active')){const label=section.querySelector('.registration-label');if(label)label.textContent='SKILLS / 06';document.querySelector('.progress-title').textContent='DIGITAL SKILLS';}},destroy(){ascii.destroy();tl.kill();el.classList.remove('is-skills-pinned');el.inert=false;}};
}
