#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const slug = args[0];
const updateDate = args.includes('--today');

if (!slug) {
  console.error('❌ Error: Please provide a post slug');
  console.error('Usage: npm run publish <slug> [--today]');
  console.error('Example: npm run publish my-post-slug --today');
  process.exit(1);
}

const filePath = join(process.cwd(), 'src/content/posts', `${slug}.md`);

// Check if file exists
if (!existsSync(filePath)) {
  console.error(`❌ Error: Post not found at ${filePath}`);
  console.error('Available posts are in src/content/posts/');
  process.exit(1);
}

// Read the file
let content = readFileSync(filePath, 'utf-8');

// Check if already published
if (content.includes('draft: false')) {
  console.error(`❌ Error: Post "${slug}" is already published (draft: false)`);
  process.exit(1);
}

// Extract title from frontmatter for commit message
const titleMatch = content.match(/title:\s*["'](.+?)["']/);
const postTitle = titleMatch ? titleMatch[1] : slug;

// Update draft status
content = content.replace(/draft:\s*true/, 'draft: false');

// Update date if --today flag is passed
if (updateDate) {
  const today = new Date().toISOString().split('T')[0];
  content = content.replace(/date:\s*\d{4}-\d{2}-\d{2}/, `date: ${today}`);
  console.log(`📅 Updated date to ${today}`);
}

// Write the updated content
writeFileSync(filePath, content, 'utf-8');
console.log(`✅ Set draft: false in ${slug}.md`);

// Git commit and push
try {
  execSync(`git add "${filePath}"`, { stdio: 'inherit' });

  const commitMessage = `Publish: ${postTitle}\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  console.log('🚀 Pushing to GitHub...');
  execSync('git push', { stdio: 'inherit' });

  console.log('\n✨ Published successfully!');
  console.log('Vercel will deploy in ~30 seconds.');
} catch (error) {
  console.error('\n❌ Git operation failed:', error);
  process.exit(1);
}
