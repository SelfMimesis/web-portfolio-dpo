// Vírgenes: original portfolio copy and original artwork, arranged for the scroll.
import { filmDimensions } from './selected-film-assets.js';
import { createFilmPhotoDecks, composeResearchPhotos } from './film-photo-decks.js';
import { createFilmPhotoPalette } from './film-photo-palette.js';
import { createFilmCarousel } from './film-carousel.js';
import { createFilmStage, filmTiming } from './film-stage.js';
export { filmTiming } from './film-stage.js';
const base = 'assets/films/virgenes/';
const img = (name, alt, cls = '', ext = 'jpg') => {
  const [width, height] = filmDimensions[name];
  const responsive = ext === 'jpg' && width > 800 ? ` srcset="${base}${name}-800.jpg 800w, ${base}${name}.jpg ${width}w" sizes="(max-width:700px) 88vw, 55vw"` : '';
  return `<img class="${cls}" src="${base}${name}.${ext}"${responsive} width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async">`;
};
const figure = (name, alt, cls = '', ext = 'jpg') => `<figure class="film-image ${cls}">${img(name, alt, '', ext)}</figure>`;
const copy = (label, title, paragraphs) => `<div class="film-copy"><span class="film-kicker">${label}</span><h2>${title}</h2>${paragraphs.map(p => `<p>${p}</p>`).join('')}</div>`;
const paper = (name, alt, cls, ext = 'png') => `<figure class="film-paper ${cls}">${img(name, alt, '', ext)}<figcaption>${alt}</figcaption></figure>`;
const photoDeck = (items, cls, label) => `<div class="film-photo-deck ${cls}" role="group" aria-label="${label}"><div class="film-photo-window">${items.map(([name, alt]) => figure(name, alt, 'film-deck-slide')).join('')}</div></div>`;

export const FILM_CHAPTERS = ['VÍRGENES / 2025', 'COLOR Y LIBERTAD', 'UN MUNDO GRÁFICO', 'PIHAMA / LA NOCHE', 'TORREMOLINOS', 'EN EL ENCUADRE'];

