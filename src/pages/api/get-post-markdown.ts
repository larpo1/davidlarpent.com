import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(
      JSON.stringify({ success: false, message: 'Slug required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate slug for path traversal
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid slug' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'posts', `${slug}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(fileContent);

    return new Response(
      JSON.stringify({
        success: true,
        markdown: parsed.content,
        frontmatter: parsed.data
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
