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

### Phase 1: Inline Image Generation (Sketch Illustrations)

- [x] **Install Google GenAI SDK and add API key**
      - **What:** Add `@google/genai` as a dependency. Document the `GOOGLE_AI_API_KEY` requirement in Architecture Decisions.
      - **Why:** Image generation uses Gemini Nano Banana Pro model (`gemini-3-pro-image-preview`) via the Google GenAI SDK.
      - **File(s):** `package.json`, `.env`, `CLAUDE.md`
      - **Implementation:**
        1. Run `npm install @google/genai`
        2. Add `GOOGLE_AI_API_KEY=` to `.env` (user will fill in their key)
        3. In Architecture Decisions, add: `**Image Generation:** Uses @google/genai with gemini-3-pro-image-preview (Nano Banana Pro) for inline sketch illustrations. Dev-mode only. Requires GOOGLE_AI_API_KEY.`
      - **Test:** `npm run build` passes.
      - **Commit:** `feat: Install Google GenAI SDK for image generation`

- [x] **Create image generation API endpoint**
      - **What:** Build a dev-only API endpoint that calls Gemini to generate a hand-drawn sketch illustration from a text prompt.
      - **Why:** Backend endpoint isolates the AI call and handles file storage.
      - **File(s):** `src/pages/api/generate-image.ts`
      - **Implementation:**
        1. Create `src/pages/api/generate-image.ts`:
           - `export const prerender = false;`
           - Dev-mode guard: return 403 if `!import.meta.env.DEV`
           - Accept POST with JSON body: `{ prompt: string, slug: string }`
           - Validate: prompt required (400), slug required (400), `GOOGLE_AI_API_KEY` must exist (500)
        2. Construct system prompt that enforces the sketch style:
           - "Hand-drawn pencil sketch illustration. Black ink on white paper. Loose, expressive linework. Minimal shading with cross-hatching. No color. No text or labels. Simple composition. Think editorial illustration in The New Yorker or a Moleskine notebook sketch."
           - Combine with user's selected text as the subject
        3. Call Gemini API:
           ```typescript
           import { GoogleGenAI } from '@google/genai';
           const ai = new GoogleGenAI({ apiKey });
           const response = await ai.models.generateContent({
             model: 'gemini-3-pro-image-preview',
             contents: fullPrompt,
           });
           ```
        4. Extract image data from response (`part.inlineData.data` base64)
        5. Save to `public/images/posts/{slug}/` with timestamp filename (e.g., `sketch-1707264000.png`)
        6. Create directory if it doesn't exist
        7. Return `{ success: true, path: '/images/posts/{slug}/sketch-{ts}.png' }` or `{ success: false, message }` on error
      - **Test:** `npm run build` passes. Endpoint returns 403 in production.
      - **Commit:** `feat: Create image generation API endpoint`

- [x] **Add image generation button to WYSIWYG toolbar**
      - **What:** Add a pencil/image icon button to the editing toolbar that captures the current text selection and opens an image generation panel.
      - **Why:** The toolbar is the natural entry point for content-level actions.
      - **File(s):** `src/components/EditToolbar.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Add a new button to the toolbar: `<button data-command="generateImage" title="Generate sketch">✎</button>` (pencil character or simple SVG)
        2. On click: capture `window.getSelection().toString()` as the prompt text
        3. If selection is empty, show a small text input popover (reuse the link-input-popover pattern) for typing a prompt manually
        4. Dispatch a custom event `image-generate-request` with `{ prompt, slug }` that the generation panel will listen for
        5. Style the button consistently with existing toolbar buttons
      - **Test:** `npm run build` passes. Button appears in toolbar.
      - **Commit:** `feat: Add image generation button to toolbar`

- [x] **Create image generation panel**
      - **What:** Build a floating panel that shows when the toolbar image button is clicked. Shows the prompt, a Generate button, a preview of the generated image, and an Insert button.
      - **Why:** The panel gives the user control: preview before inserting, edit the prompt, regenerate if needed.
      - **File(s):** `src/components/ImageGenPanel.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Create `src/components/ImageGenPanel.astro`:
           - Panel div: `#image-gen-panel.image-gen-panel` (position: fixed, z-index 1001, hidden by default)
           - Prompt textarea: editable, pre-filled with selected text, 2-3 lines
           - System prompt display: small muted text showing the style prompt (read-only)
           - "Generate" button: calls `/api/generate-image` with prompt + slug
           - Loading state: "Generating..." with spinner/pulse animation on the preview area
           - Image preview: `<img>` tag showing the generated sketch (max-width 400px)
           - "Regenerate" button: appears after first generation, same as Generate
           - "Insert" button: inserts `<img src="{path}" alt="{prompt}" class="sketch-illustration">` at the cursor position in the contenteditable
           - "Cancel" / close button
        2. Panel positioning: appear below the toolbar or centered in the viewport
        3. Listen for `image-generate-request` custom event
        4. On Insert: use `document.execCommand('insertHTML', ...)` or direct DOM insertion
      - **Test:** `npm run build` passes. Panel opens from toolbar button.
      - **Commit:** `feat: Create image generation panel`

- [x] **Add CSS for sketch illustrations (dark/light mode)**
      - **What:** Style inline sketch illustrations with automatic dark/light mode inversion using CSS `filter: invert(1)`.
      - **Why:** Sketches are generated as black-on-white. In dark mode they need to appear white-on-black. CSS filter handles this without generating two images.
      - **File(s):** `src/styles/global.css`
      - **Implementation:**
        1. Add `.sketch-illustration` class:
           ```css
           .sketch-illustration {
             max-width: 100%;
             height: auto;
             margin: 1.5rem auto;
             display: block;
             border-radius: 4px;
           }
           ```
        2. In dark mode (default), invert the sketch:
           ```css
           [data-theme="dark"] .sketch-illustration,
           :root:not([data-theme="light"]) .sketch-illustration {
             filter: invert(1);
           }
           ```
        3. In light mode, show as-is (black on white, no filter)
        4. Ensure the save-post API preserves `<img class="sketch-illustration">` tags in the HTML-to-markdown conversion
      - **Test:** `npm run build` passes.
      - **Commit:** `feat: Add CSS for sketch illustrations with dark/light mode inversion`

