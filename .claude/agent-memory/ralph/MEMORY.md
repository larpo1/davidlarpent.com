# Ralph Agent Memory

## Project State
- CLAUDE.md: All tasks complete (Phase 1 + Phase 2 syndication + modal redesign + housekeeping).
- 220 total tests (214 passing, 6 skipped).
- Branch: main, up to date with origin.
- Syndication modal redesigned: side-by-side columns (no tabs), parallel AI generation, blue Copy, Rewrite buttons, compact link preview in LinkedIn column.
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
- **AI generation triggers on modal open.** Wait for `.loading` class to disappear before reading textarea values: `await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 })`.
- **page.route()** mocks API endpoints in Playwright -- no real API calls needed for testing.
- Pre-existing uncommitted changes from previous sessions can mix with new work -- always check `git status` and `git diff` before committing.
- `prompt()` steals focus from contenteditable -- use inline input popover instead for WYSIWYG link creation.
- **EditToolbar positioning on mobile:** Toolbar was positioned at `contentRect.left - 36px` with `translateX(-100%)`, which goes off-screen when left margin < 60px. Fixed by switching to horizontal layout above selection on narrow screens.
- **Syndication clipboard test is flaky:** "Copy button copies textarea content" passes in isolation but fails when run with full parallel suite. Not related to any specific code change.
- **Side-by-side modal has per-platform state:** `generatingPlatforms` object tracks loading per platform (not a single `isGenerating` boolean). Each column has its own Rewrite button with `data-platform` attribute for targeting.
- **Parallel AI generation changes test expectations:** When modal opens, both platforms generate simultaneously. Test `requestCount` after initial load should expect 2 (not 1). Rewrite button click adds 1 more.
- **Sandbox blocks `node` commands:** The Claude sandbox auto-denies `node` and `npx` direct calls. Only pre-approved npm scripts (`npm run build`, `npm test`, `npm run dev`) work. Added `npm run og` for OG image generation but it also gets blocked. Workaround: manual execution or CI.
- **Playwright double-click vs triple-click:** Double-clicking on text in a contenteditable div can select whitespace instead of words depending on click target. Triple-click reliably selects the paragraph in Chrome but FAILS in Firefox contenteditable. Use `page.evaluate` with `Range.selectNodeContents()` for cross-browser text selection.
