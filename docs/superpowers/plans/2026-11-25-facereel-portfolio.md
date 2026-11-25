# FaceReel Portfolio Implementation Plan

**Goal:** Give FaceReel the same portfolio treatment as InstaMosaic, using its original interface and an existing real render.

**Architecture:** Reuse the resizable demo container and project details. Keep each product's interface isolated in an iframe. Extend browser-local Fmail records with a validated project identifier, retaining legacy InstaMosaic mail and the existing two-message limit.

**Reference:** The approved InstaMosaic page and the request to repeat that treatment for FaceReel.

## Tasks

- [x] Add regression tests for FaceReel mail identity, delivery after navigation, switching projects, and legacy storage validation; observe failures before implementation.
- [x] Generalize the shared demo container and Fmail UI without changing InstaMosaic's behavior.
- [x] Add FaceReel's original form, progress stages, and native video result, using the existing Cristiano target, poster, and 1080×1920 render. Assign video media URLs only when showing the result.
- [x] Add its project page, completion date, grouped stack, functionality, and listings in all four languages. Keep the private source repository unlinked.
- [x] Verify preset interactions, video playback/download, Fmail dismissal, keyboard access, responsive layouts, both themes, and no video source on initial load. Recheck InstaMosaic and run the full project checks and build.

## Constraints

- Visible metadata remains Completed, Website, GitHub, with stack and functionality in the existing disclosure.
- No sample/demo instructions, additional reset/email controls, real uploads, provider API calls, payment flows, or email delivery.
- Homepage and Projects listings contain links and descriptions only.
- Work stays on `main`; preserve the already-pushed InstaMosaic commit.
