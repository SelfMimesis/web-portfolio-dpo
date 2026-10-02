# Selected Films / Vírgenes

A dedicated Selected Films cover and six Vírgenes chapters follow the ART envelopes. They occupy one horizontal destination: the outer track holds still while the six chapters share a stationary stage. Text, photographs and paper props move independently inside that frame; horizontal travel resumes on departure. The large cover title moves and scales into the film progress frame. Mobile uses natural vertical reading order, a sticky film header and a manual final carousel; reduced motion presents a static document with instant carousel navigation. Editorial images open in a native dialog with keyboard focus and Escape support; the final carousel has no zoom interaction.

## Sources

- Copy: the four Vírgenes pages (PDF pages 4–7) of `E:\Documentos\portfolio 2024\portfolio DIEGO PEREZ OBRERO 2025.pdf`. Paragraphs are retained in Spanish; line-break hyphenation, capitalization and obvious grammatical errors are normalized.
- Original red Vírgenes lettering, Pihama lettering, pool photograph, workshop photographs, dance/bar frames and Cupido/welcome frames are cropped directly from that PDF using Windows PDF rendering. High-resolution rendering preserves available source detail; it cannot restore detail absent from the embedded image.
- Hostal Jardín, Pihama coaster, road map, Cupido sign and supplied film frames come from the original files in `E:\Documentos\portfolio 2024`. The separate Valentini label is omitted.
- The animated Pihama sign is the original `GIF--PIHAMA-BLANCO-sin-fondo.gif` (12 frames). Reduced motion uses its first frame, exported without alteration.
- On-set/Pihama/projection/Fantasía/cocktail photographs come from the supplied originals in Downloads.
- The Sudán, Pihama and Astoria matchbox fronts are extracted from their print PDFs in the supplied `cerillas sudan.zip`. They retain their original artwork.
- No generated imagery, replacement lettering, retouching or artificial detail enhancement. Film still exports remove only the black letterbox bars. Every photograph uses its full original image proportions with `object-fit: contain`; the carousel window adapts to each native aspect ratio, with no side matting or cropped photographs.

## Implementation

- `js/selected-films.js`: markup, Spanish source copy, viewer and GSAP lifecycle.
- `js/selected-film-assets.js`: exported image dimensions.
- `js/film-stage.js`: chapter timing, fixed stage transitions, opening aperture/parallax and independent prop reveals.
- `js/film-photo-decks.js`: portrait and landscape carousels, complete-image resting positions and accessible controls.
- `css/selected-films.css`: scoped layouts and responsive presentation.
- `js/scrollytelling.js`: one film hold, horizontal arrival/departure, scene seeking and teardown.
- `assets/films/virgenes`: exported original artwork and smaller responsive JPEG copies.
- `scripts/build-site.ps1`: includes the dynamically addressed film asset family.

The source PDF and source images remain unchanged outside this repository. The local `.preview-virgenes-*` scripts and captures are working extraction/verification artifacts stored in `previews/` and are not deployed.

## Composition and motion

- Cover: Selected Films fills the opening page, then docks into the persistent film/chapter progress frame.
- Vírgenes opening: original red lettering, source synopsis and the pool/Fantasía photograph only.
- Research: road map over the travel imagery. Archive/colour: Sudán matches. Pihama: original animated sign, coaster and Pihama matches. Locations: Hostal Jardín, Cupido and Astoria matches. There is no separate paper page.
- Final captures: one masked image at rest. Clicking anywhere on the photograph advances, including from the last frame to the first. The fixed SIGUIENTE cursor carries a right arrow, follows a damped spring integrated by the GSAP ticker, and reacts elastically to clicks. Pointer exit, scrolling, cancellation, focus loss and world teardown clear it immediately. GSAP timelines slide images inside the mask; rapid clicks queue the latest destination without restarting an in-flight transition. Every photo shares a measured width, including the final 4:3 original; the image keeps its aspect ratio and the outer layout reserves its maximum height to prevent scroll jumps. The numbered index and keyboard retain direct/reverse selection. Touch uses the same forward button, reduced motion changes instantly, and page scroll remains independent. Teardown removes listeners, observers, timelines, cursor and ticker callbacks.
- All motion lives within the world lifecycle. The outer horizontal pin retains `refreshPriority: 100`; the final carousel does not create a ScrollTrigger. ART has four outer panels; DEV remains at five.
- Recheck arrival, vertical reading, horizontal departure, reverse scrolling, frame containment, viewer focus, repeated world switches, mobile 390/320 and reduced motion after changing the journey geometry.

## October 2026 scrollytelling revision

The opening photograph starts with an animated aperture around the bottle. Scroll opens the aperture to the full original photograph while the lettering and synopsis grow into the composition. The title exits right beneath the photographic layers; outgoing copy fades upwards and incoming photographs rise from below. Subsequent chapters use staggered workshop prints, paper entrances, the Pihama photo reel and location signage instead of scrolling entire pages. All transitions reverse with scroll.

Research replaces the old bar photograph with the six supplied Downloads originals: DSC1917, DSC1137 and DSC2007 in the portrait deck; DSC1522, DSC2885 and DSC1628 alongside Fantasia in the landscape deck. Responsive JPEG exports preserve the complete source frames. On mobile only the research image board pins while text and the final reel stay in natural reading order. Reduced motion displays the research photographs without pins and retains an instant manual final reel. The research pin has priority 95.
Research opens with the portrait over the empty pool on the left of the landscape, keeping the woman and bottle unobstructed. Frames use the page background colour. The composition then expands into a side-by-side gallery (landscape left, portrait right). A single vertical dot indicator controls both decks; the final viewer uses cursor navigation and a numbered index in `js/film-carousel.js`. Research uses `js/film-scroll-dots.js` with a damped GSAP ticker spring. Both support keyboard selection and cleanup on world changes.

The seven swatches in `js/film-photo-palette.js` include six dominant colours from the image pair and an orange sampled directly from the bikini in the pool portrait. The strip sits below the portrait at the left, aligned with its inner edge and the bottom of the visible landscape photograph. It disappears as soon as the composition starts moving and returns on reverse scroll. GSAP animates the swatches at rest. Async results are discarded after another selection or destruction; swatch tweens are killed on teardown. Reduced motion presents a static palette sampled from the complete photographic set.
