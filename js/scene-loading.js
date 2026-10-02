// A scene is prepared before it enters the viewport, including horizontal pins.
// Content stays in the DOM; only decoding and decorative setup are deferred.
export function whenNear(element, prepare, distance = 900) {
  if (!element) return () => {};
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    prepare();
  };
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) run();
  }, { rootMargin: `${distance}px` });
  observer.observe(element);
  return run;
}

export function initSceneLoading() {
  document.querySelectorAll('img[loading="lazy"]').forEach(image => {
    whenNear(image, () => { image.loading = 'eager'; }, 650);
  });
  document.querySelectorAll('img[data-scene-src]').forEach(image => {
    whenNear(image, () => {
      image.loading = 'eager';
      if (image.dataset.sceneSrcset) image.srcset = image.dataset.sceneSrcset;
      image.src = image.dataset.sceneSrc;
      delete image.dataset.sceneSrc;
      delete image.dataset.sceneSrcset;
    });
  });
}
