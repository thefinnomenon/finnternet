import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import solid from '@astrojs/solid-js';

export default defineConfig({
  site: 'https://finnternet-retro.thefinnternet.chatgpt.site',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), solid()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', { path: 'pt', codes: ['pt-BR'] }, 'it'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