export function mountSelectedFilms(track) {
  const chapters = [
    ['opening', `<div class="film-opening-copy"><h2 class="film-original-title">${img('title-original', 'Vírgenes', '', 'png')}</h2><div class="film-synopsis"><p>“Vírgenes” es una comedia juvenil ambientada en la época dorada de Torremolinos, durante los años del auge turístico en la Costa del Sol. La historia gira en torno a tres amigos inseparables —Honorio, Rafa y Vicente— que están a punto de cumplir los 20 y viven atrapados en la monotonía de la represión franquista en Sevilla.</p><p>Un día, tras ver un NO-DO que muestra el brillo y la libertad que emanan de las playas de Torremolinos, especialmente por la llegada de turistas nórdicas, deciden emprender un viaje que marcará un antes y un después en sus vidas.</p><p>Cargan su viejo Seat 600 con lo poco que tienen, inventan excusas familiares y ponen rumbo a Torremolinos con una misión clara: perder la virginidad y descubrir el mundo que se les ha negado hasta entonces.</p></div></div><div class="film-opening-visual">${figure('pool', 'Refresco Fantasía junto a la piscina: imagen original del portfolio', 'film-pool')}<span class="film-year">2025</span></div>`],
    ['research', `${copy('01 / LA MIRADA', 'Color, música<br><i>y libertad.</i>', ['Para mí, trabajar en esta película fue una experiencia maravillosa. La ambientación recrea una época llena de color, música y libertad, en la que la creatividad estaba en pleno florecimiento.', 'Disfruté mucho el proceso de previo a la película investigando todo el mundo gráfico de las modernas discotecas que había en Torremolinos, en contraste con la sociedad retrógrada que rodeaba este oasis de modernidad; este choque entre modernidad y solemnidad era el concepto central en torno al cual construimos la identidad de la película.', 'Para ello estudié películas como “Días de viejo color” (1967), los clásicos del landismo como “Objetivo Bi-ki-ni” (1968) o películas más modernas como “Torremolinos 73” (2003), de Pablo Bérger.'])}<div class="film-research-board">${photoDeck([['fantasia','Etiqueta Fantasía en el refresco de una bañista'],['diving-platform','Los tres amigos en el trampolín frente al mar'],['summer-car','Los protagonistas en un descapotable'],['pool-party','Fiesta junto a la piscina']], 'film-research-main film-photo-deck--landscape', 'Fotografías horizontales')}${photoDeck([['pool-portrait','La piscina y el trampolín de Torremolinos'],['vespa-portrait','Dos personajes sobre una Vespa frente al mar'],['seat-portrait','Retrato de una protagonista en el Seat 600']], 'film-research-inset film-photo-deck--portrait', 'Fotografías verticales')}${paper('map', 'Mapa de carreteras · 1965', 'film-map', 'jpg')}</div>`],
    ['palette', `<div class="film-palette-board">${figure('still-life', 'Discos, tebeos y etiquetas diseñados para el universo de Vírgenes', 'film-palette-main')}${figure('cocktails', 'Copas, tabaco y atrezo gráfico de época', 'film-palette-inset')}${paper('matchbox-sudan', 'Cerillas Sudán', 'film-palette-matches', 'jpg')}<div class="film-workshop">${figure('workshop-labels', 'Etiquetas y piezas impresas en la mesa de trabajo')}${figure('workshop-bottle', 'Aplicación de una etiqueta a una botella')}${figure('workshop-print', 'Pliego de etiquetas de época')}</div></div>${copy('02 / ARCHIVO Y ATREZO', 'Una época.<br><i>Todo un mundo.</i>', ['Para esta película trabajamos con una paleta de colores muy rica y variopinta. Las escenas ambientadas en la Costa del Sol tenían una gama vibrante, llena de luz, tonos cálidos y saturados que evocan el espíritu del turismo internacional de finales de los años 60. En cambio, las escenas iniciales en Sevilla se mostraban con una estética más sobria y apagada, reflejando la rutina y el encierro de los protagonistas.', 'Navegué por numerosos archivos como el de HOLA, ABC y la Biblioteca Digital Hispánica… Tebeos, discos, anuncios, etiquetas. El atrezo fue extenso y detallado, con versiones tanto españolas como extranjeras de cada objeto, desde un brandy castizo hasta un elegante coñac importado. Incluí cerillas de hoteles internacionales, tabaco de mascar sueco, señales imantadas propias de 1969 y logotipos antiguos de compañías estatales, como Correos o la Guardia Civil.'])}`],
    ['night', `<div class="film-night-board">${figure('pihama', 'Los tres protagonistas bajo el neón Pihama', 'film-night-main')}${paper('coaster', 'Posavasos Pihama', 'film-coaster')}${paper('matchbox-pihama', 'Cerillas Pihama', 'film-night-matches', 'jpg')}</div><div class="film-night-side"><h2 class="film-pihama-title"><picture><source media="(prefers-reduced-motion: reduce)" srcset="${base}pihama-still.png"><img src="${base}pihama-animated.gif" width="3508" height="2480" alt="Pihama — rótulo animado original de la sala" loading="lazy"></picture></h2><div class="film-dissolve">${figure('pihama-dance', 'La pista de baile de Pihama', 'film-frame-first')}${figure('valentini-scene', 'La etiqueta Valentini en la barra de la discoteca', 'film-frame-next')}</div><div class="film-copy"><p>Gracias a maravillosas páginas de archivo como Torremolinos Chic, pude sumergirme en el fascinante universo gráfico de las míticas discotecas de la Costa del Sol: Tiffany’s, Bossanova Club o el legendario Barbarella, conocido por su estilo Swingin’ London, que sirvió como inspiración principal para nuestra discoteca ficticia “PIHAMA”, que rodamos en la icónica Holiday, epicentro de la movida sevillana.</p><p>Flyers, posavasos, mecheros promocionales, etiquetas de botellas y otros elementos que ayudaron a construir una atmósfera creíble y exuberante. El toque final fue un gran letrero de neón LED animado que coronaba la sala. Fue en este espacio donde nuestros protagonistas descubren una vida nocturna nunca antes vista en España.</p></div></div>`],
    ['places', `<div class="film-places-board">${figure('cupido', 'Discoteca Cupido en el pasaje de La Nogalera', 'film-cupido')}${paper('cupido-sign', 'Rótulo Discoteca Cupido', 'film-cupido-paper', 'jpg')}<div class="film-places-row">${figure('welcome', 'Bienvenido a Torremolinos / Welcome')}${figure('hostal-arrival', 'Fachada del Hostal Jardín y Seat 600')}</div>${paper('hostal', 'Hostal Jardín', 'film-hostal-badge')}${paper('matchbox-astoria', 'Cerillas Astoria', 'film-places-matches', 'jpg')}</div>${copy('04 / ROTULACIÓN Y DECORACIÓN', 'Bienvenido a<br><i>Torremolinos.</i>', ['Además, tuve que desarrollar la imagen de otras discotecas situadas en lugares emblemáticos como el mítico pasaje de La Nogalera, que junto con el pasaje Begoña es considerado la cuna del movimiento LGTBI+ en España. Para estas salas, diseñé una serie de letreros inspirados en la estética de la época, teniendo en cuenta que en su momento estos locales no eran completamente legales. Por ello, fue fundamental abordar el tema con discreción, utilizando códigos visuales y referencias sutiles que aludieran a su verdadera temática sin exponerse abiertamente.', 'Otro reto importante fue recrear el Torremolinos clásico. La ambientación resultó compleja, ya que hoy en día queda muy poco de aquel pueblo blanco costero de los años 60, ahora transformado en un entramado de grandes complejos turísticos de arquitectura brutalista. Para ello hicieron falta muchos elementos gráficos de soporte a decoración para convertir construcciones clásicas de pueblos colindantes de Torremolinos en los edificios que visitaban nuestros protagonistas.'])}`],
    ['frames', `<div class="film-frames-heading"><span class="film-kicker">05 / DEL DISEÑO AL ENCUADRE</span><h2>La gráfica<br><i>entra en escena.</i></h2><span class="film-end-mark">VÍRGENES / 2025<br>DISEÑO GRÁFICO PARA CINE</span></div><div class="film-carousel" role="region" aria-label="Capturas de Vírgenes"><div class="film-carousel-window"><div class="film-contact-sheet">${[['book','Una fotografía junto a un libro'],['cinema','Cartelería del cine Imperial'],['bar','Etiquetas en la barra del bar'],['hostal-people','Señalización del Hostal Jardín'],['beach','Gráfica de mesa en el chiringuito'],['bedroom','Mapa y papelería Pihama en la mesilla'],['family','La fotografía familiar en manos de un personaje'],['beach-beer','Etiquetas de cerveza en la playa'],['bedroom-warm','Papelería Pihama en la habitación'],['family-close','Detalle de la fotografía familiar'],['hostal-departure','Salida del Hostal Jardín'],['projection','Rodaje con la proyección de bienvenida a Torremolinos']].map(([file,alt],i)=>`<figure class="film-sheet-frame">${img(file,alt)}<figcaption>${String(i+1).padStart(2,'0')} / ${alt}</figcaption></figure>`).join('')}</div></div><div class="film-carousel-controls" aria-label="Progreso de las capturas"></div></div>`]
  ];
  const journey = document.createElement('article');
  journey.className = 'panel film-journey';
  journey.id = 'selected-films';
  journey.lang = 'es';
  journey.setAttribute('aria-label', 'Selected Films — Vírgenes');
  journey.innerHTML = `<div class="film-viewport"><div class="film-chrome">
    <header class="film-navigation"><span class="film-title-slot" aria-hidden="true"></span><span class="film-navigation-name">01 — VÍRGENES <small>2025</small></span><span class="film-chapter-count">01 / 06</span><span class="film-reading-line"><i></i></span></header>
    <h2 class="film-collection-title">SELECTED<br><em>FILMS.</em></h2></div>
    <div class="film-scroll-stack"><section class="film-cover" aria-label="Selected Films"><span class="film-cover-kicker">DIEGO PÉREZ OBRERO / DISEÑO GRÁFICO PARA CINE</span><span class="film-cover-number" aria-hidden="true">01</span><div class="film-cover-bottom"><span>UNIVERSOS GRÁFICOS.<br>HISTORIAS EN PANTALLA.</span><span>VÍRGENES / 2025<br>SCROLL TO EXPLORE ↓</span></div></section>
    ${chapters.map(([key, content], index) => `${index === 0 ? '<div class="film-story-pair">' : ''}<section class="film-page film-page--${key}" id="virgenes-${key}" data-film-chapter="${index}" aria-label="${FILM_CHAPTERS[index]}"><div class="film-layout">${content}</div><div class="film-footer"><span>DIEGO PÉREZ OBRERO / GRAPHIC DESIGN</span><span>${FILM_CHAPTERS[index]}</span></div></section>${index === chapters.length - 1 ? '</div>' : ''}`).join('')}
    </div></div>`;
  track.append(journey);
  mountFilmViewer(track);
}

