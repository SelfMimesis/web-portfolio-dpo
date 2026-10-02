// A single stationary canvas: each chapter moves its own layers, never the page.
import { composeResearchPhotos } from './film-photo-decks.js';
const clamp = n => Math.max(0, Math.min(1, n));
export const filmTiming = () => {
  const intro = Math.max(700, innerHeight * .9), arrival = innerHeight;
  const holds = [Math.max(1800, innerHeight * 2), Math.max(3800, innerHeight * 4.6), 2400, 2700, 2500, Math.max(500, innerHeight * .65)];
  const transition = Math.max(850, innerHeight);
  let cursor = intro + arrival;
  const chapters = holds.map((hold, i) => { const start = cursor; cursor += hold + (i < 5 ? transition : 0); return { start, hold }; });
  return { intro, arrival, chapters, transition, total: cursor };
};

export function createFilmStage(root) {
  const pages = [...root.querySelectorAll('.film-page')];
  const layers = pages.map(page => [...page.querySelectorAll('.film-layout > div')]);
  const title = root.querySelector('.film-original-title');
  const synopsis = root.querySelector('.film-synopsis');
  const pool = root.querySelector('.film-pool');
  const poolImage = pool.querySelector('img');
  const researchLayout = pages[1].querySelector('.film-layout');
  const researchCopy = pages[1].querySelector('.film-copy');
  const board = pages[1].querySelector('.film-research-board');
  let boardWidth = 0, fullWidth = 0, boardShift = 0;
  const refresh = () => {
    pages.forEach(page => {
      const layout = page.querySelector('.film-layout');
      layout.style.setProperty('--film-space-height', `${layout.clientHeight}px`);
    });
    // The text may be narrower than its grid span; measure the photo module itself.
    const boardLeft = board.getBoundingClientRect().left - researchLayout.getBoundingClientRect().left - Number(gsap.getProperty(board, 'x'));
    boardWidth = researchLayout.clientWidth - boardLeft;
    const photoGap = parseFloat(getComputedStyle(board).columnGap);
    const photoHeight = Math.max(0, Math.min(board.clientHeight, researchLayout.clientHeight) - 36);
    fullWidth = Math.min(researchLayout.clientWidth, photoHeight * 13 / 6 + photoGap + 44);
    boardShift = boardLeft - (researchLayout.clientWidth - fullWidth) / 2;
  };
  refresh();
  const ease = gsap.parseEase('power2.inOut');
  const set = gsap.set;
  const paint = time => {
    const { chapters, transition } = filmTiming();
    let active = 0;
    pages.forEach((page, index) => {
      const { start, hold } = chapters[index];
      const incoming = index ? clamp((time - start + transition) / transition) : 1;
      const outgoing = index < 5 ? clamp((time - start - hold) / transition) : 0;
      const enter = ease(incoming), leave = ease(outgoing);
      const visible = incoming > 0 && outgoing < 1;
      set(page, { visibility: visible ? 'visible' : 'hidden' });
      page.inert = !visible || incoming < .55 || outgoing > .55;
      if (incoming >= .55) active = index;
      layers[index].forEach((element, layer) => {
        // Text fades upwards; photographic boards arrive from below the frame.
        const isCopy = element.matches('.film-copy,.film-opening-copy,.film-frames-heading');
        const entry = isCopy ? 100 : innerHeight * (1 + layer * .08);
        const copyOpacity = clamp((incoming - .42) / .58) * (1 - clamp(outgoing / .42));
        set(element, { y: (1 - enter) * entry - leave * (isCopy ? 95 : innerHeight), opacity: isCopy ? copyOpacity : 1 });
      });
      set(page.querySelector('.film-footer'), { opacity: enter * (1 - leave) });
      const progress = clamp((time - start) / hold);
      if (index === 1) {
        const expansion = ease(clamp((progress - .10) / .22));
        set(board, { width: boardWidth + (fullWidth - boardWidth) * expansion, x: -boardShift * expansion });
        composeResearchPhotos(board, expansion);
        set(researchCopy, { x: -160 * expansion, opacity: clamp((incoming - .42) / .58) * (1 - clamp(outgoing / .42)) * (1 - expansion) });
      }
      // The paper props enter later than the photographs, at different depths.
      page.querySelectorAll('.film-paper').forEach((paper, i) => {
        const reveal = ease(clamp((progress - .08 - i * .09) / .28));
        set(paper, { y: (1 - reveal) * 130, x: (1 - reveal) * (i % 2 ? 70 : -70), rotation: (1 - reveal) * (i % 2 ? 12 : -12), opacity: reveal });
      });
      if (index === 2) {
        page.querySelectorAll('.film-workshop .film-image').forEach((photo, i) => set(photo, { y: (1 - ease(clamp((progress - .22 - i * .1) / .25))) * 150, opacity: clamp((progress - .22 - i * .1) / .25) }));
        set(page.querySelector('.film-palette-inset'), { y: (1 - ease(clamp(progress / .5))) * 100 });
      }
      if (index === 3) {
        const dissolve = ease(clamp((progress - .35) / .4));
        set(page.querySelector('.film-frame-first'), { yPercent: -dissolve * 100 });
        set(page.querySelector('.film-frame-next'), { yPercent: (1 - dissolve) * 100 });
      }
      if (index === 4) page.querySelectorAll('.film-places-row .film-image').forEach((photo, i) => set(photo, { y: (1 - ease(clamp((progress - i * .2) / .4))) * 150, opacity: clamp((progress - i * .2) / .4) }));
    });
    const opening = chapters[0];
    const expand = ease(clamp((time - opening.start) / (opening.hold * .65)));
    const departure = ease(clamp((time - opening.start - opening.hold) / transition));
    // The temporary aperture reveals the bottle, then opens to the full original.
    set(pool, { clipPath: `inset(${(1 - expand) * 32}% ${(1 - expand) * 33}% ${(1 - expand) * 7}% ${(1 - expand) * 33}%)`, scale: .86 + expand * .14, y: (1 - expand) * 45 });
    set(poolImage, { yPercent: (1 - expand) * -5 });
    set(title, { x: departure * innerWidth, scale: .82 + expand * .18, transformOrigin: 'left center' });
    set(layers[0][0], { y: 0, opacity: 1 });
    set(synopsis, { y: (1 - expand) * 35 - departure * 60, opacity: 1 - clamp(departure * 2.5), scale: .94 + expand * .06, transformOrigin: 'left top' });
    root.dataset.filmChapter = String(active);
    return active;
  };
  return { paint, refresh };
}
