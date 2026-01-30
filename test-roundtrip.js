// Test: HTML → Markdown roundtrip fidelity
// This tests whether GFM plugin preserves footnotes
// Run: node test-roundtrip.js

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Add GFM plugin for footnote support
turndown.use(gfm);

// Simulate what happens when editing a post with footnotes:
// 1. Markdown rendered to HTML by Astro (with syntax highlighting, footnotes)
const renderedHTML = `
<h1>Heading with Code</h1>
<p>Here's some JavaScript with syntax highlighting:</p>
<pre><code class="language-javascript"><span class="token keyword">function</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"world"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre>
<p>And a footnote reference<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup>.</p>
<section class="footnotes">
<h2>Footnotes</h2>
<ol>
<li id="user-content-fn-1">This is the footnote content.</li>
</ol>
</section>
`;

// 2. User edits in browser (contenteditable)
// 3. We send innerHTML to API
// 4. Turndown converts back to Markdown
const convertedMarkdown = turndown.turndown(renderedHTML);

console.log('=== CONVERTED MARKDOWN ===');
console.log(convertedMarkdown);

console.log('\n=== PROBLEMS DETECTED ===');

if (convertedMarkdown.includes('[1](#user-content-fn-1)')) {
  console.log('❌ FOOTNOTE SYNTAX BROKEN');
  console.log('   Original: [^1]');
  console.log('   Converted to: [1](#user-content-fn-1)');
  console.log('   Impact: Footnote will not work in markdown');
}

if (convertedMarkdown.includes('1.  This is the footnote')) {
  console.log('❌ FOOTNOTE DEFINITION BROKEN');
  console.log('   Original: [^1]: This is the footnote content.');
  console.log('   Converted to: 1.  This is the footnote content.');
  console.log('   Impact: Not valid GFM footnote syntax');
}

if (convertedMarkdown.includes('```javascript')) {
  console.log('✅ Code block language preserved (good!)');
} else {
  console.log('❌ Code block language lost');
}

console.log('\n=== CONCLUSION ===');
console.log('Inline editing will CORRUPT any post with footnotes.');
console.log('Do NOT use content editing until this is fixed.');
console.log('Title/description editing only is SAFE (no markdown complexity).');
