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

function buildSourceYaml(data: Record<string, any>): string {
  const lines: string[] = ['---'];
  if (data.title != null) lines.push(`title: ${yamlVal(String(data.title))}`);
  if (data.author != null) lines.push(`author: ${yamlVal(String(data.author))}`);
  if (data.type != null) lines.push(`type: ${data.type}`);
  if (data.link != null) lines.push(`link: ${yamlVal(String(data.link))}`);
  if (data.date != null) lines.push(`date: ${data.date instanceof Date ? data.date.toISOString() : data.date}`);
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    lines.push('tags:');
    for (const tag of data.tags) lines.push(`  - ${tag}`);
  }
  if (data.archived === true) lines.push(`archived: true`);
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

    const rawContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(rawContent);

    // Determine which mode based on body fields
    if ('timestamp' in body && 'content' in body) {
      // --- Note content save ---
      const { timestamp, content } = body;
      if (!timestamp || typeof timestamp !== 'string') {
        return new Response(
          JSON.stringify({ success: false, message: 'Timestamp is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      let bodyContent = parsed.content;
      const noteHeader = `<!-- note: ${timestamp} -->`;
      const noteIndex = bodyContent.indexOf(noteHeader);

      if (noteIndex === -1) {
        return new Response(
          JSON.stringify({ success: false, message: `Note not found: ${timestamp}` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Find the end of this note block (next note header or end of file)
      const nextNoteIndex = bodyContent.indexOf('<!-- note:', noteIndex + noteHeader.length);
      const blockEnd = nextNoteIndex === -1 ? bodyContent.length : nextNoteIndex;
      const block = bodyContent.slice(noteIndex, blockEnd);

      // Extract metadata comments from the block (tags, published, spotify)
      const metaLines: string[] = [];
      const lines = block.split('\n');
      // First line is the note header
      metaLines.push(lines[0]);
      for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.match(/^<!-- (tags|published|spotify): .+? -->$/)) {
          metaLines.push(lines[i]);
        } else if (trimmed === '') {
          // Skip blank lines between metadata and content
          continue;
        } else {
          // Content starts here; stop collecting metadata
          break;
        }
      }

      // Rebuild the note block: metadata + new content
      const newBlock = metaLines.join('\n') + '\n' + (content || '').trim() + '\n\n';
      bodyContent = bodyContent.slice(0, noteIndex) + newBlock + bodyContent.slice(blockEnd);

      const output = buildSourceYaml(parsed.data) + '\n' + bodyContent;
      const tmpPath = filePath + '.tmp';
      await fs.writeFile(tmpPath, output, 'utf-8');
      await fs.rename(tmpPath, filePath);

    } else if ('archived' in body && Object.keys(body).length === 2) {
      // --- Archive toggle ---
      parsed.data.archived = body.archived === true;

      const output = buildSourceYaml(parsed.data) + '\n' + parsed.content;
      const tmpPath = filePath + '.tmp';
      await fs.writeFile(tmpPath, output, 'utf-8');
      await fs.rename(tmpPath, filePath);

    } else {
      // --- Metadata save ---
      if (body.title !== undefined) parsed.data.title = body.title;
      if (body.author !== undefined) parsed.data.author = body.author;
      if (body.type !== undefined) parsed.data.type = body.type;
      if (body.link !== undefined) parsed.data.link = body.link;
      if (body.date !== undefined) parsed.data.date = new Date(body.date);
      if (body.tags !== undefined) parsed.data.tags = body.tags;

      const output = buildSourceYaml(parsed.data) + '\n' + parsed.content;
      const tmpPath = filePath + '.tmp';
      await fs.writeFile(tmpPath, output, 'utf-8');
      await fs.rename(tmpPath, filePath);
    }

    // Auto-commit after delay
    const commitFile = `src/content/sources/${slug}.md`;
    setTimeout(async () => {
      try {
        await execAsync(`git add "${commitFile}"`);
        const commitMsg = `Auto-save: ${slug} (source edit)`;
        await execAsync(`git commit -m "${commitMsg}"`);
      } catch (gitError) {
        console.log('Git auto-commit skipped:', gitError);
      }
    }, 3000);

    return new Response(
      JSON.stringify({ success: true, message: 'Source saved' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving source:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
