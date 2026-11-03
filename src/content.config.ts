import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { locales } from './lib/i18n';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    lang: z.enum(locales),
    translationKey: z.string().min(1),
    path: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
    readingMinutes: z.number().int().positive(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
