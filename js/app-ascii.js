// Discrete LED frames. One small clock, running only while this display is visible.
export function initAppASCII() {
  const display = document.querySelector('.app-ascii');
  if (!display || !window.gsap) return;
  const screen = display.querySelector('[data-ascii-frame]');
  const status = display.querySelector('[data-ascii-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['CODE', 'BUILD', 'TEST', 'LIVE'];
  const code = [
    ['<screen>         ', '  onTouch()      ', '</screen>        '],
    ['compile()        ', '[########....]   ', 'bundle -> app    '],
    ['tap(x, y)        ', 'assert: PASS     ', 'response: OK     '],
    ['scene.play()     ', 'input: ACTIVE    ', 'take: READY      ']
  ];
  let clock, visible = false, tick = 0, previous = '';
  function draw() {
    const phase = Math.floor(tick / 8) % 4;
    const blink = tick % 4 < 2;
    const phone = phase === 3 ? [' 12:48   ', ' [ LIVE ]', '  # ###  '] : phase === 2 ? [' [ TAP ] ', blink ? '    X    ' : '    +    ', '   OK    '] : phase === 1 ? [' LOADING ', blink ? ' ##....  ' : ' ####..  ', '         '] : ['  . . .  ', ' [ RUN ] ', '  _____  '];
    const text = ['+-- SOURCE --------+     +-- APP --+', ...code[phase].map((line,i) => `| ${line}| ${i===1?(blink?'--->':'- ->'):'    '} |${phone[i]}|`), '+------------------+     +---------+'].join('\n');
    if (text !== previous) { screen.textContent = text; previous = text; }
    status.textContent = `0${phase+1} / ${names[phase]}`;
  }
  function step() {
    tick++; draw();
    clock = gsap.delayedCall(.12, step);
  }
  function sync() {
    clock?.kill(); clock = null;
    if (reduced.matches) { tick=0; draw(); }
    else if (visible && !document.hidden) clock=gsap.delayedCall(.12,step);
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible=entry.isIntersecting && entry.intersectionRatio>.1; sync();
  },{threshold:[0,.1]});
  observer.observe(display);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    clock?.kill();observer.disconnect();
    document.removeEventListener('visibilitychange',sync);
    reduced.removeEventListener('change',sync);
  });
  draw();
}
