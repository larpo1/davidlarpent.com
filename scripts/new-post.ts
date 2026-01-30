#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const title = args.join(' ');

if (!title) {
  console.error('❌ Error: Please provide a post title');
  console.error('Usage: npm run new "Your Post Title"');
  console.error('Example: npm run new "The Joy of Debugging"');
  process.exit(1);
}

// Generate slug from title
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
  .replace(/\s+/g, '-')          // Replace spaces with hyphens
  .replace(/-+/g, '-')           // Replace multiple hyphens with single
  .trim();

const filePath = join(process.cwd(), 'src/content/posts', `${slug}.md`);

// Check if file already exists
if (existsSync(filePath)) {
  console.error(`❌ Error: Post already exists at ${filePath}`);
  console.error('Please choose a different title or edit the existing post.');
  process.exit(1);
}

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Create the post content
const content = `---
title: "${title}"
date: ${today}
description: ""
draft: true
---

Write your essay here.
`;

// Write the file
writeFileSync(filePath, content, 'utf-8');
console.log(`✅ Created new draft: ${slug}.md`);
console.log(`📝 File: ${filePath}`);

// Try to open in VS Code
try {
  execSync(`code "${filePath}"`, { stdio: 'ignore' });
  console.log('🚀 Opened in VS Code');
} catch (error) {
  console.log('💡 Tip: Open manually or install VS Code CLI');
}

console.log('\nNext steps:');
console.log(`  1. Write your essay in ${slug}.md`);
console.log(`  2. Preview at http://localhost:4321/drafts (run: npm run dev)`);
console.log(`  3. Publish when ready: npm run publish ${slug}`);
