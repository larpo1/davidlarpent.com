// Test: Footnote preservation strategy
// This tests whether footnotes from original markdown are preserved
// Run: node test-roundtrip.js

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Add GFM plugin
turndown.use(gfm);

// Simulate the ORIGINAL markdown (with footnotes)
const originalMarkdown = `
# Post with Footnotes

This is the first paragraph with a footnote[^1].

Here's some more text with another footnote[^2].

## Code Example

\`\`\`javascript
function hello() {
  console.log("world");
}
\`\`\`

[^1]: This is the first footnote content.

[^2]: This is the second footnote content.
`;

// Simulate the EDITED HTML (footnotes stripped before sending to API)
// This is what the browser would send after editing (without footnote elements)
const editedHTML = `
<h1>Post with Footnotes</h1>
<p>This is the first paragraph with a footnote.</p>
<p>Here's some MORE text with another footnote.</p>
<h2>Code Example</h2>
<pre><code class="language-javascript">function hello() {
  console.log("world");
}</code></pre>
`;

// Step 1: Extract footnote references from original
const footnoteRefs = [];
const footnoteRefRegex = /\[\^(\d+)\]/g;
let match;
while ((match = footnoteRefRegex.exec(originalMarkdown)) !== null) {
  footnoteRefs.push(`[^${match[1]}]`);
}

// Step 2: Extract footnote definitions from original
const footnoteDefsRegex = /\[\^(\d+)\]:[^\n]*(?:\n(?!\[\^|\n)[^\n]*)*/g;
const footnoteDefs = [];
while ((match = footnoteDefsRegex.exec(originalMarkdown)) !== null) {
  footnoteDefs.push(match[0].trim());
}

// Step 3: Convert edited HTML to Markdown
let convertedContent = turndown.turndown(editedHTML);

// Step 4: Re-insert footnote references
footnoteRefs.forEach((ref, index) => {
  if (!convertedContent.includes(ref)) {
    const paragraphs = convertedContent.split('\n\n');
    if (paragraphs.length > index) {
      paragraphs[index] = paragraphs[index] + ref;
      convertedContent = paragraphs.join('\n\n');
    }
  }
});

// Step 5: Append footnote definitions
if (footnoteDefs.length > 0) {
  convertedContent = convertedContent.trimEnd() + '\n\n' + footnoteDefs.join('\n\n');
}

console.log('=== ORIGINAL MARKDOWN (simulated) ===');
console.log(originalMarkdown);

console.log('\n=== EDITED HTML (footnotes stripped) ===');
console.log(editedHTML);

console.log('\n=== CONVERTED MARKDOWN (with preserved footnotes) ===');
console.log(convertedContent);

console.log('\n=== VERIFICATION ===');

// Check footnote references preserved
const ref1Present = convertedContent.includes('[^1]');
const ref2Present = convertedContent.includes('[^2]');
console.log(`${ref1Present ? '✅' : '❌'} Footnote reference [^1] preserved`);
console.log(`${ref2Present ? '✅' : '❌'} Footnote reference [^2] preserved`);

// Check footnote definitions preserved
const def1Present = convertedContent.includes('[^1]: This is the first footnote content.');
const def2Present = convertedContent.includes('[^2]: This is the second footnote content.');
console.log(`${def1Present ? '✅' : '❌'} Footnote definition [^1] preserved`);
console.log(`${def2Present ? '✅' : '❌'} Footnote definition [^2] preserved`);

// Check code block language preserved
const codeBlockPresent = convertedContent.includes('```javascript');
console.log(`${codeBlockPresent ? '✅' : '❌'} Code block language preserved`);

// Check edited content preserved
const editPresent = convertedContent.includes('MORE');
console.log(`${editPresent ? '✅' : '❌'} User edit "MORE" preserved`);

console.log('\n=== CONCLUSION ===');
const allPassed = ref1Present && ref2Present && def1Present && def2Present && codeBlockPresent && editPresent;
if (allPassed) {
  console.log('✅ All checks passed! Footnote preservation strategy works.');
} else {
  console.log('❌ Some checks failed. Review the output above.');
}