function mountFilmViewer(track) {
  const dialog = document.createElement('dialog');
  dialog.className = 'film-viewer';
  dialog.setAttribute('aria-label', 'Imagen de Vírgenes ampliada');
  dialog.lang = 'es';
  dialog.innerHTML = '<button class="film-viewer-close" type="button" autofocus>Cerrar <span aria-hidden="true">×</span></button><img alt=""><p></p>';
  document.body.append(dialog);
  let opener;
  const close = () => { dialog.close(); opener?.focus({ preventScroll: true }); };
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  track.querySelectorAll('.film-sheet-frame img').forEach(image => { image.sizes = '(max-width:700px) 88vw, 72vw'; });
  track.querySelectorAll('.film-image, .film-paper').forEach(figure => {
    const image = figure.querySelector('img');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'film-image-view';
    button.setAttribute('aria-label', `Ampliar: ${image.alt}`);
    image.before(button); button.append(image);
    button.addEventListener('click', () => {
      opener = button;
      const fullImage = dialog.querySelector('img');
      fullImage.src = image.src; fullImage.alt = image.alt;
      dialog.querySelector('p').textContent = image.alt;
      dialog.showModal();
    });
  });
}

const clamp = value => Math.max(0, Math.min(1, value));
const introDistance = () => Math.max(700, innerHeight * .9);

