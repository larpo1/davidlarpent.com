import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';

export const prerender = false;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

async function getImagesForSlug(slug: string) {
  const imageDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);
  try {
    await fs.access(imageDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(imageDir, { withFileTypes: true });
  const images = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) continue;

    const filePath = path.join(imageDir, entry.name);
    const stat = await fs.stat(filePath);
    images.push({
      filename: entry.name,
      path: `/images/posts/${slug}/${entry.name}`,
      modified: stat.mtimeMs,
    });
  }
  images.sort((a, b) => b.modified - a.modified);
  return images;
}

async function getPostTitle(slug: string): Promise<string> {
  const postPath = path.join(process.cwd(), 'src', 'content', 'posts', `${slug}.md`);
  try {
    const content = await fs.readFile(postPath, 'utf-8');
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    return titleMatch ? titleMatch[1] : slug;
  } catch {
    return slug;
  }
}

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const allMode = url.searchParams.get('all') === 'true';

  if (allMode) {
    const currentSlug = url.searchParams.get('currentSlug') || '';
    const postsImageDir = path.join(process.cwd(), 'public', 'images', 'posts');

    try {
      await fs.access(postsImageDir);
    } catch {
      return new Response(
        JSON.stringify({ success: true, groups: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const slugDirs = await fs.readdir(postsImageDir, { withFileTypes: true });
      const groups: { slug: string; title: string; images: any[] }[] = [];

      for (const dir of slugDirs) {
        if (!dir.isDirectory()) continue;
        const slug = dir.name;
        if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) continue;

        const images = await getImagesForSlug(slug);
        if (images.length === 0) continue;

        const title = await getPostTitle(slug);
        groups.push({ slug, title, images });
      }

      // Sort: current post first, then alphabetically by title
      groups.sort((a, b) => {
        if (a.slug === currentSlug) return -1;
        if (b.slug === currentSlug) return 1;
        return a.title.localeCompare(b.title);
      });

      return new Response(
        JSON.stringify({ success: true, groups }),
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
  }

  // Single-slug mode (existing behavior)
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

  try {
    const images = await getImagesForSlug(slug);
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
