import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const slug = url.searchParams.get('slug') || '';

  if (!slug || !slug.trim()) {
    return new Response(
      JSON.stringify({ success: false, message: 'Slug required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid slug' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const imageDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);

  try {
    await fs.access(imageDir);
  } catch {
    return new Response(
      JSON.stringify({ success: true, images: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const entries = await fs.readdir(imageDir, { withFileTypes: true });
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

    const images = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!imageExtensions.includes(ext)) continue;

      const filePath = path.join(imageDir, entry.name);
      const stat = await fs.stat(filePath);
      images.push({
        filename: entry.name,
        path: `/images/posts/${slug}/${entry.name}`,
        modified: stat.mtimeMs,
      });
    }

    images.sort((a, b) => b.modified - a.modified);

    return new Response(
      JSON.stringify({ success: true, images }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list images'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
