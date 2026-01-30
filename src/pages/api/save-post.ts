import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// This API route must be server-rendered (not pre-rendered at build time)
export const prerender = false;

// Initialize turndown for HTML to Markdown conversion
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Add GFM plugin for footnote support
turndown.use(gfm);

export const POST: APIRoute = async ({ request }) => {
  // Dev-only security check
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { slug, title, description, content, frontmatter } = body;

    // Validate slug exists
    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid slug' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate slug for path traversal
    if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid slug: path traversal not allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build file path
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    const filePath = path.join(postsDir, `${slug}.md`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: `Post not found: ${slug}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read existing file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(fileContent);

    // Update frontmatter
    if (title !== undefined) {
      parsed.data.title = title;
    }
    if (description !== undefined) {
      parsed.data.description = description;
    }
    if (frontmatter) {
      if (frontmatter.date !== undefined) {
        parsed.data.date = new Date(frontmatter.date);
      }
      if (frontmatter.draft !== undefined) {
        parsed.data.draft = frontmatter.draft;
      }
    }

    // Update content if provided (now receives markdown directly from Tiptap)
    let newContent = parsed.content;
    if (content !== undefined && content !== null) {
      // Content is already markdown from Tiptap - no conversion needed!
      newContent = content;

      // Footnote preservation logic
      const footnoteRefRegex = /\[\^(\d+)\]/g;
      const footnoteDefsRegex = /\[\^(\d+)\]:[^\n]*(?:\n(?!\[\^|\n)[^\n]*)*/g;

      // Extract footnotes from ORIGINAL markdown
      const originalFootnoteRefs = [...parsed.content.matchAll(footnoteRefRegex)];
      const originalFootnoteDefs = [...parsed.content.matchAll(footnoteDefsRegex)];

      // If original had footnotes but new content doesn't, preserve them
      if (originalFootnoteRefs.length > 0 && !content.includes('[^')) {
        // Append original footnotes
        const footnoteSection = originalFootnoteDefs.map(match => match[0]).join('\n\n');
        newContent = content + '\n\n' + footnoteSection;
      }
    }

    // Stringify back to markdown with frontmatter
    const output = matter.stringify(newContent, parsed.data);

    // Write file
    await fs.writeFile(filePath, output, 'utf-8');

    return new Response(
      JSON.stringify({ success: true, message: 'Post saved successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving post:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
