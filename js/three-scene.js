import { state } from './state.js';
let renderer, scene, camera, mesh, frame = 0, canvas;
let visible = false;
const rotation = { x: .15, y: .35 };
let sync = () => {};
function stop() { cancelAnimationFrame(frame); frame = 0; }
function render() {
  frame = 0;
  if (!renderer || !visible || document.hidden || state.isMobile || state.reducedMotion) return;
  mesh.rotation.x += (rotation.x - mesh.rotation.x) * .12;
  mesh.rotation.y += (rotation.y - mesh.rotation.y) * .12;
  renderer.render(scene, camera);
  // Draw only while the pointer-driven rotation is settling.
  if (Math.abs(rotation.x-mesh.rotation.x)+Math.abs(rotation.y-mesh.rotation.y) > .0005) frame = requestAnimationFrame(render);
}
function wake() { if (!frame) frame = requestAnimationFrame(render); }
export function updateThreeScene() { sync(); }
export async function initThreeScene() {
  canvas = document.querySelector('#webgl');
  canvas.hidden = true;
  const hosts = [...document.querySelectorAll('.cockpit-radar')];
  if (!hosts.length) return;
  hosts[0].prepend(canvas);
  if (state.isMobile || state.reducedMotion || !matchMedia('(min-width: 1100px)').matches) return;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, .1, 100); camera.position.z = 3.6;
    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(.85, 0), new THREE.MeshBasicMaterial({ color: 0xa9bf90, wireframe: true }));
    mesh.rotation.set(rotation.x, rotation.y, .12);
    scene.add(mesh);
    const ratios = new Map(hosts.map(host => [host,0]));
    let size = 0;
    const resize = () => {
      const next = canvas.clientWidth;
      if (next > 0 && next !== size) { size=next; renderer.setSize(size,size,false); }
      wake();
    };
    sync = () => {
      const host = hosts.reduce((best,node) => ratios.get(node) > (ratios.get(best)||0) ? node : best, hosts[0]);
      visible = ratios.get(host) > .1 && !state.isMobile && !state.reducedMotion && !document.hidden;
      canvas.hidden = !visible;
      if (!visible) { stop(); return; }
      if (canvas.parentElement !== host) host.prepend(canvas);
      resize();
    };
    const pointer = event => {
      rotation.x = (event.clientY / innerHeight - .5) * .7;
      rotation.y = (event.clientX / innerWidth - .5) * 1.2;
      if (visible) wake();
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
      sync();
    }, { threshold: [0,.1,.5,1] });
    hosts.forEach(host => observer.observe(host));
    const sizing = new ResizeObserver(resize);
    sizing.observe(canvas);
    window.addEventListener('pointermove',pointer,{passive:true});
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('pagehide',event => {
      if(event.persisted)return;
      stop(); observer.disconnect(); sizing.disconnect();
      window.removeEventListener('pointermove',pointer);
      document.removeEventListener('visibilitychange',sync);
      mesh.geometry.dispose(); mesh.material.dispose(); renderer.dispose();
    });
    sync();
  } catch { canvas.hidden = true; }
}
