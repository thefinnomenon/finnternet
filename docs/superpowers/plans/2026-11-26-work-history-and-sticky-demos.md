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

**Follow-up:** Show the same company, Founder role, dates and one-line description on the individual Whistle page, using the shared work entry as the source.

**LinkedIn history:** Read the complete Experience section of https://www.linkedin.com/in/cpfinn/ in the signed-in browser. Add Paragraph LLC (Aug 2022–Sep 2025), Freelance (Mar 2015–Aug 2022), Saugus Fire Department (Mar 2015–Mar 2017), MITRE (Jul 2013–Jun 2015), MIT Lincoln Laboratory (Jun–Aug 2012), and three UMass Amherst roles (Sep–Dec 2011, May–Aug 2011, Sep–Dec 2010). Preserve the user's Whistle title/dates and omit its location. Use source locations and concise summaries where provided; do not invent descriptions for the firefighter or MITRE roles. Only Whistle has an existing internal detail page.

Verified all nine roles and date ranges in the browser. The homepage retains the right rail on desktop; English and Portuguese Work pages have nine rows and no horizontal overflow at 320px. Light/dark appearance was checked. Role descriptions are optional so entries without source descriptions remain concise.

**Education and Paragraph:** Read the Education section of the same LinkedIn profile. Add a separate Education window below Work on the homepage and Work pages in every locale. Show MIT's Entrepreneurship Online Bootcamp (2017–2018), Northeastern's Master of Electrical & Computer Engineering program (2014–2015), and both UMass Amherst degrees (BA Computer Science and BS Computer Systems Engineering, 2009–2013). Academic employment remains in the source work history. Share résumé row styles across Work and Education. Link Paragraph LLC to the user-supplied active website, https://paragraph.com/, in a new tab.
