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

### Phase 1: Syndication Modal UX (no AI)

- [ ] **Create SyndicationModal component**
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

- [ ] **Add link preview card to syndication modal**
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

- [ ] **Add editable hashtag pills to LinkedIn tab**
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

- [ ] **Wire syndication buttons to open modal**
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

- [ ] **Clean up old syndication stubs**
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

- [ ] **Test: Phase 1 syndication modal**
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

- [ ] **Install Anthropic SDK and document setup**
      - **What:** Add `@anthropic-ai/sdk` as a dependency and document the ANTHROPIC_API_KEY requirement
      - **Why:** The AI draft generation feature needs the official Anthropic SDK to call Claude
      - **File(s):** `package.json`, `CLAUDE.md`
      - **Implementation:**
        1. Run `npm install @anthropic-ai/sdk`
        2. In CLAUDE.md Architecture Decisions, add: `**Syndication AI:** Uses @anthropic-ai/sdk to generate platform-specific drafts (dev-mode only). Requires ANTHROPIC_API_KEY environment variable.`
        3. In Decision Log, add: `| 2026-02-06 | Anthropic SDK for syndication AI | Dev-only draft generation, graceful fallback to template |`
      - **Test:** `npm run build` passes. `node -e "require('@anthropic-ai/sdk')"` does not error.
      - **Commit:** `feat: Install Anthropic SDK for syndication AI`

- [ ] **Create syndication draft API endpoint**
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

- [ ] **Wire modal to AI endpoint**
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

- [ ] **Test: Phase 2 AI integration**
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

- [ ] **Update Architecture Decisions and Decision Log**
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
- Syndication buttons (LinkedIn copy, Substack copy with API)
- Table of Contents (desktop sidebar, mobile overlay, scroll tracking)
- Tag system with cross-linking and tag pages
- Draft system (pill toggle on post detail, dev-only, auto-push on publish)
- Theme toggle (Bauhaus logo, dark/light mode)
- Google Analytics (production only)
- About page (editable in dev mode)
- Git-push API endpoint (dev-only)
- 95+ Playwright tests across 6 test files

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
- **Tabs:** Homepage splits posts into "Work" (default) and "Not work" categories.

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
