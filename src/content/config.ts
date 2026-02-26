import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    category: z.enum(['work', 'not-work']).optional(),
    featureImage: z.string().optional(),
  }),
});

const sources = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    type: z.enum(['book', 'article', 'paper', 'podcast']),
    link: z.string().url().optional(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    archived: z.boolean().default(false),
  }),
});

export const collections = { posts, sources };
