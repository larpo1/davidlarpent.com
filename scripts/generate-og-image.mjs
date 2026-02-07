import sharp from 'sharp';

// Create a 1200x630 OG image
// Default: clean dark background with minimal site URL
// For per-post dynamic OG images, consider using @vercel/og or Satori
// at a route like /api/og?title=Post+Title to generate images on the fly
const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#111111"/>

  <!-- Minimal site URL -->
  <text x="${width/2}" y="${height/2 + 10}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="36"
        fill="#888888"
        text-anchor="middle"
        font-weight="400">
    davidlarpent.com
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile('public/og-default.jpg');

console.log('Created public/og-default.jpg (1200x630)');
