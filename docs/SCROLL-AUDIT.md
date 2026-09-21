# Scroll narrative audit — 21 September 2026

## Architecture retained

Static HTML/CSS and native ES modules, CDN GSAP 3.13/ScrollTrigger, optional dynamically imported Three.js. No build step. `main.js/buildScenes()` builds five middle chapters per universe; the original split hero is reparented into the cover and `world-links.js` appends the seventh chapter. `navigation.js` owns world selection, home restoration, focus and URL state.

`scrollytelling.js` owns the horizontal track, upstream pin (`refreshPriority: 100`), cached travel distance and extra reading pause. About and filmography measure downstream of that pin. Mobile and reduced motion use the existing vertical flow; `mobile-story.js` provides reversible mobile scenes. GSAP failure preserves static content and navigation.

`lcd-display.js` already has a physical 12 × 16 matrix, seven-segment readouts, pixel ENTER, OFF/ON/DIM/GHOST, 100–120 ms frames, boot and engagement. Its visibility observer stops the clock outside the viewport. `three-scene.js` is optional, low DPR and disabled on mobile/reduced motion; it pauses offscreen/hidden. About uses five chapters with a desktop visual pin and inline mobile visuals. Filmography has 13 credits, a pinned desktop table/poster view and a mobile poster carousel, with reversible surface expansion.

## Findings

- Preserve pin distance, end pause, refresh ordering, original hero DOM and media-query contexts. Local timelines must not own a second desktop scroll clock or modify track geometry.
- Progress currently queries DOM and writes labels/inert on every scrub tick. Cache references and only change chapter state when the index changes.
- LCD needs an externally driven sequence and explicit lifecycle cleanup, retaining its renderer and physical segments.
- ORBIT radar can rotate continuously; target, horizon and status should use discrete physical poses. CSS radar/portrait loops need visibility gating.
- Teardown must restore local transforms before the hero moves back home. Resize and world changes must not leave timelines, observers or pins behind.
- Cursor hit-testing during scroll and many individual mobile text timelines are potential costs. Avoid adding more per-element mobile triggers.
- Hero width expansion is a short, intentional layout animation, not a scroll animation. Leave it intact in this slice.
- The ART portrait PNG is approximately 7 MB and the animated logo approximately 1 MB. Asset encoding is a separate load-time issue, not solved by GSAP tuning.

## Implementation plan

1. Foundation: cached progress updates; externally driven LCD states; visibility-aware ambient loops with no new library.
2. DIGITAL PROPS slice: cover → intro → selected work. One local-timeline module, one persistent registration frame, restrained editorial movement, fixed electronic poses and reversible quantized LCD progress. Preserve the original cover terminal.
3. Verify over HTTP on desktop, <=700px, reduced motion and missing GSAP. Exercise both worlds, reverse scroll, home/switch, keyboard, About, credits, console and lifecycle counts.
4. Extend only the verified lifecycle/performance primitives across the existing journeys. Keep the other chapters' choreography unchanged until the slice has visual approval.

The ZRK reference informs sustained framing, scale and pauses, not the portfolio's content or visual identity. Headless browser timings are regression evidence, not a guarantee of 60fps on physical phones.

## Verification and follow-up requests

- HTTP desktop 1440 × 900: seven chapters in each world, forward and reverse traversal, final reading pause and About descent all passed. Switching worlds mid-route restored the same trigger counts; returning home removed journey pins and the registration frame. 20 triggers in DEV, 19 at home in this configuration.
- HTTP mobile 390 × 844: both journeys, About, 13 posters, home and world switching passed without horizontal overflow or growing trigger counts. Found and fixed the final chapter index: pinning wraps the article, so the observer now uses the cached article list instead of `track.children`. Retest reports index 6, not -1.
- Reduced motion 1440 × 900: both vertical journeys, navigation and cleanup passed; no complex narrative timelines or journey pins remained.
- Missing GSAP/ScrollTrigger (network blocked): both seven-panel journeys remained vertical and navigable; home restoration worked with no JavaScript errors. Fixed an existing unguarded cursor cleanup call.
- Keyboard: actual Enter key activation on the DEV navigation link opened the journey, focused `dev-title`, and kept offscreen panel controls inert.
- Reversibility: the intro LCD matrix returned to the identical segment markup after moving forward and back to the same scroll position. No errors or unhandled rejections recorded in the instrumented checks.
- LCD clocks were inactive at About. The scene LCD has no automatic clock. Existing radar and portrait CSS loops now pause outside the viewport.
- Initial before/after sample: 2.4-second desktop scroll, 145 frames, no frame above 34ms in either sample. No claim of hardware-independent 60fps or a complete performance trace audit.
- Visually inspected cover and intro on desktop and mobile. Adjusted ORBIT dimensions after finding overlap with the cover footer; mobile expanded cover now gives the terminal its own row.
- Per follow-up requests, redesigned ORBIT with a larger instrument and printed hierarchy, restored ART's plain orange progress indicator, and kept the LCD progress texture exclusive to DEV.
- Murderbot preload starts from the document head (`initiatorType: link`, high priority). Browser checks before reaching filmography confirmed the first carousel image was complete, decoded (`data-poster-ready=true`) and 2000px wide. Availability still depends on successful image delivery; the page does not block navigation while waiting for the network.
- README expanded in Spanish: architecture, every module, maintenance recipes, publication, previous changes, current changes and known limits.

## Remaining scope

Later chapter choreography remains intact. No new framework, scroll library or WebGL scene was introduced. Large image optimization, a static reduced-motion logo, replacement of prototype contact behavior and broader physical-device performance testing remain separate work. The minimal helpers are extended across both worlds; further scene redesign should be incremental.
