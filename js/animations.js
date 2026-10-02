import { state } from './state.js';
let entrance;
let releaseComposition = () => {};
let split;

// The divider moves over two fixed-size layouts. Nothing inside the cockpit
// changes its container-query size while the pointer crosses the split.
function createSplit(hero, worlds) {
  const marker=hero.querySelector('.center-mark'),clock={offset:0};
  let width=hero.clientWidth,enabled=false,tween;
  worlds.forEach(world=>{
    const inner=document.createElement('div');inner.className='world-inner';
    inner.append(...world.childNodes);world.append(inner);
  });
  const compositions=worlds.map(w=>w.querySelector('.art-composition,.dev-composition'));
  const captions=compositions.map(c=>c.querySelector('.composition-caption'));
  const edges=worlds.map(w=>[...w.querySelectorAll('.world-meta>span:last-child,.world-bottom>.explore,.world-foot>span:last-child')]);
  const moving=[worlds[1],marker,...compositions,...edges.flat()];
  const setters=moving.map(el=>gsap.quickSetter(el,'x','px'));
  const captionSetters=captions.map(el=>el?gsap.quickSetter(el,'x','px'):()=>{});
  const draw=()=>{
    const x=clock.offset*width;
    setters[0](width/2+x);setters[1](x);
    setters[2](x/2);setters[3](-x/2);
    captionSetters[0](-x/2);captionSetters[1](x/2);
    let index=4;edges.forEach((nodes,i)=>nodes.forEach(()=>setters[index++](i?-x:x)));
  };
  const enable=()=>{
    if(enabled||state.activeWorld||state.isMobile||state.reducedMotion)return;
    width=hero.clientWidth;enabled=true;hero.classList.add('is-split-motion');
    gsap.set(marker,{xPercent:-50,yPercent:-50});draw();
  };
  const move=(offset,duration=.45)=>{
    enable();if(!enabled)return;
    tween?.kill();tween=gsap.to(clock,{offset,duration,ease:'power3.out',onUpdate:draw});return tween;
  };
  const disable=()=>{
    tween?.kill();clock.offset=0;enabled=false;
    hero.classList.remove('is-split-motion');gsap.set([...moving,...captions.filter(Boolean)],{clearProps:'transform'});
  };
  new ResizeObserver(()=>{width=hero.clientWidth;if(enabled)draw();}).observe(hero);
  return {move,disable,enable,async settle(){if(enabled){await move(0,.18);disable();}}};
}

// Keep the original DOM (and its running display), rather than crossfading a clone.
function lockComposition(selected) {
  const composition = selected.querySelector('.art-composition, .dev-composition');
  const rect = composition.getBoundingClientRect();
  const parent = selected.getBoundingClientRect();
  const saved = new Map();
  const remember = element => saved.set(element, element.getAttribute('style'));
  remember(composition);
  // The terminal has different cover selectors. Freeze its resting geometry too.
  const terminal = composition.querySelector('.cockpit');
  if (terminal) {
    remember(terminal);
    const style = getComputedStyle(terminal);
    const properties = ['left','top','width','height','max-width','padding','transform','box-shadow'];
    const values = properties.map(property => [property, style.getPropertyValue(property)]);
    values.forEach(([property,value]) => terminal.style.setProperty(property,value,'important'));
  }
  composition.classList.add('is-composition-locked');
  composition.style.setProperty('--cover-left', `${rect.left-parent.left}px`);
  composition.style.setProperty('--cover-top', `${rect.top-parent.top}px`);
  composition.style.setProperty('--cover-width', `${rect.width}px`);
  composition.style.setProperty('--cover-height', `${rect.height}px`);
  releaseComposition = () => {
    window.gsap?.killTweensOf(composition);
    composition.classList.remove('is-composition-locked');
    saved.forEach((style,element) => style === null ? element.removeAttribute('style') : element.setAttribute('style',style));
    releaseComposition = () => {};
  };
  // Preserve the resting position within the selected world, so the artwork
  // follows its heading to the left as that world opens to full width.
  return { composition, left: rect.left-parent.left, top: rect.top-parent.top };
}
export function initHeroSelector(onSelect) {
  const hero=document.querySelector('.hero-selector');
  const worlds = [...document.querySelectorAll('.hero-selector .world')];
  if(window.gsap){split=createSplit(hero,worlds);split.enable();}
  for (const [index, element] of worlds.entries()) {
    const world = index ? 'dev' : 'art';
    element.addEventListener('pointerenter', () => {
      state.hoveredWorld = world;
      if (!window.gsap || state.activeWorld || state.isMobile || state.reducedMotion || state.transitionInProgress || !matchMedia('(hover: hover)').matches) return;
      split.move(index?-.07:.07);
    });
    element.addEventListener('pointerleave', event => {
      state.hoveredWorld = null;
      if (!window.gsap || state.activeWorld || state.transitionInProgress || state.isMobile || state.reducedMotion) return;
      // Crossing the seam goes directly to the other target, not via 50/50.
      if(event?.relatedTarget?.closest?.('.hero-selector .world'))return;
      split.move(0);
    });
    element.addEventListener('click', e => { if (!e.target.closest('a,button')) onSelect(world, true, element); });
  }
  if (window.gsap && !state.reducedMotion) entrance = gsap.from('.world h1>span, .world h2>span', { y: 22, opacity: 0, duration: .65, stagger: .035, ease: 'power3.out' });
}
export function resetHero() {
  split?.disable();
  releaseComposition();
  const hero = document.querySelector('.hero-selector');
  hero.classList.remove('is-journey-cover');
  hero.querySelectorAll('.world, .center-mark').forEach(element => { element.hidden = false; });
  if (window.gsap) {
    gsap.killTweensOf('.world, .center-mark');
    gsap.set('.world, .center-mark', { clearProps: 'all' });
    gsap.set(hero, { clearProps: 'height,minHeight' });
  }
}

