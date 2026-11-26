# Guestography Landing Page Implementation Plan

**Goal:** Restore the original Guestography homepage inside the portfolio demo and change the email toast duration to five seconds.

**Architecture:** Reuse the existing Astro iframe and the original homepage's content, photographs, and layout. Add a home screen to the existing browser-local screen navigation. Keep the existing creation, gallery, uploads, and Fmail behavior.

**Tech stack:** Astro, TypeScript, the existing Guestography CSS, and browser-local Fmail. No dependencies or backend calls.

## Decisions

- The default demo screen is the original landing page.
- Create Event opens the existing preset form; See Demo Gallery opens the existing gallery without sending an email.
- The brand returns to the landing page without reloading the iframe. Completed event creation can be repeated through the original Create Event controls.
- Keep the original event-type/photo rotation and stop automatic changes for reduced-motion visitors.
- Keep realistic inner scrolling, mobile layout, dark theme, and keyboard focus.
- Toasts remain animated and pause while hovered/focused; their duration becomes 5,000 ms.

## Tasks

- [x] Confirm the current demo starts at Create Event and lacks the landing-page hero and demo-gallery action.
- [x] Add the original homepage content and local photographs, then connect home/create/gallery navigation.
- [x] Update toast duration to 5,000 ms.
- [x] Verify both landing actions, creation/email delivery, repeated creation, returning home, mobile/desktop, both themes, inner scrolling, and keyboard navigation in the browser. Review reduced-motion guards in source.
- [x] Run final formatting, lint, Astro check, mail tests, build, and diff checks.
- [ ] Commit and push on main, follow CI/deployment, and verify the live page.

## Verification evidence

Browser checks used 320px, 390px, and 1440px outer viewports. Inner widths matched scroll widths at 297px, 367px, and 973px. All five hero images loaded. Keyboard navigation focused the destination heading. Creation completed twice without accumulating mail; uploads increased the gallery from 12 to 15 photos. The animated toast remained visible for 5,231 ms. Light/dark rendering and inner scrolling were observed, and the browser viewport/theme were restored afterward.

## Review fixes

A separate reviewer found two issues before publication. A browser reproduction confirmed that background completion forced the visitor from home to success; completion now preserves the chosen screen unless the create form is still open. Rotating heading colors now use theme-aware CSS variables so every color meets 3:1 large-heading contrast in both themes.

The navigation regression was reproduced in the browser before the fix (home changed to success after completion). After the fix, the same flow delivered Fmail while remaining on home. Normal creation still opened success, and `?demo=ready` opened the gallery. All six heading colors passed contrast checks in both themes: minimum 4.83:1 in light and 5.93:1 in dark.
