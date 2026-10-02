import { imageSources } from './image-sources.js';

export function setResponsiveImage(image, source) {
  if (!source || image.dataset.responsiveSource === source) return;
  const entry = imageSources[source];
  image.decoding = 'async';
  image.loading = 'eager';
  if (entry) {
    image.width = entry.width;
    image.height = entry.height;
    image.sizes = entry.sizes;
    image.srcset = entry.variants.map(item => `${item.src} ${item.width}w`).join(', ');
    image.src = entry.variants[0].src;
  } else {
    image.removeAttribute('srcset');
    image.src = source;
  }
  image.dataset.responsiveSource = source;
}