- [x] **Test: Phase 1 image generation**
      - **Blocked By:** All implementation tasks above (must be [x])
      - **Test File:** tests/image-generation.spec.ts (new)
      - **Current Test Count:** 214 passing (run `npm test` to verify)
      - **Expected Test Count:** 214 + 6 = 220 passing (+6)

      - **Tests to Add:**
        1. Image generation button appears in toolbar when text is selected (dev mode)
        2. Clicking image button with selection opens generation panel with prompt pre-filled
        3. Generation panel has Generate, Insert, and Cancel buttons
        4. Insert button is disabled before image is generated
        5. Cancel closes the panel without inserting
        6. Sketch illustration images have correct CSS class and invert in dark mode

      - **Verification Checklist:**
        - [x] File tests/image-generation.spec.ts created
        - [x] Run `npm test` - all tests pass
        - [x] Test count is 220+ passing (238 passing across 4 browser configs)
        - [x] All 6 test scenarios implemented

      - **Files:** tests/image-generation.spec.ts
      - **Commit:** `test: Add Phase 1 image generation tests`

---

### Phase 2: Scroll-Scrubbed Image Reveal

> **Note:** Phase 2 tasks depend on Phase 1 being complete (sketch illustrations exist as `<img class="sketch-illustration">` inline in content). All Phase 1 tasks are [x]. These tasks are reader-facing (NOT dev-only) and must work in production.

- [x] **Install GSAP dependency**
      - **What:** Add `gsap` as a production dependency for scroll-driven animations.
      - **Why:** GSAP ScrollTrigger provides scrub-to-scroll animation that CSS alone cannot do. GSAP's core + ScrollTrigger plugin are free for standard use.
      - **File(s):** `package.json`, `CLAUDE.md`
      - **Implementation:**
        1. Run `npm install gsap`
        2. Verify `gsap` appears in `dependencies` (not `devDependencies`) since this runs in production
        3. In CLAUDE.md Architecture Decisions, add: `**Scroll Reveal:** Uses GSAP + ScrollTrigger for scroll-scrubbed sketch illustration materialisation. Production dependency. Desktop uses scrub, mobile uses IntersectionObserver with timed animation.`
        4. In Decision Log, add: `| 2026-02-07 | GSAP for scroll-scrubbed image reveal | Production reader-facing effect, scrub on desktop, IntersectionObserver on mobile |`
      - **Test:** `npm run build` passes. `node -e "require('gsap')"` does not error.
      - **Commit:** `feat: Install GSAP for scroll-scrubbed image reveal`

- [x] **Create scroll-reveal component**
      - **What:** Build `src/components/SketchScrollReveal.astro` containing the core JavaScript that finds all `.sketch-illustration` images and sets up scroll-driven materialisation for each one.
      - **Why:** This is the core animation logic. A dedicated component keeps it isolated from the Post layout and makes it testable.
      - **File(s):** `src/components/SketchScrollReveal.astro`
      - **Implementation:**
        1. Create `src/components/SketchScrollReveal.astro` with a `<script>` block (NOT `is:inline`) so Astro bundles it
        2. Import GSAP and register ScrollTrigger:
           ```typescript
           import { gsap } from 'gsap';
           import { ScrollTrigger } from 'gsap/ScrollTrigger';
           gsap.registerPlugin(ScrollTrigger);
           ```
        3. On `DOMContentLoaded`, query all `.sketch-illustration` elements in `.post-content`
        4. Determine if desktop (`window.matchMedia('(min-width: 1201px)').matches`)
        5. **Desktop path (>1200px):** For each `.sketch-illustration`:
           a. Hide the original inline image (`display: none`)
           b. Create a clone element with class `sketch-reveal-fixed` and append to `document.body`
           c. Set initial state: `opacity: 0`, `filter: blur(8px)`, `translateY: 20px`
           d. Calculate the "trigger zone": from this image's original DOM position to the next `.sketch-illustration`'s position (or end of `.post-content`)
           e. Create a GSAP timeline with `ScrollTrigger({ trigger: triggerElement, start: 'top center', end: 'bottom center', scrub: true })` where `trigger` is a wrapper or the relevant content section
           f. Timeline animates: `{ opacity: 1, filter: 'blur(0px)', y: 0 }` on enter, reverses on leave
           g. Each image gets its own ScrollTrigger instance -- when one fades out, the next fades in
        6. **Mobile path (<=1200px):** For each `.sketch-illustration`:
           a. Keep image inline (do NOT hide it)
           b. Set initial state via GSAP: `opacity: 0`, `filter: blur(8px)`, `y: 20`
           c. Use `IntersectionObserver` with `threshold: 0.3` to detect when image enters viewport
           d. On intersect: play a 0.6s GSAP tween to `{ opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.6, ease: 'power2.out' }`
           e. Optionally reverse when scrolling out of view (use `isIntersecting` false)
        7. Handle resize: if user crosses the 1200px breakpoint, clean up and re-initialise (call `ScrollTrigger.killAll()` and re-run setup). Use `matchMedia` listener, not a resize debounce.
        8. Handle zero images gracefully: if no `.sketch-illustration` found, exit early without errors
        9. **CRITICAL -- filter composability (invert + blur):** In dark mode, `filter: invert(1)` is applied via CSS. GSAP animating `filter` directly would overwrite the invert. Solution: use a CSS custom property `--sketch-blur` and compose filters in CSS as `filter: invert(1) blur(var(--sketch-blur, 0px))`. GSAP animates `--sketch-blur` instead of `filter` directly. In light mode the CSS is just `filter: blur(var(--sketch-blur, 0px))`.
      - **Test:** `npm run build` passes.
      - **Commit:** `feat: Create scroll-reveal component for sketch illustrations`

- [x] **Add CSS for desktop fixed-position sketch reveal**
      - **What:** Add styles for `.sketch-reveal-fixed` (the cloned image positioned in the right margin on desktop) and hide original inline images on desktop.
      - **Why:** The fixed-position clone needs explicit sizing, placement, and z-index to sit in the right margin without overlapping the content column or TOC.
      - **File(s):** `src/styles/global.css`
      - **Implementation:**
        1. Add `.sketch-reveal-fixed` styles (desktop only, inside `@media (min-width: 1201px)`):
           ```css
           @media (min-width: 1201px) {
             .sketch-reveal-fixed {
               position: fixed;
               top: 50%;
               transform: translateY(-50%);
               right: calc((100vw - 700px) / 4);
               max-width: 350px;
               max-height: 60vh;
               width: auto;
               height: auto;
               object-fit: contain;
               z-index: 10;
               pointer-events: none;
               opacity: 0;
             }
           }
           ```
        2. Dark/light mode inversion for the clone using `--sketch-blur` custom property:
           ```css
           [data-theme="dark"] .sketch-reveal-fixed,
           :root:not([data-theme="light"]) .sketch-reveal-fixed {
             filter: invert(1) blur(var(--sketch-blur, 0px));
           }
           .sketch-reveal-fixed {
             filter: blur(var(--sketch-blur, 0px));
           }
           ```
        3. Hide inline originals on desktop:
           ```css
           @media (min-width: 1201px) {
             .post-content .sketch-illustration {
               display: none;
             }
           }
           ```
        4. Ensure `.sketch-reveal-fixed` does not interfere with `.toc-container` (TOC is on the left, sketches on the right -- no overlap)
      - **Test:** `npm run build` passes.
      - **Commit:** `feat: Add CSS for desktop fixed-position sketch reveal`

