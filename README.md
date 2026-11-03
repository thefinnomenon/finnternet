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

The ten original English travel posts are migrated from Finnternet's public Notion pages, including their original dates, captions, links, 87 photos, and 10 YouTube embeds. The original photos live under `src/assets/travel/`; the site does not depend on Notion to serve articles or photos. The migration manifest is `src/data/travel-migration.json`.

The spring article remains clearly marked as a demo and appears after real articles in listings. The project listing currently contains the working spring experiment; add real portfolio entries when their copy and destination URLs are ready.

## Images and video

Use `PostImage.astro` in MDX to generate responsive WebP images at build time, with accurate sizes, inferred dimensions, and lazy loading. Set `priority` only on an image immediately visible at the top of a page. Keep original content images in `src/assets/`; files copied directly to `public/` are not optimized.

```mdx
import PostImage from '../../../components/PostImage.astro';
import photo from '../../../assets/travel/your-photo.jpg';

<PostImage
  src={photo}
  alt="A specific description"
  caption="An optional caption"
/>
```

YouTube embeds use `VideoEmbed.astro`, a reserved 16:9 layout, lazy loading, and the `youtube-nocookie.com` embed origin.

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

`npm run build` writes the complete static site to `dist/`. `wrangler.jsonc` deploys that directory to Cloudflare Workers Static Assets with static 404 handling. No runtime adapter, database, or server functions are required. Run `npm run deploy` after building and authenticating with Wrangler.

Connect `thefinnomenon/finnternet` to Cloudflare Workers Builds, with `main` as the production branch, repository root as the root directory, `npm run check && npm run build` as the build command, and `npm run deploy` as the deploy command. Use the Node version in `.node-version`. GitHub Actions independently runs formatting, lint, typechecking, and a production build on pushes and pull requests. The existing Notion issue-sync workflow is retained.

`public/_redirects` preserves the old travel slugs and Notion UUID URLs. `public/_headers` caches hashed assets for a year; HTML uses Cloudflare's default revalidation. `vercel.json` disables new automatic deployments on the retired Vercel integration so a push cannot replace the old live site before the Cloudflare cutover.

The original private review deployment uses a ChatGPT Sites URL, retained in `.openai/hosting.json`. The production canonical origin is now `https://finnternet.com`. Connect the custom domain to Cloudflare only after verifying the new deployment. Source migration and a repository push do not change DNS.
