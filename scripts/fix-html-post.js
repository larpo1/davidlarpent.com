import fs from 'fs/promises';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});
turndown.use(gfm);

const filePath = 'src/content/posts/what-we-lose-when-we-stop-struggling.md';

// Read file
const fileContent = await fs.readFile(filePath, 'utf-8');
const parsed = matter(fileContent);

// Convert HTML content to markdown
const markdownContent = turndown.turndown(parsed.content);

// Write back with frontmatter
const output = matter.stringify(markdownContent, parsed.data);
await fs.writeFile(filePath, output, 'utf-8');

console.log('✅ Converted HTML to markdown successfully');
