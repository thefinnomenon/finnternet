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
npm test
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

Portfolio entries live under `src/pages/projects/` and appear in the localized Projects listings. Guestography, InstaMosaic, and FaceReel also feature in the homepage's Projects window.

## Portfolio demos

The InstaMosaic page pairs a resizable product window with project details, completion date, source link, grouped tech stack, and functionality. Its isolated iframe uses the original product styling with preset interactions and precomputed image and video exports. It does not call the original backend, process user uploads, send email, or start a checkout. The former `/previews/instamosaic/` URL forwards to `/projects/instamosaic/`.

FaceReel uses the same container and project details, with its original form and progress stages followed by an existing Cristiano render. Its video and poster URLs are assigned only after showing the result. The demo does not run face recognition, fetch Instagram photos, or call the original backend.

Guestography replays event creation, gallery browsing, and a guest upload with preset details and existing example photos. Its original Tailwind styles are compiled into an isolated stylesheet. Static QR cards come from the original renderer and point back to the portfolio gallery. Only the gallery-ready email is delivered to Fmail; photos and QR images load when their screen or email is opened. Checkout, uploads, and email remain local simulations.

Fmail is a browser-local inbox shared across the site. Each notification retains its project's sender and subject. Demo notifications survive navigation, repeated runs replace previous notifications, and opening an email removes it from the inbox. Email bodies have no navigation links. The mailbox tests run with `npm test`.

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

MDX articles can import Solid components and use Astro's `client:visible` directive to hydrate them when they enter the viewport. The rest of the article stays static HTML. Interactive components should respect reduced motion and support keyboard controls. Syntax highlighting happens at build time.

## Languages and themes

English uses `/`, Spanish `/es/`, Brazilian Portuguese `/pt/`, and Italian `/it/`. Interface dictionaries live in `src/lib/i18n.ts`. Each language has an RSS feed, localized metadata, and a sitemap entry.

The header uses compact language and theme dropdowns, with Fmail at the far right. Navigation moves into a menu on narrow screens so the header stays on one row. The default theme follows the system. Choosing light or dark saves the preference locally; choosing System restores system behavior. The initial theme is applied in the document head before rendering.

## Hosting

`npm run build` writes the complete static site to `dist/`. `wrangler.jsonc` deploys that directory to Cloudflare Workers Static Assets with static 404 handling. No runtime adapter, database, or server functions are required. Run `npm run deploy` after building and authenticating with Wrangler.

The live Cloudflare deployment is https://finnternet.chris-b92.workers.dev/. Cloudflare Workers Builds is connected to `thefinnomenon/finnternet`: pushes to `main` automatically build and deploy production, and other branches receive preview builds. The root directory is `/`, the build command is `npm run check && npm run build`, and the deploy command is `npm run deploy`. Cloudflare reads the Node version from `.node-version` and the npm version from `packageManager`. GitHub Actions independently runs formatting, lint, typechecking, and a production build on pushes and pull requests. The existing Notion issue-sync workflow is retained.

`public/_redirects` preserves the old travel slugs and Notion UUID URLs. `public/_headers` caches hashed assets for a year; HTML uses Cloudflare's default revalidation. `vercel.json` disables new automatic deployments on the retired Vercel integration so a push cannot replace the old live site before the Cloudflare cutover.

The original private review deployment uses a ChatGPT Sites URL, retained in `.openai/hosting.json`. The production canonical origin is now `https://finnternet.com`. Connect the custom domain to Cloudflare only after verifying the new deployment. Source migration and a repository push do not change DNS.
