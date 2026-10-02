// Scroll moves the outer mark; pointer physics move its independent inner layer.
export function prepareToolMarks(section) {
  section.querySelectorAll('.about-tool > img').forEach(img => {
    const mark = document.createElement('div');
    mark.className = 'about-tool-mark';
    const spring = document.createElement('div');
    spring.className = 'about-tool-spring';
    const orange = img.cloneNode(true);
    orange.classList.add('about-tool-orange');
    img.replaceWith(mark);
    spring.append(img, orange);
    mark.append(spring);
  });
}

export function initToolHover(section, gsap) {
  const media = gsap.matchMedia();
  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const removers = [];
    const resets = [];
    section.querySelectorAll('.about-tool').forEach(cell => {
      const spring = cell.querySelector('.about-tool-spring');
      const [base, orange] = spring.children;
      const label = cell.querySelector('span');
      const ink = getComputedStyle(label).color;
      const accent = getComputedStyle(cell).getPropertyValue('--accent').trim();
      const values = { x: 0, y: 0, rotationX: 0, rotationY: 0, rotation: 0, scale: 1 };
      const target = { ...values };
      const velocity = Object.fromEntries(Object.keys(values).map(key => [key, 0]));
      const setters = Object.fromEntries(Object.keys(values).map(key => {
        if (key === 'scale') {
          const setX = gsap.quickSetter(spring, 'scaleX');
          const setY = gsap.quickSetter(spring, 'scaleY');
          return [key, value => { setX(value); setY(value); }];
        }
        return [key, gsap.quickSetter(spring, key, key === 'x' || key === 'y' ? 'px' : 'deg')];
      }));
      let ticking = false;
      let hovered = false;
      gsap.set(spring, { transformPerspective: 650, transformOrigin: '50% 50%' });
      const tick = (_time, delta) => {
        const dt = Math.min(delta / 1000, .032) / 2;
        let unsettled = false;
        for (const key of Object.keys(values)) {
          for (let step = 0; step < 2; step++) {
            velocity[key] += ((target[key] - values[key]) * 190 - velocity[key] * 18) * dt;
            values[key] += velocity[key] * dt;
          }
          const tolerance = key === 'scale' ? .0002 : .015;
          if (Math.abs(target[key] - values[key]) + Math.abs(velocity[key]) > tolerance) unsettled = true;
          else { values[key] = target[key]; velocity[key] = 0; }
          setters[key](values[key]);
        }
        if (!unsettled) { gsap.ticker.remove(tick); ticking = false; }
      };
      const wake = () => { if (!ticking) { ticking = true; gsap.ticker.add(tick); } };
      const follow = event => {
        if (event.pointerType === 'touch') return;
        const rect = cell.getBoundingClientRect();
        const x = gsap.utils.clamp(-1, 1, (event.clientX - rect.left) / rect.width * 2 - 1);
        const y = gsap.utils.clamp(-1, 1, (event.clientY - rect.top) / rect.height * 2 - 1);
        Object.assign(target, { x: x * 11, y: y * 9, rotationX: -y * 10, rotationY: x * 12, rotation: x * 3, scale: 1.1 });
        wake();
      };
      const enter = event => {
        if (event.pointerType === 'touch') return;
        hovered = true;
        cell.classList.add('is-tool-hovered');
        gsap.to(base, { opacity: 0, duration: .32, ease: 'power2.out', overwrite: true });
        gsap.to(orange, { opacity: 1, duration: .32, ease: 'power2.out', overwrite: true });
        gsap.to(label, { color: accent, duration: .25, overwrite: true });
        follow(event);
      };
      const leave = () => {
        if (!hovered) return;
        hovered = false;
        cell.classList.remove('is-tool-hovered');
        Object.assign(target, { x: 0, y: 0, rotationX: 0, rotationY: 0, rotation: 0, scale: 1 });
        gsap.to(base, { opacity: 1, duration: .45, overwrite: true });
        gsap.to(orange, { opacity: 0, duration: .45, overwrite: true });
        gsap.to(label, { color: ink, duration: .3, overwrite: true });
        wake();
      };
      cell.classList.add('has-tool-physics');
      cell.addEventListener('pointerenter', enter);
      cell.addEventListener('pointermove', follow);
      cell.addEventListener('pointerleave', leave);
      cell.addEventListener('pointercancel', leave);
      resets.push(leave);
      removers.push(() => {
        gsap.ticker.remove(tick);
        gsap.killTweensOf([base, orange, label]);
        cell.removeEventListener('pointerenter', enter);
        cell.removeEventListener('pointermove', follow);
        cell.removeEventListener('pointerleave', leave);
        cell.removeEventListener('pointercancel', leave);
        cell.classList.remove('has-tool-physics', 'is-tool-hovered');
        gsap.set([spring, base, orange, label], { clearProps: 'transform,transformOrigin,opacity,color' });
      });
    });
    const reset = () => resets.forEach(fn => fn());
    window.addEventListener('scroll', reset, { passive: true });
    document.addEventListener('visibilitychange', reset);
    return () => {
      window.removeEventListener('scroll', reset);
      document.removeEventListener('visibilitychange', reset);
      removers.forEach(fn => fn());
    };
  });
}
