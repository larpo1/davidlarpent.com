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

    // Update content if provided (convert HTML to Markdown)
    let newContent = parsed.content;
    if (content !== undefined && content !== null) {
      // Extract footnote references from ORIGINAL markdown
      const footnoteRefs: string[] = [];
      const footnoteRefRegex = /\[\^(\d+)\]/g;
      let match;
      while ((match = footnoteRefRegex.exec(parsed.content)) !== null) {
        footnoteRefs.push(`[^${match[1]}]`);
      }

      // Extract footnote definitions from ORIGINAL markdown
      const footnoteDefsRegex = /\[\^(\d+)\]:[^\n]*(?:\n(?!\[\^|\n)[^\n]*)*/g;
      const footnoteDefs: string[] = [];
      while ((match = footnoteDefsRegex.exec(parsed.content)) !== null) {
        footnoteDefs.push(match[0].trim());
      }

      // Convert HTML content (without footnotes) to Markdown
      let convertedContent = turndown.turndown(content);

      // Re-insert footnote references at approximate positions
      // Since we stripped them from the HTML, we add them back at end of first paragraph
      // This is best-effort - exact positioning would need more complex logic
      footnoteRefs.forEach((ref, index) => {
        if (!convertedContent.includes(ref)) {
          // Find the nth paragraph end and insert there
          const paragraphs = convertedContent.split('\n\n');
          if (paragraphs.length > index) {
            paragraphs[index] = paragraphs[index] + ref;
            convertedContent = paragraphs.join('\n\n');
          } else {
            // Fallback: add to end of content
            convertedContent = convertedContent.trimEnd() + ref + '\n';
          }
        }
      });

      // Append footnote definitions at the end
      if (footnoteDefs.length > 0) {
        convertedContent = convertedContent.trimEnd() + '\n\n' + footnoteDefs.join('\n\n');
      }

      newContent = convertedContent;
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
