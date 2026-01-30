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
6. Commit with a clear message: `feat: [what you did]`
7. Mark the task complete in this file
8. Move to next task

---

## Current Tasks

### Priority: Fix TOC Positioning Bug

- [ ] **REVERT and fix TOC positioning correctly** ⚠️ REQUIRED
      - **Issue with previous attempt:** Content too narrow because TOC/content share flex container
      - **Correct approach:** TOC should be OUTSIDE content flow, positioned to viewport
      - File: `src/styles/global.css`
      - Required changes:
        1. **Remove/revert `.post-layout` flexbox container** - content should use normal `.container`
        2. **TOC positioning:** Use `position: fixed` to viewport (not sticky in document flow)
        3. **TOC placement:** Position in left margin area, left of centered content
        4. **Left calculation:** Place TOC so it sits left of content without overlap
           - Simple approach: `left: max(1rem, calc(50% - 700px/2 - 280px))`
           - This puts TOC 280px to the left of content edge
        5. **Content:** Keep in normal `.container` (max-width: 700px, centered)
        6. **Responsive:** Hide TOC on smaller screens (under 1200px viewport)
        7. **Mobile:** Keep existing overlay behavior
      - **Reference:** See darioamodei.com - TOC at top-left viewport, content full-width centered
      - Test: Desktop shows TOC in left margin, content stays centered at 700px width
      - Commit: `fix: Position TOC outside content flow to maintain content width`

### Priority: Add Automated Testing

- [ ] **Install Playwright**
      - Run: `npm install -D @playwright/test`
      - Run: `npx playwright install`
      - Add scripts to package.json:
        - `"test": "playwright test"`
        - `"test:headed": "playwright test --headed"`
        - `"test:ui": "playwright test --ui"`
        - `"test:update": "playwright test --update-snapshots"`
      - Commit: `chore: Add Playwright testing framework`

- [ ] **Create Playwright config**
      - Create: `playwright.config.ts`
      - Configure: 4 projects (Desktop Chrome, Desktop Firefox, Tablet, Mobile)
      - Set baseURL to http://localhost:4321
      - Add webServer config to auto-start dev server
      - Commit: `chore: Configure Playwright with multi-device testing`

- [ ] **Create TOC functional tests**
      - Create: `tests/toc.spec.ts`
      - Test cases:
        - TOC visible on desktop
        - TOC contains correct heading links
        - Clicking TOC link scrolls to section
        - Active section highlighting works
        - Toggle button opens/closes TOC
        - Mobile: TOC opens as overlay
        - Mobile: Clicking link closes TOC
        - State persists across reload
      - Commit: `test: Add comprehensive TOC functional tests`

- [ ] **Create visual regression tests**
      - Create: `tests/visual.spec.ts`
      - Test cases:
        - Desktop with TOC open/closed (screenshots)
        - Tablet layout (screenshot)
        - Mobile layout and overlay (screenshots)
        - Light theme (screenshot)
        - Bounding box test to verify no overlap
      - Commit: `test: Add visual regression tests with overlap detection`

- [ ] **Run tests and generate baseline screenshots**
      - Run: `npm test`
      - This will generate initial baseline screenshots
      - Review screenshots to ensure they look correct
      - If tests fail, debug and fix before proceeding
      - Commit: `test: Add baseline screenshots for visual regression`

- [ ] **Create testing documentation**
      - Create: `tests/README.md`
      - Document:
        - How to run tests
        - Test structure overview
        - When tests run
        - How to interpret results
        - Troubleshooting guide
      - Commit: `docs: Add testing guide for Playwright`

### Priority: Update Workflow

- [ ] **Update CLAUDE.md with testing requirements**
      - Update "How to Work" section: Add step to run `npm test` after completing tasks
      - Add new "Testing Standards" section with:
        - When to run tests (always after UI/visual tasks)
        - What to do if tests fail
        - Test expectations
      - Add Decision Log section with entries:
        - TOC positioning fix decision (date, issue, solution, lesson)
        - Playwright integration decision (date, why, trade-offs)
      - Commit: `docs: Add testing requirements to ralph loop workflow`

### Lower Priority

- [ ] Add footnote styling to global.css:
      - Superscript footnote numbers in text (subtle, smaller)
      - Footnote section at bottom styled nicely
      - Footnote text slightly smaller, muted color (--color-text-light)
      - Match the minimal aesthetic of the site

## PM Review Notes

### 2026-01-30: TOC Positioning Fix Review - REVISION REQUIRED ⚠️

**Tasks #1-2 - APPROVAL REVOKED**

**Problem Identified:**
- Current implementation makes content TOO NARROW
- Root cause: TOC and content are siblings in `.post-layout` flex container (max-width: 1100px)
- This makes them **share** the available space, squeezing the content
- Content is now cramped, not full-width

**Correct Approach (per Dario's site):**
- TOC should be **outside** the content flow entirely
- Content stays in normal container (700px, centered)
- TOC positioned independently to viewport (top-left), doesn't interfere with content
- They do NOT share a flex container

**What Needs to Change:**
1. Content should stay in normal `.container` (not `.post-layout` flex)
2. TOC should use `position: fixed` to viewport, positioned in left margin area
3. TOC calculation should place it left of content, not competing with it
4. On desktop: TOC visible in left margin, content unaffected
5. On tablet/mobile: Keep current overlay behavior

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
```

### Key Files
- `src/styles/global.css` - All styling lives here
- `src/layouts/Base.astro` - Site shell, header, theme toggle
- `src/content/config.ts` - Post schema definition
- `astro.config.mjs` - Astro config, Vercel adapter

### Things Not To Touch
- `src/content/posts/*.md` - Don't modify existing essays
- `.vercel/` - Deployment config

---

## Content for Tasks

### About Page Bio

```
I'm David Larpent, Chief Product Officer at Lavanda, a property technology company.

I write about product strategy, AI, and the intersection of technology with how we actually live and work. Sometimes I paint. Occasionally I make music, badly.

Previously: [add if relevant]

Find me on LinkedIn or don't. I'm not precious about it.
```

### Header About Link

Add a simple text link "About" to the right of the site title, before the theme toggle. Style it subtle (use --color-text-light). No underline unless hovered.

---

## Notes From Human

This is a learning exercise for Ralph loops. The tasks are real but low-stakes. Don't overthink it.
