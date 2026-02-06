import sharp from 'sharp';

// Create a 1200x630 OG image with dark background and text
const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#111111"/>

  <!-- Subtle border -->
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}"
        fill="none" stroke="#333333" stroke-width="1" rx="2"/>

  <!-- Name -->
  <text x="${width/2}" y="260"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="64"
        fill="#e8e8e8"
        text-anchor="middle"
        font-weight="400">
    David Larpent
  </text>

  <!-- Divider line -->
  <line x1="${width/2 - 60}" y1="300" x2="${width/2 + 60}" y2="300"
        stroke="#555555" stroke-width="1"/>

  <!-- Subtitle -->
  <text x="${width/2}" y="370"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="28"
        fill="#999999"
        text-anchor="middle"
        font-style="italic">
    Essays on AI, Philosophy, Product
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile('public/og-default.jpg');

console.log('✅ Created public/og-default.jpg (1200x630)');
