import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.sites-runtime/**',
      'demos/creatorkitchen/vendor/**',
      'demos/creatorkitchen/.generated/**',
      'public/demos/creatorkitchen/app/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
);
