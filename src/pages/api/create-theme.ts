import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const prerender = false;

const needsQuoting = /[:"'#{}[\]&*?|>!%@`\n]/;
function yamlVal(v: string): string {
  if (!needsQuoting.test(v)) return v;
  return `'${v.replace(/'/g, "''")}'`;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, message: 'Title is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slug = typeof body.slug === 'string' && body.slug.trim() ? slugify(body.slug) : slugify(title);

    if (!slug) {
      return new Response(
        JSON.stringify({ success: false, message: 'Slug could not be derived from title' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const themesDir = path.join(process.cwd(), 'src', 'content', 'themes');
    const filePath = path.join(themesDir, `${slug}.md`);

    try {
      await fs.access(filePath);
      return new Response(
        JSON.stringify({ success: false, message: `Theme already exists: ${slug}` }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    } catch {
      // Doesn't exist; good.
    }

    const fileOutput = [
      '---',
      `title: ${yamlVal(title)}`,
      `description: ''`,
      'draft: false',
      '---',
      '',
    ].join('\n');

    await fs.mkdir(themesDir, { recursive: true });
    await fs.writeFile(filePath, fileOutput, 'utf-8');

    setTimeout(async () => {
      try {
        await execAsync(`git add "src/content/themes/${slug}.md"`);
        await execAsync(`git commit -m "Auto-save: ${slug} (theme created)"`);
      } catch (gitError) {
        console.log('Git auto-commit skipped:', gitError);
      }
    }, 3000);

    return new Response(
      JSON.stringify({ success: true, slug }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating theme:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
