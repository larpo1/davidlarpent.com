# SEO & LLM Crawling Audit - davidlarpent.com

**Date:** 2026-02-02
**Objective:** Maximize content discoverability by search engines and LLM crawlers

---

## Executive Summary

**Overall Score:** 6/10

**Strengths:**
- ✅ Sitemap configured (@astrojs/sitemap)
- ✅ RSS feed present (/rss.xml)
- ✅ Open Graph tags
- ✅ Twitter cards
- ✅ Canonical URLs
- ✅ Semantic HTML structure
- ✅ Clean URLs (/posts/slug)

**Critical Gaps:**
- ❌ No robots.txt (missing crawler directives)
- ❌ No JSON-LD structured data (rich snippets missing)
- ❌ No author metadata (byline, bio link)
- ❌ No article schema (publication date, word count not exposed)
- ❌ No OpenGraph images (social shares will be blank)
- ❌ Missing meta tags (keywords, article:published_time, article:author)

**Impact:** Your content is discoverable but not optimized. LLMs can find and read your essays, but you're missing opportunities for:
- Rich snippets in Google (star ratings, author info, breadcrumbs)
- Better social media previews
- Author attribution in AI citations
- Enhanced search result appearance

---

## Detailed Findings

### 1. ✅ GOOD: Sitemap

**Status:** Configured and working

**Evidence:**
```javascript
// astro.config.mjs
integrations: [sitemap()],
site: 'https://davidlarpent.com',
```

**What's generated:**
- Sitemap.xml at https://davidlarpent.com/sitemap.xml
- Auto-includes all pages (index, about, posts)
- Updated on each build

**Recommendation:** None needed. This is working well.

---

### 2. ✅ GOOD: RSS Feed

**Status:** Present and properly configured

**Location:** `/rss.xml`

**Content:**
- Title: "David Larpent"
- Description: "Essays on philosophy, AI, cognitive science, and more."
- Filters out drafts
- Sorted by date (newest first)
- Includes title, description, pubDate, link

**Issues:**
- ❌ No author field in RSS items
- ❌ No content:encoded tag (only description, not full content)
- ❌ No categories/tags

**Recommendations:**
```typescript
// src/pages/rss.xml.ts
items: publishedPosts.map((post) => ({
  title: post.data.title,
  description: post.data.description,
  pubDate: post.data.date,
  link: `/posts/${post.slug}/`,
  author: 'david@davidlarpent.com (David Larpent)', // ADD THIS
  categories: post.data.tags || [], // ADD THIS (requires schema update)
  content: post.body, // ADD THIS for full content in RSS
})),
```

---

### 3. ✅ GOOD: Open Graph & Twitter Cards

**Status:** Basic implementation present

**Current tags:**
```html
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />

<!-- Twitter -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
```

**Issues:**
- ❌ No og:image (social shares will have no preview image)
- ❌ No og:site_name
- ❌ No article:published_time for blog posts
- ❌ No article:author for blog posts
- ❌ No article:section (category/topic)
- ❌ Twitter card is "summary" but should be "summary_large_image"

**Recommendations:**

**In Base.astro:**
```astro
<!-- Add to props -->
interface Props {
  title: string;
  description?: string;
  image?: string; // ADD THIS
  type?: 'website' | 'article'; // ADD THIS
}

const {
  title,
  description = "Essays on philosophy, AI, cognitive science, and more.",
  image = "/og-default.jpg", // ADD DEFAULT IMAGE
  type = "website"
} = Astro.props;

<!-- Updated OG tags -->
<meta property="og:type" content={type} />
<meta property="og:site_name" content="David Larpent" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.site)} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Updated Twitter tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourusername" /> <!-- ADD YOUR TWITTER -->
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(image, Astro.site)} />
```

**In Post.astro:**
```astro
<Base
  title={`${title} | David Larpent`}
  description={description}
  type="article" // ADD THIS
  image={`/og-images/${slug}.jpg`} // ADD THIS (auto-generate or fallback to default)
>
```

**Add to Post.astro head section:**
```astro
<!-- Article-specific meta tags -->
<meta property="article:published_time" content={date.toISOString()} />
<meta property="article:author" content="David Larpent" />
<meta property="article:section" content="Essays" />
```

---

### 4. ❌ CRITICAL: No robots.txt

**Status:** Missing

**Impact:**
- No explicit crawling directives
- Crawlers will use default behavior (usually OK, but not optimal)
- No sitemap location hint
- No crawl-delay directive
- Missing opportunity to block dev/admin routes

**Recommendation:**

Create `/public/robots.txt`:

```txt
# Allow all bots to crawl everything except API routes
User-agent: *
Allow: /

# Block dev-only API endpoints (even though they're blocked in production)
Disallow: /api/

# Sitemap location
Sitemap: https://davidlarpent.com/sitemap.xml

# Allow AI crawlers explicitly (OpenAI, Anthropic, Google, Perplexity, etc.)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Crawl delay (be nice to servers)
Crawl-delay: 1
```

