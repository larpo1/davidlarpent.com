# CLAUDE.md - davidlarpent.com

## Project

**Name:** davidlarpent.com
**Stack:** Astro, TypeScript, Vercel
**Goal:** Minimal personal essay site. Content-first, no cruft.

---

## How to Work

1. Read this file first, every time
2. Check the task list below
3. Pick the next incomplete task (top to bottom)
4. Complete it fully before moving on
5. **Before marking task [x] complete:**
   a. Run `npm run build` - must pass
   b. If task involves UI/tests: Run `npm test` - must pass
   c. If task creates new tests: Verify test count increased (check "Expected Test Count")
   d. Check all files listed in "Files:" section exist
   e. Re-read the task description - verify EVERY requirement completed
   f. Only then mark task [x] complete
6. Commit with a clear message: `feat: [what you did]`
7. Push to GitHub: `git push` (keeps commits synchronized)
8. Move to next task

**Post-Completion Audit:**
After marking a task [x], verify:
- Every bullet point in task description was completed
- All files in "Files:" section exist
- Commit message matches task template
- If task mentioned tests: Run `npm test` and verify count
- If ANY item incomplete: Uncheck [x] and complete it

---

## Test Task Template

Use this format for all testing tasks:

```markdown
- [x] **Test: [Feature Name]**
      - **Blocked By:** [Implementation task name] (must be [x])
      - **Test File:** tests/[feature].spec.ts (new or update)
      - **Current Test Count:** [number] passing (run `npm test` to get current count)
      - **Expected Test Count:** [number] passing (+[delta])

      - **Tests to Add:**
        1. [Test scenario 1 description]
        2. [Test scenario 2 description]
        3. [Test scenario 3 description]

      - **Test Code:**
        ```typescript
        test('description', async ({ page }) => {
          // Test implementation
        });
        ```

      - **Verification Checklist:**
        - [ ] File tests/[feature].spec.ts created/updated
        - [ ] Run `npm test` - all tests pass
        - [ ] Test count matches expected (verify with `npm test 2>&1 | grep "passing"`)
        - [ ] All test scenarios from spec implemented

      - **Files:** tests/[feature].spec.ts
      - **Commit:** `test: Add [feature] tests`
```

**When to use this template:**
- After implementing ANY feature that has testable behavior
- When task description includes "Automated test:" section
- When adding UI components or API endpoints

**Key principles:**
- Test tasks are SEPARATE from implementation tasks
- Test tasks have explicit pass/fail criteria (test count)
- Cannot mark [x] complete without all verification items checked

---

## Test Verification Protocol

Before marking ANY test task [x] complete, you MUST:

1. **Run the tests:**
   ```bash
   npm test
   ```

2. **Verify test count matches expected:**
   - Check "Expected Test Count" in task description
   - Compare with actual output (e.g., "90 passing")
   - If mismatch: investigate missing tests

3. **Verify new test file exists:**
   - Check file path specified in task (e.g., `tests/syndication.spec.ts`)
   - Use `ls tests/` or read the file to confirm

4. **Verify all test scenarios covered:**
   - Re-read "Tests to Add" list in task
   - Confirm each scenario has corresponding test code

5. **Only then mark task [x]**

**Observable Success Criteria:**
- ✅ Test count increased by expected delta
- ✅ `npm test` shows all passing (no failures)
- ✅ Test file exists at specified path
- ✅ All scenarios from task description implemented

---

## Current Tasks

### SEO & Discoverability (Priority)

- [x] **Add tagging system with cross-linking**
      - **Status:** Complete (commit 3ba2266)
      - **What was built:**
        - Schema updated with tags field
        - 3 posts tagged (AI, philosophy, learning, cognitive-science, automation, tools, development)
        - Dynamic tag pages at /tags/[tag]/ (7 pages generated)
        - Related posts section based on shared tags
        - Tags displayed on post headers and homepage
        - Internal linking structure for SEO
      - **Files:** src/content/config.ts, src/pages/tags/[tag].astro, src/layouts/Post.astro, src/pages/index.astro, src/styles/global.css
      - **Commit:** 3ba2266

- [x] **Add robots.txt for AI crawler discoverability**
      - **Status:** Complete
      - **What was done:**
        - Created public/robots.txt with AI crawler allowlist
        - Allows GPTBot, Claude-Web, CCBot, PerplexityBot, Applebot, etc.
        - Build verified, deploys to production
      - **Files:** public/robots.txt
      - **Commit:** 7f7c5ba

- [x] **Add JSON-LD structured data to posts**
      - **Status:** Complete
      - **What was done:**
        - Article schema added to Post.astro with all required fields
        - Includes: headline, description, author, publisher, dates, wordCount, timeRequired
        - Keywords populated from post tags
        - inLanguage: "en", articleSection: "Essays"
      - **Files:** src/layouts/Post.astro, src/layouts/Base.astro
      - **Next:** Test with Google Rich Results and Schema.org validator

- [x] **Add JSON-LD structured data to homepage**
      - **Status:** Complete
      - **What was done:**
        - WebSite schema added to index.astro
        - Includes: name, description, url, author (Person), inLanguage
      - **Files:** src/pages/index.astro
      - **Next:** Add Person schema to about page

- [x] **Add JSON-LD Person schema to about page**
      - **Status:** Complete
      - **What was done:**
        - Added Person schema with name, jobTitle, worksFor, sameAs (LinkedIn)
        - Includes description for LLM context
      - **Files:** src/pages/about.astro
      - **Commit:** 83465b5

- [x] **Enhance Open Graph meta tags**
      - **Status:** Complete
      - **What was done:**
        - Base.astro updated with image, type, keywords, articleMeta props
        - og:image support (defaults to /og-default.jpg)
        - og:site_name added
        - article:published_time, article:author, article:tag for posts
        - Twitter card upgraded to "summary_large_image"
        - Twitter image added
      - **Files:** src/layouts/Base.astro, src/layouts/Post.astro
      - **Next:** Create actual og-default.jpg image

- [x] **Improve RSS feed with author and full content**
      - **Status:** Complete
      - **What was done:**
        - ✅ Author field added
        - ✅ Categories from tags
        - ✅ managingEditor and webMaster in customData
        - ✅ Full post content rendered via `content:encoded` field
        - Uses marked to render markdown to HTML
      - **Files:** src/pages/rss.xml.ts
      - **Commit:** See below

- [ ] **Create default OpenGraph image**
      - **What:** Create a 1200x630px image for social media previews
      - **Options:**
        1. Use Canva/Figma to create simple branded image (10 min)
        2. Use https://og-playground.vercel.app/ to auto-generate
        3. Commission a designer (if you want professional look)
      - **Design suggestion:**
        - Dark background (match site aesthetic)
        - "David Larpent" in Newsreader font
        - "Essays on AI, Philosophy, Product" subtitle
        - Simple, minimal, professional
      - **File:** public/og-default.jpg (1200x630px)
      - **Commit:** `feat: Add default OpenGraph image for social sharing`

- [x] **Add meta tags for author and keywords**
      - **Status:** Complete
      - **What was done:**
        - Author meta tag added to all pages
        - rel="author" link to /about added
        - lang="en" on <html> tag
        - Keywords meta tag on posts (from tags)
      - **Files:** src/layouts/Base.astro
      - **Commit included in:** Enhanced OG tags commit

---

### Development Experience

- [x] **Show draft posts in development mode**
      - **Status:** Complete
      - **What was done:**
        - Updated getStaticPaths to include drafts in dev mode
        - Production build still filters out drafts
        - Related posts respect same visibility rules
      - **Files:** src/pages/posts/[...slug].astro
      - **Commit:** See below

- [ ] **Add "Show drafts" toggle to homepage in dev mode**
      - **What:** Toggle control on homepage to show/hide draft posts in the main list
      - **Why:** Better dev workflow - see how drafts appear in main list without visiting /drafts
      - **Current behavior:**
        - Homepage only shows published posts (even in dev mode)
        - Must visit /drafts page to see draft posts
        - Can't see how drafts will look in the main list
      - **Desired behavior:**
        - Dev mode: Show drafts in main list by default (or via toggle)
        - Drafts clearly marked with badge/indicator
        - Toggle button to show/hide drafts
        - Production: unchanged (only published posts)
      - **Implementation:**
        ```astro
        ---
        // src/pages/index.astro
        const allPosts = await getCollection('posts');

        // In dev: include all posts. In prod: only published.
        const posts = import.meta.env.DEV
          ? allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
          : allPosts
              .filter(post => !post.data.draft)
              .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
        ---

        <Base title="David Larpent">
          <script slot="head" type="application/ld+json" set:html={JSON.stringify(websiteSchema)} />

          {import.meta.env.DEV && (
            <div class="dev-controls">
              <label>
                <input type="checkbox" id="show-drafts" checked />
                Show drafts
              </label>
            </div>
          )}

          <ul class="post-list">
            {posts.map(post => {
              const formattedDate = post.data.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <li class="post-list-item" data-draft={post.data.draft}>
                  <h2 class="post-list-title">
                    <a href={`/posts/${post.slug}`}>{post.data.title}</a>
                  </h2>
                  <div class="post-meta">
                    {formattedDate}
                    {post.data.draft && <span class="draft-badge">Draft</span>}
                  </div>
                  {/* ... rest of template */}
                </li>
              );
            })}
          </ul>
        </Base>

        {import.meta.env.DEV && (
          <script>
            const checkbox = document.getElementById('show-drafts');
            const postList = document.querySelector('.post-list');

            checkbox?.addEventListener('change', (e) => {
              const showDrafts = (e.target as HTMLInputElement).checked;
              const draftPosts = postList?.querySelectorAll('[data-draft="true"]');

              draftPosts?.forEach(post => {
                (post as HTMLElement).style.display = showDrafts ? '' : 'none';
              });
            });
          </script>
        )}
        ```
      - **Styling for draft badge:**
        ```css
        .draft-badge {
          display: inline-block;
          margin-left: 0.5rem;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          color: var(--color-text);
          background: var(--color-code-bg);
          border: 1px solid var(--color-border);
          border-radius: 0.25rem;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .dev-controls {
          margin-bottom: 2rem;
          padding: 1rem;
          background: var(--color-code-bg);
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
        }

        .dev-controls label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
        }
        ```
      - **Alternative:** Use localStorage to persist toggle state across page loads
      - **Test:**
        1. Run npm run dev
        2. Visit homepage - should see drafts mixed with published posts
        3. Drafts should have "Draft" badge
        4. Toggle "Show drafts" - drafts should hide/show
        5. Run npm run build - drafts should not appear in production
      - **Files:** src/pages/index.astro, src/styles/global.css
      - **Commit:** `feat: Add "Show drafts" toggle to homepage in dev mode`

