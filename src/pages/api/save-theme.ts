import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import matter from 'gray-matter';

const execAsync = promisify(exec);

export const prerender = false;

const needsQuoting = /[:"'#{}[\]&*?|>!%@`\n]/;
function yamlVal(v: string): string {
  if (!needsQuoting.test(v)) return v;
  return `'${v.replace(/'/g, "''")}'`;
}

function buildThemeYaml(data: Record<string, any>): string {
  const lines: string[] = ['---'];
  if (data.title != null) lines.push(`title: ${yamlVal(String(data.title))}`);
  if (data.description != null) lines.push(`description: ${yamlVal(String(data.description))}`);
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    lines.push('tags:');
    for (const tag of data.tags) lines.push(`  - ${tag}`);
  }
  if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
    lines.push('sources:');
    for (const slug of data.sources) lines.push(`  - ${slug}`);
  }
  if (data.draft === true) lines.push('draft: true');
  lines.push('---');
  return lines.join('\n');
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
    const { slug } = body;

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

    const themesDir = path.join(process.cwd(), 'src', 'content', 'themes');
    const filePath = path.join(themesDir, `${slug}.md`);

    try {
      await fs.access(filePath);
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: `Theme not found: ${slug}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(rawContent);

    let fileOutput: string;

    if ('content' in body && body.content !== undefined) {
      fileOutput = buildThemeYaml(parsed.data) + '\n\n' + String(body.content).trim() + '\n';
    } else {
      if (body.title !== undefined) parsed.data.title = body.title;
      if (body.description !== undefined) parsed.data.description = body.description;
      if (body.tags !== undefined) parsed.data.tags = body.tags;
      if (body.sources !== undefined) parsed.data.sources = body.sources;
      if (body.draft !== undefined) parsed.data.draft = body.draft;
      fileOutput = buildThemeYaml(parsed.data) + '\n' + parsed.content;
    }

    const commitFile = `src/content/themes/${slug}.md`;
    setTimeout(async () => {
      const tmpPath = filePath + '.tmp';
      await fs.writeFile(tmpPath, fileOutput, 'utf-8');
      await fs.rename(tmpPath, filePath);
      setTimeout(async () => {
        try {
          await execAsync(`git add "${commitFile}"`);
          const commitMsg = `Auto-save: ${slug} (theme edit)`;
          await execAsync(`git commit -m "${commitMsg}"`);
        } catch (gitError) {
          console.log('Git auto-commit skipped:', gitError);
        }
      }, 3000);
    }, 200);

    return new Response(
      JSON.stringify({ success: true, message: 'Theme saved' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving theme:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