- [x] **Add CSS for mobile inline sketch materialisation**
      - **What:** Add styles for the mobile materialisation effect -- images stay inline but start transparent/blurred and animate in via IntersectionObserver.
      - **Why:** Mobile has no right margin. Images remain in the content flow but still get the materialisation feel.
      - **File(s):** `src/styles/global.css`
      - **Implementation:**
        1. At mobile sizes (<=1200px), `.sketch-illustration` stays inline (already the case from Phase 1 CSS)
        2. Add a class `.sketch-reveal-pending` that the JS applies before the IntersectionObserver fires:
           ```css
           .sketch-reveal-pending {
             opacity: 0;
             transform: translateY(20px);
             will-change: opacity, filter, transform;
             --sketch-blur: 8px;
           }
           [data-theme="dark"] .sketch-reveal-pending,
           :root:not([data-theme="light"]) .sketch-reveal-pending {
             filter: invert(1) blur(var(--sketch-blur, 8px));
           }
           .sketch-reveal-pending {
             filter: blur(var(--sketch-blur, 8px));
           }
           ```
        3. Add `will-change: opacity, filter, transform` to `.sketch-reveal-fixed` as well for GPU acceleration
      - **Test:** `npm run build` passes.
      - **Commit:** `feat: Add CSS for mobile inline sketch materialisation`

- [x] **Wire SketchScrollReveal into Post.astro**
      - **What:** Import and render `SketchScrollReveal` in the Post layout so the scroll-reveal script loads on every post page for all readers.
      - **Why:** Connects the component to the page. This is NOT dev-only -- it must render in both dev and production.
      - **File(s):** `src/layouts/Post.astro`
      - **Implementation:**
        1. Add import at top of Post.astro frontmatter:
           ```typescript
           import SketchScrollReveal from '../components/SketchScrollReveal.astro';
           ```
        2. Render `<SketchScrollReveal />` inside the `<div class="post-layout">` block, OUTSIDE the `{isDev && ...}` guard. Place it after the closing `</article>` tag but before the dev-only controls block.
        3. The component should be lightweight -- if no `.sketch-illustration` images exist on the page, the script exits early with zero cost.
      - **Test:** `npm run build` passes. View page source of a built post page -- confirm the GSAP script bundle is included.
      - **Commit:** `feat: Wire scroll-reveal component into post layout`

- [x] **Test: Scroll-scrubbed sketch reveal**
      - **Blocked By:** All Phase 2 implementation tasks above (must be [x])
      - **Test File:** tests/sketch-scroll-reveal.spec.ts (new)
      - **Current Test Count:** 238 passing (run `npm test` to verify)
      - **Expected Test Count:** 238 + 8 = 246 passing (+8)

      - **Tests to Add:**
        1. `sketch illustrations have .sketch-illustration class` -- navigate to a post with images, verify class exists
        2. `desktop: inline sketch images are hidden` -- set viewport to 1280px wide, verify `.post-content .sketch-illustration` has `display: none`
        3. `desktop: fixed clone exists in right margin` -- set viewport to 1280px wide, verify `.sketch-reveal-fixed` element exists in DOM
        4. `desktop: fixed clone is positioned to the right of content` -- verify `.sketch-reveal-fixed` bounding rect left edge is greater than the content column right edge
        5. `mobile: sketch images are inline and visible` -- set viewport to 375px wide, verify `.sketch-illustration` is visible and in flow
        6. `mobile: no fixed clones exist` -- set viewport to 375px, verify `.sketch-reveal-fixed` count is 0
        7. `sketch images invert in dark mode` -- verify computed `filter` includes `invert` when `data-theme="dark"`
        8. `no errors on post without sketch images` -- navigate to a post without illustrations, verify no JS console errors

      - **Test Notes:**
        - Tests should use a post that has sketch illustrations. If no published post has one yet, the test can inject a `.sketch-illustration` image into `.post-content` via `page.evaluate()` before checking behavior.
        - Scroll-scrub animation is difficult to test precisely in Playwright. Focus on DOM structure (clone exists, positioning, visibility) rather than mid-animation states.
        - Use `page.on('console', ...)` or `page.on('pageerror', ...)` to catch JS errors for test 8.

      - **Verification Checklist:**
        - [x] File tests/sketch-scroll-reveal.spec.ts created
        - [x] Run `npm test` - all tests pass
        - [x] Test count is 246+ passing (260 passing across 4 browser configs)
        - [x] All 8 test scenarios implemented

      - **Files:** tests/sketch-scroll-reveal.spec.ts
      - **Commit:** `test: Add scroll-scrubbed sketch reveal tests`

---

### Completed: Syndication Modal: Generate on Demand + Auto-Save

