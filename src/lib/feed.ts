import { htmlLanguage, translations, type Locale } from './i18n';
import { postPath, postsForLocale } from './posts';

export function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character] ?? character,
  );
}

export async function rssResponse(
  locale: Locale,
  site: URL,
): Promise<Response> {
  const posts = await postsForLocale(locale);
  const t = translations[locale];
  const items = posts
    .map((post) => {
      const url = new URL(postPath(post), site).href;
      return `<item><title>${escapeXml(post.data.title)}</title><description>${escapeXml(post.data.description)}</description><link>${escapeXml(url)}</link><guid>${escapeXml(url)}</guid><pubDate>${post.data.published.toUTCString()}</pubDate></item>`;
    })
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Finnternet — ${escapeXml(t.writing)}</title><description>${escapeXml(t.intro)}</description><link>${escapeXml(site.href)}</link><language>${htmlLanguage(locale)}</language>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