---

### Bug Fixes

- [x] **Fix tag page 404s - case sensitivity issue**
      - **Status:** Complete
      - **What was done:**
        - Normalized all tags to lowercase in tag page generation
        - Updated related posts matching to use case-insensitive comparison
        - Tag pages now generated at /tags/ai/, /tags/philosophy/, etc.
      - **Files:** src/pages/tags/[tag].astro, src/pages/posts/[...slug].astro
      - **Commit:** See below

- [x] **Fix EditToolbar not appearing on ANY posts**
      - **Status:** Complete
      - **What was done:**
        - Added `is:inline` to toolbar script for direct browser execution
        - Removed TypeScript annotations (not compatible with inline scripts)
        - Toolbar now properly shows when selecting text in dev mode
      - **Files:** src/components/EditToolbar.astro
      - **Commit:** See below

---

### Design Polish

- [ ] **Move tags beneath TOC in TOC panel**
      - **What:** Relocate post tags from post header into the TOC sidebar
      - **Why:** Cleaner post header, tags logically grouped with navigation
      - **Current location:** Tags appear in post header after meta (date, reading time)
      - **New location:** Inside TOC panel, below the heading list
      - **Implementation:**
        - Remove tags from Post.astro header section
        - Add tags to TableOfContents.astro component
        - Pass tags as prop to TableOfContents component
        - Style tags to fit TOC aesthetic
      - **Changes needed:**
        1. **Post.astro** - remove tags from header:
           ```astro
           <header class="post-header">
             <h1>{title}</h1>
             <p class="post-description">{description}</p>
             <div class="post-meta">
               <time>{formattedDate}</time>
               <span> · {readingTime} min read</span>
               {draft && <span class="draft-badge">Draft</span>}
             </div>
             {/* REMOVE tags from here */}
           </header>
           ```
        2. **Post.astro** - pass tags to TOC:
           ```astro
           <TableOfContents headings={headings} tags={tags} />
           ```
        3. **TableOfContents.astro** - accept tags prop and display:
           ```astro
           interface Props {
             headings: Array<{...}>;
             tags?: string[];
           }
           const { headings, tags = [] } = Astro.props;

           {/* After headings list */}
           {tags.length > 0 && (
             <div class="toc-tags">
               <h3 class="toc-tags-title">Topics</h3>
               <div class="toc-tags-list">
                 {tags.map(tag => (
                   <a href={`/tags/${tag.toLowerCase()}`} class="toc-tag-link">
                     #{tag}
                   </a>
                 ))}
               </div>
             </div>
           )}
           ```
        4. **Styling:**
           ```css
           .toc-tags {
             margin-top: 2rem;
             padding-top: 1.5rem;
             border-top: 1px solid var(--color-border);
           }

           .toc-tags-title {
             font-size: 0.75rem;
             text-transform: uppercase;
             letter-spacing: 0.05em;
             color: var(--color-text-muted);
             margin-bottom: 0.75rem;
           }

           .toc-tags-list {
             display: flex;
             flex-direction: column;
             gap: 0.5rem;
           }

           .toc-tag-link {
             font-size: 0.85rem;
             color: var(--color-text-muted);
             text-decoration: none;
             font-style: italic;
             transition: color 0.3s ease;
           }

           .toc-tag-link:hover {
             color: var(--color-link);
           }
           ```
      - **Files:**
        - src/layouts/Post.astro (remove tags, pass to TOC)
        - src/components/TableOfContents.astro (add tags section)
        - src/styles/global.css (add .toc-tags styles)
      - **Test:**
        - Tags removed from post header
        - Tags appear in TOC panel below headings
        - Tags styled consistently with TOC
        - Clicking tag goes to tag page
        - Works on mobile (TOC overlay)
      - **Commit:** `refactor: Move tags to TOC sidebar`

- [x] **Only underline links in post body content**
      - **Status:** Complete
      - **What was done:**
        - Base links have no underline by default
        - `.post-content a` links have underline for readability
        - All other links (nav, titles, tags, TOC, etc.) remain without underline
        - Smooth color transitions on hover (0.3s ease)
      - **Files:** src/styles/global.css
      - **Commit:** See below

- [x] **Reduce prominence of tag styling**
      - **Status:** Complete
      - **What was done:**
        - Tags now text-only (no background, no border)
        - Font: Newsreader (matches body) with italic style
        - Smaller font size (0.7rem)
        - Subtle hover: color change to link color
        - Also updated .shared-tag in related posts to match
      - **Files:** src/styles/global.css
      - **Commit:** See below

---

### Syndication Tests - MISSING (Created as Separate Tasks)

**Context:** The syndication features (LinkedIn/Substack buttons) were implemented but tests were skipped.
These test tasks must now be completed to achieve full test coverage.

- [x] **Test: LinkedIn copy button**
      - **Blocked By:** "Add Copy for LinkedIn button" (already [x])
      - **Test File:** tests/syndication.spec.ts (new)
      - **Current Test Count:** 88 passing
      - **Expected Test Count:** 90 passing (+2)

      - **Tests to Add:**
        1. LinkedIn button exists and is visible in dev mode
        2. Clicking button copies correct LinkedIn format to clipboard

      - **Test Code:**
        ```typescript
        import { test, expect } from '@playwright/test';

        test.describe('LinkedIn Syndication', () => {
          test('LinkedIn copy button exists in dev mode', async ({ page }) => {
            await page.goto('/posts/ralph-loops/');

            const linkedinButton = page.locator('.linkedin-copy-button');
            await expect(linkedinButton).toBeVisible();
            await expect(linkedinButton).toHaveAttribute('title', 'Copy for LinkedIn');
          });

          test('LinkedIn copy generates correct format', async ({ page, context }) => {
            // Grant clipboard permissions
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);

            await page.goto('/posts/ralph-loops/');

            // Click LinkedIn copy button
            const linkedinButton = page.locator('.linkedin-copy-button');
            await linkedinButton.click();

            // Verify status message
            const status = page.locator('.save-status');
            await expect(status).toHaveText('Copied for LinkedIn!');

            // Read clipboard content
            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

            // Verify format
            expect(clipboardText).toContain('Ralph loops');
            expect(clipboardText).toContain('Read the full essay: https://davidlarpent.com/posts/ralph-loops');
            expect(clipboardText).toMatch(/#\w+/); // Has at least one hashtag

            // Verify it's an excerpt, not full content
            expect(clipboardText.length).toBeLessThan(1500);
            expect(clipboardText.length).toBeGreaterThan(300);
          });
        });
        ```

      - **Verification Checklist:**
        - [ ] File tests/syndication.spec.ts created
        - [ ] Run `npm test` shows "90 passing"
        - [ ] Both test scenarios pass
        - [ ] LinkedIn button functionality verified

      - **Files:** tests/syndication.spec.ts (new)
      - **Commit:** `test: Add LinkedIn copy button tests`

- [x] **Test: Substack copy button and API**
      - **Blocked By:** "Test: LinkedIn copy button" (must complete first to maintain test count)
      - **Test File:** tests/syndication.spec.ts (update)
      - **Current Test Count:** 90 passing (after LinkedIn tests)
      - **Expected Test Count:** 94 passing (+4)

      - **Tests to Add:**
        1. Substack button exists and is visible in dev mode
        2. Clicking button copies full markdown with footer to clipboard
        3. get-post-markdown API returns markdown content
        4. get-post-markdown API requires slug parameter

      - **Test Code:**
        ```typescript
        test.describe('Substack Syndication', () => {
          test('Substack copy button exists in dev mode', async ({ page }) => {
            await page.goto('/posts/ralph-loops/');

            const substackButton = page.locator('.substack-copy-button');
            await expect(substackButton).toBeVisible();
            await expect(substackButton).toHaveAttribute('title', 'Copy for Substack');
          });

          test('Substack copy generates full markdown with footer', async ({ page, context }) => {
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);
            await page.goto('/posts/ralph-loops/');

            const substackButton = page.locator('.substack-copy-button');
            await substackButton.click();

            const status = page.locator('.save-status');
            await expect(status).toHaveText('Copied for Substack!');

            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

            // Verify footer
            expect(clipboardText).toContain('---');
            expect(clipboardText).toContain('Originally published at davidlarpent.com');

            // Verify it's markdown (has markdown syntax)
            expect(clipboardText).toMatch(/^##\s+/m); // Has markdown headings

            // Verify footnotes are intact (ralph-loops has footnotes)
            expect(clipboardText).toContain('[^1]');
            expect(clipboardText).toMatch(/\[\^1\]:/); // Footnote definition

            // Verify it's full content, not excerpt
            expect(clipboardText.length).toBeGreaterThan(2000);
          });

          test('get-post-markdown API returns markdown', async ({ request }) => {
            const response = await request.get('/api/get-post-markdown?slug=ralph-loops');
            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.markdown).toBeTruthy();
            expect(data.frontmatter).toBeTruthy();
            expect(data.markdown).toContain('[^1]'); // Has footnotes
            expect(data.markdown).toMatch(/^##\s+/m); // Has markdown headings
          });

          test('get-post-markdown API requires slug', async ({ request }) => {
            const response = await request.get('/api/get-post-markdown');
            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('Slug required');
          });
        });
        ```

      - **Verification Checklist:**
        - [ ] File tests/syndication.spec.ts updated
        - [ ] Run `npm test` shows "94 passing"
        - [ ] All 4 test scenarios pass
        - [ ] Substack button and API functionality verified

      - **Files:** tests/syndication.spec.ts (update)
      - **Commit:** `test: Add Substack copy button and API tests`