export const filmResearchDistance = () => Math.max(2600, innerHeight * 3.6);
export function filmHoldDistance() {
  return filmTiming().total;
}

export function createSelectedFilms(section, { vertical, reducedMotion, seekFilm } = {}) {
  const root = section.querySelector('.film-journey');
  const stack = root.querySelector('.film-scroll-stack');
  const pages = [...root.querySelectorAll('.film-page')];
  const title = root.querySelector('.film-collection-title');
  const nav = root.querySelector('.film-navigation');
  const slot = root.querySelector('.film-title-slot');
  const line = root.querySelector('.film-reading-line i');
  let lastProgress = 0, journeyLength = 1;
  let stage, decks, mobilePhotos, staticPalette;
  const researchBoard = root.querySelector('.film-research-board');
  let dock = { x: 0, y: 0, scale: 1 };
  const carousel = createFilmCarousel(root, { reducedMotion });
  const refresh = () => {
    journeyLength = filmHoldDistance();
    stage?.refresh();
    carousel.refresh();
    dock = { x: nav.offsetLeft + slot.offsetLeft - title.offsetLeft, y: nav.offsetTop + slot.offsetTop - title.offsetTop, scale: slot.offsetWidth / title.offsetWidth };
  };
  const paintIntro = intro => {
    const eased = gsap.parseEase('power2.inOut')(clamp(intro));
    gsap.set(title, { x: dock.x * eased, y: dock.y * eased, scale: 1 + (dock.scale - 1) * eased });
    gsap.set(nav, { opacity: clamp((intro - .5) * 2) });
  };
  const paint = progress => {
    if (vertical || reducedMotion) return;
    lastProgress = clamp(progress);
    const time = lastProgress * journeyLength;
    const intro = clamp(time / introDistance());
    const timing = filmTiming();
    const y = Math.max(0, Math.min(innerHeight, time - timing.intro));
    paintIntro(intro);
    gsap.set(stack, { y: -y });
    gsap.set(line, { scaleX: lastProgress });
    const current = stage.paint(time);
    root.querySelector('.film-chapter-count').textContent = String(current + 1).padStart(2, '0') + ' / 06';
    decks.update(clamp(((time - timing.chapters[1].start) / timing.chapters[1].hold - .32) / .68));

    root.dataset.filmProgress = lastProgress.toFixed(4);
  };
  const context = window.gsap?.context(() => {
    refresh();
    if (reducedMotion) {
      staticPalette = createFilmPhotoPalette(researchBoard, { reducedMotion: true });
      staticPalette.update([...researchBoard.querySelectorAll('.film-deck-slide img')]);
      return;
    }
    root.classList.add('has-film-motion');

    decks = createFilmPhotoDecks(root, { reducedMotion, seek: value => {
      if (mobilePhotos) window.scrollTo({ top: mobilePhotos.start + (.32 + value * .68) * (mobilePhotos.end - mobilePhotos.start), behavior: 'smooth' });
      else { const timing = filmTiming(); seekFilm?.((timing.chapters[1].start + timing.chapters[1].hold * (.32 + value * .68)) / timing.total); }
    }});
    decks.update(0);
    if (!vertical) {
      root.classList.add('has-film-stage');
      stage = createFilmStage(root);
      gsap.set(title, { transformOrigin: '0 0' });
      refresh();
      paint(0);
    } else {
      const paintMobile = () => {
        const distance = -root.getBoundingClientRect().top;
        paintIntro(distance / (root.querySelector('.film-cover').offsetHeight * .65));
        gsap.set(line, { scaleX: clamp(distance / Math.max(1, root.offsetHeight - innerHeight)) });
        let index = 0;
        pages.forEach((page, i) => { if (page.getBoundingClientRect().top < innerHeight * .5) index = i; });
        root.querySelector('.film-chapter-count').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
      };
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onUpdate: paintMobile, onRefresh: () => { refresh(); paintMobile(); } });
      paintMobile();
      pages.forEach(page => page.querySelectorAll('.film-paper').forEach((element, i) => gsap.from(element, {
        y: 55, rotation: i % 2 ? 9 : -9, opacity: 0, duration: .85,
        scrollTrigger: { trigger: element, start: 'top 94%', toggleActions: 'play none none reverse' }
      })));
      const paintMobilePhotos = progress => {
        composeResearchPhotos(researchBoard, gsap.parseEase('power2.inOut')(clamp((progress - .10) / .22)));
        decks.update(clamp((progress - .32) / .68));
      };
      paintMobilePhotos(0);
      mobilePhotos = ScrollTrigger.create({
        trigger: researchBoard, start: () => 'top top+=' + (document.querySelector('.site-header').offsetHeight + 100),
        end: () => '+=' + filmResearchDistance(), pin: true, pinSpacing: true, refreshPriority: 95,
        onUpdate: self => paintMobilePhotos(self.progress), onRefresh: self => paintMobilePhotos(self.progress)
      });

    }
  }, root);
  return {
    update(_index, progress) { paint(progress); },
    refresh() { refresh(); paint(lastProgress); },
    destroy() {
      context?.revert();
      carousel.destroy();
      decks?.destroy(); root.classList.remove('has-film-motion', 'has-film-stage');
      staticPalette?.destroy();
      root.querySelector('.film-carousel-controls').hidden = false;
      pages.forEach(page => { page.inert = false; });

    }
  };
}
