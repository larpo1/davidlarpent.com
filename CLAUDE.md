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

- [ ] **Table of Contents for Essays** - Implement TOC sidebar like darioamodei.com
  - [ ] Create TableOfContents.astro component
  - [ ] Integrate into Post.astro layout
  - [ ] Add responsive styles (desktop sidebar, mobile overlay)
  - [ ] Add scroll tracking and active highlighting
  - [ ] Hamburger menu to open/close, open by default
- [ ] **Add Favicon** - Copy from field-notes project
  - Source: `/Users/larpo/Downloads/field-notes/public/static/favicons/favicon.ico`
  - Destination: `public/favicon.ico`

## Completed

- [x] Initial site setup
- [x] First essay: What We Lose When We Stop Struggling
- [x] Second essay: Ralph loops
- [x] Update About page with real bio
- [x] Add subtle "About" link to header
- [x] Fix syntax highlighting theme (github-dark)

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
