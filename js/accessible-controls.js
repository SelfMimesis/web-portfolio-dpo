import { COMPACT_QUERY } from './state.js';

export function initAccessibleControls() {
  const header = document.querySelector('.site-header');
  const nav = header.querySelector('nav');
  nav.id = 'main-navigation';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'menu-toggle';
  button.textContent = 'Menu +';
  button.setAttribute('aria-controls', nav.id);
  button.setAttribute('aria-expanded', 'false');
  nav.before(button);
  header.classList.add('has-menu');
  const compact = matchMedia(COMPACT_QUERY);
  const close = (focus = false) => {
    header.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Menu +';
    nav.inert = compact.matches;
    if (focus) button.focus();
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    header.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close −' : 'Menu +';
    nav.inert = !open && compact.matches;
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) close(true);
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
  header.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!header.contains(document.activeElement)) close();
  }));
  compact.addEventListener('change', () => close());
  close();
}
