import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

export const prerender = false;

const STYLE_PROMPT = 'Hand-drawn pencil sketch illustration. Black ink on white paper. Loose, expressive linework. Minimal shading with cross-hatching. No color. No text or labels. Simple composition. Think editorial illustration in The New Yorker or a Moleskine notebook sketch.';

export const POST: APIRoute = async ({ request }) => {
  // Dev-mode guard
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse request body
  let body: { prompt?: string; slug?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { prompt, slug } = body;

  // Validate prompt
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return new Response(
      JSON.stringify({ success: false, message: 'Prompt required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate slug
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
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

  // Check for API key
  const apiKey = import.meta.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, message: 'GOOGLE_AI_API_KEY environment variable not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Construct full prompt
  const fullPrompt = `${STYLE_PROMPT}\n\nSubject: ${prompt.trim()}`;

  try {
    // Call Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: fullPrompt,
    });

    // Extract image data from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return new Response(
        JSON.stringify({ success: false, message: 'No content in AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const imagePart = parts.find((part: any) => part.inlineData);
    if (!imagePart || !imagePart.inlineData?.data) {
      return new Response(
        JSON.stringify({ success: false, message: 'No image data in AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save image to public/images/posts/{slug}/
    const timestamp = Math.floor(Date.now() / 1000);
    const filename = `sketch-${timestamp}.png`;
    const imageDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);
    const imagePath = path.join(imageDir, filename);

    // Create directory if it doesn't exist
    await fs.mkdir(imageDir, { recursive: true });

    // Write the image file (base64 -> buffer)
    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
    await fs.writeFile(imagePath, imageBuffer);

    const publicPath = `/images/posts/${slug}/${filename}`;

    return new Response(
      JSON.stringify({ success: true, path: publicPath }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Image generation failed'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
