# CreatorKitchen editor archive

The editor runs the actual `components/TipTap.tsx` and original components/extensions from [creatorkitchen-public](https://github.com/thefinnomenon/creatorkitchen-public), source commit `b458dc24d94c1e0566983f60eaf0032d2bb71058`. The sanitized archive preserves the April 2022 implementation. `vendor/LICENSE` contains its MIT license.

`source-manifest.json` records the SHA-256 of every vendored file. The build verifies all hashes before compiling the original source. The original editor and extensions compile unchanged. The build applies one guarded fix to the original Callout view so its style selector cycles back to the first style instead of producing an undefined type. `original-entry.js` exports the original editor, and the workspace pins React, Tiptap, and ProseMirror to the original lockfile versions.

The portfolio integration adds:

- A styled sidebar and top bar, local documents, and a Content Settings drawer behind the gear. Saving means keeping edits in memory for this visit, not persisting them to a server.
- Accessible editor/control labels, editable hover tooltips that update original Tiptap marks, and read-only tooltip rendering in Preview. Popups mount outside ProseMirror. Inline audio clicks are blocked while editing; Preview renders the original serialized audio markup with keyboard support.
- A file-storage adapter that returns browser object URLs for the original audio and file controls. Files stay on the visitor's device, and URLs are revoked when the page closes.
- Theme synchronization with the parent portfolio, responsive styles, and bundled local pronunciation fixtures.
- A compact, scrollable command menu with icons and a single-row formatting toolbar. The original suggestion filtering and editor commands remain unchanged. The audio control adapter uses native play/pause/ended events to keep its icon in sync, with a compact file chooser and local upload storage.

Publishing, external-site navigation, and the original dashboard are not mounted. Preview takes its snapshot from the original editor's `getHTML()` serializer through a context bridge, including on the first visit. Local Preview strips editable attributes and editor-only controls, replacing unfinished media with a placeholder while preserving audio/video playback. No Amplify, authentication, database, or publishing services are called. Original image-search requests receive empty local responses; other fetch requests fail with an archived-service message. The isolated page's CSP blocks network connections.

Run `npm run build:creatorkitchen` from the site root to generate hashed browser assets and their manifest under `public/demos/creatorkitchen/app/`. These generated files are ignored by Git. Both the site's development and production commands build this bundle first.

The editor is an archive with legacy dependencies, not a modernized version of the application. Its untouched source is excluded from current-site lint, formatting, and strict typechecking; new integration code is checked. Hash verification and the production browser bundle validate the archived boundary. Dependency auditing still reports advisories in this historical dependency tree.

The starter lesson demonstrates the editor through a beginner Brazilian Portuguese present-subjunctive lesson, including conjugation tables, callouts, rich text, code/keyboard notation, hover answer explanations, six pronunciation clips, an illustration, and a short pronunciation video. Asset provenance and grammar references are recorded in `public/demos/creatorkitchen/NOTICE.txt`.
