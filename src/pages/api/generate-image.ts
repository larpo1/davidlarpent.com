import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

export const prerender = false;

const DEFAULT_STYLE_PROMPT = 'Square 1:1 aspect ratio. Minimal architectural line drawing on a pure white background. Fine black ink lines only. Clean, precise, spare linework. No shading, no cross-hatching, no fills, no gradients. Just lines on white. Think Dieter Rams sketch meets architectural blueprint. Abstract where possible. Include 1-2 minimal handwritten labels in a loose architect\'s hand — like notes on a draft, not typeset text. Elegant negative space. The drawing should feel like a diagram that became art.';

export const POST: APIRoute = async ({ request }) => {
  // Dev-mode guard
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ success: false, message: 'API only available in development mode' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse request body
  let body: { prompt?: string; slug?: string; stylePrompt?: string; referenceImagePath?: string };
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

  // Construct full prompt (use client-provided style prompt if given)
  const stylePrompt = (body.stylePrompt && body.stylePrompt.trim()) || DEFAULT_STYLE_PROMPT;
  const fullPrompt = `${stylePrompt}\n\nSubject: ${prompt.trim()}`;

  try {
    // Load reference image if provided (for edit mode)
    let referenceImageData: { base64: string; mimeType: string } | null = null;
    if (body.referenceImagePath && typeof body.referenceImagePath === 'string') {
      const refPath = body.referenceImagePath;
      // Validate: must start with /images/ and not contain traversal
      if (refPath.startsWith('/images/') && !refPath.includes('..')) {
        const refFilePath = path.join(process.cwd(), 'public', refPath);
        try {
          const refBuffer = await fs.readFile(refFilePath);
          const refExt = path.extname(refFilePath).toLowerCase();
          const refMime = refExt === '.jpg' || refExt === '.jpeg' ? 'image/jpeg'
            : refExt === '.webp' ? 'image/webp'
            : 'image/png';
          referenceImageData = { base64: refBuffer.toString('base64'), mimeType: refMime };
        } catch {
          // Reference image not found — continue without it
        }
      }
    }

    // Call Gemini API
    const ai = new GoogleGenAI({ apiKey });

    // Build contents: text prompt + optional reference image
    let contents: any;
    if (referenceImageData) {
      contents = [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: referenceImageData.mimeType, data: referenceImageData.base64 } },
            { text: `Edit this image according to the following instructions:\n\n${fullPrompt}` },
          ]
        }
      ];
    } else {
      contents = fullPrompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents,
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
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
    const filename = `sketch-${timestamp}.${ext}`;
    const imageDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);
    const imagePath = path.join(imageDir, filename);

    // Create directory if it doesn't exist
    await fs.mkdir(imageDir, { recursive: true });

    // Write the image file (base64 -> buffer)
    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
    await fs.writeFile(imagePath, imageBuffer);

    const publicPath = `/images/posts/${slug}/${filename}`;

    return new Response(
      JSON.stringify({ success: true, path: publicPath, dataUrl: `data:${mimeType};base64,${imagePart.inlineData.data}` }),
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
