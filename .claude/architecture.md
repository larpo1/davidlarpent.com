# Architecture Decisions — davidlarpent.com

## Design Principles

- Minimal. Think darioamodei.com
- Dark mode default, light mode available
- No animations (except scroll reveal), no hero images, no noise
- Typography is the design
- Keep it simple. This is a blog, not a SaaS product.
- No unnecessary dependencies

## Architecture Decisions

- **Newsreader font:** Chosen for readability on long essays. Don't change.
- **Dark mode default:** Intentional. Don't change.
- **Google Analytics:** G-M2Q4Q201KD, production only. Consider Plausible later.
- **No comments:** Intentional. Not a community, just essays.
- **Content editing:** Title/description editable inline in dev. Content editable but footnotes locked (non-editable) to prevent corruption. Draft/published status toggled via pill on post detail view.
- **Draft management:** Pill toggle on post detail view (dev only). Publishing sets date to today and git pushes. No separate /drafts page.
- **TOC:** Always visible on desktop (>1200px). Toggle overlay on mobile/tablet.
- **Tabs:** Homepage splits content into Output (posts) and Input (sources) tabs.
- **Syndication:** Full-screen modal with side-by-side LinkedIn/Substack columns. Dev-mode only. Both AI drafts generated in parallel on open. Editable preview with hashtag pills, compact link preview card (LinkedIn only), blue Copy button. Falls back to naive template if AI unavailable. Columns stack vertically on mobile.
- **Image Generation:** Uses @google/genai with gemini-3-pro-image-preview for inline sketch illustrations. Dev-mode only. Requires GOOGLE_AI_API_KEY.
- **Scroll Reveal:** Uses GSAP + ScrollTrigger for scroll-scrubbed sketch illustration materialisation. Production dependency. Desktop uses scrub with fixed right-margin clone, mobile uses IntersectionObserver with timed animation. Filter composability: uses `--sketch-blur` CSS custom property to avoid overwriting `invert(1)` in dark mode.
- **Source editing:** Source metadata editable inline in dev mode. Tags are note-level with source-level tags auto-computed as live union. Settings panel (gear icon) for Save + archive toggle. API: `/api/save-source` (metadata, note content), `/api/update-note` (publish toggle, delete, tag updates with source recomputation).
- **Newsletter:** Buttondown API for email subscriptions. `NewsletterSignup.astro` component (3 variants: card, inline, icon). API endpoint: `/api/subscribe` with rate limiting. Requires `BUTTONDOWN_API_KEY`. Inline variant in site footer, icon variant in post share controls.
- **Podcast Bookmarking:** iOS Shortcut → POST /api/bookmark-podcast (production, Bearer token auth). Spotify Web API gets currently-playing episode. GitHub REST API creates/updates source files (Vercel has no persistent filesystem). Requires SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, GITHUB_TOKEN, GITHUB_REPO, BOOKMARK_SECRET.

## iOS Shortcut: Bookmark Podcast

### Prerequisites
1. Run `npm run spotify:auth` to get a Spotify refresh token
2. Set all env vars in Vercel: `BOOKMARK_SECRET`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`

### Shortcut Steps
1. **Ask for Input** (optional) — type: Text, prompt: "Quick note? (leave blank to skip)"
2. **Get Contents of URL** — POST `https://davidlarpent.com/api/bookmark-podcast`
   - Header: `Authorization: Bearer {BOOKMARK_SECRET}`
   - Header: `Content-Type: application/json`
   - Body: `{ "note": "{input}" }`
3. **Get Dictionary Value** — key: `episode`
4. **If** episode has value → Show Notification "Bookmarked: {episode}"
5. **Otherwise** → Show Notification "Bookmark failed: {message}"

### Testing Locally
```bash
curl -X POST http://localhost:4321/api/bookmark-podcast \
  -H "Authorization: Bearer {BOOKMARK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"note":"test"}'
```

## Decision Log

| Date | Decision | Outcome |
|------|----------|---------|
| 2026-01-30 | TOC uses fixed viewport positioning | Content width maintained, 72 tests pass |
| 2026-01-30 | Playwright for testing | 260+ tests, catches regressions |
| 2026-01-30 | TOC always-visible on desktop | Eliminated toggle overlap bugs |
| 2026-02-02 | Split test tasks from implementation | Ralph no longer skips tests |
| 2026-02-06 | Draft pill toggle replaces /drafts page | Publishing from post detail view with auto-push |
| 2026-02-06 | Anthropic SDK for syndication AI | Dev-only draft generation, graceful fallback |
| 2026-02-06 | Syndication modal replaces clipboard copy | Editable preview, link card, hashtag pills, AI drafts |
| 2026-02-07 | GSAP for scroll-scrubbed image reveal | Desktop scrub, mobile IntersectionObserver |
| 2026-02-26 | Inline editing for sources | Metadata + note content editable in dev |
| 2026-02-26 | Podcast bookmark via iOS Shortcut | Production endpoint, Spotify + GitHub APIs |
| 2026-02-27 | Note-level tags, source tags computed | Tags belong to notes; source tags = union |
