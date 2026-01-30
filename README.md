# davidlarpent.com

Personal essay site for David Larpent. Built with Astro, designed for simplicity and content-first reading.

## Design Philosophy

Inspired by [darioamodei.com](https://www.darioamodei.com/):
- Extreme simplicity, content-first
- No hero images, animations, or cruft
- Clean typography, generous whitespace
- Just essays with dates, easy to read

## Tech Stack

- **Framework**: Astro 5.x (SSG)
- **Hosting**: Vercel
- **Content**: Markdown with frontmatter
- **Styling**: Minimal custom CSS (no frameworks)

## Project Structure

```
davidlarpent.com/
├── src/
│   ├── content/
│   │   ├── config.ts           # Content collection schema
│   │   └── posts/              # Essay markdown files
│   ├── layouts/
│   │   ├── Base.astro          # HTML shell, meta tags
│   │   └── Post.astro          # Essay layout with reading time
│   ├── pages/
│   │   ├── index.astro         # Home: list of essays
│   │   ├── about.astro         # Bio page
│   │   ├── rss.xml.ts          # RSS feed
│   │   └── posts/
│   │       └── [...slug].astro # Dynamic post pages
│   └── styles/
│       └── global.css          # Minimal styles
├── scripts/
│   ├── syndicate-substack.ts   # Placeholder for Substack cross-posting
│   └── syndicate-linkedin.ts   # Placeholder for LinkedIn sharing
├── astro.config.mjs            # Astro config with Vercel adapter
└── vercel.json                 # Vercel deployment config
```

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |

## Writing Essays

Create a new `.md` file in `src/content/posts/`:

```markdown
---
title: "Your Essay Title"
date: 2026-01-30
description: "A brief description for RSS and social sharing"
draft: false
---

Your essay content here...
```

Essays are automatically:
- Listed on homepage (newest first)
- Added to RSS feed at `/rss.xml`
- Added to sitemap
- Given reading time estimates

## Deployment

Configured for Vercel with static output:
- Push to main branch to trigger deployment
- Vercel will automatically build and deploy
- Domain: davidlarpent.com (configure in Vercel dashboard)

## Syndication (Phase 2)

Placeholder scripts exist for:
- Cross-posting to Substack (`npm run syndicate:substack`)
- Sharing on LinkedIn (`npm run syndicate:linkedin`)

These will be implemented when needed.

## Performance

Built for speed:
- Static site generation (SSG)
- No client-side JavaScript (except what Astro needs)
- Optimized for Lighthouse 95+ score
- Works perfectly without JavaScript
