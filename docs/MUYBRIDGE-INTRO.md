# ART introduction — Still images. Living worlds.

The introduction lives **inside the expanded ART cover**, in the space to its right. Scrolling recomposes the original title and printed objects on the left. After its four passages, Muybridge fades into the [graphic props sequence](GRAPHIC-PROPS.md): a note descends, a passport ascends and a family photograph descends. The track then continues to the editorial graphic props conclusion and Next World. ART now has three panels; the motion study and paper sequence share the first panel. The previous standalone implementation is preserved in commit `8f3c11c` on branch `capitulo-02-reinicio`.

## Source and crop manifest

`assets/graphic-props/mubridge-scaled-2-scaled.webp` is a byte-for-byte copy of the supplied file. Its actual decoded dimensions are **2500 × 1559**, rather than the 2048 × 1277 estimate in the brief.

SHA-256: `E5F8A7594FE6CEDDC932C11FB2E204F7337AB3135CF3993710C7F22A918262EE`.

`MUYBRIDGE_CONFIG` in `js/muybridge-intro.js` keeps the source dimensions, plate rectangle, twelve individually inspected interior rectangles, running sequence, phase offsets and inertia parameters together. Coordinates are `[x, y, width, height]` in original source pixels. The outer plate is `[116, 36, 2284, 1208]` (approximately 1.891:1). The mount and text below the plate are excluded. The CSS fallback uses that same configuration.

The twelve `cells` are in reading order. They are replacement windows inside the photographs, not equal subdivisions of the plate. Their individual origins account for the scan's irregular spacing. Each is 500 × 278 pixels, covering the whole horse and rider without rescaling the pose. The canvas starts with the exact cropped plate; only these windows change. The photographed outer border, internal dividers and surrounding printed numbers remain stationary. No generated imagery, pose interpolation, tint or extra texture is used.

The gallop uses zero-based source indices 0–10, always forward. Source 11 (the twelfth photograph, a standing horse) appears only in the original static plate. Twelve destination cells use phase offsets `[0,1,2,3,4,5,6,7,8,9,10,0]`.

## Narrative and lifecycle

- `mountMuybridgeIntro()` builds semantic text and the image once in `buildScenes()` and retains one decode promise.
- `scrollytelling.js` holds the first ART panel for 2200–3000 px inside the existing horizontal pin. The four passage starts are 0, .3, .53 and .8. Numbered buttons land on readable portions of each passage; the existing next control can skip directly to Selected Work.
- A paused GSAP cover timeline reduces the original heading and composition while revealing the introduction in the remaining space. Separate paused text timelines use word masks, character staggering via `gsap.utils.distribute`, timeline labels and eased paragraph entries. Semantic headings retain a complete accessible label. All progress is driven by the existing journey; no new pin or animation library is added.
- Scroll supplies momentum to the horses. Each gesture adds `abs(deltaScroll) / pixelsPerFrame * impulseGain` to the velocity, capped at `maxFps`. The shared clock integrates exponential drag (`v *= exp(-friction * dt)`) and draws discrete poses. It runs only while a user-generated impulse is decaying; there is no idle autoplay. A strong gesture coasts for roughly two seconds before dropping below `stopFps` and cancelling the clock. Further gestures add momentum. Reverse scrolling still uses the forward gallop sequence.
- Current tuning: `pixelsPerFrame: 18`, `impulseGain: 4`, `maxFps: 28`, `friction: 2.2`, `stopFps: .2`. Increase friction for a shorter tail; reduce it for a longer tail. These are contemporary interaction choices, not historical playback claims.
- Mobile uses normal vertical reading flow and a sticky figure, with no extra pin. Reduced motion shows the original plate and all four passages in normal flow.
- The visible play/pause button preserves a manual pause across passages, resize and leaving/re-entering ART. It is disabled in the still opening and in reduced motion.
- Figure intersection, active ART state and document visibility gate rendering. Leaving visibility, explicit pause and controller destruction cancel the pending frame and discard residual velocity. Destruction also reverts GSAP styles, aborts listeners and disconnects the observer. The existing navigation lifecycle recreates the controller on breakpoint/motion changes without rebuilding the markup or reloading the source.
- `Explore the work →` targets the existing Selected Work panel through `goToPanel(1)`. No project content is added.

## Verification performed

Chrome over local HTTP, including the simulated Pages prefix `/web-portfolio-dpo/`:

- Inspected original image, cropped plate, all twelve source crops in a contact sheet, desktop composition and mobile screenshots. Horse/rider proportions remain unchanged; hooves are inside the sampling windows. Retained the natural gallop rise and fall and the scan's photographic variation.
- Compared actual canvas pixels: all twelve windows change, including bottom right, while sampled pixels outside the windows remain identical to the original plate.
- Checked forward sequence/phase offsets through scrolling and coasting. Source frame 12 is absent from every active sequence.
- Verified motion continues briefly at fixed scroll, sampled progressively decreasing velocity, then verified that the paint count stops changing and stays stopped. A stronger gesture injects more velocity. Manual pause immediately freezes the canvas, and re-enabling waits for another gesture.
- Repeated ART entry retains one canvas, unchanged ScrollTrigger count and one source request; the inertial tail settles instead of producing an idle loop.
- The earlier standalone implementation was also tested with real tab hiding and forced canvas failure. The current controller retains those visibility/fallback gates; see the current regression for the integrated cover and inertia checks.
- Tested the integrated layout at 1440 × 900, 2542 × 1246, 390 × 844, 320 × 740 and landscape 844 × 390. No horizontal overflow; practice copy fits above the desktop navigation. Verified intermediate character entrance states, original cover scale at scroll zero, the track resuming after the story and restoration of the landing selector on returning home.
- Emulated reduced motion: static plate, no frame cycling, all copy readable.
- Forced this canvas's `getContext()` to return null: the cropped original image remained visible and the playback control stayed disabled.
- Both ART and Digital Props reach NEXT WORLD. About remains inactive at 10%, 50% and 94% of each horizontal journey and begins at its opening afterward.
- Source decoded successfully from `http://127.0.0.1:5501/web-portfolio-dpo/assets/graphic-props/mubridge-scaled-2-scaled.webp`.

Reusable regression: `scripts/checks/.preview-muybridge.js`, run with the existing `.preview-cinema-check.ps1` wrapper. `scripts/checks/.preview-muybridge-crops.ps1` exports the contact sheet from the current page to `previews/.preview-muybridge-crops.png`. Both require the existing Chrome CDP session on port 9223 and the page served over HTTP.

Not verified on a physical phone, Safari or Firefox. The Pages subdirectory was tested locally; no deployment was performed.
