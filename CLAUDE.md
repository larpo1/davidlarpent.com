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
