# QA Report: Inline Editing Feature

**Date:** 2026-01-30
**Reviewer:** PM
**Status:** ⚠️ Implemented with critical bugs

---

## Executive Summary

Ralph successfully implemented the core inline editing feature, but testing revealed **critical data loss bugs** that make it unsafe to use on posts with footnotes. The feature works as designed for title/description editing but needs significant fixes before content editing can be enabled.

---

## What Works ✅

1. **API Route** (`/api/save-post`)
   - Dev-only security (403 in production)
   - Path traversal protection
   - Gray-matter frontmatter parsing
   - Turndown HTML→Markdown conversion
   - File read/write working correctly

2. **UI Implementation**
   - Contenteditable title, description, content in dev
   - Clean SVG icon buttons (save + settings)
   - Settings modal for date/draft
   - Auto-reload after save
   - Keyboard shortcut (Ctrl/Cmd+S)
   - Dev-only visibility working

3. **Production Safety**
   - Edit controls completely hidden in production
   - `contenteditable="false"` in built output
   - Build passes without errors

---

## Critical Bugs 🚨

### Bug #1: Footnote Corruption (HIGH SEVERITY)

**Problem:**
Editing content with footnotes breaks the markdown syntax.

**Evidence:**
```bash
$ node test-roundtrip.js
```

Original footnote markdown:
```markdown
Text with footnote[^1].

[^1]: Footnote content.
```

After editing and saving:
```markdown
Text with footnote[1](#fn1).

1. Footnote content.
```

**Impact:**
- Footnotes completely broken
- Ralph-loops post has footnotes - **DO NOT EDIT**
- Data loss on save

**Root Cause:**
Turndown doesn't understand GFM footnote syntax. Converts `<sup><a href="#fn1">1</a></sup>` to `[1](#fn1)` instead of `[^1]`.

**Fix Options:**
- **Quick:** Disable content editing entirely (keep title/description only)
- **Proper:** Add `turndown-plugin-gfm`, test extensively

---

### Bug #2: Description Hidden in Production

**Location:** `Post.astro` line 50

```astro
style={isDev ? '' : 'display: none;'}
```

**Problem:**
Description is hidden from readers in production. Was this intentional?

**Fix:**
Remove style attribute if descriptions should be visible, or document why they're hidden.

---

### Bug #3: No Validation

**Problem:**
API accepts empty title, empty content, no validation.

**Impact:**
Could save completely blank posts.

**Fix:**
Add checks in API:
```typescript
if (!title || title.trim().length === 0) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Title cannot be empty'
  }), { status: 400 });
}
```

---

### Bug #4: innerText vs textContent

**Location:** `Post.astro` line 107

```typescript
title: titleEl?.innerText?.trim() || '',
```

**Problem:**
`innerText` includes hidden elements, use `textContent` instead.

**Fix:**
```typescript
title: titleEl?.textContent?.trim() || '',
```

---

### Bug #5: No User Guidance

**Problems:**
- Users don't know about Ctrl/Cmd+S shortcut
- No warning about footnote corruption risk
- No indication of what's safe to edit

**Fix:**
- Add keyboard shortcut hint near save button
- Add warning modal on first edit attempt
- Visual indicator for risky content (footnotes)

---

## Test Results

| Test | Result | Notes |
|------|--------|-------|
| Build passes | ✅ | No errors |
| Dev mode shows controls | ✅ | Contenteditable working |
| Production hides controls | ✅ | contenteditable="false" |
| API dev-only check | ✅ | 403 in production |
| Path traversal protection | ✅ | Rejects `../` in slug |
| Code block roundtrip | ✅ | Language hints preserved |
| Footnote roundtrip | ❌ | **Syntax corrupted** |
| Empty validation | ❌ | Accepts blank content |
| Keyboard shortcut | ✅ | Works, but undocumented |

---

## Recommendations

### Immediate Action Required

**Option A: Safe Quick Fix (RECOMMENDED)**
1. Disable content editing (remove `contenteditable` from `.post-content`)
2. Keep title + description editing only (no footnotes there)
3. Add validation for empty fields
4. Fix `innerText` → `textContent`
5. Document that content editing is disabled due to footnote corruption risk

**Option B: Full Fix (More Work)**
1. Install `turndown-plugin-gfm` for proper footnote support
2. Test extensively on all posts
3. Add validation + warnings
4. Fix bugs #2-5
5. Create comprehensive tests

### Testing Checklist Before Re-enabling

- [ ] Edit post with footnotes, verify syntax preserved
- [ ] Edit post with code blocks, verify language hints preserved
- [ ] Edit post with links/images, verify markdown correct
- [ ] Try to save empty title (should fail)
- [ ] Try to save empty content (should fail)
- [ ] Test on both ralph-loops and what-we-lose posts
- [ ] Verify production build has no edit controls

---

## Files Modified by Ralph

1. `src/pages/api/save-post.ts` - API endpoint
2. `src/layouts/Post.astro` - Contenteditable UI + script
3. `src/components/EditSettingsModal.astro` - Settings modal
4. `src/styles/global.css` - Edit control styles
5. `package.json` - Added gray-matter, turndown

---

## Conclusion

Ralph did excellent work on the implementation. The feature is 80% complete and the architecture is sound. However, the footnote corruption bug makes it **unsafe for production use** until fixed.

**Recommended next step:** Implement Option A (disable content editing) and add to CLAUDE.md as a task for Ralph.

---

## Evidence Files

- `test-roundtrip.js` - Demonstrates footnote corruption
- `QA-INLINE-EDITING.md` - This report
- Git commits: 1d1c610 through 9a0e7d7
