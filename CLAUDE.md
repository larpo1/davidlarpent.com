# CLAUDE.md - davidlarpent.com

## Project

Personal essay site. Content-first, minimal. Built with Astro, TypeScript, deployed on Vercel.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Astro (SSG + SSR hybrid) |
| Language | TypeScript |
| Styling | Global CSS (`src/styles/global.css`) |
| Testing | Playwright (260+ tests, 4 browser configs) |
| Deploy | Vercel |
| AI (dev-only) | Anthropic SDK (syndication drafts), Google GenAI (sketch illustrations) |
| Animation | GSAP + ScrollTrigger (scroll-scrubbed sketch reveal) |

## Project Structure

```
src/
  content/posts/      # Markdown essays
  content/sources/    # Source notes (books, articles, podcasts)
  components/         # Astro components
  pages/              # Astro pages + API routes
  layouts/            # Base.astro, Post.astro
  styles/             # global.css (all styling)
  lib/                # Shared utilities
public/               # Static assets
scripts/              # Publishing tooling
tests/                # Playwright tests (8 files)
```

## Key Conventions

- **Design:** Minimal. Typography is the design. Dark mode default.
- **Font:** Newsreader. Don't change.
- **No comments:** Intentional. Not a community.
- **Content editing:** Inline editing in dev mode (title, description, content, settings panel)
- **Draft system:** Pill toggle on post detail (dev only). Publishing sets date + git pushes.
- **Syndication:** Side-by-side modal (LinkedIn + Substack), AI drafts, dev-only.
- **Sketch illustrations:** Gemini-generated, scroll-scrubbed reveal (GSAP). Desktop: fixed right margin. Mobile: inline with IntersectionObserver.
- **Source notes:** Input tab on homepage, inline editing, note-level tags, podcast bookmarking via iOS Shortcut.
- **Newsletter:** Buttondown API. Inline footer + icon variant in post share controls.

## Verification

Two tiers — light verify keeps the dev server alive:

```bash
npm run verify:light   # Tests only. Run per task. Non-destructive.
npm run verify         # Full build + tests. Run at sprint end only (kills dev server).
```

During active work, use `verify:light`. Only run full `verify` when the sprint is complete.

## Git

- Commit after each completed task: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Push after tests pass: `git push`
- Never commit if `npm run build` fails

## Dev Server

```bash
npm run dev
```

## Key Files

- `src/styles/global.css` — All styling
- `src/layouts/Base.astro` — Site shell, header, theme
- `src/content/config.ts` — Post and source schema
- `astro.config.mjs` — Astro config, Vercel adapter

## Don't Touch

- `src/content/posts/*.md` — Don't modify existing essays
- `.vercel/` — Deployment config

## Documentation

- `.claude/workflow.md` — Development process, Ralph sprint format, test templates, lessons learned
- `.claude/architecture.md` — Architecture decisions, decision log, iOS Shortcut setup
- `.claude/sprint.md` — Current sprint backlog (if active)
- `.claude/archive.md` — Completed work history

## Testing

```bash
npm test              # All tests headless
npm run test:headed   # Visible browser
npm run test:ui       # Interactive UI mode
npm run test:update   # Update baseline screenshots
```

If tests fail: check error + `test-results/` screenshots, fix, re-run.

## Completed Features

Homepage tabs, SEO suite, inline editing, WYSIWYG toolbar, syndication modal (AI drafts), TOC (desktop sidebar + mobile overlay), tag system, draft management, theme toggle, Google Analytics, about page, git-push API, source notes system, source inline editing, newsletter (Buttondown), podcast bookmarking (iOS Shortcut + Spotify + GitHub), sketch illustrations with scroll reveal. 260+ Playwright tests.
