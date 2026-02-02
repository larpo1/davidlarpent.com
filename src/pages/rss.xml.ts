import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const publishedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'David Larpent',
    description: 'Essays on philosophy, AI, cognitive science, and more.',
    site: context.site!,
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
      author: 'david@davidlarpent.com (David Larpent)',
      categories: post.data.tags || [],
    })),
    customData: `<language>en-us</language>
<managingEditor>david@davidlarpent.com (David Larpent)</managingEditor>
<webMaster>david@davidlarpent.com (David Larpent)</webMaster>`,
  });
}
