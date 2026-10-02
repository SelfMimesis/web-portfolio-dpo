// Small, cached pixel samples of the original photographs; no image alteration.
const samples = new WeakMap();
const folds = new WeakMap();
export function foldFilmPhotoPalette(element, folded) {
  folds.get(element)?.(folded);
}
const distance = (a, b) => a.reduce((sum, channel, i) => sum + (channel - b[i]) ** 2, 0);
function sample(image) {
  image.loading = 'eager';
  if (!samples.has(image)) samples.set(image, image.decode().then(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 40;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, 40, 40);
    const pixels = context.getImageData(0, 0, 40, 40).data, colors = [];
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 128) colors.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }
    return colors;
  }));
  return samples.get(image);
}

function dominantColors(pixels) {
  // Farthest-point seeds keep small saturated details, such as the yellow bottle.
  const centers = [pixels[Math.floor(pixels.length / 2)]];
  while (centers.length < 6) {
    let best = pixels[0], furthest = -1;
    for (const pixel of pixels) {
      const d = Math.min(...centers.map(center => distance(pixel, center)));
      if (d > furthest) { best = pixel; furthest = d; }
    }
    centers.push(best);
  }
  for (let pass = 0; pass < 7; pass++) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (const pixel of pixels) {
      let nearest = 0;
      centers.forEach((center, i) => { if (distance(pixel, center) < distance(pixel, centers[nearest])) nearest = i; });
      pixel.forEach((value, channel) => { sums[nearest][channel] += value; });
      sums[nearest][3]++;
    }
    sums.forEach((sum, i) => { if (sum[3]) centers[i] = sum.slice(0, 3).map(value => value / sum[3]); });
  }
  const luminance = rgb => rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  return centers.sort((a, b) => luminance(a) - luminance(b)).map(rgb => '#' + rgb.map(value => Math.round(value).toString(16).padStart(2, '0')).join(''));
}

async function bikiniOrange(reference) {
  if (!reference) return null;
  // Decode a stable source: responsive srcset changes must not cancel this sample.
  const image = new Image();
  image.src = reference.src;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 40;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  // Sample the orange bikini in the lower-left foreground of the pool portrait.
  context.drawImage(image, 0, image.naturalHeight * .68, image.naturalWidth * .48, image.naturalHeight * .18, 0, 0, 40, 40);
  const pixels = context.getImageData(0, 0, 40, 40).data, orange = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b] = pixels.slice(i, i + 3);
    if (r > 130 && r > g * 1.65 && g > b * 1.6 && g > 45) orange.push([r, g, b]);
  }
  if (!orange.length) return null;
  return '#' + [0, 1, 2].map(channel => Math.round(orange.reduce((sum, rgb) => sum + rgb[channel], 0) / orange.length).toString(16).padStart(2, '0')).join('');
}

export function createFilmPhotoPalette(board, { reducedMotion = false } = {}) {
  const element = document.createElement('div');
  element.className = 'film-photo-palette';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', 'Paleta de colores de las fotografías');
  element.innerHTML = '<span aria-hidden="true"></span>'.repeat(7);
  board.append(element);
  const swatches = [...element.children], cache = new Map();
  const orange = bikiniOrange(board.querySelector('img[src*="pool-portrait"]')).catch(() => null);
  let current = '', request = 0, disposed = false, folded = false;
  // Each hinged swatch closes toward its right-hand neighbour. The final one
  // compresses to its right edge; reversing scroll opens the same sequence.
  const fold = !reducedMotion && window.gsap ? gsap.timeline({
    paused: true,
    onComplete: () => { if (folded && !disposed) gsap.set(element, { autoAlpha: 0 }); }
  }) : null;
  if (fold) {
    swatches.slice(0, -1).forEach((swatch, i) => {
      fold.to(swatch, { rotationY: -90, duration: .2, ease: 'power2.inOut' }, i * .18);
    });
    fold.to(swatches.at(-1), { scaleX: 0, duration: .32, ease: 'power3.inOut' }, (swatches.length - 1) * .18);
  }
  folds.set(element, value => {
    if (disposed || folded === value) return;
    folded = value;
    element.setAttribute('aria-hidden', String(folded));
    if (!fold) { element.style.visibility = folded ? 'hidden' : 'visible'; return; }
    gsap.set(element, { autoAlpha: 1 });
    if (folded) fold.play(); else fold.reverse();
  });
  return {
    update(images) {
      const key = images.map(image => image.src).join('|');
      if (key === current) return;
      current = key;
      const id = ++request;
      if (!cache.has(key)) cache.set(key, Promise.all([Promise.all(images.map(sample)), orange]).then(([groups, accent]) => {
        const colors = dominantColors(groups.flat());
        colors.splice(4, 0, accent || colors[3]);
        return colors.reverse();
      }));
      cache.get(key).then(colors => {
        if (disposed || id !== request) return;
        element.hidden = false;
        element.dataset.colors = colors.join(',');
        element.setAttribute('aria-label', `Paleta de las fotografías: ${colors.join(', ')}`);
        swatches.forEach((swatch, i) => {
          if (reducedMotion || !window.gsap) { swatch.style.backgroundColor = colors[i]; swatch.style.opacity = '1'; return; }
          // Colour sampling can finish during a fold: preserve its hinge tween.
          gsap.killTweensOf(swatch, 'backgroundColor,opacity,y,scaleY');
          gsap.to(swatch, { backgroundColor: colors[i], opacity: 1, duration: .8, delay: i * .045, ease: 'power2.inOut' });
          gsap.fromTo(swatch, { y: 7, scaleY: .6 }, { y: 0, scaleY: 1, duration: .75, delay: i * .045, ease: 'back.out(1.4)' });
        });
      }).catch(() => { if (!disposed && id === request) element.hidden = true; });
    },
    destroy() { disposed = true; fold?.kill(); folds.delete(element); swatches.forEach(swatch => window.gsap?.killTweensOf(swatch)); window.gsap?.killTweensOf(element); element.remove(); }
  };
}
