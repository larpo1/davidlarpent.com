import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import matter from 'gray-matter';
import { parseNotes } from '../../lib/parse-notes';

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
    const { slug, timestamp, action } = body;

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

    if (!timestamp || typeof timestamp !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Timestamp is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action !== 'toggle-published' && action !== 'delete' && action !== 'update-tags') {
      return new Response(
        JSON.stringify({ success: false, message: 'Action must be "toggle-published", "delete", or "update-tags"' }),
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
    let bodyContent = parsed.content;

    // Find the correct note by position index (handles duplicate timestamps)
    const noteMarkers = [...bodyContent.matchAll(/<!-- note: .+? -->/g)];
    const requestedIndex = typeof body.noteIndex === 'number' ? body.noteIndex : null;

    let notePos: number;
    let noteHeader: string;
    if (requestedIndex !== null && requestedIndex >= 0 && requestedIndex < noteMarkers.length) {
      notePos = noteMarkers[requestedIndex].index!;
      noteHeader = noteMarkers[requestedIndex][0];
    } else {
      // Fallback: find by timestamp (backward compat)
      noteHeader = `<!-- note: ${timestamp} -->`;
      notePos = bodyContent.indexOf(noteHeader);
    }

    if (notePos === -1) {
      return new Response(
        JSON.stringify({ success: false, message: `Note not found: ${timestamp}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'toggle-published') {
      // Find the published comment within this note's block
      const nextNoteStart = requestedIndex !== null && requestedIndex + 1 < noteMarkers.length
        ? noteMarkers[requestedIndex + 1].index!
        : bodyContent.indexOf('<!-- note:', notePos + noteHeader.length);
      const blockEnd = nextNoteStart === -1 ? bodyContent.length : nextNoteStart;
      const block = bodyContent.slice(notePos, blockEnd);

      const updatedBlock = block.replace(
        /<!-- published: (true|false) -->/,
        (_match, val) => `<!-- published: ${val === 'true' ? 'false' : 'true'} -->`
      );

      bodyContent = bodyContent.slice(0, notePos) + updatedBlock + bodyContent.slice(blockEnd);
    } else if (action === 'update-tags') {
      // Update tags comment within the note block
      const { tags } = body;
      if (!Array.isArray(tags)) {
        return new Response(
          JSON.stringify({ success: false, message: 'tags must be an array' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const nextNoteStart = requestedIndex !== null && requestedIndex + 1 < noteMarkers.length
        ? noteMarkers[requestedIndex + 1].index!
        : bodyContent.indexOf('<!-- note:', notePos + noteHeader.length);
      const blockEnd = nextNoteStart === -1 ? bodyContent.length : nextNoteStart;
      let block = bodyContent.slice(notePos, blockEnd);

      const tagsLine = tags.length > 0 ? `<!-- tags: ${tags.join(', ')} -->` : null;
      const existingTagsMatch = block.match(/<!-- tags: .+? -->/);

      if (existingTagsMatch && tagsLine) {
        block = block.replace(/<!-- tags: .+? -->/, tagsLine);
      } else if (existingTagsMatch && !tagsLine) {
        block = block.replace(/<!-- tags: .+? -->\n?/, '');
      } else if (!existingTagsMatch && tagsLine) {
        // Insert after the note header line
        block = block.replace(noteHeader, noteHeader + '\n' + tagsLine);
      }

      bodyContent = bodyContent.slice(0, notePos) + block + bodyContent.slice(blockEnd);

      // Recompute source frontmatter tags as union of all note tags
      const allNotes = parseNotes(bodyContent);
      const computedTags = [...new Set(allNotes.flatMap(n => n.tags))].sort();
      parsed.data.tags = computedTags;
    } else {
      // Delete: remove from note header to next note header (or end of file)
      const nextNoteStart = requestedIndex !== null && requestedIndex + 1 < noteMarkers.length
        ? noteMarkers[requestedIndex + 1].index!
        : bodyContent.indexOf('<!-- note:', notePos + noteHeader.length);
      const blockEnd = nextNoteStart === -1 ? bodyContent.length : nextNoteStart;
      bodyContent = bodyContent.slice(0, notePos) + bodyContent.slice(blockEnd);
    }

    // Reassemble frontmatter + body
    const output = matter.stringify(bodyContent, parsed.data);

    const responseData: Record<string, any> = {
      success: true,
      message: `Note ${action === 'delete' ? 'deleted' : 'updated'}`,
    };
    if (action === 'update-tags') {
      responseData.sourceTags = parsed.data.tags;
    }

    // Defer file write so the API response reaches the client first.
    // The write triggers Astro HMR (page reload) — if it happens before
    // the client processes the response, the UI reverts to stale data.
    const commitFile = `src/content/sources/${slug}.md`;
    setTimeout(async () => {
      await fs.writeFile(filePath, output, 'utf-8');
      // Auto-commit after additional delay
      setTimeout(async () => {
        try {
          await execAsync(`git add "${commitFile}"`);
          const commitMsg = `Auto-save: ${slug} (note ${action})`;
          await execAsync(`git commit -m "${commitMsg}"`);
        } catch (gitError) {
          console.log('Git auto-commit skipped:', gitError);
        }
      }, 3000);
    }, 200);

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating note:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
