const source = [
  'const scene = vision.connect();',
  'const hand = scene.track("hand_01");',
  'hand.scan({ mode: "depth" });',
  'const mesh = scene.object("polyhedron");',
  'mesh.morph({ speed: 0.35 });',
  'scene.on("pointer", ({ x, y }) => {',
  '  hand.lookAt(x, y);',
  '  mesh.rotate(x * Math.PI);',
  '});',
  'scene.render({ contours: true });'
];

export function initDetectorTerminal(win, session, onInput, allowed, onScan) {
  const keyboard = win.querySelector('.detector-keyboard');
  const drawer = document.createElement('details');
  drawer.className = 'detector-keyboard-toggle';
  const summary = document.createElement('summary');
  summary.textContent = 'Scene keyboard';
  keyboard.before(drawer); drawer.append(summary, keyboard);
  const output = win.querySelector('.detector-terminal code');
  const scroll = output.parentElement;
  const terminal = win.querySelector('.detector-terminal');
  const scanLabel = terminal.querySelector('b');
  const meter = terminal.querySelector('.terminal-scan-meter i');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let scanTween, scanning = false, scanFrame = -1;
  const scanState = { progress: 0 };
  session.code ??= { completed: [], current: '', index: 0 };
  const state = session.code;
  const rows = [[...'1234567890', 'Backspace'], ['Tab', ...'QWERTYUIOP'], ['CapsLock', ...'ASDFGHJKL', 'Enter'], ['Shift', ...'ZXCVBNM', 'ArrowUp'], ['Control', 'Alt', 'Space', 'ArrowLeft', 'ArrowDown', 'ArrowRight']];
  const labels = { Backspace: '⌫', Enter: '↵', Tab: '⇥', CapsLock: 'CAPS', Shift: 'SHIFT', Control: 'CTRL', Alt: 'ALT', Space: 'SPACE', ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→' };
  const modifiers = ['CapsLock', 'Shift', 'Control', 'Alt'];
  keyboard.replaceChildren(...rows.map(keys => {
    const row = document.createElement('div');
    row.className = 'detector-key-row';
    keys.forEach(key => {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.key = key; button.tabIndex = -1;
      button.textContent = labels[key] || key;
      if (modifiers.includes(key)) button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', key === 'Enter' ? 'Complete code line' : key === 'Backspace' ? 'Erase code' : modifiers.includes(key) ? 'Toggle ' + key : key.startsWith('Arrow') ? 'Navigate ' + key.slice(5).toLowerCase() : 'Write code with ' + key);
      row.append(button);
    });
    return row;
  }));
  const buttons = [...keyboard.querySelectorAll('button')];
  buttons[0].tabIndex = 0;
  const render = () => {
    output.textContent = state.completed.concat(state.current).join('\n');
    scroll.scrollTop = scroll.scrollHeight;
  };
  const renderScan = () => {
    const percent = Math.floor(scanState.progress * 100);
    if (percent === scanFrame) return;
    scanFrame = percent;
    const filled = Math.round(percent / 100 * 14);
    const phase = percent < 18 ? 'Calibrating depth...' : percent < 46 ? 'Sampling contours...' :
      percent < 76 ? 'Resolving 05 landmarks...' : percent < 100 ? 'Building surface...' : 'SCAN COMPLETE / 05 LOCKED';
    scanLabel.textContent = percent < 100 ? 'SCANNING ' + String(percent).padStart(3, '0') + '%' : 'SCAN COMPLETE';
    output.textContent = '> HAND_01 / DEPTH\n[' + '|'.repeat(filled) + '.'.repeat(14-filled) + '] ' + String(percent).padStart(3, '0') + '%\n' + phase;
    meter.style.transform = `scaleX(${scanState.progress})`;
    scroll.scrollTop = scroll.scrollHeight;
    terminal.dataset.scanProgress = String(percent);
    onScan(scanState.progress, percent < 100);
  };
  const cancelScan = () => {
    scanTween?.kill(); scanning = false;
    terminal.classList.remove('is-scanning');
    terminal.removeAttribute('data-scan-progress');
    meter.style.transform = 'scaleX(0)'; scanLabel.textContent = 'TYPE TO BUILD';
    onScan(0, false);
  };
  const scan = () => {
    if (!allowed()) return;
    scanTween?.kill(); scanning = !reduced; scanFrame = -1;
    scanState.progress = reduced ? 1 : 0;
    terminal.classList.toggle('is-scanning', scanning);
    win.querySelector('.detector-announcement').textContent = reduced ? 'Hand scan complete. Five landmarks resolved.' : 'Scanning hand.';
    renderScan();
    if (reduced) return;
    scanTween = window.gsap.to(scanState, {
      progress: 1, duration: 1.8, ease: 'none', onUpdate: renderScan,
      onComplete: () => {
        scanning = false; terminal.classList.remove('is-scanning');
        win.querySelector('.detector-announcement').textContent = 'Hand scan complete. Five landmarks resolved.';
      }
    });
  };
  const finish = () => {
    state.completed.push(source[state.index % source.length]);
    if (state.completed.length > 16) state.completed.shift();
    state.current = ''; state.index++;
  };
  const write = key => {
    if (!allowed()) return;
    if (modifiers.includes(key)) {
      const button = buttons.find(button => button.dataset.key === key);
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    cancelScan();
    if (key === 'Backspace') {
      if (state.current) state.current = state.current.slice(0, -1);
      else if (state.completed.length) { state.current = state.completed.pop(); state.index = Math.max(0, state.index - 1); }
    } else if (key === 'Enter') finish();
    else {
      const line = source[state.index % source.length];
      state.current = line.slice(0, state.current.length + 6 + key.charCodeAt(0) % 5);
      if (state.current === line) finish();
    }
    const button = buttons.find(button => button.dataset.key === key);
    buttons.forEach(button => button.classList.remove('is-key-active'));
    button?.classList.add('is-key-active');
    render(); onInput();
  };
  const focusButton = button => {
    buttons.forEach(key => { key.tabIndex = key === button ? 0 : -1; });
    button.focus({ preventScroll: true });
  };
  const click = event => {
    const button = event.target.closest('[data-key]');
    if (!button) return;
    const directions = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -11, ArrowDown: 11 };
    if (button.dataset.key in directions) {
      focusButton(buttons[(buttons.indexOf(button) + directions[button.dataset.key] + buttons.length) % buttons.length]);
      return;
    }
    focusButton(button); write(button.dataset.key);
  };
  const keydown = event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const index = Math.max(0, buttons.indexOf(document.activeElement));
    const directions = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -11, ArrowDown: 11 };
    if (event.key in directions) {
      event.preventDefault(); focusButton(buttons[(index + directions[event.key] + buttons.length) % buttons.length]); return;
    }
    if (event.key === 'Backspace' || event.key === 'Enter' || /^[a-zA-Z0-9]$/.test(event.key)) {
      event.preventDefault(); write(event.key.length === 1 ? event.key.toUpperCase() : event.key);
    }
  };
  const release = () => buttons.forEach(button => button.classList.remove('is-key-active'));
  keyboard.addEventListener('click', click);
  keyboard.addEventListener('keydown', keydown);
  keyboard.addEventListener('keyup', release);
  keyboard.addEventListener('pointerleave', release);
  terminal.addEventListener('click', scan);
  render();
  const destroy = () => {
    drawer.before(keyboard); drawer.remove();
    scanTween?.kill();
    terminal.removeEventListener('click', scan);
    terminal.classList.remove('is-scanning'); terminal.removeAttribute('data-scan-progress');
    meter.style.transform = ''; scanLabel.textContent = 'READY TO SCAN';
    keyboard.removeEventListener('click', click); keyboard.removeEventListener('keydown', keydown);
    keyboard.removeEventListener('keyup', release); keyboard.removeEventListener('pointerleave', release);
  };
  return { scan, setActive: active => { if (scanning) active ? scanTween?.resume() : scanTween?.pause(); }, destroy };
}
