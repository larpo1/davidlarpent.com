import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { buildNoteBlock } from '../../lib/append-note';

const execAsync = promisify(exec);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { slug, content, tags, published, spotify } = body;

    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid slug' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid slug: path traversal not allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Note content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sourcesDir = path.join(process.cwd(), 'src', 'content', 'sources');
    const filePath = path.join(sourcesDir, `${slug}.md`);

    try {
      await fs.access(filePath);
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: `Source not found: ${slug}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const noteBlock = buildNoteBlock({
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      published: published === true,
      spotify: typeof spotify === 'string' && spotify.trim() ? spotify.trim() : undefined,
    });

    await fs.appendFile(filePath, noteBlock, 'utf-8');

    const commitFile = `src/content/sources/${slug}.md`;
    setTimeout(async () => {
      try {
        await execAsync(`git add "${commitFile}"`);
        const commitMsg = `Auto-save: ${slug} (note)`;
        await execAsync(`git commit -m "${commitMsg}"`);
      } catch (gitError) {
        console.log('Git auto-commit skipped:', gitError);
      }
    }, 3000);

    return new Response(
      JSON.stringify({ success: true, message: 'Note saved' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving note:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
