import type { APIRoute } from 'astro';
import { locales, localePath, htmlLanguage } from '../lib/i18n';
import { publishedPosts, postPath } from '../lib/posts';
import { escapeXml } from '../lib/feed';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('The site URL is required to build the sitemap.');
  const posts = await publishedPosts();
  const groups = [
    ...['', 'writing', 'projects', 'about'].map((path) =>
      locales.map((lang) => ({ lang, path: localePath(lang, path) })),
    ),
    ...[...new Set(posts.map((post) => post.data.translationKey))].map((key) =>
      posts
        .filter((post) => post.data.translationKey === key)
        .map((post) => ({ lang: post.data.lang, path: postPath(post) })),
    ),
  ];
  const urls = groups
    .flatMap((group) =>
      group.map(
        (entry) =>
          `<url><loc>${escapeXml(new URL(entry.path, site).href)}</loc>${group.map((alternate) => `<xhtml:link rel="alternate" hreflang="${htmlLanguage(alternate.lang)}" href="${escapeXml(new URL(alternate.path, site).href)}"/>`).join('')}</url>`,
      ),
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
