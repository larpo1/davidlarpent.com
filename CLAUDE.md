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

## Completed

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

## Decision Log

### 2026-01-30: TOC Positioning
**Issue:** TOC needed to work on desktop sidebar and mobile overlay
**Solution:** Used sticky positioning with flex layout, responsive breakpoints at 1024px
**Outcome:** 72 Playwright tests pass including overlap detection
**Lesson:** Let automated tests validate CSS behavior rather than manual inspection

### 2026-01-30: Playwright Integration
**Why:** Need automated testing to catch TOC positioning issues
**Trade-offs:** Adds ~3MB to dev dependencies, requires browser downloads
**Outcome:** Comprehensive test coverage for TOC functional and visual behavior

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