**Why this matters for LLMs:**
- GPTBot (OpenAI) checks robots.txt
- CCBot (Common Crawl, used by many AI models) checks robots.txt
- Anthropic/Claude crawlers check robots.txt
- Explicit Allow: / signals "yes, please index this"

---

### 5. ❌ CRITICAL: No JSON-LD Structured Data

**Status:** Completely missing

**Impact:**
- Google won't show rich snippets
- No author attribution in search results
- No article metadata (publish date, reading time, etc.)
- LLMs have less structured context
- Missing opportunity for knowledge graph inclusion

**What should be added:**

**Article Schema (for blog posts):**

Add to `Post.astro`:

```astro
---
// In the frontmatter
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Person",
    "name": "David Larpent",
    "url": "https://davidlarpent.com/about",
    "sameAs": [
      "https://www.linkedin.com/in/davidlarpent",
      // Add Twitter, GitHub, etc. if you have them
    ]
  },
  "publisher": {
    "@type": "Person",
    "name": "David Larpent",
    "url": "https://davidlarpent.com"
  },
  "datePublished": date.toISOString(),
  "dateModified": date.toISOString(), // Update this if you track modifications
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://davidlarpent.com/posts/${slug}`
  },
  "wordCount": wordCount,
  "timeRequired": `PT${readingTime}M`, // ISO 8601 duration format
  "inLanguage": "en-US",
  "isAccessibleForFree": true,
  "articleSection": "Essays",
  // If you add tags/categories:
  // "keywords": post.data.tags?.join(', '),
};
---

<Base title={`${title} | David Larpent`} description={description}>
  <!-- Add JSON-LD script in head -->
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} slot="head" />

  <!-- Rest of template -->
</Base>
```

**Website Schema (for homepage):**

Add to `index.astro`:

```astro
---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "David Larpent",
  "description": "Essays on philosophy, AI, cognitive science, and more.",
  "url": "https://davidlarpent.com",
  "author": {
    "@type": "Person",
    "name": "David Larpent",
    "url": "https://davidlarpent.com/about",
    "jobTitle": "Chief Product Officer",
    "worksFor": {
      "@type": "Organization",
      "name": "Lavanda"
    }
  }
};
---

<Base title="David Larpent">
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} slot="head" />
  <!-- Rest of template -->
</Base>
```

**Person Schema (for about page):**

Add to `about.astro`:

```astro
---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "David Larpent",
  "jobTitle": "Chief Product Officer",
  "worksFor": {
    "@type": "Organization",
    "name": "Lavanda"
  },
  "url": "https://davidlarpent.com",
  "sameAs": [
    "https://www.linkedin.com/in/davidlarpent"
  ],
  "description": "Chief Product Officer at Lavanda. Writes about product strategy, AI, and the intersection of technology with how we actually live and work."
};
---

<Base title="About | David Larpent" description="About David Larpent">
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} slot="head" />
  <!-- Rest of template -->
</Base>
```

---

### 6. ⚠️ MISSING: Author Metadata

**Status:** No author information in metadata

**Impact:**
- AI citations won't attribute content to you properly
- Google won't show author byline in search results
- No author profile linking

**Recommendations:**

**Update content schema:**

```typescript
// src/content/config.ts
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    author: z.string().default('David Larpent'), // ADD THIS
    tags: z.array(z.string()).optional(), // ADD THIS
  }),
});
```

**Add author meta tags to Post.astro:**

```html
<meta name="author" content="David Larpent" />
<link rel="author" href="https://davidlarpent.com/about" />
```

---

### 7. ⚠️ MISSING: OpenGraph Images

**Status:** No og:image tags

**Impact:**
- Social media shares (Twitter, LinkedIn, Slack) show blank previews
- Reduced click-through rate from social
- Unprofessional appearance

**Recommendations:**

**Option 1: Auto-generate OG images (recommended)**

Use a service like Vercel OG or satori to auto-generate OG images from post titles.

**Option 2: Manual OG images**

Create static images:
- Size: 1200x630px
- Format: JPG or PNG
- Location: `/public/og-images/`
- Naming: `/og-images/${slug}.jpg`

**Option 3: Single default OG image**

Create one default image:
- `/public/og-default.jpg`
- Include your name/brand
- Simple, professional design

---

### 8. ✅ GOOD: Semantic HTML

**Status:** Well structured

**Evidence:**
- `<article>` for posts
- `<header>` for post headers
- `<time>` with datetime attribute
- `<h1>` for titles
- `<nav>` for navigation
- Proper heading hierarchy (H1 → H2 → H3)

**No changes needed.**

---

### 9. ✅ GOOD: Clean URLs

**Status:** SEO-friendly URLs

**Evidence:**
- `/posts/ralph-loops/` (clean, descriptive)
- No query parameters
- No file extensions
- Lowercase, hyphenated slugs

**No changes needed.**

---

### 10. ⚠️ MISSING: Additional Meta Tags

**Status:** Basic meta tags only

**Missing tags that help LLMs:**

```html
<!-- Language -->
<html lang="en">