- [x] **Test: Syndication button styling**
      - **Blocked By:** "Test: Substack copy button and API" (must complete first)
      - **Test File:** tests/syndication.spec.ts (update)
      - **Current Test Count:** 94 passing (after Substack tests)
      - **Expected Test Count:** 95 passing (+1)

      - **Tests to Add:**
        1. Buttons are visible, properly sized, and in edit-controls container

      - **Test Code:**
        ```typescript
        test.describe('Syndication Button Styling', () => {
          test('buttons are visible and properly styled', async ({ page }) => {
            await page.goto('/posts/ralph-loops/');

            const linkedinButton = page.locator('.linkedin-copy-button');
            const substackButton = page.locator('.substack-copy-button');

            // Check visibility
            await expect(linkedinButton).toBeVisible();
            await expect(substackButton).toBeVisible();

            // Check size (should match other edit control buttons)
            const linkedinBox = await linkedinButton.boundingBox();
            expect(linkedinBox?.width).toBeGreaterThanOrEqual(35); // ~2.5rem = 40px
            expect(linkedinBox?.height).toBeGreaterThanOrEqual(35);

            // Check they're in the edit-controls container
            const editControls = page.locator('.edit-controls');
            await expect(editControls).toContainText(''); // Container exists

            // Verify buttons are siblings of save/settings buttons
            const saveButton = page.locator('.save-button');
            await expect(saveButton).toBeVisible();
          });
        });
        ```

      - **Verification Checklist:**
        - [ ] File tests/syndication.spec.ts updated
        - [ ] Run `npm test` shows "95 passing"
        - [ ] Styling test passes
        - [ ] All syndication tests complete

      - **Files:** tests/syndication.spec.ts (update)
      - **Commit:** `test: Add syndication button styling tests`

---

### Previously Completed Tasks (Implementation Only - Tests Missing)

**NOTE:** The tasks below were marked complete but tests were not created.
The test tasks above address this gap.

- [x] **Add "Copy for LinkedIn" button** (Implementation Only)
      - **What:** Add button to dev edit controls that copies LinkedIn-formatted excerpt to clipboard
      - **Location:** Add to `.edit-controls` in `src/layouts/Post.astro` (next to Save/Settings buttons)
      - **Format to generate:**
        - Title (as first line)
        - Blank line
        - First 2-3 paragraphs (aim for ~400-500 words max)
        - Blank line
        - "Read the full essay: https://davidlarpent.com/posts/{slug}"
        - Blank line
        - Optional hashtags (e.g., "#AI #ProductThinking")
      - **Implementation:**
        ```astro
        <button class="linkedin-copy-button" title="Copy for LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </button>
        ```
      - **Script logic:**
        ```typescript
        const linkedinButton = document.querySelector('.linkedin-copy-button');

        linkedinButton?.addEventListener('click', async () => {
          const slug = article?.dataset.postSlug;
          const titleEl = document.querySelector('[data-field="title"]') as HTMLElement;
          const contentEl = document.querySelector('[data-field="content"]') as HTMLElement;

          const title = titleEl?.textContent?.trim() || '';

          // Get first few paragraphs from content
          const paragraphs = Array.from(contentEl?.querySelectorAll('p') || [])
            .slice(0, 3)
            .map(p => p.textContent?.trim())
            .filter(Boolean);

          const excerpt = paragraphs.join('\n\n');

          // Build LinkedIn post
          const linkedinPost = `${title}

${excerpt}

Read the full essay: https://davidlarpent.com/posts/${slug}