- [x] **Replace auto-generation with Generate button**
      - **What:** Remove the auto-AI-generation that fires when the modal opens. Instead, show a "Generate" button in each column. Textarea starts empty (or with last saved draft from localStorage). Clicking Generate calls the AI endpoint for that column only.
      - **Why:** User wants control over when AI generation happens. Auto-generation overwrites previous edits and wastes API calls when the user just wants to review/edit existing copy.
      - **File(s):** `src/components/SyndicationModal.astro`
      - **Implementation:**
        1. Remove the auto `generateDraft` calls from `openSyndicationModal`
        2. Add a "Generate" button in each column (same style as "Rewrite" — in fact, rename "Rewrite" to "Generate" since there's no initial generation to "re"-write)
        3. On modal open: load saved draft from `localStorage` if it exists (key: `syndication-{slug}-{platform}`). If no saved draft, show empty textarea with placeholder
        4. "Generate" button calls the AI endpoint and populates the textarea (overwriting current content)
        5. Keep a single "Generate" button per column (replaces the current "Rewrite" button)
        6. Button text changes to "Generating..." with disabled state while API call is in progress
      - **Test:** `npm run build` passes. Modal opens without API calls. Generate button triggers AI draft.
      - **Commit:** `refactor: Replace auto-generation with Generate button`

- [x] **Auto-save edits to localStorage**
      - **What:** Automatically save textarea content to localStorage on blur and on modal close. Restore saved content when modal reopens for the same post.
      - **Why:** User doesn't want to lose edits. Edits should persist across modal open/close cycles and page refreshes.
      - **File(s):** `src/components/SyndicationModal.astro`
      - **Implementation:**
        1. localStorage key format: `syndication-{slug}-linkedin` and `syndication-{slug}-substack`
        2. On textarea `blur`: save current value to localStorage
        3. On modal close (X button, backdrop click, Escape): save both textareas to localStorage
        4. On modal open: check localStorage for saved drafts. If found, populate textareas with saved content. If not, leave empty with placeholder.
        5. Also save hashtags: `syndication-{slug}-hashtags` as JSON array
        6. "Generate" button should overwrite the textarea AND save the new content to localStorage
        7. "Copy" button should also trigger a save (so the copied version is the persisted version)
      - **Test:** `npm run build` passes. Edits persist after closing and reopening the modal.
      - **Commit:** `feat: Auto-save syndication edits to localStorage`

- [x] **Clean up button layout**
      - **What:** Each column should have: "Generate" button (secondary style) and "Copy" button (blue primary). Remove the separate "Rewrite" button since "Generate" replaces it.
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Each column has two buttons: Generate (secondary) and Copy (blue primary)
        2. Generate button: border style (current regenerate style), text "Generate"
        3. Copy button: blue fill (current style), text "Copy"
        4. When textarea is empty, Copy button should be disabled (grayed out)
        5. Buttons sit in a row at the bottom of each column
      - **Test:** `npm run build` passes.
      - **Commit:** `refactor: Clean up syndication button layout`

- [x] **Test: Generate on demand and auto-save**
      - **Blocked By:** All implementation tasks above (must be [x])
      - **Test File:** tests/syndication.spec.ts (update existing)
      - **Current Test Count:** Run `npm test` to get current count
      - **Expected Test Count:** Update existing tests, +3 new

      - **Tests to Update/Add:**
        1. Modal opens without triggering API calls (no "Generating..." state on open)
        2. Both textareas start empty (or with placeholder) when no saved draft exists
        3. Generate button triggers loading state and populates textarea
        4. Update any existing tests that expect auto-generation behaviour

      - **Files:** tests/syndication.spec.ts
      - **Commit:** `test: Update syndication tests for generate on demand`

---

### Completed: Syndication Modal Redesign

- [x] **Convert syndication modal to side-by-side layout**
      - **What:** Replace the tabbed LinkedIn/Substack layout with a two-column side-by-side view. LinkedIn on the left, Substack on the right. Kill the tab navigation entirely.
      - **Why:** There's plenty of horizontal space. Side-by-side lets you see and edit both drafts simultaneously without switching tabs.
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Remove the tab navigation HTML (`.syndication-tab-navigation`, tab buttons, underline)
        2. Replace `.syndication-tab-panels` with a two-column flex layout: `display: flex; gap: 2rem;` with each column at `flex: 1`
        3. Each column gets: platform label (h3), textarea, and its own Copy + Regenerate buttons
        4. LinkedIn column also gets: character count (3000 limit) and hashtag pills below the textarea
        5. Substack column: just textarea + buttons (no char count, no hashtags)
        6. Remove all tab switching JS logic (no more `switchTab`, `aria-pressed`, underline animation)
        7. On modal open, generate BOTH platforms simultaneously (two parallel API calls to `/api/generate-syndication-draft`)
        8. On mobile (<768px), stack columns vertically instead of side-by-side
      - **Test:** `npm run build` passes. Modal shows two columns on desktop, stacked on mobile.
      - **Commit:** `refactor: Convert syndication modal to side-by-side layout`

- [x] **Reposition link preview card**
      - **What:** Move the OG link preview card from its current overlapping position to a small thumbnail below the LinkedIn textarea
      - **Why:** Currently overlays the textarea content, blocking text
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Move the `.link-preview-card` HTML to sit below the LinkedIn textarea (inside the LinkedIn column)
        2. Resize: max-width 250px, image max-height 100px
        3. Keep title and URL display but make them smaller (0.75rem)
        4. Remove the description from the preview card (just image + title + URL)
        5. Ensure it doesn't push the layout — sits inline below the textarea
      - **Test:** `npm run build` passes. Link preview shows as a compact card below the LinkedIn textarea.
      - **Commit:** `refactor: Reposition link preview card below LinkedIn textarea`

- [x] **Simplify OG image to title only**
      - **What:** Update the default OG image to show only the post title. Remove "David Larpent", "Essays on AI, Philosophy, Product", the Bauhaus crosses, and "DAVIDLARPENT.COM"
      - **Why:** The current image is too busy and the branding is redundant — the URL already tells people who wrote it
      - **File(s):** Look for the OG image generation source. If it's a static file (`public/og-default.jpg`), this may need a dynamic approach or a new static template. Check if there's an OG image API endpoint or if it uses something like `@vercel/og` or Satori.
      - **Implementation:**
        1. Investigate how the OG image is currently generated/created
        2. If static: create a cleaner static template with just a plain dark background and post title in Newsreader font (centered, large)
        3. If there's infrastructure for dynamic generation: simplify the template to title-only
        4. The link preview card in the modal should reflect whatever image the post will actually use
      - **Note:** If dynamic OG image generation requires significant new infrastructure (Satori, Canvas, etc.), create a simple improved static fallback and document what a dynamic solution would look like. Don't over-engineer.
      - **Test:** `npm run build` passes. OG meta tag still present and pointing to a valid image.
      - **Commit:** `refactor: Simplify OG image to title only`

- [x] **Style fixes: blue Copy button, Regenerate label**
      - **What:** Make the Copy button blue (`#6ba4ff` or `var(--color-link)`). Rename "Regenerate" to "Rewrite" for clarity.
      - **Why:** Copy is the primary action and should look like it. "Regenerate" is ambiguous — "Rewrite" makes it clear the AI will produce a new draft.
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Update `.syndication-copy-button` background to `#6ba4ff`, hover to `#5a93ee`
        2. Rename "Regenerate" button text to "Rewrite" in the HTML
        3. Each column gets its own Copy and Rewrite buttons (from the side-by-side task)
      - **Test:** `npm run build` passes.
      - **Commit:** `fix: Blue copy button, rename Regenerate to Rewrite`

- [x] **Test: Syndication modal redesign**
      - **Blocked By:** All implementation tasks above (must be [x])
      - **Test File:** tests/syndication.spec.ts (update existing)
      - **Current Test Count:** Run `npm test` to get current count
      - **Expected Test Count:** Update existing tests to match new layout, +2 new tests

      - **Tests to Update/Add:**
        1. Update existing tab tests to verify side-by-side columns instead of tabs
        2. Both LinkedIn and Substack textareas visible simultaneously
        3. Link preview card appears below LinkedIn textarea (not overlapping)
        4. Copy button has blue background styling
        5. Each column has its own Copy and Rewrite buttons
        6. On mobile viewport, columns stack vertically

      - **Verification Checklist:**
        - [ ] Run `npm test` - all tests pass
        - [ ] No test failures related to removed tab navigation
        - [ ] New layout tests pass on both Desktop and Mobile viewports

      - **Files:** tests/syndication.spec.ts
      - **Commit:** `test: Update syndication tests for side-by-side layout`

---

### Completed: Draft Management

- [x] **Add draft/published pill toggle to post detail view**
- [x] **Add git-push API endpoint**
- [x] **Convert settings modal to slide-out panel**
- [x] **Delete the /drafts page**
- [x] **Update Architecture Decisions in CLAUDE.md**
- [x] **Test: Draft pill toggle and slide-out panel**

### Completed: Syndication Modal (original build)

- [x] **Create SyndicationModal component**
      - **What:** Build a full-screen takeover modal with LinkedIn and Substack tabs, textareas, character count, and copy functionality
      - **Why:** Replaces the current one-click clipboard copy with an editable preview workflow -- the author can see and refine what gets syndicated before copying
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Create `src/components/SyndicationModal.astro` with this structure:
           - Outer container: `#syndication-modal.syndication-modal` with `data-open="false"`
           - Backdrop: `.syndication-modal-backdrop` (full-screen, semi-transparent black)
           - Content panel: `.syndication-modal-content` (position: fixed, inset: 0, z-index: 300, background: var(--color-background), display: flex, flex-direction: column)
           - Header bar: close button (top-right, X icon), title "Syndicate"
           - Tab row: two tab buttons `.syndication-tab-button[data-tab="linkedin"]` and `[data-tab="substack"]` -- style like the homepage tab-navigation pattern (underline on active)
           - Tab panels (show/hide based on active tab):
             - **LinkedIn panel:** `<textarea class="syndication-textarea" data-platform="linkedin">` with `.char-count` below it showing `{current}/{3000}` -- highlight red when over 3000. Below textarea: a `.syndication-copy-button` button labelled "Copy"
             - **Substack panel:** `<textarea class="syndication-textarea" data-platform="substack">` (no char limit). Below: a `.syndication-copy-button` button labelled "Copy"
           - Status message area: `.syndication-status` for "Copied!" feedback
        2. Script block in the component handles:
           - Tab switching (show/hide panels, update active tab styles)
           - Character count live update on LinkedIn textarea input
           - Copy button: `navigator.clipboard.writeText(textarea.value)`, show "Copied!" status, clear after 2 seconds
           - Close on backdrop click, close button click, Escape key
           - Expose a global `window.openSyndicationModal(data)` function that accepts `{ slug, title, description, tags, category, platform, linkedinText, substackText }` -- sets `data-open="true"`, switches to the requested platform tab, and populates textareas
        3. In `global.css`, add styles for all `.syndication-modal*` classes:
           - Full-screen overlay: position fixed, inset 0, z-index 300
           - Content fills viewport with padding (2rem on desktop, 1rem on mobile)
           - Textarea: width 100%, flex-grow 1, min-height 300px, font-family inherit, font-size 1rem, background var(--color-code-bg), color var(--color-text), border 1px solid var(--color-border), resize vertical
           - Char count: font-size 0.8rem, color var(--color-text-light). When `.over-limit`: color #f87171 (red)
           - Tab buttons: same pattern as `.tab-button` from homepage but scoped to `.syndication-modal`
           - Copy button: same style as `.submit-button` from settings modal
           - Open/close via `data-open` attribute (opacity + pointer-events pattern)
      - **Test:** `npm run build` passes. Component renders without errors.
      - **Commit:** `feat: Create SyndicationModal component`

- [x] **Add link preview card to syndication modal**
      - **What:** Show an OG-style link preview card inside the syndication modal so the author can see how their link will appear when shared
      - **Why:** LinkedIn and Substack both render link previews -- seeing it in the modal gives the author a complete picture of what their syndicated post will look like
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. In SyndicationModal.astro, add a `.link-preview-card` div below each textarea (shared across both tabs, rendered once):
           - `.link-preview-image` -- `<img>` tag, src set from post og:image (fallback: `/og-default.jpg`)
           - `.link-preview-title` -- post title
           - `.link-preview-description` -- post description (truncated to ~120 chars with ellipsis)
           - `.link-preview-url` -- `davidlarpent.com` in muted text
        2. The `window.openSyndicationModal(data)` function already receives title, description, slug -- use those to populate the preview card. Add `ogImage` to the data interface (optional, fallback to `/og-default.jpg`).
        3. In `global.css`, add `.link-preview-card` styles:
           - Border: 1px solid var(--color-border), border-radius: 8px, overflow: hidden, max-width: 500px, margin-top: 1rem
           - Image: width 100%, max-height 200px, object-fit cover
           - Text area: padding 0.75rem
           - Title: font-weight 600, font-size 0.95rem, one line with text-overflow ellipsis
           - Description: font-size 0.85rem, color var(--color-text-light), max 2 lines
           - URL: font-size 0.75rem, color var(--color-text-light), uppercase
      - **Test:** `npm run build` passes. Preview card is visible when modal opens.
      - **Commit:** `feat: Add link preview card to syndication modal`

- [x] **Add editable hashtag pills to LinkedIn tab**
      - **What:** Show the post's tags as removable hashtag pills below the LinkedIn textarea, with an input to add custom hashtags, included in copied text
      - **Why:** LinkedIn posts perform better with relevant hashtags. Editable pills replace the hardcoded `#AI #ProductThinking`
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. In SyndicationModal.astro, add a `.hashtag-pills` container below the LinkedIn textarea (above the link preview card):
           - Render initial pills from the post's `tags` array, prefixed with `#`
           - Each pill: `.hashtag-pill` span with text and `.hashtag-remove` button (X)
           - After pills: `<input class="hashtag-input" placeholder="Add hashtag...">` -- on Enter, adds new pill (auto-prepends #, lowercases, strips spaces)
        2. Update the copy button logic for LinkedIn:
           - Append a blank line then all hashtag pills as space-separated `#tag` strings
        3. The `window.openSyndicationModal(data)` function populates initial pills from `data.tags`
        4. In `global.css`, add `.hashtag-pill` and `.hashtag-pills` styles:
           - Pills: inline-flex, border-radius 2rem, padding 0.2em 0.6em, font-size 0.8rem, background var(--color-code-bg), border 1px solid var(--color-border)
           - Remove button: background none, border none, cursor pointer, opacity 0.6 hover 1
           - Container: flex-wrap, gap 0.5rem, margin-top 0.75rem
           - Input: dashed border, transparent bg, border-radius 2rem, width 120px
      - **Test:** `npm run build` passes. Pills render from post tags.
      - **Commit:** `feat: Add editable hashtag pills to LinkedIn tab`

- [x] **Wire syndication buttons to open modal**
      - **What:** Replace the current direct-to-clipboard syndication buttons in Post.astro with buttons that open the SyndicationModal, pre-populated with content
      - **Why:** Connects the existing UI (buttons in edit-controls) to the new modal, maintaining feature parity while adding the editing step
      - **File(s):** `src/layouts/Post.astro`
      - **Implementation:**
        1. In Post.astro, import and render the SyndicationModal component alongside other dev-mode components
        2. Pass post metadata as data attributes: slug, title, description, tags, category, ogImage
        3. Replace the LinkedIn button click handler with:
           - Build naive excerpt (title + first 3 paragraphs + link)
           - Call `window.openSyndicationModal({ slug, title, description, tags, category, platform: 'linkedin', linkedinText, substackText: '' })`
        4. Replace the Substack button click handler with:
           - Fetch markdown via `/api/get-post-markdown`
           - Call `window.openSyndicationModal({ ..., platform: 'substack', substackText, linkedinText: '' })`
        5. Remove the old direct-copy `showStatus('Copied for LinkedIn!')` and `showStatus('Copied for Substack!')` logic entirely
      - **Test:** `npm run build` passes. Clicking LinkedIn/Substack buttons opens the modal.
      - **Commit:** `feat: Wire syndication buttons to open modal`

- [x] **Clean up old syndication stubs**
      - **What:** Delete the empty syndication script stubs and their npm script entries
      - **Why:** These were placeholder files for a direct-API approach we're not pursuing. The modal replaces them.
      - **File(s):** `scripts/syndicate-linkedin.ts` (delete), `scripts/syndicate-substack.ts` (delete), `package.json`
      - **Implementation:**
        1. Delete `scripts/syndicate-linkedin.ts`
        2. Delete `scripts/syndicate-substack.ts`
        3. In `package.json`, remove `"syndicate:substack"` and `"syndicate:linkedin"` script entries
        4. Search codebase for any remaining references and remove them
      - **Test:** `npm run build` passes. `ls scripts/syndicate*` returns nothing.
      - **Commit:** `refactor: Remove empty syndication script stubs`

- [x] **Test: Phase 1 syndication modal**
      - **Blocked By:** All Phase 1 implementation tasks above (must be [x])
      - **Test File:** tests/syndication.spec.ts (update existing)
      - **Current Test Count:** Run `npm test` to get current count before starting
      - **Expected Test Count:** Current + net change from rewriting 5 existing tests and adding 5 new ones (12 unique syndication tests total)

      - **Tests to Update (rewrite existing):**
        1. `LinkedIn copy button exists in dev mode` --> `LinkedIn button opens syndication modal`
        2. `LinkedIn copy generates correct format` --> `LinkedIn tab shows pre-populated excerpt with title and paragraphs`
        3. `Substack copy button exists in dev mode` --> `Substack button opens syndication modal on Substack tab`
        4. `Substack copy generates full markdown with footer` --> `Substack tab shows raw markdown with canonical footer`
        5. `buttons are visible and properly styled` --> `syndication modal has correct layout (full-screen, tabs, textarea, copy button)`

      - **Tests to Keep As-Is:**
        6. `get-post-markdown API returns markdown` (unchanged)
        7. `get-post-markdown API requires slug` (unchanged)

      - **Tests to Add (new):**
        8. `LinkedIn tab shows character count that highlights when over 3000`
        9. `Link preview card shows post title and description`
        10. `Hashtag pills render from post tags and are removable`
        11. `Copy button copies textarea content to clipboard and shows status`
        12. `Modal closes on Escape key and close button`

      - **Verification Checklist:**
        - [ ] File tests/syndication.spec.ts updated
        - [ ] Run `npm test` -- all tests pass
        - [ ] All 12 test scenarios implemented
        - [ ] Old direct-copy test assertions removed

      - **Files:** tests/syndication.spec.ts
      - **Commit:** `test: Update syndication tests for modal workflow`

### Phase 2: AI Draft Generation

> **Note:** Phase 2 tasks are blocked by Phase 1 completion. Do not start these until all Phase 1 tasks (including the test task) are marked [x].

- [x] **Install Anthropic SDK and document setup**
      - **What:** Add `@anthropic-ai/sdk` as a dependency and document the ANTHROPIC_API_KEY requirement
      - **Why:** The AI draft generation feature needs the official Anthropic SDK to call Claude
      - **File(s):** `package.json`, `CLAUDE.md`
      - **Implementation:**
        1. Run `npm install @anthropic-ai/sdk`
        2. In CLAUDE.md Architecture Decisions, add: `**Syndication AI:** Uses @anthropic-ai/sdk to generate platform-specific drafts (dev-mode only). Requires ANTHROPIC_API_KEY environment variable.`
        3. In Decision Log, add: `| 2026-02-06 | Anthropic SDK for syndication AI | Dev-only draft generation, graceful fallback to template |`
      - **Test:** `npm run build` passes. `node -e "require('@anthropic-ai/sdk')"` does not error.
      - **Commit:** `feat: Install Anthropic SDK for syndication AI`

- [x] **Create syndication draft API endpoint**
      - **What:** Build a dev-only API endpoint that calls Claude to generate a platform-specific syndication draft in the author's voice
      - **Why:** Replaces the naive excerpt with an intelligent, voice-aware draft tailored to each platform's conventions and constraints
      - **File(s):** `src/pages/api/generate-syndication-draft.ts`
      - **Implementation:**
        1. Create `src/pages/api/generate-syndication-draft.ts`:
           - `export const prerender = false;`
           - Dev-mode guard: return 403 if `!import.meta.env.DEV`
           - Accept POST with JSON body: `{ slug: string, platform: 'linkedin' | 'substack' }`
           - Validate: slug required (400), platform must be valid (400), ANTHROPIC_API_KEY must exist (500)
        2. Read post markdown using same filesystem approach as `get-post-markdown.ts`, parse frontmatter with gray-matter
        3. Construct platform-specific prompt:
           - **LinkedIn:** Generate a compelling hook post (<3000 chars). First ~210 chars critical (LinkedIn truncates before "see more"). Tease the key insight, don't give it all away. Natural CTA. Author voice: witty, wry, British humour, first-person, no em dashes, no corporate filler, no exclamation marks, no emojis. Suggest 3-5 relevant hashtags. Return JSON: `{ "draft": "...", "hashtags": ["..."] }`
           - **Substack:** Generate 2-3 paragraph editorial intro that contextualises the essay for newsletter subscribers, adds personal framing, transitions naturally into the full essay. Same voice rules. Include full essay below intro with canonical footer. Return JSON: `{ "draft": "...", "hashtags": [] }`
        4. Call Anthropic Messages API with claude-sonnet model, max_tokens 4096
        5. Parse JSON from response (handle markdown code fence wrapping)
        6. Return `{ success: true, draft, hashtags }` or `{ success: false, message }` on error
      - **Test:** `npm run build` passes. Endpoint returns 403 in production. Returns 400 without slug.
      - **Commit:** `feat: Create syndication draft API endpoint`

- [x] **Wire modal to AI endpoint**
      - **What:** When the syndication modal opens, call the AI endpoint to generate a draft, with loading state, error fallback, and regenerate button
      - **Why:** Connects the UI to the AI backend -- the author sees an AI-generated draft instead of a naive excerpt
      - **File(s):** `src/components/SyndicationModal.astro`, `src/styles/global.css`
      - **Implementation:**
        1. Update `window.openSyndicationModal(data)` to:
           - Show loading state: set textarea value to "Generating draft...", add `.loading` class (opacity 0.5, cursor wait)
           - Call `POST /api/generate-syndication-draft` with `{ slug, platform }`
           - On success: populate textarea with `response.draft`, update hashtag pills with `response.hashtags`, remove `.loading`
           - On failure: fall back to naive template text, show "AI generation failed, using template" in `.syndication-status`
        2. Add "Regenerate" button (`.syndication-regenerate`) next to Copy:
           - On click: repeat the API call with same loading/fallback behavior
           - Disable while request in flight
        3. In `global.css`: `.syndication-textarea.loading` opacity 0.5; `.syndication-regenerate` secondary button style; `:disabled` opacity 0.5 cursor not-allowed
        4. When switching tabs, if other tab's textarea is empty, trigger generation for that platform too
      - **Test:** `npm run build` passes. Modal shows loading state. Falls back to template on failure.
      - **Commit:** `feat: Wire syndication modal to AI draft endpoint`

- [x] **Test: Phase 2 AI integration**
      - **Blocked By:** All Phase 2 implementation tasks above (must be [x])
      - **Test File:** tests/syndication.spec.ts (update)
      - **Current Test Count:** Run `npm test` to get current count before starting
      - **Expected Test Count:** Current + 4 new unique tests (x browser configs)

      - **Tests to Add:**
        1. `Modal shows loading state when generating draft` -- use `page.route()` to intercept and delay API response
        2. `Modal falls back to template on API failure` -- use `page.route()` to mock 500 response, verify template text and error message
        3. `Regenerate button triggers new API call` -- use `page.route()` to intercept, click regenerate, verify second request
        4. `AI-generated draft is editable in textarea` -- use `page.route()` to mock success with known text, verify textarea value, type additional text, verify change

      - **Verification Checklist:**
        - [ ] File tests/syndication.spec.ts updated with 4 new tests
        - [ ] Run `npm test` -- all tests pass
        - [ ] All 4 test scenarios use `page.route()` to mock API (no real Anthropic API calls)

      - **Files:** tests/syndication.spec.ts
      - **Commit:** `test: Add Phase 2 AI integration tests`

### Housekeeping

- [x] **Update Architecture Decisions and Decision Log**
      - **What:** Document the syndication modal architecture and AI integration decisions
      - **Why:** Future sessions need to understand why syndication works this way
      - **File(s):** `CLAUDE.md`
      - **Implementation:**
        1. In Architecture Decisions, update syndication bullet to: `**Syndication:** Full-screen modal with LinkedIn and Substack tabs. Dev-mode only. Editable preview with hashtag pills and link preview card. AI-generated drafts via Anthropic SDK (dev-only endpoint). Falls back to naive template if AI unavailable.`
        2. In Decision Log, add:
           - `| 2026-02-06 | Syndication modal replaces direct clipboard copy | Editable preview, link card, hashtag pills, AI drafts |`
           - `| 2026-02-06 | Two-phase syndication rollout | Phase 1 modal UX, Phase 2 AI generation |`
        3. In Completed Work, update syndication line to: `Syndication workflow (full-screen modal, LinkedIn/Substack tabs, AI drafts, hashtag pills, link preview)`
      - **Commit:** `docs: Update architecture decisions for syndication redesign`

---

## Completed Work (see ARCHIVE.md for details)

- Homepage tabs (Not work / Work categories with animated underline)
- SEO: JSON-LD, Open Graph, robots.txt, sitemap, RSS feed, meta tags
- Inline editing system (title, description, content, slide-out settings panel)
- WYSIWYG toolbar (bold, italic, link, headings)
- Syndication workflow (full-screen modal, side-by-side columns, AI drafts, hashtag pills, link preview, blue Copy)
- Table of Contents (desktop sidebar, mobile overlay, scroll tracking)
- Tag system with cross-linking and tag pages
- Draft system (pill toggle on post detail, dev-only, auto-push on publish)
- Theme toggle (Bauhaus logo, dark/light mode)
- Google Analytics (production only)
- About page (editable in dev mode)
- Git-push API endpoint (dev-only)
- Source notes system (Input tab, source detail pages, note parsing, add/delete/publish notes)
- Source inline editing (metadata + note content, archive toggle, save-source API)
- Newsletter subscription (Buttondown API, inline footer + icon variant in post share controls)
- Podcast bookmark (iOS Shortcut → production API, Spotify + GitHub integration)
- 288+ Playwright tests across 8 test files

---

## Process Rules

- Implementation and testing are SEPARATE tasks with SEPARATE checkboxes
- Every test task specifies: current test count, expected test count, delta
- Cannot mark [x] without running `npm test` and verifying count
- If you want Ralph to do something, make it a separate task with observable success criteria

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
- **Google Analytics:** Added (G-M2Q4Q201KD), production only. Consider Plausible later.
- **No comments:** Intentional. Not a community, just essays.
- **Content editing:** Title/description editable inline in dev. Content editable but footnotes locked (non-editable) to prevent corruption. Draft/published status toggled via pill on post detail view.
- **Draft management:** Pill toggle on post detail view (dev only). Publishing sets date to today and git pushes. No separate /drafts page.
- **TOC:** Always visible on desktop (>1200px). Toggle overlay on mobile/tablet.
- **Tabs:** Homepage splits content into Output (posts) and Input (sources) tabs.
- **Syndication:** Full-screen modal with side-by-side LinkedIn/Substack columns. Dev-mode only. Both AI drafts generated in parallel on open. Editable preview with hashtag pills, compact link preview card (LinkedIn only), blue Copy button. Falls back to naive template if AI unavailable. Columns stack vertically on mobile.
- **Image Generation:** Uses @google/genai with gemini-3-pro-image-preview (Nano Banana Pro) for inline sketch illustrations. Dev-mode only. Requires GOOGLE_AI_API_KEY.
- **Scroll Reveal:** Uses GSAP + ScrollTrigger for scroll-scrubbed sketch illustration materialisation. Production dependency. Desktop uses scrub, mobile uses IntersectionObserver with timed animation.
- **Source editing:** Source metadata (title, author, type, link, date, tags) editable inline in dev mode. Note content editable with blur-to-save. Archive toggle hides sources from production listings. API endpoint: `/api/save-source` (metadata, note content, and archive toggle modes). `/api/update-note` handles note publish toggle and delete.
- **Newsletter:** Buttondown API for email subscriptions. `NewsletterSignup.astro` component (3 variants: card, inline, icon). API endpoint: `/api/subscribe` with rate limiting. Requires `BUTTONDOWN_API_KEY` env var. Inline variant in site footer (Base.astro), icon variant in post share controls (Post.astro).
- **Podcast Bookmarking:** iOS Shortcut → POST /api/bookmark-podcast (production, Bearer token auth). Spotify Web API gets currently-playing episode. GitHub REST API creates/updates source files (Vercel has no persistent filesystem). Requires SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, GITHUB_TOKEN, GITHUB_REPO, BOOKMARK_SECRET.

---

## iOS Shortcut: Bookmark Podcast

Setup steps for the single-tap iOS Shortcut that bookmarks the currently-playing Spotify podcast episode.

### Prerequisites
1. Run `npm run spotify:auth` to get a Spotify refresh token
2. Set all env vars in Vercel: `BOOKMARK_SECRET`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`

### Shortcut Steps
1. **Ask for Input** (optional) — type: Text, prompt: "Quick note? (leave blank to skip)"
2. **Get Contents of URL** — method: POST, URL: `https://davidlarpent.com/api/bookmark-podcast`
   - Header: `Authorization: Bearer {your BOOKMARK_SECRET value}`
   - Header: `Content-Type: application/json`
   - Request Body (JSON): `{ "note": "{input from step 1}" }`
3. **Get Dictionary Value** — key: `episode` from step 2 result
4. **If** `episode` has any value:
   - **Show Notification** — title: "Bookmarked", body: `{episode}`
5. **Otherwise:**
   - **Get Dictionary Value** — key: `message` from step 2 result
   - **Show Notification** — title: "Bookmark failed", body: `{message}`

### Testing Locally
```bash
# Play a podcast on Spotify, then:
curl -X POST http://localhost:4321/api/bookmark-podcast \
  -H "Authorization: Bearer {your BOOKMARK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"note":"test bookmark"}'
```

---

## Lessons Learned

1. **Ralph skips tests unless they are separate tasks.** Always create a dedicated test task with expected test counts. Never embed test requirements inside an implementation task.
2. **Test user behavior, not implementation.** Bad: `expect(button).not.toBeVisible()`. Good: verify the user can complete the full interaction cycle.
3. **Ralph marks tasks complete prematurely.** The post-completion audit step exists because of this. Enforce it.

---

## Decision Log

| Date | Decision | Outcome |
|------|----------|---------|
| 2026-01-30 | TOC uses fixed viewport positioning | Content width maintained, 72 tests pass |
| 2026-01-30 | Added Playwright for testing | 95+ tests, catches regressions |
| 2026-01-30 | TOC always-visible on desktop | Eliminated toggle overlap bugs |
| 2026-02-02 | Split test tasks from implementation | Ralph no longer skips tests |
| 2026-02-06 | Draft pill toggle replaces /drafts page | Publishing from post detail view with auto-push |
| 2026-02-06 | Anthropic SDK for syndication AI | Dev-only draft generation, graceful fallback to template |
| 2026-02-06 | Syndication modal replaces direct clipboard copy | Editable preview, link card, hashtag pills, AI drafts |
| 2026-02-06 | Two-phase syndication rollout | Phase 1 modal UX, Phase 2 AI generation |
| 2026-02-07 | GSAP for scroll-scrubbed image reveal | Production reader-facing effect, scrub on desktop, IntersectionObserver on mobile |
| 2026-02-26 | Inline editing for sources | Metadata + note content editable in dev, archived field for hiding from prod |
| 2026-02-26 | Podcast bookmark via iOS Shortcut | Production endpoint, Spotify + GitHub APIs, Bearer token auth |

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
  content/sources/  # Source notes (books, articles, papers, podcasts)
  components/       # Astro components (NewsletterSignup, SyndicationModal, etc.)
  pages/            # Astro pages (index, about, sources)
  layouts/          # Base.astro, Post.astro
  styles/           # global.css
  lib/              # Shared utilities (parse-notes.ts)
public/             # Static assets
scripts/            # Publish/new-post tooling
tests/              # Playwright tests
```

### Key Files
- `src/styles/global.css` - All styling lives here
- `src/layouts/Base.astro` - Site shell, header, theme toggle
- `src/content/config.ts` - Post and source schema definitions
- `astro.config.mjs` - Astro config, Vercel adapter
- `playwright.config.ts` - Test configuration

### Things Not To Touch
- `src/content/posts/*.md` - Don't modify existing essays
- `.vercel/` - Deployment config

---

## Notes From Human

This is a learning exercise for Ralph loops. The tasks are real but low-stakes. Don't overthink it.
