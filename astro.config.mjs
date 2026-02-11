// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';

/** Rehype plugin: add loading="lazy" to <img> elements in raw HTML blocks.
 *  Skips images with class="sketch-illustration" because those are repositioned
 *  into fixed-position wrappers by SketchScrollReveal.astro, and loading="lazy"
 *  prevents them from loading inside opacity:0 fixed containers. */
function rehypeLazyImages() {
  return (tree) => {
    visit(tree, (node) => {
      // Handle parsed element nodes (markdown image syntax)
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = node.properties || {};
        // Skip sketch illustrations — they get repositioned into fixed wrappers
        const classes = node.properties.className || node.properties.class || [];
        const classStr = Array.isArray(classes) ? classes.join(' ') : String(classes);
        if (classStr.includes('sketch-illustration')) return;
        node.properties.loading = 'lazy';
      }
      // Handle raw HTML blocks (inline <img> tags in markdown)
      if (node.type === 'raw' && typeof node.value === 'string' && node.value.includes('<img')) {
        // For raw HTML, skip <img> tags that contain sketch-illustration class
        node.value = node.value.replace(/<img(?![^>]*loading=)([^>]*?)>/g, (match, attrs) => {
          if (attrs.includes('sketch-illustration')) return match;
          return '<img loading="lazy"' + attrs + '>';
        });
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
