import { state } from './state.js';
let renderer, scene, camera, mesh, frame = 0;
function stop() { cancelAnimationFrame(frame); frame = 0; }
function render(time = 0) {
  if (!renderer || document.hidden || state.activeWorld || state.isMobile || state.reducedMotion || window.scrollY > window.innerHeight) { stop(); return; }
  mesh.rotation.z = time * .000035;
  mesh.rotation.y += ((state.hoveredWorld === 'art' ? -.4 : .4) - mesh.rotation.y) * .025;
  renderer.render(scene, camera);
  frame = requestAnimationFrame(render);
}
export function updateThreeScene(world) {
  const canvas = document.querySelector('#webgl');
  canvas.hidden = !!world || state.isMobile || state.reducedMotion;
  if (canvas.hidden) stop(); else if (renderer && !frame) render();
}
export async function initThreeScene() {
  if (state.isMobile || state.reducedMotion || !matchMedia('(min-width: 1100px)').matches) return;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl'), alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 100); camera.position.z = 6;
    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(.6, 0), new THREE.MeshBasicMaterial({ color: 0xa9bf90, wireframe: true }));
    mesh.position.set(2.4, -.2, 0); scene.add(mesh);
    const resize = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); updateThreeScene(state.activeWorld); };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => updateThreeScene(state.activeWorld));
    // Only gates optional rendering; ScrollTrigger owns navigation.
    new IntersectionObserver(([entry]) => { if (entry.isIntersecting) updateThreeScene(state.activeWorld); else stop(); }).observe(document.querySelector('.hero-selector'));
    resize();
  } catch { document.querySelector('#webgl').hidden = true; }
}
