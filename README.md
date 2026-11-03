# Finnternet

A static personal website with a retro desktop visual language. Built with Astro, Solid, TypeScript, and MDX. No database or runtime server is required.

## Development

Use Node 24 LTS and npm.

```sh
npm ci
npm run dev
```

```sh
npm run format:check
npm run lint
npm run check
npm run build
npm run preview
```

## Writing

Add `.md` or `.mdx` files under `src/content/posts/<language>/`. Frontmatter is validated at build time:

```yaml
title: A title
description: A short summary.
lang: en
translationKey: a-stable-shared-key
path: a-url-slug
published: 2026-11-02
readingMinutes: 3
draft: false
demo: false
```

Use the same `translationKey` across translations, with a language-specific `path`. Posts do not need all four translations. Only existing translations appear in the article language switcher and alternate metadata. Drafts are excluded from pages, listings, feeds, and the sitemap. Duplicate URLs and duplicate language versions of the same post fail the build.

The initial spring article is clearly marked as a demo. Replace its content and the starter biography before launching the personal site publicly. The project listing currently contains the working spring experiment; add real portfolio entries when their copy and destination URLs are ready.

## Interactive posts

Import a Solid component into MDX and choose when it hydrates:

```mdx
import SpringPlayground from '../../../components/SpringPlayground';

<SpringPlayground locale="en" client:visible />
```

The rest of the article stays static HTML. The spring playground stops its animation once settled, respects reduced motion, and has labelled, keyboard-operable controls. Syntax highlighting happens at build time.

## Languages and themes

English uses `/`, Spanish `/es/`, Brazilian Portuguese `/pt/`, and Italian `/it/`. Interface dictionaries live in `src/lib/i18n.ts`. Each language has an RSS feed, localized metadata, and a sitemap entry.

The default theme follows the system. Choosing light or dark saves the preference locally; choosing the monitor icon restores system behavior. The initial theme is applied in the document head before rendering.

## Hosting

`npm run build` writes the complete static site to `dist/`. The Sites manifest in `.openai/hosting.json` points to that directory. No adapter, environment secrets, or server functions are required.

The private review deployment uses a ChatGPT Sites URL. Before connecting `finnternet.com`, update `site` in `astro.config.mjs` to the custom domain and rebuild so canonical URLs, RSS, and the sitemap use the final origin. The existing website and its DNS are unaffected by this preview.
