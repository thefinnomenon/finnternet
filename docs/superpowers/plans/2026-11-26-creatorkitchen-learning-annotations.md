# CreatorKitchen original editor

The portfolio must run the working original editor, especially its custom tooltip and audio extensions. The surrounding sidebar and navigation should keep the portfolio demo's earlier styling. Content Settings belongs behind the gear at every viewport size. Visitors can create documents and see local saving feedback, without preview, publishing, or external-site navigation.

Implementation:

1. Bundle the original React 17/Tiptap editor and its extensions unchanged from the sanitized public source archive. Verify every archived file against a recorded SHA-256 before building. Pin the original editor and ProseMirror dependency versions.
2. Mount the original editor inside the existing styled sidebar and top bar. Keep initial editor content stable while typing and remount only when switching documents. Store each document's title, description, and exact editor HTML in memory.
3. Put title and description in a native modal settings drawer with keyboard dismissal and focus return. Preserve adding documents and local save feedback. Remove the recreated editor, preview, publishing, and external-site flow.
4. Replace only retired file storage with browser object URLs. Keep original editor tools and original tooltip/audio markup. Use local pronunciation fixtures, shared theme messages, and accessible editor labeling.
5. Verify document isolation and exact HTML preservation, original toolbar and audio behavior, settings and document switching, desktop/mobile layouts, and both themes. Run formatting, lint, typecheck, tests, and production build. Commit and push on the existing main branch, follow CI and deployment, and verify production.

The archived source is intentionally excluded from the site's current lint, formatter, and TypeScript checks. Its hashes are checked before every build; the new shell and adapters remain subject to the site's strict checks. No original authentication, database, email, or publishing services are restored.
