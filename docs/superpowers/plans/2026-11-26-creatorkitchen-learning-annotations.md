# CreatorKitchen learning annotations

The owner identified hover tooltips and audio links as core features of the original editor and described its early intent to support areas such as language learning. Preserve both interactions in the isolated portfolio replay and make this purpose prominent in the project description and functionality list.

Use the existing Astro/TypeScript replay, its editor, local publication snapshots and shared theme support. Match the original extensions' inline annotation semantics and dotted/wavy underlines without importing the retired authenticated application. No new framework, backend, uploads or provider calls. Use a short Portuguese article and locally generated pronunciation recordings.

Implementation:

1. Extend text runs with escaped tooltip content and approved local audio identifiers. Preserve both marks through editing, preview and independent publication snapshots.
2. Add selection-based Tooltip and Audio link controls with editable annotations and removal. Keep the existing layout and compact mobile toolbar.
3. Show hover/focus/tap tooltips; play pronunciation on click or keyboard activation, with one audio stream at a time and visible failure feedback.
4. Update source-backed portfolio copy to explain the broader publishing idea and language-learning use case. The public source already contains the actual Tiptap extensions.
5. Verify serialization and snapshot regressions, real audio playback, selection/edit/remove flows, both themes, mobile, keyboard, and the existing editor/publishing flow. Run required checks, commit/push on main and verify CI, deployment and production.

The earlier instruction to continue without questions applies. The implementation approach is an agent choice, and the final handoff must distinguish the recreated demo from the original source application.

Verification: 31 tests pass, including annotation escaping, independent publication snapshots, selections across annotation boundaries, annotation grouping through formatting and formatting toggles. Prettier, ESLint, Astro checks (70 files, zero diagnostics) and the 44-page production build pass. Independent review findings were corrected. Browser checks verified annotation creation/edit/removal, two real local audio clips, keyboard explanations and playback, 320px layout without overflow, light/dark themes, and published content remaining unchanged after later draft edits. Provider services and original Tiptap runtime were not used. Production verification follows the main-branch push.
