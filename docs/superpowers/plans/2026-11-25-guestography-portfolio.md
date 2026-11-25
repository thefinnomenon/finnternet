# Guestography Portfolio Implementation Plan

**Goal:** Repeat the approved portfolio treatment for Guestography, preserving the original event creation, guest upload, and gallery interfaces.

**Architecture:** Reuse ProjectLayout, ProjectDetails, ProjectDemo, and browser-local Fmail. Keep the preset product flow isolated in its own iframe. Generate static QR cards with Guestography's existing renderer and use its existing public example photos. No new site dependencies or changes to the original repository.

**Decisions:** The owner chose inactive status. Use the original Alyssa & Mike's Wedding example and user@finnternet.com. Event creation shows the original spinner and success screen, with checkout omitted from this frontend-only replay. Only the original gallery-ready email is delivered, with static QR cards and no navigation links. Source remains unlinked while private. Completed August 10, 2026 from e44a22d.

## Tasks

- [x] Add regression coverage for Guestography's single gallery-ready email, delivery after navigation, deduplication, and storage validation. Observe failures before implementation.
- [x] Add Guestography metadata and mail copy while preserving both existing demos and the two-message limit.
- [x] Add original product styles, static QR cards, example photos, create/success/gallery/upload screens, preset inputs, upload progress, and an accessible image viewer. Reuse original controls without sample instructions or extra reset/email buttons.
- [x] Add the project page, concise functionality and grouped stack, localized homepage and Projects listings, sitemap, and README.
- [x] Verify desktop/mobile, both themes, keyboard interactions, inner scrolling, real image downloads, gallery lightbox, QR email dismissal, repeated runs, delivery after navigation, and isolation of media to the project route. Run formatter, lint, Astro check, tests, and production build. Review the final diff.

## Review Focus

- Keep event creation mail separate from guest uploads so uploads never generate a second gallery-ready notification.
- Preserve elapsed progress across cached page restoration and clear timers only for discarded documents.
- Never load gallery photos or QR cards on the homepage or before their relevant screen/message opens.
- Keep gallery and modal focus usable at narrow widths and with keyboard input.
- Preserve original product wording and avoid technical specifications in the visible feature bullets.