export async function expandHero(world, prepareJourney = () => {}) {
  entrance?.revert(); entrance = null;
  const hero = document.querySelector('.hero-selector');
  const selected = hero.querySelector(`.world--${world}`);
  const other = hero.querySelector(`.world--${world === 'art' ? 'dev' : 'art'}`);
  const marker = hero.querySelector('.center-mark');
  await split?.settle();
  const first=selected.getBoundingClientRect(),otherFirst=other.getBoundingClientRect();
  const elements=[...selected.querySelectorAll('.world-meta>span,h1,h2,.art-composition,.dev-composition,.world-bottom>p,.world-foot>span')];
  const before=elements.map(el=>el.getBoundingClientRect());
  lockComposition(selected);
  // Commit and measure the final layout once, before anything starts moving.
  // The scroll scenes are also prepared here, not in the last animation frame.
  hero.classList.add('is-journey-cover');
  other.hidden=true;marker.hidden=true;
  prepareJourney();
  if (!window.gsap || state.reducedMotion) return;
  const last=selected.getBoundingClientRect(),bounds=hero.getBoundingClientRect();
  const after=elements.map(el=>el.getBoundingClientRect());
  const styles=elements.map(el=>el.getAttribute('style'));
  const dx=first.left-last.left,dy=first.top-last.top;
  other.hidden=false;marker.hidden=false;
  gsap.set(other,{position:'absolute',left:otherFirst.left-bounds.left,top:otherFirst.top-bounds.top,height:otherFirst.height,zIndex:1});
  other.style.setProperty('width',`${otherFirst.width}px`,'important');
  gsap.set(selected,{zIndex:2,willChange:'transform,clip-path'});
  const timeline=gsap.timeline({paused:true,defaults:{duration:.75,ease:'power3.inOut',lazy:false}});
  timeline.fromTo(selected,{
    x:dx,y:dy,clipPath:`inset(0px ${Math.max(0,last.width-first.width)}px ${Math.max(0,last.height-first.height)}px 0px)`
  },{x:0,y:0,clipPath:'inset(0px 0px 0px 0px)'},0);
  elements.forEach((el,i)=>{
    timeline.fromTo(el,{x:before[i].left-after[i].left-dx,y:before[i].top-after[i].top-dy},{x:0,y:0},0);
  });
  timeline.to(other,{xPercent:world==='art'?100:-100,opacity:0,duration:.6},0);
  timeline.to(marker,{opacity:0,scale:.5,duration:.2},0);
  // Let the browser commit the initial mask/layers before advancing the clock.
  await new Promise(requestAnimationFrame);
  timeline.play();
  await timeline;
  other.hidden=true;marker.hidden=true;
  gsap.set([selected,other,marker],{clearProps:'all'});
  gsap.set(elements,{clearProps:'transform'});
  elements.forEach((el,i)=>styles[i]===null?el.removeAttribute('style'):el.setAttribute('style',styles[i]));
}
