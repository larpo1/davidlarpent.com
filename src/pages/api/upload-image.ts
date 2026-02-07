import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';

export const prerender = false;

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const contentType = request.headers.get('content-type') || '';

  let imageBuffer: Buffer;
  let ext: string;
  let slug: string;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    slug = (formData.get('slug') as string) || '';

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, message: 'File required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_TYPES[file.type]) {
      return new Response(
        JSON.stringify({ success: false, message: 'File type not allowed. Use PNG, JPEG, WebP, or GIF.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ success: false, message: 'File too large (max 10MB)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    ext = ALLOWED_TYPES[file.type];
    const arrayBuffer = await file.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
  } else {
    let body: { slug?: string; data?: string; mimeType?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    slug = body.slug || '';
    const { data, mimeType } = body;

    if (!data || typeof data !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Base64 data required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!mimeType || !ALLOWED_TYPES[mimeType]) {
      return new Response(
        JSON.stringify({ success: false, message: 'Valid mimeType required (image/png, image/jpeg, image/webp, image/gif)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    ext = ALLOWED_TYPES[mimeType];
    imageBuffer = Buffer.from(data, 'base64');

    if (imageBuffer.length > MAX_SIZE) {
      return new Response(
        JSON.stringify({ success: false, message: 'File too large (max 10MB)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  if (!slug || typeof slug !== 'string' || !slug.trim()) {
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
    const timestamp = Math.floor(Date.now() / 1000);
    const filename = `sketch-${timestamp}.${ext}`;
    const imageDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);
    const imagePath = path.join(imageDir, filename);

    await fs.mkdir(imageDir, { recursive: true });
    await fs.writeFile(imagePath, imageBuffer);

    const publicPath = `/images/posts/${slug}/${filename}`;

    return new Response(
      JSON.stringify({ success: true, path: publicPath }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
