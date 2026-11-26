# Three Portfolio Entries Implementation Plan

**Goal:** Publish Whistle, GraphQL Algolia Transformer, and CreatorKitchen entries with useful interactive demos and reviewed source links.

**Architecture:** Extend the existing Astro portfolio, window components, isolated iframe demos, localized listings, and shared theme/resize controls. Whistle is a business entry under Work. The other two are Projects. Preserve the existing three demos and keep their browser-local Fmail separate from the new demos.

**Authorization:** The owner selected these three, requested repository sanitization or public versions, and explicitly delegated all remaining choices without questions. Preserve original repositories and private history. Do not publish credentials, private records, customer content, or raw audit artifacts. Do not invent business metrics, job dates, or provider approvals.

**Tech stack:** Existing Astro, TypeScript, CSS, Node 24, and browser-local state. No new services or backend calls for portfolio demos.

## Scope and ownership

- Root: shared demo registry and container, Work navigation/pages, translations/listings/sitemap, integration, public repository creation, final checks and deployment.
- Whistle: source review, synthetic prediction/lobby/leaderboard replay, business page, isolated sanitized source candidate.
- GraphQL Algolia Transformer: source review and animated schema/stream/index/search explanation.
- CreatorKitchen: source review and original editor/preview/publish replay, sanitized source candidate if needed.

## Contracts

- Iframe routes: `/demos/whistle/`, `/demos/graphql-algolia-transformer/`, `/demos/creatorkitchen/`.
- Portfolio routes: `/work/whistle/`, `/projects/graphql-algolia-transformer/`, `/projects/creatorkitchen/`.
- Theme messages use `<project>:theme` with `light` or `dark`; validate the parent and origin.
- New demos do not schedule Fmail. Existing Guestography creation remains 2,000 ms and the toast remains 5,000 ms.
- Preserve realistic inner scrolling and resizing. Support 320px, keyboard access, both themes, and reduced motion.
- Use Awesome User and user@finnternet.com where a name/email is required. Keep all content synthetic or approved public assets.
- Public originals with clean history may be linked directly. Prepare independent cleaned versions when historical credentials or private artifacts are found; never force-push the private originals.

## Tasks

- [x] Add the Work section and localized navigation/listings; feature Whistle prominently on the homepage.
- [x] Extend the shared iframe container to the three additional demos without expanding the Fmail trust boundary.
- [x] Complete the three project-specific entries and demos with source-backed copy.
- [x] Audit source trees, all refs/history and all physical Git objects with redacted scanning; verify sanitized candidates and record remaining provider issues privately.
- [x] Publish reviewed source versions and link them from the portfolio; set repository Website fields to the canonical portfolio pages.
- [x] Verify new and existing demos, keyboard/mobile/theme/resize behavior, navigation, Fmail isolation, and static asset loading.
- [x] Run formatter, lint, strict Astro checks, meaningful tests, production build and diff checks. Review the final changes.
- [ ] Commit and push on main, follow GitHub/Cloudflare to terminal success, and smoke-test the live site.

## Review focus

- New project IDs must never become accepted Fmail projects through a broader registry.
- Editing, publishing, predictions and indexing remain local and must not make original provider calls.
- Source dates describe source history; business employment and commercial results need direct evidence.
- No audit report, ignored environment file, private media, database export or checkpoint ref may enter a public repository or the site build.
- Smaller screens must retain usable controls and avoid horizontal overflow.

## Verification record

Source reviews approved both archives after own-configuration corrections. Whistle release `3b6a6ce9d72cdefcca43cf4f2fd8bea4a0db2b40` and CreatorKitchen release `b458dc24d94c1e0566983f60eaf0032d2bb71058` passed independent Gitleaks scans of the exact tree, retained history and all physical objects. Original repositories were preserved. Provider credential revocation and original application deployment were outside these checks.

Local checks: Prettier, ESLint, Astro (69 files, zero diagnostics), 25 domain/Fmail tests and a 44-page production build passed. Browser checks covered complete demo flows, 320px layouts, desktop layout, keyboard interaction, light/dark themes, resizing, published snapshots, score updates, clean leave/rejoin, Fmail isolation and the existing Guestography flow. An existing InstaMosaic stylesheet emits the same nonfatal `th:last-child()` build warning.

The final commit/push and terminal CI/deployment result are recorded in the handoff and private audit reports after release.
