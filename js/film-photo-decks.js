import { createFilmScrollDots } from './film-scroll-dots.js';
import { createFilmPhotoPalette, foldFilmPhotoPalette } from './film-photo-palette.js';
// Portrait and landscape photographs retain independent, uncropped frames.
export function createFilmPhotoDecks(root, { reducedMotion, seek } = {}) {
  const board = root.querySelector('.film-research-board');
  const palette = createFilmPhotoPalette(board, { reducedMotion });
  const controls = document.createElement('div');
  controls.className = 'film-research-progress';
  controls.setAttribute('aria-label', 'Progreso de la galería de fotografías');
  board.append(controls);
  const count = Math.max(...[...board.querySelectorAll('.film-photo-deck')].map(deck => deck.querySelectorAll('.film-deck-slide').length));
  const dots = createFilmScrollDots(controls, { count, seek, reducedMotion, axis: 'y' });
  let firstUpdate = true;
  const decks = [...root.querySelectorAll('.film-photo-deck')].map(element => {
    const slides = [...element.querySelectorAll('.film-deck-slide')];
    let active = -1;
    const render = progress => {
      if (reducedMotion || !window.gsap) return;
      const value = Math.round(Math.max(0, Math.min(1, progress)) * (slides.length - 1));
      if (value === active) return;
      const first = active === -1;
      active = value;
      slides.forEach((slide, i) => {
        gsap.to(slide, { yPercent: (i - value) * 100, duration: first ? 0 : .7, ease: 'power2.inOut', overwrite: true });
        slide.inert = i !== active;
      });
    };
    return { element, slides, render, image: () => slides[Math.max(0, active)].querySelector('img') };
  });
  return {
    update(progress) { decks.forEach(deck => deck.render(progress)); dots.update(progress, firstUpdate); palette.update(decks.map(deck => deck.image())); firstUpdate = false; },
    destroy() {

      dots.destroy(); controls.remove();
      palette.destroy();
      decks.forEach(deck => ['width', 'transform', 'border-width'].forEach(property => deck.element.style.removeProperty(property)));
      decks.forEach(deck => deck.slides.forEach(slide => { window.gsap?.killTweensOf(slide); slide.inert = false; slide.style.removeProperty('transform'); slide.style.removeProperty('opacity'); slide.style.removeProperty('visibility'); }));
    }
  };
}

// The introductory overlap unfolds into two complete, equally tall photographs.
export function composeResearchPhotos(board, expansion) {
  const width = board.clientWidth - 44, height = board.clientHeight - 36;
  const gap = parseFloat(getComputedStyle(board).columnGap);
  const border = 8 * (1 - expansion);
  const lerp = (a, b) => a + (b - a) * expansion;
  const landscape = board.querySelector('.film-research-main');
  const portrait = board.querySelector('.film-research-inset');
  const mainWidth = Math.min(width * .96, (height - 48) * 1.5);
  // The portrait overlaps only the empty pool at the left of the landscape.
  const mainLeft = width - mainWidth;
  const insetWidth = Math.min(width * .34, mainWidth * .36, (height - 24) * 2 / 3);
  const mainHeight = (mainWidth - 16) * 2 / 3 + 16;
  const insetHeight = (insetWidth - 16) * 1.5 + 16;
  const mainTop = Math.max(0, (height - mainHeight) / 2 - 24);
  const palette = board.querySelector('.film-photo-palette');
  const paletteHeight = palette?.offsetHeight || 18;
  const paletteGap = 8;
  const portraitTop = Math.max(0, mainTop + mainHeight - insetHeight - 8 - paletteHeight - 2 * paletteGap);
  const galleryHeight = Math.min(height, (width - gap) * 6 / 13);
  const galleryLeft = (width - galleryHeight * 13 / 6 - gap) / 2;
  const galleryTop = (height - galleryHeight) / 2;
  gsap.set(landscape, { width: lerp(mainWidth, galleryHeight * 1.5), x: lerp(mainLeft, galleryLeft), y: lerp(mainTop, galleryTop), borderWidth: border });
  gsap.set(portrait, { width: lerp(insetWidth, galleryHeight * 2 / 3), x: lerp(0, galleryLeft + galleryHeight * 1.5 + gap), y: lerp(portraitTop, galleryTop), borderWidth: border });
  if (palette) {
    // Centre the palette between the portrait frame and the landscape's image
    // edge. Freeze its geometry during folding, so the hinges do not drift.
    if (expansion === 0) gsap.set(palette, { width: insetWidth - 16, x: 8, y: (portraitTop + insetHeight + mainTop + mainHeight - 8 - paletteHeight) / 2 });
    foldFilmPhotoPalette(palette, expansion > 0);
  }
}
