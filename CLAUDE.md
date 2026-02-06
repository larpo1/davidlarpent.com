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

No active tasks. Waiting for PM to define next sprint.

---

## Completed Work (see ARCHIVE.md for details)

- Homepage tabs (Not work / Work categories with animated underline)
- SEO: JSON-LD, Open Graph, robots.txt, sitemap, RSS feed, meta tags
- Inline editing system (title, description, content, settings modal)
- WYSIWYG toolbar (bold, italic, link, headings)
- Syndication buttons (LinkedIn copy, Substack copy with API)
- Table of Contents (desktop sidebar, mobile overlay, scroll tracking)
- Tag system with cross-linking and tag pages
- Draft system (dev-only toggle, draft badges)
- Theme toggle (Bauhaus logo, dark/light mode)
- Google Analytics (production only)
- About page (editable in dev mode)
- 95+ Playwright tests across 5 test files

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
- **Content editing:** Title/description editable inline in dev. Content editable but footnotes locked (non-editable) to prevent corruption.
- **TOC:** Always visible on desktop (>1200px). Toggle overlay on mobile/tablet.
- **Tabs:** Homepage splits posts into "Not work" (default) and "Work" categories.

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
