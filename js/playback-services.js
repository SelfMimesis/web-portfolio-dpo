const services = [
  ['Live playback', 'I cue and play back visuals live in Resolume during filming, adapting to the timing of the director and actors.', 'CUE → RESOLUME → ON CAMERA'],
  ['Troubleshooting', 'I diagnose and resolve on-set issues with screens, signal paths and their content, keeping the shoot moving.', 'DETECT → DIAGNOSE → RESTORE'],
  ['Equipment setup', 'I set up and test screen systems for filming. I have worked on sets with large numbers of screens running simultaneously, all synchronised.', 'CONNECT → TEST → SYNC'],
  ['Technical assistance', 'I advise the camera and directing teams on screens and their content, and adjust the image for accurate, camera-ready display.', 'ADVISE → CALIBRATE → CAMERA READY'],
  ['Controlling web prototypes software', 'I have experience using prototyping software for film, including Proto.io and ProtoPie, to build and control interactive screen prototypes on set.', 'TRIGGER → INTERACTION → SCREEN RESPONSE']
];
function diagram(index) {
  if(index===4)return `<div class="service-prototypes"><div class="prototype-brands"><img src="assets/protoio-logo.svg" alt="Proto.io"><span><img src="assets/protopie-logo.png" alt="">ProtoPie</span></div><svg viewBox="0 0 400 120" aria-hidden="true"><path class="service-wire" d="M65 60H335"/><g data-service-node><circle cx="55" cy="60" r="24"/><text x="55" y="64">TAP</text></g><g data-service-node><rect x="145" y="25" width="100" height="70"/><text x="195" y="64">LOGIC</text></g><g data-service-node><rect x="300" y="10" width="70" height="100"/><path d="M312 32h46m-46 15h30m-30 15h40m-40 26h46"/></g><path class="service-test" data-service-meter d="M15 118H385"/></svg></div>`;
  if(index===0)return `<div class="service-playback"><img src="assets/resolume-logo.svg" alt="Resolume"><div class="service-cues">${['CUE 01','CUE 02','CUE 03','TAKE'].map(s=>`<span data-service-node>${s}</span>`).join('')}</div><div class="service-transport"><i data-service-meter></i></div><span>DIRECTOR CUE / ACTOR TIMING / LIVE OUTPUT</span></div>`;
  if(index===1)return `<svg viewBox="0 0 500 150" aria-hidden="true"><path class="service-wire" d="M55 70H440"/><g data-service-node><rect x="15" y="38" width="90" height="64"/><text x="60" y="75">SOURCE</text></g><g data-service-node><path d="M190 35H290V105H190Z"/><text x="240" y="75">SIGNAL</text></g><g data-service-node><rect x="375" y="30" width="110" height="80"/><text x="430" y="75">OUTPUT</text></g><path class="service-test" data-service-meter d="M20 135H480"/></svg>`;
  if(index===2)return `<svg viewBox="0 0 500 165" aria-hidden="true"><path class="service-wire" d="M250 20V60M45 60H455M45 60V85M127 60V85M209 60V85M291 60V85M373 60V85M455 60V85"/><text x="250" y="18">MASTER / TIMECODE</text>${[12,94,176,258,340,422].map((x,i)=>`<g data-service-node><rect x="${x}" y="85" width="65" height="47"/><path d="M${x+24} 140h18"/><text x="${x+32}" y="114">0${i+1}</text></g>`).join('')}<path class="service-test" data-service-meter d="M20 157H480"/></svg>`;
  return `<svg viewBox="0 0 500 165" aria-hidden="true"><path class="service-wire" d="M220 80H340"/><g><rect x="15" y="22" width="200" height="113"/>${[0,1,2,3,4,5].map((n)=>`<rect data-service-node x="${25+n*30}" y="32" width="25" height="80"/>`).join('')}</g><g><rect x="345" y="45" width="95" height="68"/><path d="M440 65l43-20v68l-43-20M365 120l-15 30m70-30 15 30"/></g><text x="115" y="155">DISPLAY CALIBRATION</text><path class="service-test" data-service-meter d="M345 155H485"/></svg>`;
}
export function mountPlaybackServices(panel) {
  const container=document.createElement('div');container.className='playback-services';
  container.innerHTML=services.map(([title,copy,cue],i)=>`<article class="playback-service"><div class="service-chrome"><span>ON-SET SYSTEMS / 0${i+1}</span><span>FIELD CAPABILITY [ + ]</span></div><div class="service-body"><h3><span>0${i+1}.</span> ${title}</h3><p>${copy}</p><div class="service-diagram">${diagram(i)}</div><div class="service-cue">${cue}</div></div></article>`).join('');
  panel.append(container);
  const ascii=document.createElement('pre');ascii.className='playback-ascii';ascii.setAttribute('aria-hidden','true');panel.querySelector('.playback-photo').append(ascii);
  // Static fallback also exists without GSAP.
  ascii.textContent=gradient(0);
}
function gradient(frame) {
  const ramp=' .:-=+*#%@';
  return Array.from({length:7},(_,y)=>Array.from({length:42},(_,x)=>{
    const v=(Math.sin(x*.16+y*.4+frame*.22)+Math.cos(x*.09-y*.5-frame*.15)+2)/4;
    return ramp[Math.min(9,Math.floor(v*10))];
  }).join('')).join('\n');
}
export function createPlaybackServices(panel,{mobile=false}={}) {
  const cards=[...panel.querySelectorAll('.playback-service')];
  const duration=cards.length+.34;
  const ascii=panel.querySelector('.playback-ascii');
  let last=-1;
  let lastGradient=-1;
  const paintGradient=tick=>{if(tick!==lastGradient){lastGradient=tick;ascii.textContent=gradient(tick);}};
  const timeline=gsap.timeline({paused:true});
  if(!mobile){
    timeline.to(panel.querySelector('.playback-copy'),{opacity:1,duration:.2},0)
      .to(panel.querySelector('.playback-photo'),{opacity:1,duration:.2},0);
    cards.forEach((card,i)=>{
      timeline.fromTo(card,{autoAlpha:0,yPercent:110,rotateX:5},{autoAlpha:1,yPercent:0,rotateX:0,duration:.24,ease:'power2.out'},i+.14)
        .to(card,{autoAlpha:0,yPercent:-20,duration:.18,ease:'power1.in'},i+.96);
    });
    timeline.fromTo(cards[0].querySelector('img'),{opacity:.2,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.25,ease:'steps(5)'},.3);
    timeline.to(panel.querySelector('.playback-copy'),{opacity:1,duration:.2},cards.length+.14)
      .to(panel.querySelector('.playback-photo'),{opacity:1,duration:.2},cards.length+.14);
  }else{
    cards.forEach(card=>gsap.from(card,{y:40,opacity:.15,duration:1,scrollTrigger:{trigger:card,start:'top 92%',end:'top 55%',scrub:true,onUpdate:self=>draw(self.progress)}}));
  }
  function draw(progress){
    const tick=Math.floor(progress*96);
    if(tick===last)return;last=tick;
    paintGradient(tick);
    cards.forEach((card,i)=>{
      const phase=mobile?progress:Math.max(0,Math.min(1,(progress*duration-i-.14)/.82));
      const nodes=[...card.querySelectorAll('[data-service-node]')];
      nodes.forEach((node,j)=>{node.style.opacity=(i===2 ? phase>j/nodes.length : Math.floor(phase*nodes.length)===j||phase>.94)?'1':'.18';});
      const meter=card.querySelector('[data-service-meter]');
      if(meter)gsap.set(meter,{scaleX:phase,transformOrigin:'left center'});
    });
  }
  return {update(progress){timeline.progress(Math.max(0,Math.min(1,progress)));draw(progress);},gradient(progress){paintGradient(Math.floor(progress*32));}};
}
