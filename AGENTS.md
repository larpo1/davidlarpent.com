# Specialist Agents

Use specialist agents via the Task tool for expert review and guidance. Invoke them strategically — not for every change, but at quality-critical moments.

---

## `lead` (Tech Lead / Architect)

**Use for:**
- Architecture decisions (Astro component patterns, API route design, SSG/SSR boundaries)
- Code review of complex features
- Refactoring strategies
- Build pipeline and dependency decisions

**Example triggers:**
- "Review the scroll-reveal component architecture"
- "Is the inline editing approach sustainable as features grow?"
- "Should the syndication draft endpoint be SSR or API route?"

**When to invoke:** Before implementing new page types, API endpoints, or cross-cutting features

---

## `security` (Security Audit)

**Use for:**
- Production API endpoint security (bookmark-podcast, subscribe)
- Input validation and injection prevention
- Secret management (API keys, bearer tokens)
- CORS and rate limiting

**Example triggers:**
- "Audit the bookmark-podcast endpoint for auth bypass"
- "Review the subscribe endpoint rate limiting"
- "Check env var handling in the GenAI image endpoint"

**When to invoke:** After implementing or modifying production API endpoints

---

## `qa` (QA & Testing)

**Use for:**
- Playwright test coverage analysis
- Edge case identification (cross-browser, dark/light mode, mobile/desktop)
- Test strategy recommendations
- Visual regression test design

**Example triggers:**
- "Review test coverage for the scroll-reveal feature"
- "What edge cases am I missing for the WYSIWYG toolbar?"
- "Design tests for the source note editing flow"

**When to invoke:** After implementing a feature, before considering it done. Always create separate test tasks.

---

## `integrations` (APIs & External Services)

**Use for:**
- Anthropic SDK (syndication drafts)
- Google GenAI (sketch illustrations)
- Buttondown (newsletter)
- Spotify + GitHub APIs (podcast bookmarking)
- Vercel deployment configuration

**Example triggers:**
- "Review error handling for the GenAI image generation"
- "Design fallback behaviour when Anthropic API is down"
- "How should we handle Spotify token refresh failures?"

**When to invoke:** When integrating external services or modifying API call patterns

---

## `simplify` (Code Simplification)

**Use for:**
- CSS bloat in global.css (single file, grows fast)
- Component complexity
- Script cleanup
- Removing dead code after feature iterations

**Example triggers:**
- "global.css is getting unwieldy — identify dead rules"
- "Simplify the SyndicationModal script block"
- "Review the Post.astro layout for unnecessary complexity"

**When to invoke:** When code feels too complex, or during refactoring passes

---

## `documenter` (Documentation)

**Use for:**
- Auditing CLAUDE.md and .claude/ docs accuracy against the codebase
- Updating architecture decisions after structural changes
- Keeping the decision log current
- Flagging stale documentation

**When to invoke:** Runs automatically via post-merge hook. Manual invoke after major feature additions.

---

## When to Use Agents — Quick Reference

| Situation | Agent(s) |
|-----------|----------|
| New page / component | `lead` (design) → `qa` (tests) |
| Production API endpoint | `lead` (design) → `security` (audit) → `qa` (tests) |
| External service integration | `integrations` (design) → `security` (audit) |
| Complex refactor | `lead` (approach) → `simplify` (review) |
| CSS growing unwieldy | `simplify` (cleanup) |
| Feature complete | `qa` (coverage) → `documenter` (docs) |

## Agent Workflow

```
1. Plan the feature
2. Implement (separate from tests)
3. Invoke `lead` for architecture review (if complex)
4. Invoke `security` for audit (if production API endpoint)
5. Invoke `qa` for test coverage review
6. Create and implement test task (separate checkbox)
7. Invoke `documenter` to update docs (or let post-merge hook handle it)
8. Merge
```

## Ralph Integration

During Ralph sprints, review agents (code-reviewer, silent-failure-hunter) run automatically after each task via the sprint workflow in `.claude/workflow.md`. The agents above are for deeper, strategic review — invoke them at quality-critical moments, not on every task.
