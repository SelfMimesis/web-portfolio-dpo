// Only the visible app plays; visibility and reduced-motion preferences pause it.
export function createStoryVideos(story,{mobile=false}={}) {
  let progress=0,dead=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clips=[...story.querySelectorAll('.story-video')].map(video=>{
    const clip={video,start:Number(video.dataset.start),end:Number(video.dataset.end),visible:false,active:false};
    video.muted=true;
    const rewind=()=>{if(video.readyState&&Number.isFinite(video.duration))video.currentTime=Math.min(clip.start,video.duration);};
    clip.ready=()=>{rewind();sync();if(clip.active)video.play().catch(()=>{});};
    clip.tick=()=>{if(!video.loop&&!video.seeking&&(video.currentTime>=clip.end-.08||video.currentTime<clip.start-.1)){rewind();if(clip.active)video.play().catch(()=>{});}};
    clip.rewind=rewind;
    video.addEventListener('loadedmetadata',clip.ready);
    video.addEventListener('timeupdate',clip.tick);
    video.addEventListener('ended',clip.ready);
    return clip;
  });
  function sync(){
    clips.forEach(clip=>{
      const isPost=clip.video.closest('.app-social');
      const active=!dead&&!document.hidden&&!reduced.matches&&clip.visible&&(mobile||(isPost?progress>=.46&&progress<.64:progress>=.64&&progress<.82));
      if(active===clip.active)return;
      clip.active=active;
      if(active){clip.rewind();clip.video.play().catch(()=>{});}else clip.video.pause();
    });
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const clip=clips.find(c=>c.video===entry.target);if(clip)clip.visible=entry.isIntersecting;});sync();
  },{threshold:0});
  clips.forEach(clip=>{observer.observe(clip.video);if(clip.video.readyState)clip.rewind();});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  return {update(p){progress=p;sync();},destroy(){dead=true;observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);clips.forEach(({video,ready,tick})=>{video.pause();video.removeEventListener('loadedmetadata',ready);video.removeEventListener('timeupdate',tick);video.removeEventListener('ended',ready);});}};
}
