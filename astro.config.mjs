// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';

/** Rehype plugin: add loading="lazy" to <img> elements in raw HTML blocks */
function rehypeLazyImages() {
  return (tree) => {
    visit(tree, (node) => {
      // Handle parsed element nodes (markdown image syntax)
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = node.properties || {};
        node.properties.loading = 'lazy';
      }
      // Handle raw HTML blocks (inline <img> tags in markdown)
      if (node.type === 'raw' && typeof node.value === 'string' && node.value.includes('<img')) {
        node.value = node.value.replace(/<img(?![^>]*loading=)/g, '<img loading="lazy"');
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://davidlarpent.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: false
    }
  }),
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    rehypePlugins: [rehypeLazyImages]
  }
});
