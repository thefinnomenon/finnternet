import type { APIRoute, GetStaticPaths } from 'astro';
import { locales, type Locale } from '../../lib/i18n';
import { rssResponse } from '../../lib/feed';

export const getStaticPaths = (() =>
  locales
    .filter((locale) => locale !== 'en')
    .map((locale) => ({
      params: { lang: locale },
      props: { locale },
    }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ locale: Locale }> = ({ props, site }) => {
  if (!site) throw new Error('The site URL is required to build RSS.');
  return rssResponse(props.locale, site);
};
