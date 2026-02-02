import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { marked } from 'marked';
import fs from 'fs/promises';
import matter from 'gray-matter';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const publishedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  // Build items with full content
  const items = await Promise.all(publishedPosts.map(async (post) => {
    // Read the raw markdown file
    const filePath = `src/content/posts/${post.id}`;
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { content: markdownContent } = matter(fileContent);

    // Render markdown to HTML
    const htmlContent = await marked.parse(markdownContent);

    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
      author: 'david@davidlarpent.com (David Larpent)',
      categories: post.data.tags || [],
      content: htmlContent,
    };
  }));

  return rss({
    title: 'David Larpent',
    description: 'Essays on philosophy, AI, cognitive science, and more.',
    site: context.site!,
    items,
    customData: `<language>en-us</language>
<managingEditor>david@davidlarpent.com (David Larpent)</managingEditor>
<webMaster>david@davidlarpent.com (David Larpent)</webMaster>`,
  });
}
