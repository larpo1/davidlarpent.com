import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const prerender = false;

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});
turndown.use(gfm);

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Content required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert HTML to Markdown
    const markdown = turndown.turndown(content);

    // Write to file
    const filePath = 'src/content/about.md';
    await fs.writeFile(filePath, markdown, 'utf-8');

    // Auto-commit to prevent data loss
    try {
      await execAsync(`git add "${filePath}"`);
      const commitMsg = 'Auto-save: about';
      await execAsync(`git commit -m "${commitMsg}"`);
    } catch (gitError) {
      // Git commit failed (maybe no changes or not a git repo) - still return success
      console.log('Git auto-commit skipped:', gitError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'About page saved successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving about page:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
