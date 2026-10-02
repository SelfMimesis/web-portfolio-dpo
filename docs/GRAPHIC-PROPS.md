# Graphic props — 2 October 2026

The ART route replaces the fictional project placeholders with the supplied production artwork. Its three track panels are the expanded cover, the editorial conclusion and Next World.

Inside the cover, Muybridge finishes its four passages and fades into three scroll-controlled beats: **A note. A rendezvous.** (down), **A passport. Another life.** (up), and **A photograph. A shared past.** (down). Each image pauses for reading before leaving in the same direction. Reverse scroll restores every state. The Muybridge “Explore the work” link enters this sequence.

The next panel, **Small details. A whole world.**, explains how graphic props establish period, place, character and the everyday life of a film set. Two narrow glassine envelopes replace the earlier three-object composition. Rounded flaps open before the sleeves tip toward a table and eight original labels slide out along independent curves. The typography, paper background and orange serif emphasis follow the existing ART language; copy remains in English like the surrounding site.

## Files and timing

- `js/graphic-props.js`: markup, copy and reversible GSAP timelines. `GRAPHIC_PROPS_CONFIG` controls reading distances.
- `css/graphic-props.css`: desktop, vertical mobile and reduced-motion layouts.
- `js/scrollytelling.js`: the existing single horizontal pin owns the added pauses and retains `refreshPriority: 100` for About positioning.
- `js/main.js`: mounts the sequence and conclusion.
- `js/prop-envelope.js` and `css/prop-envelope.css`: two paper envelopes, eight extracted labels, reversible opening timeline and keyboard control.

Mobile uses normal vertical reading with restrained image travel, followed by a local pin for the envelope opening. That upstream pin has refresh priority 95 so the final destination and About are measured afterward. Reduced motion and the no-GSAP fallback expose every image and paragraph without animation, with the envelope already open. Animation contexts are removed on world changes and media changes; the graphic context is reverted after the main track context.

## Artwork

Sources are the six user-supplied files in `C:/Users/Usuario/Documents/portfolio 2027/`. Originals remain unchanged. Delivery copies preserve the full framing and colours, with no AI generation or retouching.

| Source | Delivery asset in `assets/graphic-props/` |
| --- | --- |
| `img122 copia.png` | `story-note.jpg`, 2200 × 1518 |
| `pasaporte nazi italiano.png` | `story-passport.jpg`, 2400 × 1868 |
| `foto FAMILIA HONORIO FINAL copia.jpg` | `story-family.jpg`, 2400 × 1620 |
| `caja de cerillas 4 copia.jpg` | `story-matches.jpg`, original copy |
| `DIUJO PIHAMA coneho final.png` | `story-pihama.jpg`, 1282 × 1616 |
| `etiqueta vela pilar 2.png` | `story-candle.png`, original transparent PNG |

JPEG delivery copies use quality 90, with resizing only where needed. The transparent candle artwork remains PNG.

The three narrative props use 84% of their former desktop width (88% on mobile), constrained by the viewport while preserving their aspect ratios. GSAP introduces them with monotonic easing, restrained rotation and a slight persistent perspective tilt. There is no entrance overshoot. An overdamped angular spring reacts subtly to scroll impulses and stops when settled. Its ticker and listeners are removed on teardown and it is disabled for reduced motion.

The note, passport and photograph retain the complete scans, with no traced masks or clipping. Multiply blending against the page paper suppresses the white scan backing; a quiet shadow sits under the full image. Entrance scale is .975, resting scale 1 and exit scale 1.018, giving subtle depth. No bitmap artwork is rewritten by these presentation changes. Older masks remain available for the earlier composition but are not applied to these three props.

## Envelope artwork and reference

The original interaction reference is Helin Kıl's [Bookmarks Component](https://helin.design/). The current material and proportions follow the user's `H54fbb18af4bd4db18bf1fede700217a1T.jpg`: narrow translucent paper sleeves, rounded flaps, a vertical glued overlap and a doubled bottom fold. CSS layers and `glassine-fibres.svg` provide fine fibres, soft transmission and seams. No reference-site code or imagery is incorporated.

`scripts/extract-prop-labels.ps1` renders explicit source rectangles from the original PDFs through Windows' native PDF renderer, preserving source colours and transparency. It does not alter the PDFs. Deliverables live in `assets/graphic-props/labels/`:

| Label | User-supplied PDF |
| --- | --- |
| El Marino | `pegatinas recursos 2 vectorizado (1).pdf` |
| Hilo para la pesca | `pegatinas recursos 2 vectorizado (1).pdf` |
| Pilar Gómez Angulo | `pegatinas recursos 1 vectorizado (1).pdf` |
| Cola especial · José Pla | `pegatinas recursos 4 vectorizado.pdf` |
| La Mariquilla · Pimentón | `pegatinas recursos 2 vectorizado (1).pdf` |
| Fluorescencia · Industrias | `pegatinas recursos 1 vectorizado (1).pdf` |
| Modelo / Calidad / Color (small stock ticket) | `pegatinas recursos 1 vectorizado (1).pdf` |
| Ref. / Precio (small stock ticket) | `pegatinas recursos 4 vectorizado.pdf` |

Farmacia G. Becerra and Andrés Cervantes are no longer displayed. The five newly requested labels were located in the original PDFs and extracted at higher resolution than the inline attachments. El Marino has an elliptical presentation clip to exclude a neighbouring fragment; Cola uses a contour mask and the blue price ticket has an edge clip because PDF 4 has an opaque scan backing. Other crops retain the PDFs' alpha. The build asset list includes the complete graphic-props family, including dynamic references and masks.

The two flaps unfold at different times; the envelopes tip and the labels slide, rotate and settle along separate cubic trajectories. Blue pairs with warm red/cream, and green with magenta. Wide labels are stored lengthwise; the two small tickets sit ahead of the main stack and finish over the envelope fronts. One GSAP clock renders absolute positions with eased acceleration and friction, so refresh and reverse scrolling cannot redefine the initial pose. There is no bouncing or synchronized vertical lift. The Open/Close control seeks the same timeline and supports native keyboard activation. Reduced motion shows the final composition without a pin or animation.

## Verification

Verified over HTTP in Chrome: desktop sequence and staged conclusion; positive/negative/positive image travel; reverse scroll to the note and Muybridge; About remains below the viewport until the ART pin finishes; four world switches retain 17 triggers and land at the top. Checked 390px, 320px and reduced motion visually, including same-document desktop/mobile resizing, all eleven decoded images, all eight labels visible and no horizontal overflow. The angular spring settles to zero. Both envelopes are checked closed, halfway open and fully open; native Enter activation closes them again on desktop and both phone widths. Mobile has 22 triggers and reduced motion has two, with the envelopes static and open.
