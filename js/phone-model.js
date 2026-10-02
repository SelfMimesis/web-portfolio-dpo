const clamp = value => Math.max(0,Math.min(1,value));
let modelText;

// The supplied OBJ stays local. DOM interfaces remain readable/selectable above its screen.
export function createPhoneModel(demo) {
  const stage=document.createElement('div');stage.className='phone-stage';
  const canvas=document.createElement('canvas');canvas.className='phone-model';canvas.setAttribute('aria-hidden','true');
  const fallback=document.createElement('div');fallback.className='phone-fallback';fallback.setAttribute('aria-hidden','true');
  const display=document.createElement('div');display.className='phone-display';
  const content=document.createElement('div');content.className='phone-content';
  const children=[...demo.children];children.forEach(node=>content.append(node));
  display.append(content);stage.append(fallback,canvas,display);demo.append(stage);demo.classList.add('has-phone-model');
  let renderer,scene,camera,model,THREE,dead=false,progress=0,width=0,height=0;
  let stageWidth=stage.clientWidth,stageHeight=stage.clientHeight,lastPose='';
  const materials=new Set();
  const layout=(left,top,w,h)=>{
    display.style.left=`${left}px`;display.style.top=`${top}px`;display.style.width=`${w}px`;display.style.height=`${h}px`;
    content.style.transform=`scale(${w/300})`;content.style.height=`${h*300/w}px`;
  };
  const render=(force=false)=>{
    if(dead)return;
    const bounds={width:stageWidth,height:stageHeight};
    if(!bounds.width || !bounds.height)return;
    const turn=clamp((progress-.095)/.165),ease=turn*turn*(3-2*turn);
    const reveal=clamp((progress-.26)/.02);
    const pose=`${stageWidth}/${stageHeight}/${turn}/${reveal}`;
    // Once face-on, only the DOM app changes. Keep the existing WebGL frame.
    if(!force&&pose===lastPose)return;
    lastPose=pose;
    display.style.opacity=String(reveal);
    display.style.visibility=progress>.26?'visible':'hidden';
    if(!renderer){
      const h=bounds.height*.916,w=h*.463;
      layout((bounds.width-w)/2,(bounds.height-h)/2,w,h);
      fallback.style.transform=`perspective(1000px) rotateY(${(1-ease)*-205}deg) rotateZ(${(1-ease)*-12}deg) scale(${.85+.15*ease})`;
      return;
    }
    if(width!==bounds.width || height!==bounds.height){
      width=bounds.width;height=bounds.height;renderer.setSize(width,height,false);
      const half=.084;
      camera.left=-half*width/height;camera.right=half*width/height;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
    }
    model.rotation.set((1-ease)*.24,(1-ease)*-3.58,(1-ease)*-.21);
    model.position.y=(1-ease)*-.008;model.scale.setScalar(.85+.15*ease);
    model.updateMatrixWorld(true);
    const a=new THREE.Vector3(-.035638,.159671-.08269,.0038).applyMatrix4(model.matrixWorld).project(camera);
    const b=new THREE.Vector3(.035623,.00571-.08269,.0038).applyMatrix4(model.matrixWorld).project(camera);
    // Interfaces enter only after the physical device has settled face-on.
    if(turn===1)layout((a.x+1)*width/2,(1-a.y)*height/2,(b.x-a.x)*width/2,(a.y-b.y)*height/2);
    renderer.render(scene,camera);
  };
  const observer=new ResizeObserver(([entry])=>{stageWidth=entry.contentRect.width;stageHeight=entry.contentRect.height;render();});observer.observe(stage);
  const contextLost=event=>{event.preventDefault();renderer=null;stage.classList.remove('phone-ready');stage.dataset.model='fallback';render(true);};
  canvas.addEventListener('webglcontextlost',contextLost);
  let loading=false;
  const load=async()=>{
    if(loading||dead)return;
    loading=true;warmup.disconnect();
    try {
      const [three,{OBJLoader},source]=await Promise.all([
        import('./vendor/three/three.module.js'),import('./vendor/three/OBJLoader.js'),
        modelText??=fetch(new URL('../assets/models/iphone12/phone.obj',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Phone model unavailable');return r.text();})
      ]);
      if(dead)return;
      THREE=three;
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
      renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
      scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-.1,.1,.089,-.089,.01,2);camera.position.set(0,0,.45);camera.lookAt(0,0,0);camera.updateMatrixWorld();
      scene.add(new THREE.HemisphereLight(0xe5efd3,0x334338,2.8));
      const key=new THREE.DirectionalLight(0xf2f8df,4);key.position.set(-.2,.3,.35);scene.add(key);
      const rim=new THREE.DirectionalLight(0xa7cda1,3);rim.position.set(.25,.15,-.2);scene.add(rim);
      const fill=new THREE.DirectionalLight(0xd7e7ce,1.5);fill.position.set(.2,-.2,.3);scene.add(fill);
      model=new THREE.Group();const body=new OBJLoader().parse(source);body.position.y=-.08269;
      body.traverse(mesh=>{
        if(!mesh.isMesh)return;
        const name=mesh.name;
        const old=Array.isArray(mesh.material)?mesh.material:[mesh.material];old.forEach(m=>m.dispose());
        if(/PhoneFilm|FrontGlass/.test(name)){mesh.visible=false;return;}
        let color=0x18221e,metalness=.25,roughness=.38;
        if(/SideMetal|Buttons|RoundFlash|CameraRounds|StarScrew/.test(name)){color=0x819389;metalness=.85;roughness=.28;}
        if(/BackPhoneBody/.test(name)){color=0x516656;metalness=.38;roughness=.28;}
        if(/CameraGlass|Cameras|BlueCamera/.test(name)){color=0x111d24;metalness=.65;roughness=.12;}
        if(/Flash/.test(name)){color=0xd3dac3;metalness=.1;roughness=.45;}
        const material=/InsideDisplay/.test(name)?new THREE.MeshBasicMaterial({color:0x1e261d}):new THREE.MeshStandardMaterial({color,metalness,roughness});
        materials.add(material);mesh.material=material;
      });
      model.add(body);scene.add(model);
      // Compile shaders asynchronously where the driver supports it.
      await renderer.compileAsync(scene,camera);
      if(dead)return;
      stage.classList.add('phone-ready');stage.dataset.model='supplied-obj';render(true);
    } catch(error){if(dead)return;stage.dataset.model='fallback';console.warn('Phone model: using readable static fallback.',error);renderer?.dispose();renderer=null;render(true);}
  };
  // Prepare while the preceding chapter is being read, not during cover opening.
  const warmup=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.05))load();
  },{threshold:[0,.05]});
  warmup.observe(demo.closest('.scrolly').querySelector('.panel--playback')||stage);
  render();
  return {
    update(p){if(p>0)load();if(p===progress)return;progress=p;render();},
    destroy(){dead=true;warmup.disconnect();observer.disconnect();canvas.removeEventListener('webglcontextlost',contextLost);model?.traverse(mesh=>mesh.geometry?.dispose());materials.forEach(m=>m.dispose());renderer?.dispose();children.forEach(node=>demo.append(node));stage.remove();demo.classList.remove('has-phone-model');}
  };
}
