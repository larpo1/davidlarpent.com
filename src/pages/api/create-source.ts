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
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const VALID_TYPES = new Set(['book', 'article', 'paper', 'podcast']);

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
    const author = typeof body.author === 'string' && body.author.trim() ? body.author.trim() : 'Unknown';
    const type = typeof body.type === 'string' && VALID_TYPES.has(body.type) ? body.type : 'article';
    const link = typeof body.link === 'string' && body.link.trim() ? body.link.trim() : undefined;

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, message: 'Title is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const baseSlug = slugify(title);
    if (!baseSlug) {
      return new Response(
        JSON.stringify({ success: false, message: 'Slug could not be derived from title' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sourcesDir = path.join(process.cwd(), 'src', 'content', 'sources');
    await fs.mkdir(sourcesDir, { recursive: true });

    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      try {
        await fs.access(path.join(sourcesDir, `${slug}.md`));
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      } catch {
        break;
      }
    }

    const filePath = path.join(sourcesDir, `${slug}.md`);
    const lines: string[] = ['---'];
    lines.push(`title: ${yamlVal(title)}`);
    lines.push(`author: ${yamlVal(author)}`);
    lines.push(`type: ${type}`);
    if (link) lines.push(`link: ${yamlVal(link)}`);
    lines.push(`date: ${new Date().toISOString()}`);
    lines.push('---');
    lines.push('');
    const fileOutput = lines.join('\n');

    await fs.writeFile(filePath, fileOutput, 'utf-8');

    setTimeout(async () => {
      try {
        await execAsync(`git add "src/content/sources/${slug}.md"`);
        await execAsync(`git commit -m "Auto-save: ${slug} (source created)"`);
      } catch (gitError) {
        console.log('Git auto-commit skipped:', gitError);
      }
    }, 3000);

    return new Response(
      JSON.stringify({ success: true, slug }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating source:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
