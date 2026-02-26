#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);

// Parse flags: --type=book, --author="Name"
let title = '';
let author = '';
let type = 'book';

const positional: string[] = [];
for (const arg of args) {
  if (arg.startsWith('--type=')) {
    type = arg.slice(7);
  } else if (arg.startsWith('--author=')) {
    author = arg.slice(9);
  } else {
    positional.push(arg);
  }
}
title = positional.join(' ');

if (!title) {
  console.error('Error: Please provide a source title');
  console.error('Usage: npm run new:source "Title" --author="Author Name" --type=book');
  console.error('Types: book, article, paper, podcast');
  process.exit(1);
}

if (!author) {
  console.error('Error: Please provide an author with --author="Name"');
  process.exit(1);
}

const validTypes = ['book', 'article', 'paper', 'podcast'];
if (!validTypes.includes(type)) {
  console.error(`Error: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Generate slug from title and author
const slug = (title + ' ' + author)
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

const filePath = join(process.cwd(), 'src/content/sources', `${slug}.md`);

if (existsSync(filePath)) {
  console.error(`Error: Source already exists at ${filePath}`);
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];

const content = `---
title: "${title}"
author: "${author}"
type: ${type}
date: ${today}
tags: []
---
`;

writeFileSync(filePath, content, 'utf-8');
console.log(`Created new source: ${slug}.md`);
console.log(`File: ${filePath}`);

try {
  execFileSync('code', [filePath], { stdio: 'ignore' });
  console.log('Opened in VS Code');
} catch {
  console.log('Tip: Open manually or install VS Code CLI');
}