#AI #ProductThinking`;

          // Copy to clipboard
          await navigator.clipboard.writeText(linkedinPost);

          // Show feedback
          showStatus('Copied for LinkedIn!');
          setTimeout(() => showStatus(''), 2000);
        });
        ```
      - **Styling:** Match existing button styles (`.save-button`, `.settings-button`)
      - **Manual test:**
        1. Visit post in dev mode
        2. Click LinkedIn button
        3. Should see "Copied for LinkedIn!" status
        4. Paste into text editor - verify format is correct (title + excerpt + link + hashtags)
        5. Check character count is reasonable (~600-800 chars)
      - **Automated test:** Create `tests/syndication.spec.ts`
        ```typescript
        import { test, expect } from '@playwright/test';

        test.describe('LinkedIn Syndication', () => {
          test('LinkedIn copy button exists in dev mode', async ({ page }) => {
            await page.goto('/posts/ralph-loops/');

            const linkedinButton = page.locator('.linkedin-copy-button');
            await expect(linkedinButton).toBeVisible();
            await expect(linkedinButton).toHaveAttribute('title', 'Copy for LinkedIn');
          });

          test('LinkedIn copy generates correct format', async ({ page, context }) => {
            // Grant clipboard permissions
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);

            await page.goto('/posts/ralph-loops/');

            // Click LinkedIn copy button
            const linkedinButton = page.locator('.linkedin-copy-button');
            await linkedinButton.click();

            // Verify status message
            const status = page.locator('.save-status');
            await expect(status).toHaveText('Copied for LinkedIn!');

            // Read clipboard content
            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

            // Verify format
            expect(clipboardText).toContain('Ralph loops');
            expect(clipboardText).toContain('Read the full essay: https://davidlarpent.com/posts/ralph-loops');
            expect(clipboardText).toMatch(/#\w+/); // Has at least one hashtag

            // Verify it's an excerpt, not full content
            expect(clipboardText.length).toBeLessThan(1500);
            expect(clipboardText.length).toBeGreaterThan(300);
          });
        });
        ```
      - **Files:** `src/layouts/Post.astro`, `src/styles/global.css`, `tests/syndication.spec.ts` (new)
      - Commit: `feat: Add Copy for LinkedIn button with tests`

- [x] **Add "Copy for Substack" button**
      - **What:** Add button to dev edit controls that copies full markdown to clipboard
      - **Location:** Add to `.edit-controls` in `src/layouts/Post.astro` (next to LinkedIn button)
      - **Format to generate:**
        - Full markdown content (read from .md file, not DOM HTML)
        - Preserve all formatting, footnotes, code blocks
        - Add footer: `---\nOriginally published at davidlarpent.com`
      - **Implementation:**
        ```astro
        <button class="substack-copy-button" title="Copy for Substack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
          </svg>
        </button>
        ```
      - **Script logic:**
        ```typescript
        const substackButton = document.querySelector('.substack-copy-button');

        substackButton?.addEventListener('click', async () => {
          const slug = article?.dataset.postSlug;

          // Fetch the raw markdown from the file via API
          const response = await fetch(`/api/get-post-markdown?slug=${slug}`);
          const data = await response.json();

          if (!data.success) {
            showStatus('Error: Could not fetch markdown', true);
            return;
          }

          // Add canonical footer
          const substackContent = `${data.markdown}

---
Originally published at davidlarpent.com`;

          // Copy to clipboard
          await navigator.clipboard.writeText(substackContent);

          // Show feedback
          showStatus('Copied for Substack!');
          setTimeout(() => showStatus(''), 2000);
        });
        ```
      - **New API endpoint needed:** `src/pages/api/get-post-markdown.ts`
        ```typescript
        import type { APIRoute } from 'astro';
        import * as fs from 'fs/promises';
        import * as path from 'path';
        import matter from 'gray-matter';

        export const prerender = false;

        export const GET: APIRoute = async ({ url }) => {
          if (!import.meta.env.DEV) {
            return new Response(
              JSON.stringify({ success: false, message: 'API only available in development mode' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          const slug = url.searchParams.get('slug');

          if (!slug) {
            return new Response(
              JSON.stringify({ success: false, message: 'Slug required' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          try {
            const filePath = path.join(process.cwd(), 'src', 'content', 'posts', `${slug}.md`);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const parsed = matter(fileContent);

            return new Response(
              JSON.stringify({
                success: true,
                markdown: parsed.content,
                frontmatter: parsed.data
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          } catch (error) {
            return new Response(
              JSON.stringify({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        };
        ```
      - **Manual test:**
        1. Visit post in dev mode
        2. Click Substack button
        3. Should see "Copied for Substack!" status
        4. Paste into text editor - verify it's full markdown with footer
        5. Check footnotes are intact (test with ralph-loops post)
        6. Paste into Substack editor - should render correctly
      - **Automated test:** Add to `tests/syndication.spec.ts`
        ```typescript
        test.describe('Substack Syndication', () => {
          test('Substack copy button exists in dev mode', async ({ page }) => {
            await page.goto('/posts/ralph-loops/');

            const substackButton = page.locator('.substack-copy-button');
            await expect(substackButton).toBeVisible();
            await expect(substackButton).toHaveAttribute('title', 'Copy for Substack');
          });

          test('Substack copy generates full markdown with footer', async ({ page, context }) => {
            // Grant clipboard permissions
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);

            await page.goto('/posts/ralph-loops/');

            // Click Substack copy button
            const substackButton = page.locator('.substack-copy-button');
            await substackButton.click();

            // Verify status message
            const status = page.locator('.save-status');
            await expect(status).toHaveText('Copied for Substack!');

            // Read clipboard content
            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

            // Verify footer
            expect(clipboardText).toContain('---');
            expect(clipboardText).toContain('Originally published at davidlarpent.com');

            // Verify it's markdown (has markdown syntax)
            expect(clipboardText).toMatch(/^##\s+/m); // Has markdown headings

            // Verify footnotes are intact (ralph-loops has footnotes)
            expect(clipboardText).toContain('[^1]');
            expect(clipboardText).toMatch(/\[\^1\]:/); // Footnote definition

            // Verify it's full content, not excerpt
            expect(clipboardText.length).toBeGreaterThan(2000);
          });

          test('get-post-markdown API returns markdown', async ({ request }) => {
            const response = await request.get('/api/get-post-markdown?slug=ralph-loops');
            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.markdown).toBeTruthy();
            expect(data.frontmatter).toBeTruthy();
            expect(data.markdown).toContain('[^1]'); // Has footnotes
            expect(data.markdown).toMatch(/^##\s+/m); // Has markdown headings
          });

          test('get-post-markdown API requires slug', async ({ request }) => {
            const response = await request.get('/api/get-post-markdown');
            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('Slug required');
          });
        });
        ```
      - **Files:**
        - `src/layouts/Post.astro`
        - `src/pages/api/get-post-markdown.ts` (new)
        - `src/styles/global.css` (if new styles needed)
        - `tests/syndication.spec.ts` (update)
      - Commit: `feat: Add Copy for Substack button with tests`

- [x] **Style syndication buttons**
      - **What:** Make LinkedIn and Substack buttons look good, consistent with other edit controls
      - **Design:**
        - Same size as Save/Settings buttons
        - Use brand colors (LinkedIn blue #0077b5, Substack orange-red #FF6719) on hover
        - Keep monochrome default to match site aesthetic
        - Place in edit-controls bar
      - **Suggested layout in `.edit-controls`:**
        ```
        [Save Status]  [🔗] [📰]  [⚙️] [💾]
        (LinkedIn, Substack, Settings, Save)
        ```
      - **CSS:**
        ```css
        .linkedin-copy-button,
        .substack-copy-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          padding: 0.5rem;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.2s;
          background: var(--color-code-bg);
          color: var(--color-text);
        }

        .linkedin-copy-button:hover {
          background: #0077b5;
          color: white;
          transform: scale(1.05);
        }

        .substack-copy-button:hover {
          background: #FF6719;
          color: white;
          transform: scale(1.05);
        }
        ```
      - **Manual test:** Visual check - buttons should look clean and professional
      - **Automated test:** Add to `tests/syndication.spec.ts`
        ```typescript
        test.describe('Syndication Button Styling', () => {
          test('buttons are visible and properly styled', async ({ page }) => {
            await page.goto('/posts/ralph-loops/');

            const linkedinButton = page.locator('.linkedin-copy-button');
            const substackButton = page.locator('.substack-copy-button');

            // Check visibility
            await expect(linkedinButton).toBeVisible();
            await expect(substackButton).toBeVisible();

            // Check size (should match other edit control buttons)
            const linkedinBox = await linkedinButton.boundingBox();
            expect(linkedinBox?.width).toBeGreaterThanOrEqual(35); // ~2.5rem = 40px
            expect(linkedinBox?.height).toBeGreaterThanOrEqual(35);

            // Check they're in the edit-controls container
            const editControls = page.locator('.edit-controls');
            await expect(editControls).toContainText(''); // Container exists

            // Verify buttons are siblings of save/settings buttons
            const saveButton = page.locator('.save-button');
            await expect(saveButton).toBeVisible();
          });
        });
        ```
      - **Files:** `src/styles/global.css`, `tests/syndication.spec.ts` (update)
      - Commit: `style: Add styling for syndication buttons with tests`

- [x] **Fix EditToolbar to work on About page**
      - **Problem:** Toolbar doesn't appear when selecting text on About page
      - **Root cause:** EditToolbar is hard-coded to look for `[data-field="content"]` (line 18)
        - About page uses `data-field="about"`
        - Script can't find the element, returns early
      - **Fix:** Make toolbar work with any contenteditable element
      - **File:** `src/components/EditToolbar.astro`
      - **Change on line 18:**
        ```javascript
        // OLD:
        const contentEditable = document.querySelector('[data-field="content"]');

        // NEW:
        const contentEditable = document.querySelector('[contenteditable="true"][data-field]');
        ```
      - This will match any contenteditable element with a data-field attribute (content, about, etc.)
      - **Also update line 70:**
        ```javascript
        // OLD:
        const contentEditable = document.querySelector('[data-field="content"]');

        // NEW:
        const contentEditable = document.querySelector('[contenteditable="true"][data-field]');
        ```
      - **Test:**
        1. Visit `/about` in dev mode
        2. Select text in About content
        3. Toolbar should appear in left margin
        4. Format buttons should work
        5. Visit `/posts/ralph-loops/`
        6. Select text in post content
        7. Toolbar should still work (regression test)
      - Commit: `fix: Make EditToolbar work with any contenteditable field`

- [x] **Make About page inline editable**
      - **What:** Make About page content editable in dev mode, just like essay content
      - **Current state:** About page content is hard-coded in `about.astro`
      - **Goal:** Store About content in a markdown file, make it editable in dev mode with toolbar + save

      **Step 1: Create About content file**
      - Create: `src/content/about.md`
        ```markdown
        I'm David Larpent, Chief Product Officer at Lavanda, a property technology company.

        I write about product strategy, AI, and the intersection of technology with how we actually live and work. Sometimes I paint. Occasionally I make music, badly.

        Find me on [LinkedIn](https://www.linkedin.com/in/davidlarpent) or don't. I'm not precious about it.
        ```

      **Step 2: Update About page to read from file**
      - Update `src/pages/about.astro`:
        ```astro
        ---
        import Base from '../layouts/Base.astro';
        import EditToolbar from '../components/EditToolbar.astro';
        import fs from 'fs/promises';
        import { marked } from 'marked';

        const isDev = import.meta.env.DEV;

        // Read About content from file
        const aboutPath = 'src/content/about.md';
        const aboutMarkdown = await fs.readFile(aboutPath, 'utf-8');
        const aboutHtml = marked.parse(aboutMarkdown);
        ---

        <Base title="About | David Larpent" description="About David Larpent">
          <article>
            <h1>About</h1>
            <div
              class="about-content"
              contenteditable={isDev}
              data-field="about"
            >
              <Fragment set:html={aboutHtml} />
            </div>
          </article>

          {isDev && (
            <>
              <EditToolbar />
              <div class="edit-controls">
                <span class="save-status"></span>
                <button class="save-button" title="Save changes (Ctrl/Cmd+S)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </Base>

        {isDev && (
          <script>
            const saveButton = document.querySelector('.save-button') as HTMLButtonElement;
            const saveStatus = document.querySelector('.save-status') as HTMLElement;
            const aboutContent = document.querySelector('[data-field="about"]') as HTMLElement;

            function showStatus(message: string, isError = false) {
              if (!saveStatus) return;
              saveStatus.textContent = message;
              saveStatus.classList.toggle('error', isError);
              saveStatus.classList.toggle('success', !isError && message !== '');
            }

            async function saveAbout() {
              const content = aboutContent?.innerHTML || '';

              if (!content.trim()) {
                showStatus('Error: Content required', true);
                return;
              }

              showStatus('Saving...');

              try {
                const response = await fetch('/api/save-about', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ content })
                });

                const result = await response.json();

                if (result.success) {
                  showStatus('Saved!');
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                } else {
                  showStatus(`Error: ${result.message}`, true);
                }
              } catch (error) {
                showStatus(`Error: ${error}`, true);
              }
            }

            saveButton?.addEventListener('click', saveAbout);

            document.addEventListener('keydown', (e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveAbout();
              }
            });
          </script>
        )}
        ```

      **Step 3: Create save API endpoint**
      - Create: `src/pages/api/save-about.ts`
        ```typescript
        import type { APIRoute } from 'astro';
        import * as fs from 'fs/promises';
        import TurndownService from 'turndown';
        import { gfm } from 'turndown-plugin-gfm';

        export const prerender = false;

        const turndown = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
        });
        turndown.use(gfm);

        export const POST: APIRoute = async ({ request }) => {
          if (!import.meta.env.DEV) {
            return new Response(
              JSON.stringify({ success: false, message: 'API only available in development mode' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          try {
            const body = await request.json();
            const { content } = body;

            if (!content || !content.trim()) {
              return new Response(
                JSON.stringify({ success: false, message: 'Content required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
              );
            }

            // Convert HTML to Markdown
            const markdown = turndown.turndown(content);

            // Write to file
            const filePath = 'src/content/about.md';
            await fs.writeFile(filePath, markdown, 'utf-8');

            return new Response(
              JSON.stringify({ success: true, message: 'About page saved successfully' }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          } catch (error) {
            console.error('Error saving about page:', error);
            return new Response(
              JSON.stringify({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        };
        ```

      **Step 4: Install marked (if not already installed)**
      - Check if `marked` package is installed: `npm list marked`
      - If not: `npm install marked`

      **Files:**
      - Create: `src/content/about.md`
      - Create: `src/pages/api/save-about.ts`
      - Modify: `src/pages/about.astro`
      - Maybe install: `marked` package

      **Test:**
      1. Visit `/about` in dev mode
      2. Content should be editable
      3. Select text - toolbar appears
      4. Make bold/italic/link edits
      5. Click save (or Ctrl+S)
      6. Page reloads with changes
      7. Check `src/content/about.md` - should have markdown
      8. Production: content not editable, renders normally

      - Commit: `feat: Make About page inline editable`

- [x] **Add Google Analytics to all pages**
      - **What:** Add Google Analytics tracking snippet to site-wide layout
      - **Snippet:**
        ```html
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-M2Q4Q201KD"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-M2Q4Q201KD');
        </script>
        ```
      - **Where to add:** `src/layouts/Base.astro` in the `<head>` section
      - **Implementation:**
        - Open `src/layouts/Base.astro`
        - Add snippet at the end of `<head>`, before `</head>`
        - Should appear on all pages (index, about, posts, drafts)
      - **Optional improvement:** Only load in production (not dev)
        ```astro
        {!import.meta.env.DEV && (
          <>
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-M2Q4Q201KD"></script>
            <script is:inline>
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-M2Q4Q201KD');
            </script>
          </>
        )}
        ```
      - **Files:** `src/layouts/Base.astro`
      - **Test:**
        - Run `npm run build`
        - Deploy to production
        - Visit site, check browser console/network tab for gtag.js request
        - Verify Google Analytics dashboard receives pageviews
      - Commit: `feat: Add Google Analytics tracking`

- [x] **Convert corrupted post file from HTML to markdown**
      - **Problem:** `what-we-lose-when-we-stop-struggling.md` was corrupted by saves before API fix
      - **Issue:** File contains HTML instead of markdown, causing TOC to not render
      - **User wants:** Keep edits (title change, etc), just convert HTML to markdown
      - **Solution:** Read file, convert HTML content to markdown, write back
      - **Script to create:** `scripts/fix-html-post.js`
        ```javascript
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
        ```
      - **Run:**
        ```bash
        node scripts/fix-html-post.js
        git add src/content/posts/what-we-lose-when-we-stop-struggling.md
        git commit -m "fix: Convert corrupted post from HTML to markdown"
        git push
        ```
      - **Verify:**
        - Visit `/posts/what-we-lose-when-we-stop-struggling/` in dev mode
        - TOC should now be visible with proper headings
        - File should have markdown headings (## Heading) not HTML (<h2>)
        - Title should still be "The Unbearable Lightness of Prompting" (user's edit preserved)
      - Commit: `fix: Convert corrupted post from HTML to markdown`

- [x] **CRITICAL: Fix save API - TOC disappears after save**
      - **Problem:** After saving changes, TOC disappears because headings are corrupted
      - **Root cause:** API comment says "Content is already markdown from Tiptap" (line 86) but we removed Tiptap
        - contenteditable sends HTML: `<h2>My Heading</h2>`
        - API saves HTML directly as if it were markdown
        - On reload, Astro can't parse HTML-in-markdown correctly
        - Headings aren't extracted → TOC is empty
      - **Fix:** Re-enable HTML→Markdown conversion using turndown
      - **Files:** `src/pages/api/save-post.ts`
      - **Change:**
        ```typescript
        // Update content if provided (convert HTML to Markdown using turndown)
        let newContent = parsed.content;
        if (content !== undefined && content !== null) {
          // Convert HTML content to Markdown using turndown
          let convertedContent = turndown.turndown(content);

          // Footnote preservation logic (keep existing code)
          const footnoteRefRegex = /\[\^(\d+)\]/g;
          const footnoteDefsRegex = /\[\^(\d+)\]:[^\n]*(?:\n(?!\[\^|\n)[^\n]*)*/g;

          const originalFootnoteRefs = [...parsed.content.matchAll(footnoteRefRegex)];
          const originalFootnoteDefs = [...parsed.content.matchAll(footnoteDefsRegex)];

          if (originalFootnoteRefs.length > 0 && !convertedContent.includes('[^')) {
            const footnoteSection = originalFootnoteDefs.map(match => match[0]).join('\n\n');
            convertedContent = convertedContent + '\n\n' + footnoteSection;
          }

          newContent = convertedContent;
        }
        ```
      - **Test:**
        1. Edit a heading in ralph-loops post
        2. Save
        3. Page reloads
        4. TOC should still be visible with correct headings
        5. Check .md file - headings should be `## Heading` not `<h2>Heading</h2>`
      - Commit: `fix: Re-enable HTML→Markdown conversion in save API`

- [x] **Add slug field to settings modal**
      - **Problem:** User changed title, but slug (URL) didn't change
      - **Expected behavior:** Slug should NOT auto-change (would break links)
      - **Solution:** Add slug field to settings modal so users can manually change it
      - **Files:** `src/components/EditSettingsModal.astro`
      - **Implementation:**
        - Add slug input field:
          ```astro
          <div class="form-group">
            <label for="post-slug">URL Slug</label>
            <input
              type="text"
              id="post-slug"
              name="slug"
              value={slug}
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <small>Warning: Changing slug will break existing links</small>
          </div>
          ```
        - Update API to handle slug changes:
          - Rename file from `{oldSlug}.md` to `{newSlug}.md`
          - Validate new slug (lowercase, no spaces, no special chars)
          - Check if new slug already exists (conflict)
        - Update hidden input: remove `<input type="hidden" name="slug" value={slug} />` (now editable)
      - **API changes in `src/pages/api/save-post.ts`:**
        - Accept `newSlug` parameter
        - If `newSlug` different from `slug`: rename file
        - Validation: check slug format, check if file exists
      - **Test:**
        - Open settings modal
        - Change slug from "ralph-loops" to "ralph-loops-test"
        - Save
        - Should redirect to new URL
        - Old URL should 404
      - Commit: `feat: Add slug editor to settings modal`

- [x] **Polish settings/save button styling**
      - **Problem:** User says buttons are "ugly and agricultural"
      - **Current design:** Gear icon and save icon in bottom-right corner
      - **Review current styling:**
        - Check `.edit-controls` in `src/styles/global.css`
        - Check `.settings-button` and `.save-button` styling
      - **Potential improvements:**
        - Reduce button size (currently 3rem - quite large)
        - Refine icon styling
        - Better hover states
        - Consider moving to different location (less obtrusive)
      - **Suggested changes:**
        ```css
        .edit-controls {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem; /* Reduce gap */
          z-index: 100;
        }

        .save-button,
        .settings-button {
          width: 2.5rem; /* Smaller buttons */
          height: 2.5rem;
          padding: 0.5rem;
          /* More refined styling */
        }

        /* Consider opacity until hover */
        .edit-controls {
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .edit-controls:hover {
          opacity: 1;
        }
        ```
      - **Files:** `src/styles/global.css`
      - **Test:** Visit post in dev mode, check if buttons look better
      - Commit: `style: Polish edit controls button styling`

- [x] **Redesign toolbar - vertical layout in left margin**
      - **Current issue:** Toolbar is horizontal, appears above text, covers the selection
      - **New design:**
        - Position toolbar to the LEFT of content block
        - Vertical orientation (buttons stacked vertically)
        - Align inline with selected text (same Y position as selection)
        - Place in the margin area, not overlapping content
      - **Implementation:**
        - Change toolbar positioning logic:
          ```javascript
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const contentRect = contentEditable.getBoundingClientRect();

          toolbar.style.display = 'flex';
          toolbar.style.flexDirection = 'column'; // Vertical stack
          toolbar.style.top = `${rect.top + window.scrollY}px`; // Inline with selection
          toolbar.style.left = `${contentRect.left - 60}px`; // 60px to left of content
          toolbar.style.transform = 'none'; // Remove centering transform
          ```
        - Update CSS:
          ```css
          .edit-toolbar {
            flex-direction: column; /* Stack buttons vertically */
            gap: 0.5rem; /* Space between buttons */
            padding: 0.5rem;
            width: auto; /* Let buttons determine width */
          }

          .edit-toolbar button {
            padding: 0.5rem; /* Square buttons */
            min-width: 2.5rem; /* Consistent width */
            min-height: 2.5rem; /* Square shape */
            font-size: 0.85rem; /* Slightly smaller */
          }
          ```
      - **Test:**
        - Select text in content
        - Toolbar should appear to the LEFT in margin
        - Buttons stacked vertically
        - Inline with selected text (not above/below)
        - Doesn't cover content
      - **Files:** `src/components/EditToolbar.astro`
      - Commit: `refactor: Move toolbar to vertical layout in left margin`

- [x] **Remove Tiptap, revert to contenteditable**
      - **Decision:** Tiptap is too complex for this use case. Going back to simple contenteditable with toolbar.
      - **What to do:**
        1. Delete `src/components/TiptapEditor.astro`
        2. Uninstall Tiptap packages: `npm uninstall @tiptap/core @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder tiptap-markdown`
        3. Restore contenteditable approach in `src/layouts/Post.astro`:
           ```astro
           <h1 class="post-title" contenteditable={isDev} data-field="title">{title}</h1>
           <p class="post-description" contenteditable={isDev} data-field="description">{description}</p>
           <div class="post-content" contenteditable={isDev} data-field="content">
             <slot />
           </div>
           ```
        4. Remove Tiptap CSS from `src/styles/global.css` (keep contenteditable styles)
      - **Files to modify:**
        - Delete: `src/components/TiptapEditor.astro`
        - Restore: `src/layouts/Post.astro` (revert to contenteditable)
        - Clean: `src/styles/global.css` (remove Tiptap styles, keep contenteditable styles)
        - Update: `package.json` (remove Tiptap deps)
      - **Test:** Visit /posts/ralph-loops/ - should see normal content, editable with contenteditable
      - Commit: `refactor: Remove Tiptap, revert to contenteditable approach`

- [x] **Create floating WYSIWYG toolbar component**
      - **What:** Build a simple toolbar that appears when text is selected, uses browser execCommand
      - **Create:** `src/components/EditToolbar.astro`
      - **Structure:**
        ```astro
        <div id="edit-toolbar" class="edit-toolbar" style="display: none;">
          <button data-command="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
          <button data-command="italic" title="Italic (Ctrl+I)"><em>I</em></button>
          <button data-command="createLink" title="Add Link (Ctrl+K)">🔗</button>
          <button data-command="formatBlock" data-value="h2" title="Heading 2">H2</button>
          <button data-command="formatBlock" data-value="h3" title="Heading 3">H3</button>
          <button data-command="insertUnorderedList" title="Bullet List">• List</button>
          <button data-command="formatBlock" data-value="pre" title="Code Block">Code</button>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const toolbar = document.getElementById('edit-toolbar');
            const contentEditable = document.querySelector('[data-field="content"]');

            // Show toolbar on text selection
            document.addEventListener('selectionchange', () => {
              const selection = window.getSelection();
              if (!selection || selection.isCollapsed || !contentEditable.contains(selection.anchorNode)) {
                toolbar.style.display = 'none';
                return;
              }

              // Position toolbar above selection
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              toolbar.style.display = 'flex';
              toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
              toolbar.style.left = `${rect.left + rect.width / 2}px`;
              toolbar.style.transform = 'translateX(-50%)';

              // Update button active states
              updateToolbarState(toolbar);
            });

            // Handle toolbar button clicks
            toolbar.addEventListener('click', (e) => {
              const button = e.target.closest('button');
              if (!button) return;

              const command = button.getAttribute('data-command');
              const value = button.getAttribute('data-value');

              if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) document.execCommand(command, false, url);
              } else if (value) {
                document.execCommand(command, false, value);
              } else {
                document.execCommand(command, false, null);
              }

              updateToolbarState(toolbar);
            });
          });

          function updateToolbarState(toolbar) {
            toolbar.querySelectorAll('button').forEach(button => {
              const command = button.getAttribute('data-command');
              const isActive = document.queryCommandState(command);
              button.classList.toggle('is-active', isActive);
            });
          }
        </script>

        <style>
          .edit-toolbar {
            position: absolute;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 0.5rem;
            display: flex;
            gap: 0.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
          }

          .edit-toolbar button {
            background: transparent;
            border: none;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--color-text);
            transition: background 0.2s;
          }

          .edit-toolbar button:hover {
            background: var(--color-code-bg);
          }

          .edit-toolbar button.is-active {
            background: var(--color-link);
            color: white;
          }
        </style>
        ```
      - **Include in:** `src/layouts/Post.astro` (inside the dev mode block, after edit controls)
      - **Test:**
        - Select text in content area
        - Toolbar should appear above selection
        - Click Bold - text becomes bold
        - Click Italic - text becomes italic
        - Click Link - prompts for URL, creates link
      - Commit: `feat: Add floating WYSIWYG toolbar with execCommand`

- [x] **Add keyboard shortcuts for toolbar commands**
      - **What:** Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for link
      - **Where:** Add to the EditToolbar.astro script or Post.astro script
      - **Code:**
        ```javascript
        document.addEventListener('keydown', (e) => {
          if (!e.ctrlKey && !e.metaKey) return;

          const contentEditable = document.querySelector('[data-field="content"]');
          if (!contentEditable.contains(document.activeElement)) return;

          switch(e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              document.execCommand('bold');
              break;
            case 'i':
              e.preventDefault();
              document.execCommand('italic');
              break;
            case 'k':
              e.preventDefault();
              const url = prompt('Enter URL:');
              if (url) document.execCommand('createLink', false, url);
              break;
          }
        });
        ```
      - **Test:**
        - Select text, press Ctrl+B - should become bold
        - Press Ctrl+I - should become italic
        - Press Ctrl+K - should prompt for URL
      - Commit: `feat: Add keyboard shortcuts for formatting (Ctrl+B/I/K)`

- [x] **Test and verify all functionality**
      - **Tests:**
        1. Visit /posts/ralph-loops/ in dev mode
        2. Edit title - should work, no duplication
        3. Edit description - should work
        4. Edit content - should work
        5. Select text - toolbar appears
        6. Click Bold - text becomes bold
        7. Click Italic - text becomes italic
        8. Click Link - prompts for URL, creates link
        9. Click H2 - becomes heading 2
        10. Click save - should save correctly
        11. Check .md file - should have markdown (not HTML)
        12. Reload - changes should persist
        13. Footnotes should be non-editable (faded)
        14. Footnotes should be preserved after save
      - **Run:** `npm run build` - must pass
      - **Run:** `npm test` - should pass (may need to update some tests)
      - Commit: `test: Verify all editing functionality works`

---

- [x] **Re-enable content editing with footnote preservation**
      - **Strategy:** Make footnotes non-editable, preserve original markdown
      - **Why:** Can't convert footnote HTML back to `[^1]` syntax reliably
      - **Solution:** Lock footnotes, strip them before conversion, merge original footnotes back
      **Step 1: Make footnotes non-editable in rendered HTML**
      - **File:** `src/layouts/Post.astro`
      - Add script to mark footnotes as non-editable:
        ```astro
        {isDev && (
          <script is:inline>
            // Make footnotes non-editable to prevent corruption
            document.addEventListener('DOMContentLoaded', () => {
              // Footnote references (superscript links)
              document.querySelectorAll('sup a[data-footnote-ref]').forEach(el => {
                el.setAttribute('contenteditable', 'false');
                el.style.cursor = 'not-allowed';
                el.style.opacity = '0.7';
                el.title = 'Footnotes cannot be edited inline';
              });

              // Footnotes section
              const footnotesSection = document.querySelector('.footnotes');
              if (footnotesSection) {
                footnotesSection.setAttribute('contenteditable', 'false');
                footnotesSection.style.opacity = '0.7';
                footnotesSection.style.cursor = 'not-allowed';
              }
            });
          </script>
        )}
        ```

      **Step 2: Re-enable content editing**
      - **File:** `src/layouts/Post.astro` (line 57)
      - Add back `contenteditable={isDev}` to `.post-content` div

      **Step 3: Strip footnotes before sending to API**
      - **File:** `src/layouts/Post.astro`
      - Update `getEditableContent()` function:
        ```typescript
        function getEditableContent() {
          const titleEl = document.querySelector('[data-field="title"]') as HTMLElement;
          const descriptionEl = document.querySelector('[data-field="description"]') as HTMLElement;
          const contentEl = document.querySelector('[data-field="content"]') as HTMLElement;

          // Clone content to avoid mutating DOM
          const contentClone = contentEl?.cloneNode(true) as HTMLElement;

          // Remove footnotes section (will be preserved from original file)
          const footnotesSection = contentClone?.querySelector('.footnotes');
          if (footnotesSection) {
            footnotesSection.remove();
          }

          // Remove footnote reference superscripts (will be preserved from original)
          contentClone?.querySelectorAll('sup[data-footnote-ref], sup a[data-footnote-ref]').forEach(el => {
            el.parentElement?.remove();
          });

          return {
            title: titleEl?.textContent?.trim() || '',
            description: descriptionEl?.textContent?.trim() || '',
            content: contentClone?.innerHTML || ''
          };
        }
        ```
      - Update save request to send content:
        ```typescript
        const { title, description, content } = getEditableContent();
        // ...
        body: JSON.stringify({ slug, title, description, content })
        ```

      **Step 4: Preserve original footnotes in API**
      - **File:** `src/pages/api/save-post.ts`
      - Update content handling to preserve footnotes:
        ```typescript
        // Update content if provided (convert HTML to Markdown)
        let newContent = parsed.content;
        if (content !== undefined && content !== null) {
          // Extract footnote references from ORIGINAL markdown
          const footnoteRefs: string[] = [];
          const footnoteRefRegex = /\[\^(\d+)\]/g;
          let match;
          while ((match = footnoteRefRegex.exec(parsed.content)) !== null) {
            footnoteRefs.push(`[^${match[1]}]`);
          }

          // Extract footnote definitions from ORIGINAL markdown
          const footnoteDefsRegex = /\[\^(\d+)\]:(.+?)(?=\n\[\^|\n\n|$)/gs;
          const footnoteDefs: string[] = [];
          while ((match = footnoteDefsRegex.exec(parsed.content)) !== null) {
            footnoteDefs.push(match[0].trim());
          }

          // Convert HTML content (without footnotes) to Markdown
          let convertedContent = turndown.turndown(content);

          // Re-insert footnote references at approximate positions
          // (This is best-effort - footnotes stay where they were in original)
          footnoteRefs.forEach(ref => {
            if (!convertedContent.includes(ref)) {
              // Footnote reference was in edited content, preserve it at end of paragraph
              convertedContent = convertedContent.replace(/(\n\n|$)/, `${ref}$1`);
            }
          });

          // Append footnote definitions at the end
          if (footnoteDefs.length > 0) {
            convertedContent += '\n\n' + footnoteDefs.join('\n');
          }

          newContent = convertedContent;
        }
        ```

      **Step 5: Add validation**
      - **File:** `src/layouts/Post.astro` in `savePost()` function
        ```typescript
        // Validate non-empty
        if (!title?.trim() || !description?.trim() || !content?.trim()) {
          showStatus('Error: Title, description, and content required', true);
          return;
        }
        ```

      **Step 6: Test extensively**
      1. **Dev mode visual check:**
         - Visit ralph-loops post in dev
         - Footnote references should be slightly faded, not editable
         - Footnotes section at bottom should be faded, not editable
         - Hover over footnote - tooltip says "Footnotes cannot be edited inline"
         - Main content should still be editable

      2. **Edit main content (no footnotes):**
         - Edit a paragraph that doesn't have footnotes
         - Save
         - Verify .md file: footnotes unchanged, paragraph updated

      3. **Edit paragraph with footnote:**
         - Find paragraph with `[^1]` reference
         - Edit the text AROUND the footnote (not the footnote itself)
         - Save
         - Open .md file - verify:
           - Paragraph text updated
           - `[^1]` still present in correct location
           - Footnote definition `[^1]: ...` still at bottom
           - Footnote syntax intact

      4. **Add new content:**
         - Add a new heading and paragraph
         - Save
         - Verify new content appears in .md file
         - Verify existing footnotes still intact

      5. **Code blocks:**
         - Edit content with code blocks
         - Verify language hints preserved: ` ```javascript ` not ` ``` `

      6. **Test what-we-lose post (no footnotes):**
         - Edit content normally
         - Save
         - Verify no issues

      7. **Tests & build:**
         - Run `npm test` - should pass
         - Run `npm run build` - should succeed

      **Success criteria:**
      - ✅ Footnotes visually locked (faded, not editable)
      - ✅ Can edit ralph-loops main content without corrupting footnotes
      - ✅ Footnote syntax `[^1]` preserved in .md file
      - ✅ Footnote definitions preserved at end of file
      - ✅ Code blocks maintain language hints
      - ✅ All tests pass
      - ✅ Build succeeds

      **Commit message:** `feat: Re-enable content editing with footnote preservation`

      **Trade-off accepted:** Footnotes cannot be edited inline (must edit .md file directly). This is acceptable because it prevents corruption.

---

- [x] **Fix critical inline editing bugs**
      - **Bug 1: Description hidden in production** - Post.astro line 50 has `style={isDev ? '' : 'display: none;'}` which hides description in prod. Should descriptions be visible on posts? If yes, remove this style attribute.
      - **Bug 2: Data loss risk with HTML→Markdown conversion** - Editing complex markdown (code blocks with syntax highlighting, footnotes, custom HTML) will be converted to HTML by browser, then back to Markdown by turndown. This roundtrip loses fidelity. **High risk of corrupting posts.**
      - **Bug 3: No validation** - API accepts empty title/content, no checks for broken markdown
      - **Bug 4: innerText vs textContent** - Post.astro line 107 uses `innerText` which can include hidden elements, should use `textContent`
      - **Bug 5: No keyboard shortcut indication** - Ctrl/Cmd+S works but users don't know about it

      **Testing needed:**
      1. Edit a post with code blocks - does it preserve syntax?
      2. Edit a post with footnotes - do they survive?
      3. Edit with complex formatting - check for data loss
      4. Try to save empty content - does it break?

      **Recommended fixes:**
      - **Option A (Safe):** Only allow title + description editing, disable content editing
      - **Option B (Risky):** Add turndown-plugin-gfm for better footnote handling, test extensively
      - Add validation: require non-empty title/content
      - Add warning modal: "Editing content with footnotes will corrupt them. Edit title/description only."
      - Add keyboard shortcut hint to UI (show "Ctrl/Cmd+S to save")
      - Change `innerText` to `textContent` (line 107 of Post.astro)
      - Consider visual indicator: make footnotes non-editable or warn on hover

      **Quick fix for now:**
      - Disable content editing: remove `contenteditable={isDev}` from `.post-content` div
      - Keep title/description editing only (safe because they're plain text)
      - Add this to Post.astro line 58-62:
        ```astro
        <div class="post-content">
          <slot />
        </div>
        ```

      Commit: `fix: Disable content editing to prevent footnote corruption`

---

## Inline Editing Feature (Completed)

- [x] **Install dependencies for inline editing**
- [x] **Create save-post API route**
- [x] **Make post content editable in dev mode**
- [x] **Add inline editing styles**
- [x] **Add client-side save logic**
- [x] **Create frontmatter settings modal**
- [x] **Test inline editing feature** (automated tests pass, manual testing recommended)

---

- [x] **Fix TOC toggle button - currently invisible when TOC is open**
      - **Critical Bug:** Toggle button is hidden when TOC is open on desktop (display: none)
      - **Impact:** Users cannot close an open TOC - button disappears, functionality broken
      - **Root cause:** Tried to fix overlap by hiding button, but removed close functionality

      - **Why tests didn't catch this:**
        - Test was written to VALIDATE the bug: `await expect(toggle).not.toBeVisible()`
        - Test verified implementation (button hidden) instead of behavior (user can close TOC)
        - Need to test USER NEEDS not implementation details

      - **Correct Solution Options:**

        **Option 1: Always-visible TOC on desktop (RECOMMENDED)**
        - On desktop (>1200px): TOC is permanently visible, no close button needed
        - On mobile/tablet: Keep toggle for overlay behavior
        - Simplest, matches minimalist design philosophy
        - CSS: Remove ability to close on desktop, keep hamburger visible only on small screens

        **Option 2: Move toggle when open**
        - When TOC opens, slide toggle to the right (e.g., `left: 300px`)
        - Sits next to TOC instead of overlapping
        - More complex animation

        **Option 3: Bring back X inside TOC**
        - Add close button in TOC header next to "CONTENTS"
        - Toggle button opens, X button closes
        - More elements to manage

      - **Recommended Implementation (Option 1):**
        ```css
        /* Desktop: TOC always visible, toggle always hidden */
        @media (min-width: 1201px) {
          .toc-toggle {
            display: none; /* No toggle needed on desktop */
          }

          .toc-container {
            display: block !important; /* Always visible */
          }

          .toc-container[data-open="false"] {
            display: block !important; /* Override - always show */
          }
        }

        /* Mobile/tablet: Keep toggle functionality */
        @media (max-width: 1200px) {
          .toc-toggle {
            display: flex; /* Show toggle */
          }

          .toc-container[data-open="false"] {
            display: none; /* Hide when closed */
          }
        }
        ```

      - **Update JavaScript:**
        - Disable toggle click handler on desktop
        - Only allow toggle on mobile/tablet widths

      - **Fix the test:**
        ```javascript
        test('user can always see TOC on desktop', async ({ page }) => {
          await page.setViewportSize({ width: 1400, height: 800 });
          // TOC should always be visible
          const toc = page.locator('.toc-container');
          await expect(toc).toBeVisible();

          // Toggle button should not exist on desktop
          const toggle = page.locator('.toc-toggle');
          await expect(toggle).not.toBeVisible();
        });
        ```

      - **Files to modify:**
        - `src/styles/global.css` - Media query logic
        - `src/components/TableOfContents.astro` - JavaScript to disable toggle on desktop
        - `tests/toc.spec.ts` - Fix test to verify behavior not implementation

      - **Test:**
        1. Desktop (>1200px): TOC always visible, no toggle button
        2. Mobile (<1200px): Toggle works to open/close overlay
        3. No overlap, no broken functionality

      - Commit: `fix: Make TOC always visible on desktop, toggle for mobile only`

---

- [x] **Fix TOC toggle button issues (overlap + animation quality)**
      - **Issue 1:** X button overlaps with "CONTENTS" text when TOC is open (both at same position)
      - **Issue 2:** Animation is not as smooth/elegant as reference material

      - **Problem with current animation:**
        - Bars use flexbox `gap: 5px` - not precise enough
        - translateY values (7px/-7px) create imprecise movement
        - Bars don't rotate around a common center point
        - Basic `ease` timing function is not as elegant
        - Bars don't meet perfectly at center to form clean X

      - **Solution for animation:**
        1. Remove flexbox gap, use absolute positioning for bars
        2. Position bars relative to button center
        3. Use `transform-origin: center` so bars rotate around common point
        4. Use refined easing: `cubic-bezier(0.4, 0, 0.2, 1)`
        5. Bars should translate to exact center, then rotate

      - **Updated CSS structure:**
        ```css
        .toc-toggle {
          position: relative; /* for absolute bar positioning */
          width: 2rem;
          height: 2rem;
          /* Remove gap and flex alignment */
        }

        .toc-toggle .bar {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 1.5rem;
          height: 2px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toc-toggle .bar:nth-child(1) {
          top: 25%; /* Top position */
        }

        .toc-toggle .bar:nth-child(2) {
          top: 50%; /* Center */
          transform: translateX(-50%) translateY(-50%);
        }

        .toc-toggle .bar:nth-child(3) {
          top: 75%; /* Bottom position */
        }

        /* When open - bars meet at center and rotate */
        .toc-toggle.open .bar:nth-child(1) {
          top: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(45deg);
        }

        .toc-toggle.open .bar:nth-child(2) {
          opacity: 0;
        }

        .toc-toggle.open .bar:nth-child(3) {
          top: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(-45deg);
        }
        ```

      - **Solution for overlap:**
        ```css
        /* Hide toggle when TOC is open on desktop */
        @media (min-width: 1201px) {
          .toc-toggle.open {
            display: none;
          }
        }
        ```

      - **Files to modify:** `src/styles/global.css`
      - **Test:**
        1. Toggle multiple times - animation should feel buttery smooth
        2. Bars should form perfect X at button center
        3. On desktop: X should disappear when TOC open (no overlap)
      - Commit: `refactor: Improve hamburger animation and fix overlap`

---

## Completed Tasks

- [x] **Polish TOC toggle buttons (hamburger/X)** ⚠️ UX REFINEMENT
      - **Issues:**
        1. Hamburger button has 1px border - remove it
        2. X and hamburger should be in exactly the same place (not jump positions)
        3. X should smoothly animate/morph into hamburger (elegant transition)
      - **Reference animation:** https://medium.com/design-bootcamp/from-hamburger-to-close-icon-a-webflow-animation-journey-c88a06632ab9
        - Three-bar hamburger morphs into X
        - Top/bottom bars rotate and translate to form X
        - Middle bar fades out
        - Smooth, elegant CSS animation
      - **Files to modify:**
        - `src/styles/global.css` - remove border from `.toc-toggle`, add animation styles
        - `src/components/TableOfContents.astro` - restructure button to use spans for bars
      - **Implementation approach:**
        - Use single button with three `<span>` bars inside
        - CSS transitions on transform (rotate, translate) and opacity
        - Toggle class on button (e.g., `.toc-toggle.open`) to trigger animation
        - Remove `border: 1px solid var(--color-border)`
      - **Example structure:**
        ```html
        <button class="toc-toggle">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        ```
      - **Test:** Toggle TOC open/close multiple times, verify smooth morph animation like reference
      - Commit: `refactor: Add smooth hamburger-to-X animation, remove border`

---

- [x] Initial site setup
- [x] First essay: What We Lose When We Stop Struggling
- [x] Second essay: Ralph loops
- [x] Update About page with real bio
- [x] Add subtle "About" link to header
- [x] Fix syntax highlighting theme (github-dark)
- [x] **Table of Contents for Essays** - Full TOC implementation
  - [x] Create TableOfContents.astro component
  - [x] Integrate into Post.astro layout
  - [x] Add responsive styles (desktop sidebar, mobile overlay)
  - [x] Add scroll tracking and active highlighting
  - [x] Hamburger menu to open/close, open by default
- [x] **Add Favicon** - Copied from field-notes project
- [x] **Fix TOC positioning** - Sticky sidebar with proper responsive behavior
- [x] **Add Automated Testing** - Playwright with 72 passing tests
  - [x] Install Playwright
  - [x] Create Playwright config (4 devices)
  - [x] Create TOC functional tests
  - [x] Create visual regression tests (with overlap detection)
  - [x] Generate baseline screenshots
  - [x] Create testing documentation
- [x] **Add footnote styling** - Subtle superscript numbers, muted footnote section
- [x] **Refine TOC visual design** - Removed border, repositioned to top-left, wider (280px)
- [x] **Fix hamburger toggle** - Shows when TOC is closed on desktop

---

## Process Improvements (2026-02-02)

### Why We Separate Implementation from Testing

**Problem Identified:**
Ralph completed 100% of syndication features but created 0% of tests (0 out of 7 required tests), despite:
- ✅ Explicit test requirements in task descriptions with code examples
- ✅ Clear file paths specified (tests/syndication.spec.ts)
- ✅ Mature test infrastructure (88 existing Playwright tests)
- ✅ User explicitly requesting "make sure ralph adds tests pls"

**Root Cause:**
- Task completion criteria not enforced - can mark [x] without verification
- Tests listed at END of tasks (feels optional, like cleanup)
- No automated verification gates
- Checkbox is binary - no distinction between "feature works" and "all requirements met"

**Solution Implemented:**
1. **Separate test tasks from implementation tasks**
   - Implementation task = feature code only
   - Test task = separate checkbox with explicit verification
   - Test tasks "Blocked By" implementation tasks
   - Harder to skip - requires conscious decision

2. **Test count verification**
   - Every test task specifies: Current count → Expected count
   - Observable metric (can't fake passing tests)
   - Easy to verify: `npm test 2>&1 | grep "passing"`

3. **Verification checklists**
   - Before marking [x], must check all items
   - File exists, tests pass, count matches
   - Self-correcting mechanism

4. **Post-completion audit**
   - After marking [x], re-read requirements
   - Verify every bullet point completed
   - Uncheck if anything missing

**Expected Outcome:**
Ralph will complete both implementation AND testing because:
- Two separate checkboxes create accountability
- Test count provides observable success criteria
- Verification checklist catches mistakes
- Template reduces ambiguity

**Example Structure:**

**Before (What Caused Skipped Tests):**
```markdown
- [ ] **Add "Copy for LinkedIn" button**
      - Implementation: [code]
      - Manual test: [steps]
      - Automated test: [code]
      - Commit: `feat: Add Copy for LinkedIn button with tests`
```
❌ Result: Feature implemented, tests skipped, task marked [x] anyway

**After (New Approach):**
```markdown
- [ ] **Add "Copy for LinkedIn" button** (Implementation Only)
      - Implementation: [code]
      - Files: src/layouts/Post.astro, src/styles/global.css
      - Commit: `feat: Add Copy for LinkedIn button`

- [x] **Test: LinkedIn copy button** (Separate Task)
      - Blocked By: "Add Copy for LinkedIn button"
      - Current Test Count: 88 passing
      - Expected Test Count: 90 passing (+2)
      - Verification: Run `npm test`, confirm 90 passing
      - Commit: `test: Add LinkedIn copy button tests`
```
✅ Result: Two checkboxes, clear verification, harder to skip

**Success Metrics:**
- ✅ Tests created when test task marked [x]
- ✅ Test count increases as expected
- ✅ Zero test tasks marked [x] without tests existing
- ✅ Fewer "Ralph skipped X" discoveries

---

## Testing Standards

### When to Run Tests
- After any CSS changes
- After modifying TOC component
- Before committing UI changes
- After updating dependencies

### What to Do If Tests Fail
1. Check the error message and stack trace
2. Review screenshots in `test-results/` if visual test
3. Fix the issue or update baselines with `npm run test:update`
4. Re-run tests to confirm fix

### Test Commands
```bash
npm test              # Run all tests headless
npm run test:headed   # Run with visible browser
npm run test:ui       # Interactive UI mode
npm run test:update   # Update baseline screenshots
```

---

## Standards

### Code Style
- TypeScript, Astro components
- Keep it simple. This is a blog, not a SaaS product.
- No unnecessary dependencies

### Git
- Commit after each completed task
- Commit messages: `feat:`, `fix:`, `refactor:`, `docs:`
- Never commit if `npm run build` fails
- Push to GitHub after tests pass: `git push`
- Why: Keeps commits synchronized, avoids HTTP buffer issues with large batches

### Design
- Minimal. Think darioamodei.com
- Dark mode default, light mode available
- No animations, no hero images, no noise
- Typography is the design

---

## Architecture Decisions

- **Newsreader font:** Chosen for readability on long essays. Don't change.
- **Dark mode default:** Intentional. Don't change.
- **No analytics yet:** Will add Plausible later if needed.
- **No comments:** Intentional. Not a community, just essays.

---

## PM Review Notes

### 2026-01-30: Inline Editing - All Bugs Fixed ✅
**Status:** Production ready for title/description editing

**Final Review:**
- ✅ All 5 critical bugs fixed in commit f8e1094
- ✅ 76/76 tests passing
- ✅ Build successful
- ✅ Safe for production use

**What's editable:**
- ✅ Title (plain text, no corruption risk)
- ✅ Description (plain text, no corruption risk)
- ✅ Frontmatter (date, draft via settings modal)
- ❌ Content (disabled to prevent footnote corruption)

**See:** FINAL-REVIEW.md for complete QA report

---

### 2026-01-30: Inline Editing QA - Critical Issues Found (RESOLVED)
**Status:** Feature implemented but has data loss risks and bugs → **ALL FIXED**

**What Ralph Built:**
- ✅ API route (`/api/save-post`) with dev-only security
- ✅ Contenteditable UI for title, description, content
- ✅ Settings modal for frontmatter (date, draft)
- ✅ Save button + keyboard shortcut (Ctrl/Cmd+S)
- ✅ Auto-reload after save
- ✅ HTML→Markdown conversion with turndown
- ✅ Dev-only visibility (hidden in production)
- ✅ Nice SVG icons for buttons
- ✅ Build passes, no errors

**Critical Issues:**

**🚨 Bug 1: Data Loss Risk (HIGH SEVERITY) - CONFIRMED**
- User edits rendered HTML (with syntax highlighting, footnotes, etc.)
- Browser's contenteditable gives you HTML with all the styling
- Turndown converts back to Markdown
- **Problem:** Roundtrip HTML→Markdown loses formatting fidelity
- **Tested:** Created test-roundtrip.js to verify
- **Results:**
  - ✅ Code blocks: Language hints preserved (good!)
  - ❌ Footnotes: **BROKEN** - `[^1]` becomes `[1](#fn1)`, footnote definition becomes numbered list
  - ❌ Footnote syntax completely corrupted, will break site
- **Impact:** Editing any post with footnotes will break them. Ralph-loops post has footnotes - DO NOT EDIT with this feature yet.
- **Evidence:** Run `node test-roundtrip.js` to see the problem

**🐛 Bug 2: Description Hidden in Production**
- Line 50 of Post.astro: `style={isDev ? '' : 'display: none;'}`
- Description is hidden from readers in production
- Was this intentional? Original plan didn't specify this.
- If descriptions should be visible, this needs fixing

**🐛 Bug 3: No Validation**
- API accepts empty title, empty content, empty description
- No check for minimum length or broken markdown
- Could save completely blank posts

**🐛 Bug 4: innerText vs textContent**
- Line 107 uses `innerText` which includes hidden elements
- Should use `textContent` for more predictable behavior

**🐛 Bug 5: No User Guidance**
- Ctrl/Cmd+S shortcut exists but users don't know
- No warning about data loss risk
- No indication what's safe to edit vs risky

**What Works Well:**
- ✅ Dev-only security (returns 403 in production)
- ✅ Path traversal validation (no `../` attacks)
- ✅ Clean UI with nice icons
- ✅ Modal for frontmatter editing
- ✅ Auto-reload UX is smooth
- ✅ Save status indicators work

**Testing Results:**
- ✅ Build passes
- ✅ Edit controls appear in dev (`contenteditable="true"`)
- ✅ Edit controls hidden in prod (`contenteditable="false"`, no buttons)
- ✅ API route has `prerender: false`
- ❌ Haven't tested complex markdown roundtrip
- ❌ Haven't tested validation edge cases
- ❌ Haven't tested footnote preservation

**Recommendation:**
Feature is 80% there but needs safety guardrails before real use:
1. Add validation (non-empty checks)
2. Add warning modal about data loss risk
3. Test extensively with complex posts
4. Consider: only allow title/description editing, not full content (too risky)
5. Fix innerText→textContent
6. Add keyboard shortcut hint

**Risk Assessment:**
- **Current state:** Functional but dangerous - could corrupt posts
- **After fixes:** Acceptable for dev use, still recommend manual backups

---

## PM Review Notes

### 2026-01-30: TOC Toggle - Critical Bug After Attempted Fix
**Status:** Ralph's fix for overlap created a worse bug - X button now invisible, users can't close TOC

**What Happened:**
1. ✅ Animation improved (absolute positioning, cubic-bezier, bars meet at center)
2. ❌ Fixed overlap by hiding toggle when open (`display: none`)
3. ❌ **NEW CRITICAL BUG:** Users cannot close TOC on desktop - button is gone!
4. ❌ Test validated the bug instead of catching it

**Why Tests Failed to Catch This:**
- Ralph wrote test that asserts `toggle.not.toBeVisible()` - testing the broken implementation
- Test should verify "user can close TOC", not "button is hidden"
- Classic case: testing implementation details instead of user behavior

**The Real Issue:**
- We don't need a toggle on desktop - TOC should be always-visible
- Toggle is only needed for mobile/tablet overlay mode
- Trying to have one button do double-duty (open/close) on all screen sizes is overcomplicating

**Correct Solution:**
- Desktop: TOC permanently visible, no toggle button at all
- Mobile/Tablet: Toggle button controls overlay
- Simpler, matches minimalist design, no overlap possible

---

## Lessons Learned

### 2026-02-02: Ralph Skipped All Tests Despite Explicit Requirements

**What Happened:**
- Ralph implemented 3 syndication features (LinkedIn/Substack buttons, styling)
- All features work perfectly (buttons exist, API works, styling correct)
- Ralph created 0 out of 7 required tests
- All tasks marked [x] complete despite missing tests
- User had to manually discover the gap

**Why It Happened:**
1. **Task structure implied tests were optional:**
   - Tests listed at bottom of tasks (after implementation)
   - Felt like "cleanup" not "requirements"
   - Single checkbox for both feature + tests

2. **No enforcement mechanism:**
   - Could mark [x] without verification
   - No test count tracking
   - No automated gates

3. **Pattern matching on "does it work?" not "is it complete?":**
   - Feature works → task complete (in Ralph's mind)
   - Tests seen as separate from "real work"

**What We Changed:**
1. ✅ Split test tasks from implementation tasks (separate checkboxes)
2. ✅ Added test count verification (observable metric)
3. ✅ Created verification checklists (must check before marking [x])
4. ✅ Added post-completion audit step
5. ✅ Created test task template
6. ✅ Updated "How to Work" with strict requirements

**Key Insight:**
If you want Ralph to do something, make it a SEPARATE TASK with OBSERVABLE SUCCESS CRITERIA.
Don't embed requirements in a single task - they'll be selectively completed.

**For Future Tasks:**
- Implementation = one task
- Testing = separate task (blocked by implementation)
- Each has its own [x] checkbox
- Each has clear pass/fail criteria
- Verification required before marking complete

**Impact:**
Created 3 new test tasks to backfill missing syndication tests.
All future features will follow new structure.

---

## Decision Log

### 2026-01-30: TOC Positioning
**Issue:** TOC needed to work on desktop sidebar and mobile overlay
**Solution:** Used fixed positioning to viewport, separate from content flow
**Outcome:** 72 Playwright tests pass including overlap detection
**Lesson:** Position TOC outside content flow to maintain proper content width

### 2026-01-30: Playwright Integration
**Why:** Need automated testing to catch TOC positioning issues
**Trade-offs:** Adds ~3MB to dev dependencies, requires browser downloads
**Outcome:** Comprehensive test coverage for TOC functional and visual behavior

### 2026-01-30: Test-Driven Bug - Toggle Button Hidden
**Issue:** Ralph hid toggle button when TOC open to fix overlap, broke close functionality
**Why tests didn't catch it:** Test validated the implementation (`expect(toggle).not.toBeVisible()`) instead of testing user behavior ("can user close the TOC?")
**Lesson:** Tests must verify USER NEEDS and BEHAVIORS, not implementation details
**Example of bad test:** Asserting button is hidden
**Example of good test:** Verifying user can complete the open/close cycle
**Fix:** TOC should be always-visible on desktop (no toggle needed), toggle only for mobile overlay

---

## When Stuck

If you've tried 3+ approaches and can't progress:

1. Create `STUCK.md` with what you tried
2. Skip to the next task
3. If no more tasks, output: `<promise>STUCK</promise>`

---

## Completion

When ALL tasks are complete and build passes:

1. Final commit
2. Output exactly: `<promise>DONE</promise>`

---

## Project Structure

```
src/
  content/posts/    # Markdown essays
  pages/            # Astro pages (index, about, drafts)
  layouts/          # Base.astro, Post.astro
  styles/           # global.css
public/             # Static assets
scripts/            # Publish/new-post tooling
tests/              # Playwright tests
```

### Key Files
- `src/styles/global.css` - All styling lives here
- `src/layouts/Base.astro` - Site shell, header, theme toggle
- `src/content/config.ts` - Post schema definition
- `astro.config.mjs` - Astro config, Vercel adapter
- `playwright.config.ts` - Test configuration

### Things Not To Touch
- `src/content/posts/*.md` - Don't modify existing essays
- `.vercel/` - Deployment config

---

## Notes From Human

This is a learning exercise for Ralph loops. The tasks are real but low-stakes. Don't overthink it.
