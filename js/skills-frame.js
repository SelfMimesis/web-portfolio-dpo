// The rectangle retracts into quiet corner marks on the existing scroll clock.
export function createSkillsFrame(frame){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.classList.add('registration-hud');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<path class="hud-outline"/><path class="hud-details"/>';
  frame.prepend(svg);
  const outline=svg.querySelector('.hud-outline'),details=svg.querySelector('.hud-details');
  const note=frame.querySelector('.registration-note'),originalNote=note.textContent;
  let progress=0,ink=0,width=0,height=0;
  const path=points=>points.map((point,index)=>point ? `${index===0||!points[index-1]?'M':'L'}${point.join(',')}` : '').join(' ');
  function render(){
    if(!width||!height)return;
    const w=width,h=height,p=progress,x=w*.5*(1-p)+14*p,y=h*.5*(1-p)+14*p;
    outline.setAttribute('d',path([[0,y],[0,0],[x,0],null,[w-x,0],[w,0],[w,y],null,[w,h-y],[w,h],[w-x,h],null,[x,h],[0,h],[0,h-y]]));
    outline.style.opacity=String(.19+p*.31);
    details.style.opacity=String(p*.14);
    details.setAttribute('d',`M 28,0 H ${w*.34} M ${w*.66},0 H ${w-28} M 28,${h} H ${w-28}`);
    note.textContent=p>0?'ON-SET EXPERIENCE':originalNote;
    frame.style.setProperty('--skills-frame',String(p));
    frame.style.setProperty('--skills-label-color',`rgb(${[214,216,208].map(channel=>Math.round(channel*(1-ink))).join(',')})`);
    frame.classList.toggle('has-skills-frame',p>0);
  }
  const observer=new ResizeObserver(()=>{width=frame.clientWidth;height=frame.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);render();});
  observer.observe(frame);
  return{
    update(value){
      const t=Math.max(0,Math.min(1,(value-.015)/.22)),next=t*t*(3-2*t);
      const shade=Math.max(0,Math.min(1,(value-.48)/.14)),nextInk=shade*shade*(3-2*shade);
      if(next===progress&&nextInk===ink)return;progress=next;ink=nextInk;render();
    },
    destroy(){observer.disconnect();svg.remove();note.textContent=originalNote;frame.classList.remove('has-skills-frame');frame.style.removeProperty('--skills-frame');frame.style.removeProperty('--skills-label-color');}
  };
}
