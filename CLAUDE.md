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
5. Run `npm run build` before committing (must pass)
6. Run `npm test` after UI/visual changes (must pass)
7. Commit with a clear message: `feat: [what you did]`
8. Mark the task complete in this file
9. Move to next task

---

## Current Tasks

*No pending tasks*

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

### 2026-01-30: Inline Editing QA - Critical Issues Found
**Status:** Feature implemented but has data loss risks and bugs

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
