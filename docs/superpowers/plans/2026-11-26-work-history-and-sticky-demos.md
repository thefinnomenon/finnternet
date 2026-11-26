# Work history and sticky demos

**Goal:** Present Work as chronological résumé rows and keep project demos visible while reading longer details.

**Approach:** Reuse one static WorkHistory component on the homepage and Work section. Keep the existing window style; Work occupies the homepage's right column on desktop and follows Welcome on mobile. Each row contains company, role, dates and one description. Use the user's dates for Whistle LLC: Founder, September 2025 to September 2026, without a location. Remove the redundant business summary in all four languages.

**Architecture:** Existing Astro, TypeScript, scoped CSS and shared portfolio data. Add no dependencies. Sort work rows newest first and localize roles and month labels. Make the shared project demo panel sticky only in the two-column layout. Measure its height to allow oversized or resized demos to scroll fully into view before sticking.

## Steps

- [x] Add shared work data and reusable résumé rows; update homepage and Work pages.
- [x] Add desktop sticky behavior to the shared project layout.
- [x] Verify desktop/mobile, light/dark, keyboard links and sticky scrolling with long project details and a resized demo.
- [x] Run formatting, lint, type checks, tests and production build.

**Verification:** Browser layout and scrolling checks cover the presentation change. Preserve existing tests; add no tests that merely duplicate static copy or CSS.

Verified the résumé dates and translated roles on all eight home/Work pages. Desktop scrolling held the demo at 24px while the details moved; resizing a demo to 808px in a 700px viewport let it scroll to a -132px inset with its bottom visible. At 320px, layouts had no horizontal overflow, Work preceded writing, and demos used normal document flow. Light/dark appearance and keyboard navigation were checked. Formatting, lint, Astro checks, all 29 tests and the 45-page production build passed. The existing archived-editor and InstaMosaic stylesheet build warnings remain.
