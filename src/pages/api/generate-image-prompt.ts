import type { APIRoute } from 'astro';
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
  let body: { sourceText?: string; stylePrompt?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { sourceText, stylePrompt } = body;

  // Validate sourceText
  if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) {
    return new Response(
      JSON.stringify({ success: false, message: 'sourceText required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate stylePrompt
  if (!stylePrompt || typeof stylePrompt !== 'string' || !stylePrompt.trim()) {
    return new Response(
      JSON.stringify({ success: false, message: 'stylePrompt required' }),
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

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are an expert at writing image generation prompts. Your job is to distill a passage of text into a concise visual subject description that an image generation model can illustrate.

Rules:
- Output ONLY the subject description, nothing else
- Do not include any preamble, explanation, or formatting
- Do NOT include any style instructions — those will be added separately
- Describe a specific visual scene or concept inspired by the source text
- Keep it concise but specific (1-3 sentences)
- Focus on visual elements that can be drawn, not abstract concepts
- Think about what would make a compelling, clear illustration of the key idea`,
      messages: [
        {
          role: 'user',
          content: `Source text:\n${sourceText.trim()}\n\nDistill this into a visual subject description for an image generation model.`
        }
      ]
    });

    const subjectDescription = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim();

    // Combine: full style prompt (verbatim) + synthesized subject
    const fullPrompt = `${stylePrompt.trim()}\n\nSubject: ${subjectDescription}`;

    return new Response(
      JSON.stringify({ success: true, prompt: fullPrompt }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Prompt generation failed'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
