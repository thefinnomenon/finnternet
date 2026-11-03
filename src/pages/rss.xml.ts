import type { APIRoute } from 'astro';
import { rssResponse } from '../lib/feed';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('The site URL is required to build RSS.');
  return rssResponse('en', site);
};
