import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Dev-mode guard
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse request body
  let body: { slug?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { slug, platform } = body;

  // Validate slug
  if (!slug) {
    return new Response(
      JSON.stringify({ success: false, message: 'Slug required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate slug for path traversal
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid slug' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate platform
  if (!platform || !['linkedin', 'substack'].includes(platform)) {
    return new Response(
      JSON.stringify({ success: false, message: 'Platform must be "linkedin" or "substack"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check for API key
  const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, message: 'ANTHROPIC_API_KEY environment variable not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Read post markdown
  let markdown: string;
  let frontmatter: Record<string, any>;
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'posts', `${slug}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(fileContent);
    markdown = parsed.content;
    frontmatter = parsed.data;
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Could not read post'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Build platform-specific prompt
  const title = frontmatter.title || slug;
  const description = frontmatter.description || '';
  const tags = frontmatter.tags || [];

  let systemPrompt: string;
  let userPrompt: string;

  if (platform === 'linkedin') {
    systemPrompt = `You are a ghostwriter for David Larpent. Your job is to write compelling LinkedIn posts that tease an note and drive clicks to read it.

Voice rules:
- Witty, wry, British humour
- First person
- No em dashes
- No corporate filler or buzzwords
- No exclamation marks
- No emojis
- Conversational but intelligent

Format rules:
- Under 3000 characters total
- First ~210 characters are critical (LinkedIn truncates before "see more")
- Open with a hook that creates curiosity
- Tease the key insight without giving it all away
- End with a natural call-to-action linking to the full note
- The link URL is: https://davidlarpent.com/posts/${slug}

Return your response as JSON with this exact structure:
{ "draft": "the full linkedin post text", "hashtags": ["tag1", "tag2", "tag3"] }

Suggest 3-5 relevant hashtags (without the # prefix). Only return the JSON, no other text.`;

    userPrompt = `Write a LinkedIn post for this note:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}

Full note:
${markdown}`;
  } else {
    // Substack
    systemPrompt = `You are a ghostwriter for David Larpent. Your job is to write an editorial intro for a Substack newsletter that contextualises the note for subscribers.

Voice rules:
- Witty, wry, British humour
- First person
- No em dashes
- No corporate filler or buzzwords
- No exclamation marks
- No emojis
- Conversational but intelligent

Format rules:
- Write 2-3 paragraphs of editorial intro
- Add personal framing that gives subscribers context they wouldn't get from the note alone
- Transition naturally into the full note
- After the intro, include the complete note text
- End with a canonical footer: "---\\nOriginally published at davidlarpent.com"

Return your response as JSON with this exact structure:
{ "draft": "the full substack content (intro + note + footer)", "hashtags": [] }

Only return the JSON, no other text.`;

    userPrompt = `Write a Substack newsletter intro and include the full note:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}

Full note:
${markdown}`;
  }

  // Call Anthropic Messages API
  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse JSON from response (handle markdown code fence wrapping)
    let parsed: { draft: string; hashtags: string[] };
    try {
      // Try direct JSON parse first
      parsed = JSON.parse(responseText);
    } catch {
      // Try extracting from markdown code fence
      const jsonMatch = responseText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse JSON from AI response');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        draft: parsed.draft,
        hashtags: parsed.hashtags || []
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'AI generation failed'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