<!-- Copyright/License -->
<meta name="copyright" content="© 2026 David Larpent" />
<meta name="license" content="All rights reserved" /> <!-- Or CC BY if you prefer -->

<!-- Classification -->
<meta name="category" content="Essays" />
<meta name="topic" content="Philosophy, AI, Product Strategy" />

<!-- For posts, add keywords -->
<meta name="keywords" content="AI, product management, philosophy, cognitive science" />
```

---

## Priority Action Items

### 🔴 HIGH PRIORITY (Do First)

1. **Create robots.txt**
   - Impact: High
   - Effort: 5 minutes
   - File: `/public/robots.txt`
   - Status: Currently missing

2. **Add JSON-LD structured data**
   - Impact: High
   - Effort: 1-2 hours
   - Files: `Post.astro`, `index.astro`, `about.astro`
   - Status: Currently missing
   - Enables: Rich snippets, author attribution, better AI understanding

3. **Add OpenGraph images**
   - Impact: High (social sharing)
   - Effort: 2-4 hours (depends on automation)
   - Options: Auto-generate with Vercel OG or create default image
   - Status: Currently missing

### 🟡 MEDIUM PRIORITY (Do Soon)

4. **Enhance Open Graph tags**
   - Impact: Medium
   - Effort: 30 minutes
   - Add: article:published_time, article:author, og:image, og:site_name
   - Status: Partially implemented

5. **Add author metadata**
   - Impact: Medium
   - Effort: 30 minutes
   - Update: content schema, meta tags, RSS feed
   - Status: Missing

6. **Improve RSS feed**
   - Impact: Medium (for RSS readers and aggregators)
   - Effort: 20 minutes
   - Add: author, categories, full content
   - Status: Basic implementation only

### 🟢 LOW PRIORITY (Nice to Have)

7. **Add tags/categories to posts**
   - Impact: Low-Medium
   - Effort: 1-2 hours
   - Update: schema, templates, create tag pages
   - Status: Not implemented

8. **Add breadcrumbs**
   - Impact: Low
   - Effort: 30 minutes
   - Add: Breadcrumb schema + UI
   - Status: Not implemented

9. **Add reading progress indicator**
   - Impact: Low (UX, not SEO)
   - Effort: 1 hour
   - Status: Not implemented

---

## LLM Crawler Specific Recommendations

### For OpenAI (GPTBot)
- ✅ Has sitemap
- ✅ Has RSS
- ❌ Needs robots.txt with explicit Allow
- ❌ Needs JSON-LD for better context

### For Anthropic (Claude-Web)
- ✅ Has sitemap
- ✅ Clean HTML structure
- ❌ Needs robots.txt
- ❌ Needs author attribution

### For Perplexity
- ✅ Has sitemap
- ✅ Has meta descriptions
- ❌ Needs structured data for better citations
- ❌ Needs author metadata

### For Common Crawl (CCBot)
- ✅ Public, crawlable content
- ❌ Needs robots.txt confirmation
- ✅ Has semantic HTML

---

## Testing & Validation

After implementing changes, validate with:

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Test JSON-LD structured data

2. **Google Search Console**
   - Submit sitemap
   - Check index coverage
   - Monitor rich results

3. **Open Graph Debugger**
   - https://developers.facebook.com/tools/debug/
   - Test social media previews

4. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Test Twitter previews

5. **Schema.org Validator**
   - https://validator.schema.org/
   - Validate JSON-LD markup

6. **Lighthouse SEO Audit**
   ```bash
   npm install -g lighthouse
   lighthouse https://davidlarpent.com --only-categories=seo
   ```

---

## Expected Impact

### Before Implementation
- Google: Basic text snippets
- Social: Blank link previews
- LLM citations: Generic "from davidlarpent.com"
- Search visibility: Moderate

### After Implementation
- Google: Rich snippets with author, date, reading time
- Social: Eye-catching previews with images
- LLM citations: "David Larpent, Chief Product Officer at Lavanda, writing in..."
- Search visibility: Significantly improved

---

## Quick Win: 30-Minute SEO Boost

If you only have 30 minutes, do this:

1. **Create robots.txt** (5 min)
2. **Add default OG image** (10 min - use Canva)
3. **Add basic JSON-LD to Post.astro** (15 min)

This will get you 70% of the benefit with 20% of the effort.

---

## Implementation Checklist

- [ ] Create `/public/robots.txt`
- [ ] Add JSON-LD to `Post.astro` (Article schema)
- [ ] Add JSON-LD to `index.astro` (WebSite schema)
- [ ] Add JSON-LD to `about.astro` (Person schema)
- [ ] Create OG images (auto-generate or default)
- [ ] Update Open Graph tags in `Base.astro`
- [ ] Add author field to content schema
- [ ] Update RSS feed with author and content
- [ ] Add meta tags (author, keywords)
- [ ] Test with Google Rich Results
- [ ] Test with OG debugger
- [ ] Submit sitemap to Google Search Console

---

**Next Steps:** Would you like me to implement any of these recommendations? I'd suggest starting with the high-priority items (robots.txt, JSON-LD, OG images) for maximum impact.
