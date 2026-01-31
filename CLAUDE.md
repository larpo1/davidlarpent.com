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
8. Push to GitHub: `git push` (keeps commits synchronized)
9. Mark the task complete in this file
10. Move to next task

---

## Current Tasks

- [ ] **Restore corrupted post file**
      - **Problem:** `what-we-lose-when-we-stop-struggling.md` was corrupted by saves before API fix
      - **Issue:** File contains HTML instead of markdown, causing TOC to not render
      - **Fix:** Restore clean version from git history
      - **Command:**
        ```bash
        git checkout 465ff30 -- src/content/posts/what-we-lose-when-we-stop-struggling.md
        ```
      - **Then commit:**
        ```bash
        git add src/content/posts/what-we-lose-when-we-stop-struggling.md
        git commit -m "fix: Restore corrupted what-we-lose post from git history"
        git push
        ```
      - **Verify:**
        - Visit `/posts/what-we-lose-when-we-stop-struggling/` in dev mode
        - TOC should now be visible with proper headings
        - File should have markdown headings (## Heading) not HTML (<h2>)
      - **Note:** User also changed title to "The Unbearable Lightness of Prompting" - this will be reverted to original title. If they want to keep the new title, they can re-edit after restoration.
      - Commit: `fix: Restore corrupted what-we-lose post from git history`

- [x] **CRITICAL: Fix save API - TOC disappears after save**
      - **Problem:** After saving changes, TOC disappears because headings are corrupted
      - **Root cause:** API comment says "Content is already markdown from Tiptap" (line 86) but we removed Tiptap
        - contenteditable sends HTML: `<h2>My Heading</h2>`
        - API saves HTML directly as if it were markdown
        - On reload, Astro can't parse HTML-in-markdown correctly
        - Headings aren't extracted → TOC is empty
      - **Fix:** Re-enable HTML→Markdown conversion using turndown
      - **Files:** `src/pages/api/save-post.ts`
      - **Change:**
        ```typescript
        // Update content if provided (convert HTML to Markdown using turndown)
        let newContent = parsed.content;
        if (content !== undefined && content !== null) {
          // Convert HTML content to Markdown using turndown
          let convertedContent = turndown.turndown(content);

          // Footnote preservation logic (keep existing code)
          const footnoteRefRegex = /\[\^(\d+)\]/g;
          const footnoteDefsRegex = /\[\^(\d+)\]:[^\n]*(?:\n(?!\[\^|\n)[^\n]*)*/g;

          const originalFootnoteRefs = [...parsed.content.matchAll(footnoteRefRegex)];
          const originalFootnoteDefs = [...parsed.content.matchAll(footnoteDefsRegex)];

          if (originalFootnoteRefs.length > 0 && !convertedContent.includes('[^')) {
            const footnoteSection = originalFootnoteDefs.map(match => match[0]).join('\n\n');
            convertedContent = convertedContent + '\n\n' + footnoteSection;
          }

          newContent = convertedContent;
        }
        ```
      - **Test:**
        1. Edit a heading in ralph-loops post
        2. Save
        3. Page reloads
        4. TOC should still be visible with correct headings
        5. Check .md file - headings should be `## Heading` not `<h2>Heading</h2>`
      - Commit: `fix: Re-enable HTML→Markdown conversion in save API`

- [x] **Add slug field to settings modal**
      - **Problem:** User changed title, but slug (URL) didn't change
      - **Expected behavior:** Slug should NOT auto-change (would break links)
      - **Solution:** Add slug field to settings modal so users can manually change it
      - **Files:** `src/components/EditSettingsModal.astro`
      - **Implementation:**
        - Add slug input field:
          ```astro
          <div class="form-group">
            <label for="post-slug">URL Slug</label>
            <input
              type="text"
              id="post-slug"
              name="slug"
              value={slug}
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <small>Warning: Changing slug will break existing links</small>
          </div>
          ```
        - Update API to handle slug changes:
          - Rename file from `{oldSlug}.md` to `{newSlug}.md`
          - Validate new slug (lowercase, no spaces, no special chars)
          - Check if new slug already exists (conflict)
        - Update hidden input: remove `<input type="hidden" name="slug" value={slug} />` (now editable)
      - **API changes in `src/pages/api/save-post.ts`:**
        - Accept `newSlug` parameter
        - If `newSlug` different from `slug`: rename file
        - Validation: check slug format, check if file exists
      - **Test:**
        - Open settings modal
        - Change slug from "ralph-loops" to "ralph-loops-test"
        - Save
        - Should redirect to new URL
        - Old URL should 404
      - Commit: `feat: Add slug editor to settings modal`

- [x] **Polish settings/save button styling**
      - **Problem:** User says buttons are "ugly and agricultural"
      - **Current design:** Gear icon and save icon in bottom-right corner
      - **Review current styling:**
        - Check `.edit-controls` in `src/styles/global.css`
        - Check `.settings-button` and `.save-button` styling
      - **Potential improvements:**
        - Reduce button size (currently 3rem - quite large)
        - Refine icon styling
        - Better hover states
        - Consider moving to different location (less obtrusive)
      - **Suggested changes:**
        ```css
        .edit-controls {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem; /* Reduce gap */
          z-index: 100;
        }

        .save-button,
        .settings-button {
          width: 2.5rem; /* Smaller buttons */
          height: 2.5rem;
          padding: 0.5rem;
          /* More refined styling */
        }

        /* Consider opacity until hover */
        .edit-controls {
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .edit-controls:hover {
          opacity: 1;
        }
        ```
      - **Files:** `src/styles/global.css`
      - **Test:** Visit post in dev mode, check if buttons look better
      - Commit: `style: Polish edit controls button styling`

- [x] **Redesign toolbar - vertical layout in left margin**
      - **Current issue:** Toolbar is horizontal, appears above text, covers the selection
      - **New design:**
        - Position toolbar to the LEFT of content block
        - Vertical orientation (buttons stacked vertically)
        - Align inline with selected text (same Y position as selection)
        - Place in the margin area, not overlapping content
      - **Implementation:**
        - Change toolbar positioning logic:
          ```javascript
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const contentRect = contentEditable.getBoundingClientRect();

          toolbar.style.display = 'flex';
          toolbar.style.flexDirection = 'column'; // Vertical stack
          toolbar.style.top = `${rect.top + window.scrollY}px`; // Inline with selection
          toolbar.style.left = `${contentRect.left - 60}px`; // 60px to left of content
          toolbar.style.transform = 'none'; // Remove centering transform
          ```
        - Update CSS:
          ```css
          .edit-toolbar {
            flex-direction: column; /* Stack buttons vertically */
            gap: 0.5rem; /* Space between buttons */
            padding: 0.5rem;
            width: auto; /* Let buttons determine width */
          }

          .edit-toolbar button {
            padding: 0.5rem; /* Square buttons */
            min-width: 2.5rem; /* Consistent width */
            min-height: 2.5rem; /* Square shape */
            font-size: 0.85rem; /* Slightly smaller */
          }
          ```
      - **Test:**
        - Select text in content
        - Toolbar should appear to the LEFT in margin
        - Buttons stacked vertically
        - Inline with selected text (not above/below)
        - Doesn't cover content
      - **Files:** `src/components/EditToolbar.astro`
      - Commit: `refactor: Move toolbar to vertical layout in left margin`

- [x] **Remove Tiptap, revert to contenteditable**
      - **Decision:** Tiptap is too complex for this use case. Going back to simple contenteditable with toolbar.
      - **What to do:**
        1. Delete `src/components/TiptapEditor.astro`
        2. Uninstall Tiptap packages: `npm uninstall @tiptap/core @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder tiptap-markdown`
        3. Restore contenteditable approach in `src/layouts/Post.astro`:
           ```astro
           <h1 class="post-title" contenteditable={isDev} data-field="title">{title}</h1>
           <p class="post-description" contenteditable={isDev} data-field="description">{description}</p>
           <div class="post-content" contenteditable={isDev} data-field="content">
             <slot />
           </div>
           ```
        4. Remove Tiptap CSS from `src/styles/global.css` (keep contenteditable styles)
      - **Files to modify:**
        - Delete: `src/components/TiptapEditor.astro`
        - Restore: `src/layouts/Post.astro` (revert to contenteditable)
        - Clean: `src/styles/global.css` (remove Tiptap styles, keep contenteditable styles)
        - Update: `package.json` (remove Tiptap deps)
      - **Test:** Visit /posts/ralph-loops/ - should see normal content, editable with contenteditable
      - Commit: `refactor: Remove Tiptap, revert to contenteditable approach`

- [x] **Create floating WYSIWYG toolbar component**
      - **What:** Build a simple toolbar that appears when text is selected, uses browser execCommand
      - **Create:** `src/components/EditToolbar.astro`
      - **Structure:**
        ```astro
        <div id="edit-toolbar" class="edit-toolbar" style="display: none;">
          <button data-command="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
          <button data-command="italic" title="Italic (Ctrl+I)"><em>I</em></button>
          <button data-command="createLink" title="Add Link (Ctrl+K)">🔗</button>
          <button data-command="formatBlock" data-value="h2" title="Heading 2">H2</button>
          <button data-command="formatBlock" data-value="h3" title="Heading 3">H3</button>
          <button data-command="insertUnorderedList" title="Bullet List">• List</button>
          <button data-command="formatBlock" data-value="pre" title="Code Block">Code</button>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const toolbar = document.getElementById('edit-toolbar');
            const contentEditable = document.querySelector('[data-field="content"]');

            // Show toolbar on text selection
            document.addEventListener('selectionchange', () => {
              const selection = window.getSelection();
              if (!selection || selection.isCollapsed || !contentEditable.contains(selection.anchorNode)) {
                toolbar.style.display = 'none';
                return;
              }

              // Position toolbar above selection
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              toolbar.style.display = 'flex';
              toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
              toolbar.style.left = `${rect.left + rect.width / 2}px`;
              toolbar.style.transform = 'translateX(-50%)';

              // Update button active states
              updateToolbarState(toolbar);
            });

            // Handle toolbar button clicks
            toolbar.addEventListener('click', (e) => {
              const button = e.target.closest('button');
              if (!button) return;

              const command = button.getAttribute('data-command');
              const value = button.getAttribute('data-value');

              if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) document.execCommand(command, false, url);
              } else if (value) {
                document.execCommand(command, false, value);
              } else {
                document.execCommand(command, false, null);
              }

              updateToolbarState(toolbar);
            });
          });

          function updateToolbarState(toolbar) {
            toolbar.querySelectorAll('button').forEach(button => {
              const command = button.getAttribute('data-command');
              const isActive = document.queryCommandState(command);
              button.classList.toggle('is-active', isActive);
            });
          }
        </script>

        <style>
          .edit-toolbar {
            position: absolute;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 0.5rem;
            display: flex;
            gap: 0.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
          }

          .edit-toolbar button {
            background: transparent;
            border: none;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--color-text);
            transition: background 0.2s;
          }

          .edit-toolbar button:hover {
            background: var(--color-code-bg);
          }

          .edit-toolbar button.is-active {
            background: var(--color-link);
            color: white;
          }
        </style>
        ```
      - **Include in:** `src/layouts/Post.astro` (inside the dev mode block, after edit controls)
      - **Test:**
        - Select text in content area
        - Toolbar should appear above selection
        - Click Bold - text becomes bold
        - Click Italic - text becomes italic
        - Click Link - prompts for URL, creates link
      - Commit: `feat: Add floating WYSIWYG toolbar with execCommand`

- [x] **Add keyboard shortcuts for toolbar commands**
      - **What:** Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for link
      - **Where:** Add to the EditToolbar.astro script or Post.astro script
      - **Code:**
        ```javascript
        document.addEventListener('keydown', (e) => {
          if (!e.ctrlKey && !e.metaKey) return;

          const contentEditable = document.querySelector('[data-field="content"]');
          if (!contentEditable.contains(document.activeElement)) return;

          switch(e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              document.execCommand('bold');
              break;
            case 'i':
              e.preventDefault();
              document.execCommand('italic');
              break;
            case 'k':
              e.preventDefault();
              const url = prompt('Enter URL:');
              if (url) document.execCommand('createLink', false, url);
              break;
          }
        });
        ```
      - **Test:**
        - Select text, press Ctrl+B - should become bold
        - Press Ctrl+I - should become italic
        - Press Ctrl+K - should prompt for URL
      - Commit: `feat: Add keyboard shortcuts for formatting (Ctrl+B/I/K)`

- [x] **Test and verify all functionality**
      - **Tests:**
        1. Visit /posts/ralph-loops/ in dev mode
        2. Edit title - should work, no duplication
        3. Edit description - should work
        4. Edit content - should work
        5. Select text - toolbar appears
        6. Click Bold - text becomes bold
        7. Click Italic - text becomes italic
        8. Click Link - prompts for URL, creates link
        9. Click H2 - becomes heading 2
        10. Click save - should save correctly
        11. Check .md file - should have markdown (not HTML)
        12. Reload - changes should persist
        13. Footnotes should be non-editable (faded)
        14. Footnotes should be preserved after save
      - **Run:** `npm run build` - must pass
      - **Run:** `npm test` - should pass (may need to update some tests)
      - Commit: `test: Verify all editing functionality works`

---

- [x] **Re-enable content editing with footnote preservation**
      - **Strategy:** Make footnotes non-editable, preserve original markdown
      - **Why:** Can't convert footnote HTML back to `[^1]` syntax reliably
      - **Solution:** Lock footnotes, strip them before conversion, merge original footnotes back
      **Step 1: Make footnotes non-editable in rendered HTML**
      - **File:** `src/layouts/Post.astro`
      - Add script to mark footnotes as non-editable:
        ```astro
        {isDev && (
          <script is:inline>
            // Make footnotes non-editable to prevent corruption
            document.addEventListener('DOMContentLoaded', () => {
              // Footnote references (superscript links)
              document.querySelectorAll('sup a[data-footnote-ref]').forEach(el => {
                el.setAttribute('contenteditable', 'false');
                el.style.cursor = 'not-allowed';
                el.style.opacity = '0.7';
                el.title = 'Footnotes cannot be edited inline';
              });

              // Footnotes section
              const footnotesSection = document.querySelector('.footnotes');
              if (footnotesSection) {
                footnotesSection.setAttribute('contenteditable', 'false');
                footnotesSection.style.opacity = '0.7';
                footnotesSection.style.cursor = 'not-allowed';
              }
            });
          </script>
        )}
        ```

      **Step 2: Re-enable content editing**
      - **File:** `src/layouts/Post.astro` (line 57)
      - Add back `contenteditable={isDev}` to `.post-content` div

      **Step 3: Strip footnotes before sending to API**
      - **File:** `src/layouts/Post.astro`
      - Update `getEditableContent()` function:
        ```typescript
        function getEditableContent() {
          const titleEl = document.querySelector('[data-field="title"]') as HTMLElement;
          const descriptionEl = document.querySelector('[data-field="description"]') as HTMLElement;
          const contentEl = document.querySelector('[data-field="content"]') as HTMLElement;

          // Clone content to avoid mutating DOM
          const contentClone = contentEl?.cloneNode(true) as HTMLElement;

          // Remove footnotes section (will be preserved from original file)
          const footnotesSection = contentClone?.querySelector('.footnotes');
          if (footnotesSection) {
            footnotesSection.remove();
          }

          // Remove footnote reference superscripts (will be preserved from original)
          contentClone?.querySelectorAll('sup[data-footnote-ref], sup a[data-footnote-ref]').forEach(el => {
            el.parentElement?.remove();
          });

          return {
            title: titleEl?.textContent?.trim() || '',
            description: descriptionEl?.textContent?.trim() || '',
            content: contentClone?.innerHTML || ''
          };
        }
        ```
      - Update save request to send content:
        ```typescript
        const { title, description, content } = getEditableContent();
        // ...
        body: JSON.stringify({ slug, title, description, content })
        ```

      **Step 4: Preserve original footnotes in API**
      - **File:** `src/pages/api/save-post.ts`
      - Update content handling to preserve footnotes:
        ```typescript
        // Update content if provided (convert HTML to Markdown)
        let newContent = parsed.content;
        if (content !== undefined && content !== null) {
          // Extract footnote references from ORIGINAL markdown
          const footnoteRefs: string[] = [];
          const footnoteRefRegex = /\[\^(\d+)\]/g;
          let match;
          while ((match = footnoteRefRegex.exec(parsed.content)) !== null) {
            footnoteRefs.push(`[^${match[1]}]`);
          }

          // Extract footnote definitions from ORIGINAL markdown
          const footnoteDefsRegex = /\[\^(\d+)\]:(.+?)(?=\n\[\^|\n\n|$)/gs;
          const footnoteDefs: string[] = [];
          while ((match = footnoteDefsRegex.exec(parsed.content)) !== null) {
            footnoteDefs.push(match[0].trim());
          }

          // Convert HTML content (without footnotes) to Markdown
          let convertedContent = turndown.turndown(content);

          // Re-insert footnote references at approximate positions
          // (This is best-effort - footnotes stay where they were in original)
          footnoteRefs.forEach(ref => {
            if (!convertedContent.includes(ref)) {
              // Footnote reference was in edited content, preserve it at end of paragraph
              convertedContent = convertedContent.replace(/(\n\n|$)/, `${ref}$1`);
            }
          });

          // Append footnote definitions at the end
          if (footnoteDefs.length > 0) {
            convertedContent += '\n\n' + footnoteDefs.join('\n');
          }

          newContent = convertedContent;
        }
        ```

      **Step 5: Add validation**
      - **File:** `src/layouts/Post.astro` in `savePost()` function
        ```typescript
        // Validate non-empty
        if (!title?.trim() || !description?.trim() || !content?.trim()) {
          showStatus('Error: Title, description, and content required', true);
          return;
        }
        ```

      **Step 6: Test extensively**
      1. **Dev mode visual check:**
         - Visit ralph-loops post in dev
         - Footnote references should be slightly faded, not editable
         - Footnotes section at bottom should be faded, not editable
         - Hover over footnote - tooltip says "Footnotes cannot be edited inline"
         - Main content should still be editable

      2. **Edit main content (no footnotes):**
         - Edit a paragraph that doesn't have footnotes
         - Save
         - Verify .md file: footnotes unchanged, paragraph updated

      3. **Edit paragraph with footnote:**
         - Find paragraph with `[^1]` reference
         - Edit the text AROUND the footnote (not the footnote itself)
         - Save
         - Open .md file - verify:
           - Paragraph text updated
           - `[^1]` still present in correct location
           - Footnote definition `[^1]: ...` still at bottom
           - Footnote syntax intact

      4. **Add new content:**
         - Add a new heading and paragraph
         - Save
         - Verify new content appears in .md file
         - Verify existing footnotes still intact

      5. **Code blocks:**
         - Edit content with code blocks
         - Verify language hints preserved: ` ```javascript ` not ` ``` `

      6. **Test what-we-lose post (no footnotes):**
         - Edit content normally
         - Save
         - Verify no issues

      7. **Tests & build:**
         - Run `npm test` - should pass
         - Run `npm run build` - should succeed

      **Success criteria:**
      - ✅ Footnotes visually locked (faded, not editable)
      - ✅ Can edit ralph-loops main content without corrupting footnotes
      - ✅ Footnote syntax `[^1]` preserved in .md file
      - ✅ Footnote definitions preserved at end of file
      - ✅ Code blocks maintain language hints
      - ✅ All tests pass
      - ✅ Build succeeds

      **Commit message:** `feat: Re-enable content editing with footnote preservation`

      **Trade-off accepted:** Footnotes cannot be edited inline (must edit .md file directly). This is acceptable because it prevents corruption.

---

- [x] **Fix critical inline editing bugs**
      - **Bug 1: Description hidden in production** - Post.astro line 50 has `style={isDev ? '' : 'display: none;'}` which hides description in prod. Should descriptions be visible on posts? If yes, remove this style attribute.
      - **Bug 2: Data loss risk with HTML→Markdown conversion** - Editing complex markdown (code blocks with syntax highlighting, footnotes, custom HTML) will be converted to HTML by browser, then back to Markdown by turndown. This roundtrip loses fidelity. **High risk of corrupting posts.**
      - **Bug 3: No validation** - API accepts empty title/content, no checks for broken markdown
      - **Bug 4: innerText vs textContent** - Post.astro line 107 uses `innerText` which can include hidden elements, should use `textContent`
      - **Bug 5: No keyboard shortcut indication** - Ctrl/Cmd+S works but users don't know about it

      **Testing needed:**
      1. Edit a post with code blocks - does it preserve syntax?
      2. Edit a post with footnotes - do they survive?
      3. Edit with complex formatting - check for data loss
      4. Try to save empty content - does it break?

      **Recommended fixes:**
      - **Option A (Safe):** Only allow title + description editing, disable content editing
      - **Option B (Risky):** Add turndown-plugin-gfm for better footnote handling, test extensively
      - Add validation: require non-empty title/content
      - Add warning modal: "Editing content with footnotes will corrupt them. Edit title/description only."
      - Add keyboard shortcut hint to UI (show "Ctrl/Cmd+S to save")
      - Change `innerText` to `textContent` (line 107 of Post.astro)
      - Consider visual indicator: make footnotes non-editable or warn on hover

      **Quick fix for now:**
      - Disable content editing: remove `contenteditable={isDev}` from `.post-content` div
      - Keep title/description editing only (safe because they're plain text)
      - Add this to Post.astro line 58-62:
        ```astro
        <div class="post-content">
          <slot />
        </div>
        ```

      Commit: `fix: Disable content editing to prevent footnote corruption`

---

## Inline Editing Feature (Completed)

- [x] **Install dependencies for inline editing**
- [x] **Create save-post API route**
- [x] **Make post content editable in dev mode**
- [x] **Add inline editing styles**
- [x] **Add client-side save logic**
- [x] **Create frontmatter settings modal**
- [x] **Test inline editing feature** (automated tests pass, manual testing recommended)

---

- [x] **Fix TOC toggle button - currently invisible when TOC is open**
      - **Critical Bug:** Toggle button is hidden when TOC is open on desktop (display: none)
      - **Impact:** Users cannot close an open TOC - button disappears, functionality broken
      - **Root cause:** Tried to fix overlap by hiding button, but removed close functionality

      - **Why tests didn't catch this:**
        - Test was written to VALIDATE the bug: `await expect(toggle).not.toBeVisible()`
        - Test verified implementation (button hidden) instead of behavior (user can close TOC)
        - Need to test USER NEEDS not implementation details

      - **Correct Solution Options:**

        **Option 1: Always-visible TOC on desktop (RECOMMENDED)**
        - On desktop (>1200px): TOC is permanently visible, no close button needed
        - On mobile/tablet: Keep toggle for overlay behavior
        - Simplest, matches minimalist design philosophy
        - CSS: Remove ability to close on desktop, keep hamburger visible only on small screens

        **Option 2: Move toggle when open**
        - When TOC opens, slide toggle to the right (e.g., `left: 300px`)
        - Sits next to TOC instead of overlapping
        - More complex animation

        **Option 3: Bring back X inside TOC**
        - Add close button in TOC header next to "CONTENTS"
        - Toggle button opens, X button closes
        - More elements to manage

      - **Recommended Implementation (Option 1):**
        ```css
        /* Desktop: TOC always visible, toggle always hidden */
        @media (min-width: 1201px) {
          .toc-toggle {
            display: none; /* No toggle needed on desktop */
          }

          .toc-container {
            display: block !important; /* Always visible */
          }

          .toc-container[data-open="false"] {
            display: block !important; /* Override - always show */
          }
        }

        /* Mobile/tablet: Keep toggle functionality */
        @media (max-width: 1200px) {
          .toc-toggle {
            display: flex; /* Show toggle */
          }

          .toc-container[data-open="false"] {
            display: none; /* Hide when closed */
          }
        }
        ```

      - **Update JavaScript:**
        - Disable toggle click handler on desktop
        - Only allow toggle on mobile/tablet widths

      - **Fix the test:**
        ```javascript
        test('user can always see TOC on desktop', async ({ page }) => {
          await page.setViewportSize({ width: 1400, height: 800 });
          // TOC should always be visible
          const toc = page.locator('.toc-container');
          await expect(toc).toBeVisible();

          // Toggle button should not exist on desktop
          const toggle = page.locator('.toc-toggle');
          await expect(toggle).not.toBeVisible();
        });
        ```

      - **Files to modify:**
        - `src/styles/global.css` - Media query logic
        - `src/components/TableOfContents.astro` - JavaScript to disable toggle on desktop
        - `tests/toc.spec.ts` - Fix test to verify behavior not implementation

      - **Test:**
        1. Desktop (>1200px): TOC always visible, no toggle button
        2. Mobile (<1200px): Toggle works to open/close overlay
        3. No overlap, no broken functionality

      - Commit: `fix: Make TOC always visible on desktop, toggle for mobile only`

---

- [x] **Fix TOC toggle button issues (overlap + animation quality)**
      - **Issue 1:** X button overlaps with "CONTENTS" text when TOC is open (both at same position)
      - **Issue 2:** Animation is not as smooth/elegant as reference material

      - **Problem with current animation:**
        - Bars use flexbox `gap: 5px` - not precise enough
        - translateY values (7px/-7px) create imprecise movement
        - Bars don't rotate around a common center point
        - Basic `ease` timing function is not as elegant
        - Bars don't meet perfectly at center to form clean X

      - **Solution for animation:**
        1. Remove flexbox gap, use absolute positioning for bars
        2. Position bars relative to button center
        3. Use `transform-origin: center` so bars rotate around common point
        4. Use refined easing: `cubic-bezier(0.4, 0, 0.2, 1)`
        5. Bars should translate to exact center, then rotate

      - **Updated CSS structure:**
        ```css
        .toc-toggle {
          position: relative; /* for absolute bar positioning */
          width: 2rem;
          height: 2rem;
          /* Remove gap and flex alignment */
        }

        .toc-toggle .bar {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 1.5rem;
          height: 2px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toc-toggle .bar:nth-child(1) {
          top: 25%; /* Top position */
        }

        .toc-toggle .bar:nth-child(2) {
          top: 50%; /* Center */
          transform: translateX(-50%) translateY(-50%);
        }

        .toc-toggle .bar:nth-child(3) {
          top: 75%; /* Bottom position */
        }

        /* When open - bars meet at center and rotate */
        .toc-toggle.open .bar:nth-child(1) {
          top: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(45deg);
        }

        .toc-toggle.open .bar:nth-child(2) {
          opacity: 0;
        }

        .toc-toggle.open .bar:nth-child(3) {
          top: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(-45deg);
        }
        ```

      - **Solution for overlap:**
        ```css
        /* Hide toggle when TOC is open on desktop */
        @media (min-width: 1201px) {
          .toc-toggle.open {
            display: none;
          }
        }
        ```

      - **Files to modify:** `src/styles/global.css`
      - **Test:**
        1. Toggle multiple times - animation should feel buttery smooth
        2. Bars should form perfect X at button center
        3. On desktop: X should disappear when TOC open (no overlap)
      - Commit: `refactor: Improve hamburger animation and fix overlap`

---

## Completed Tasks

- [x] **Polish TOC toggle buttons (hamburger/X)** ⚠️ UX REFINEMENT
      - **Issues:**
        1. Hamburger button has 1px border - remove it
        2. X and hamburger should be in exactly the same place (not jump positions)
        3. X should smoothly animate/morph into hamburger (elegant transition)
      - **Reference animation:** https://medium.com/design-bootcamp/from-hamburger-to-close-icon-a-webflow-animation-journey-c88a06632ab9
        - Three-bar hamburger morphs into X
        - Top/bottom bars rotate and translate to form X
        - Middle bar fades out
        - Smooth, elegant CSS animation
      - **Files to modify:**
        - `src/styles/global.css` - remove border from `.toc-toggle`, add animation styles
        - `src/components/TableOfContents.astro` - restructure button to use spans for bars
      - **Implementation approach:**
        - Use single button with three `<span>` bars inside
        - CSS transitions on transform (rotate, translate) and opacity
        - Toggle class on button (e.g., `.toc-toggle.open`) to trigger animation
        - Remove `border: 1px solid var(--color-border)`
      - **Example structure:**
        ```html
        <button class="toc-toggle">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        ```
      - **Test:** Toggle TOC open/close multiple times, verify smooth morph animation like reference
      - Commit: `refactor: Add smooth hamburger-to-X animation, remove border`

---

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
- [x] **Refine TOC visual design** - Removed border, repositioned to top-left, wider (280px)
- [x] **Fix hamburger toggle** - Shows when TOC is closed on desktop

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

## PM Review Notes

### 2026-01-30: Inline Editing - All Bugs Fixed ✅
**Status:** Production ready for title/description editing

**Final Review:**
- ✅ All 5 critical bugs fixed in commit f8e1094
- ✅ 76/76 tests passing
- ✅ Build successful
- ✅ Safe for production use

**What's editable:**
- ✅ Title (plain text, no corruption risk)
- ✅ Description (plain text, no corruption risk)
- ✅ Frontmatter (date, draft via settings modal)
- ❌ Content (disabled to prevent footnote corruption)

**See:** FINAL-REVIEW.md for complete QA report

---

### 2026-01-30: Inline Editing QA - Critical Issues Found (RESOLVED)
**Status:** Feature implemented but has data loss risks and bugs → **ALL FIXED**

**What Ralph Built:**
- ✅ API route (`/api/save-post`) with dev-only security
- ✅ Contenteditable UI for title, description, content
- ✅ Settings modal for frontmatter (date, draft)
- ✅ Save button + keyboard shortcut (Ctrl/Cmd+S)
- ✅ Auto-reload after save
- ✅ HTML→Markdown conversion with turndown
- ✅ Dev-only visibility (hidden in production)
- ✅ Nice SVG icons for buttons
- ✅ Build passes, no errors

**Critical Issues:**

**🚨 Bug 1: Data Loss Risk (HIGH SEVERITY) - CONFIRMED**
- User edits rendered HTML (with syntax highlighting, footnotes, etc.)
- Browser's contenteditable gives you HTML with all the styling
- Turndown converts back to Markdown
- **Problem:** Roundtrip HTML→Markdown loses formatting fidelity
- **Tested:** Created test-roundtrip.js to verify
- **Results:**
  - ✅ Code blocks: Language hints preserved (good!)
  - ❌ Footnotes: **BROKEN** - `[^1]` becomes `[1](#fn1)`, footnote definition becomes numbered list
  - ❌ Footnote syntax completely corrupted, will break site
- **Impact:** Editing any post with footnotes will break them. Ralph-loops post has footnotes - DO NOT EDIT with this feature yet.
- **Evidence:** Run `node test-roundtrip.js` to see the problem

**🐛 Bug 2: Description Hidden in Production**
- Line 50 of Post.astro: `style={isDev ? '' : 'display: none;'}`
- Description is hidden from readers in production
- Was this intentional? Original plan didn't specify this.
- If descriptions should be visible, this needs fixing

**🐛 Bug 3: No Validation**
- API accepts empty title, empty content, empty description
- No check for minimum length or broken markdown
- Could save completely blank posts

**🐛 Bug 4: innerText vs textContent**
- Line 107 uses `innerText` which includes hidden elements
- Should use `textContent` for more predictable behavior

**🐛 Bug 5: No User Guidance**
- Ctrl/Cmd+S shortcut exists but users don't know
- No warning about data loss risk
- No indication what's safe to edit vs risky

**What Works Well:**
- ✅ Dev-only security (returns 403 in production)
- ✅ Path traversal validation (no `../` attacks)
- ✅ Clean UI with nice icons
- ✅ Modal for frontmatter editing
- ✅ Auto-reload UX is smooth
- ✅ Save status indicators work

**Testing Results:**
- ✅ Build passes
- ✅ Edit controls appear in dev (`contenteditable="true"`)
- ✅ Edit controls hidden in prod (`contenteditable="false"`, no buttons)
- ✅ API route has `prerender: false`
- ❌ Haven't tested complex markdown roundtrip
- ❌ Haven't tested validation edge cases
- ❌ Haven't tested footnote preservation

**Recommendation:**
Feature is 80% there but needs safety guardrails before real use:
1. Add validation (non-empty checks)
2. Add warning modal about data loss risk
3. Test extensively with complex posts
4. Consider: only allow title/description editing, not full content (too risky)
5. Fix innerText→textContent
6. Add keyboard shortcut hint

**Risk Assessment:**
- **Current state:** Functional but dangerous - could corrupt posts
- **After fixes:** Acceptable for dev use, still recommend manual backups

---

## PM Review Notes

### 2026-01-30: TOC Toggle - Critical Bug After Attempted Fix
**Status:** Ralph's fix for overlap created a worse bug - X button now invisible, users can't close TOC

**What Happened:**
1. ✅ Animation improved (absolute positioning, cubic-bezier, bars meet at center)
2. ❌ Fixed overlap by hiding toggle when open (`display: none`)
3. ❌ **NEW CRITICAL BUG:** Users cannot close TOC on desktop - button is gone!
4. ❌ Test validated the bug instead of catching it

**Why Tests Failed to Catch This:**
- Ralph wrote test that asserts `toggle.not.toBeVisible()` - testing the broken implementation
- Test should verify "user can close TOC", not "button is hidden"
- Classic case: testing implementation details instead of user behavior

**The Real Issue:**
- We don't need a toggle on desktop - TOC should be always-visible
- Toggle is only needed for mobile/tablet overlay mode
- Trying to have one button do double-duty (open/close) on all screen sizes is overcomplicating

**Correct Solution:**
- Desktop: TOC permanently visible, no toggle button at all
- Mobile/Tablet: Toggle button controls overlay
- Simpler, matches minimalist design, no overlap possible

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
