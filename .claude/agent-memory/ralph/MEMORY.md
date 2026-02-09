# Ralph Agent Memory

## Project State
- CLAUDE.md: All tasks complete (Phase 1 + Phase 2 syndication + modal redesign + generate-on-demand + housekeeping + Phase 1 image generation + Phase 2 scroll-scrubbed image reveal).
- 276 total tests (260 passing, 16 skipped).
- Branch: main, up to date with origin.
- Syndication modal: side-by-side columns, Generate on demand (no auto-generation), auto-save to localStorage, blue Copy buttons, compact link preview in LinkedIn column.
- Image generation: EditToolbar has pencil button -> ImageGenPanel (floating panel) -> calls /api/generate-image -> Gemini gemini-3-pro-image-preview. Sketch illustrations use CSS invert(1) in dark mode.
- Scroll reveal: SketchScrollReveal.astro (production, reader-facing). Desktop: clones to fixed position in right margin, GSAP ScrollTrigger scrub. Mobile: IntersectionObserver with 0.6s timed animation. Uses `--sketch-blur` CSS custom property for filter composability (invert + blur).
- Link inspect popover added to EditToolbar (shows URL, Open, Remove when caret is inside `<a>`).
- EditToolbar now responsive: vertical in left margin on wide screens, horizontal above selection on narrow screens.

## Key Patterns
- Always run `npm run build` before committing.
- Always run `npm test` before committing UI changes. Tests take ~60s.
- Tests run across 4 browser configs: Desktop Chrome, Desktop Firefox, Tablet, Mobile.
- Use `git show HEAD:<file>` to retrieve content from committed versions when working copy has been modified.

## Gotchas
- Astro `is:inline` scripts don't get bundled -- needed for EditToolbar and SyndicationModal to work.
- Footnotes in posts (ralph-loops.md) are fragile -- contenteditable + turndown roundtrip corrupts `[^1]` syntax. Footnotes are locked as non-editable.
- Homepage tabs default to "work" category. Posts without category default to "work".
- TOC is always visible on desktop (>1200px), toggle only on mobile/tablet.
- Settings modal is a slide-out panel (right side, CSS transitions via data-open attribute, pointer-events).
- Production build HTML can be tested by reading files from dist/client/ directory.
- **Astro dev toolbar intercepts clicks on mobile.** Use `page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove())` after `page.waitForLoadState('networkidle')` in tests to fix.
- **AI generation is on-demand (not auto).** User clicks "Generate" button per column. No API calls on modal open. Tests should NOT expect loading state on open.
- **page.route()** mocks API endpoints in Playwright -- no real API calls needed for testing.
- Pre-existing uncommitted changes from previous sessions can mix with new work -- always check `git status` and `git diff` before committing.
- `prompt()` steals focus from contenteditable -- use inline input popover instead for WYSIWYG link creation.
- **EditToolbar positioning on mobile:** Toolbar was positioned at `contentRect.left - 36px` with `translateX(-100%)`, which goes off-screen when left margin < 60px. Fixed by switching to horizontal layout above selection on narrow screens.
- **Syndication clipboard test is flaky:** "Copy button copies textarea content" passes in isolation but fails when run with full parallel suite. Not related to any specific code change.
- **Side-by-side modal has per-platform state:** `generatingPlatforms` object tracks loading per platform (not a single `isGenerating` boolean). Each column has its own Generate button with `data-platform` attribute for targeting.
- **Modal uses localStorage for persistence:** Keys are `syndication-{slug}-linkedin`, `syndication-{slug}-substack`, `syndication-{slug}-hashtags`. Saved on blur, close, Generate complete, Copy. Loaded on open.
- **Sandbox blocks `node` commands:** The Claude sandbox auto-denies `node` and `npx` direct calls. Only pre-approved npm scripts (`npm run build`, `npm test`, `npm run dev`) work. Added `npm run og` for OG image generation but it also gets blocked. Workaround: manual execution or CI.
- **Playwright double-click vs triple-click:** Double-clicking on text in a contenteditable div can select whitespace instead of words depending on click target. Triple-click reliably selects the paragraph in Chrome but FAILS in Firefox contenteditable. Use `page.evaluate` with `Range.selectNodeContents()` for cross-browser text selection.
- **Astro dev mode adds extra attributes to HTML elements** (data-astro-source-file, data-astro-source-loc). When using `page.route()` to inject HTML, use regex to match tags rather than exact string markers. E.g. `/(data-field="content"[^>]*>)/` instead of `'data-field="content">'`.
- **addInitScript DOMContentLoaded timing is unreliable** for injecting DOM elements that bundled Astro scripts need. Use `page.route()` to intercept and modify the HTML response instead -- this guarantees the injected content exists before any scripts execute.
- **CSS display:none + getComputedStyle filter**: Even when an element has `display: none`, `getComputedStyle()` still returns its computed `filter` value. Tests can check filter rules on hidden elements.
