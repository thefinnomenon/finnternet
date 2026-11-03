import { getCollection, type CollectionEntry } from 'astro:content';
import { htmlLanguage, localePath, type Locale } from './i18n';

export type Post = CollectionEntry<'posts'>;

export async function publishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const paths = new Set<string>();
  const translations = new Set<string>();
  for (const post of posts) {
    const path = postPath(post);
    const translation = `${post.data.translationKey}:${post.data.lang}`;
    if (paths.has(path) || translations.has(translation)) {
      throw new Error(`Duplicate post URL or translation: ${post.id}`);
    }
    paths.add(path);
    translations.add(translation);
  }
  return posts.sort(
    (a, b) =>
      Number(a.data.demo) - Number(b.data.demo) ||
      b.data.published.getTime() - a.data.published.getTime() ||
      a.id.localeCompare(b.id),
  );
}

export async function postsForLocale(locale: Locale): Promise<Post[]> {
  return (await publishedPosts()).filter((post) => post.data.lang === locale);
}

export function postPath(post: Post): string {
  return localePath(post.data.lang, `writing/${post.data.path}`);
}

export function postDate(post: Post, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLanguage(locale), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(post.data.published);
}
