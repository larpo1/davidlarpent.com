import { test, expect } from '@playwright/test';

test.describe('Syndication Modal', () => {
  // Helper: remove Astro dev toolbar which can intercept clicks on mobile
  async function dismissDevToolbar(page: any) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const toolbar = document.querySelector('astro-dev-toolbar');
      if (toolbar) toolbar.remove();
    });
  }

  // Test 1: LinkedIn button opens syndication modal with both columns visible
  test('LinkedIn button opens syndication modal', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await expect(linkedinButton).toBeVisible();

    await linkedinButton.click();

    // Modal should be open
    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Both textareas should be visible (side-by-side layout)
    const linkedinTextarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    const substackTextarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(linkedinTextarea).toBeVisible();
    await expect(substackTextarea).toBeVisible();
  });

  // Test 2: LinkedIn textarea shows pre-populated excerpt with title and paragraphs
  test('LinkedIn textarea shows pre-populated excerpt with title and paragraphs', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Wait for AI generation to complete (falls back to template)
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    const value = await textarea.inputValue();

    // Should contain the post title
    expect(value).toContain('Ralph');
    // Should contain the essay link
    expect(value).toContain('https://davidlarpent.com/posts/ralph-loops');
    // Should be an excerpt (not full content)
    expect(value.length).toBeGreaterThan(100);
    expect(value.length).toBeLessThan(3000);
  });

  // Test 3: Substack button opens syndication modal with both columns visible
  test('Substack button opens syndication modal with both columns', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const substackButton = page.locator('.substack-copy-button');
    await expect(substackButton).toBeVisible();

    await substackButton.click();

    // Modal should be open
    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Both textareas should be visible (side-by-side layout)
    const linkedinTextarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    const substackTextarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(linkedinTextarea).toBeVisible();
    await expect(substackTextarea).toBeVisible();
  });

  // Test 4: Substack textarea shows raw markdown with canonical footer
  test('Substack textarea shows raw markdown with canonical footer', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const substackButton = page.locator('.substack-copy-button');
    await substackButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Wait for AI generation to complete (loading class appears then disappears)
    const textarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    const value = await textarea.inputValue();

    // Should contain canonical footer (from fallback template)
    expect(value).toContain('Originally published at davidlarpent.com');
    // Should be markdown (has markdown syntax)
    expect(value).toMatch(/^##\s+/m);
    // Should be full content, not excerpt
    expect(value.length).toBeGreaterThan(2000);
  });

  // Test 5: Syndication modal has correct side-by-side layout
  test('syndication modal has correct side-by-side layout with columns', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Check modal content fills viewport
    const content = modal.locator('.syndication-modal-content');
    await expect(content).toBeVisible();

    // Check two columns exist with labels
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const substackColumn = modal.locator('.syndication-column[data-platform="substack"]');
    await expect(linkedinColumn).toBeVisible();
    await expect(substackColumn).toBeVisible();

    // Check column labels
    const linkedinLabel = linkedinColumn.locator('.syndication-column-label');
    const substackLabel = substackColumn.locator('.syndication-column-label');
    await expect(linkedinLabel).toHaveText('LinkedIn');
    await expect(substackLabel).toHaveText('Substack');

    // Check both textareas exist
    const linkedinTextarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    const substackTextarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(linkedinTextarea).toBeVisible();
    await expect(substackTextarea).toBeVisible();

    // Check each column has its own Copy and Rewrite buttons
    const linkedinCopy = linkedinColumn.locator('.syndication-copy-button');
    const substackCopy = substackColumn.locator('.syndication-copy-button');
    await expect(linkedinCopy).toBeVisible();
    await expect(substackCopy).toBeVisible();
    await expect(linkedinCopy).toHaveText('Copy');
    await expect(substackCopy).toHaveText('Copy');

    const linkedinRewrite = linkedinColumn.locator('.syndication-regenerate');
    const substackRewrite = substackColumn.locator('.syndication-regenerate');
    await expect(linkedinRewrite).toBeVisible();
    await expect(substackRewrite).toBeVisible();
    await expect(linkedinRewrite).toHaveText('Rewrite');
    await expect(substackRewrite).toHaveText('Rewrite');

    // Check close button exists
    const closeButton = modal.locator('.syndication-close-button');
    await expect(closeButton).toBeVisible();
  });

  // Test 6: API returns markdown (unchanged)
  test('get-post-markdown API returns markdown', async ({ request }) => {
    const response = await request.get('/api/get-post-markdown?slug=ralph-loops');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.markdown).toBeTruthy();
    expect(data.frontmatter).toBeTruthy();
    expect(data.markdown).toContain('[^1]'); // Has footnotes
    expect(data.markdown).toMatch(/^##\s+/m); // Has markdown headings
  });

  // Test 7: API requires slug (unchanged)
  test('get-post-markdown API requires slug', async ({ request }) => {
    const response = await request.get('/api/get-post-markdown');
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Slug required');
  });

  // Test 8: LinkedIn column shows character count that highlights when over 3000
  test('LinkedIn column shows character count that highlights when over 3000', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Wait for AI generation to complete
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Char count should be visible
    const charCount = modal.locator('.char-count');
    await expect(charCount).toBeVisible();

    // Should not be over limit initially
    await expect(charCount).not.toHaveClass(/over-limit/);

    // Type enough text to exceed 3000 chars
    await textarea.fill('x'.repeat(3001));

    // Char count should now show over-limit
    await expect(charCount).toHaveClass(/over-limit/);

    // The current count should show 3001
    const charCurrent = modal.locator('.char-current');
    await expect(charCurrent).toHaveText('3001');
  });

  // Test 9: Link preview card shows post title inside LinkedIn column
  test('Link preview card shows post title inside LinkedIn column', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Link preview card should be visible inside LinkedIn column
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const previewCard = linkedinColumn.locator('.link-preview-card');
    await expect(previewCard).toBeVisible();

    // Title should contain post title
    const previewTitle = linkedinColumn.locator('.link-preview-title');
    await expect(previewTitle).toContainText('Ralph');

    // URL should show davidlarpent.com
    const previewUrl = linkedinColumn.locator('.link-preview-url');
    await expect(previewUrl).toHaveText('davidlarpent.com');
  });

  // Test 10: Hashtag pills render from post tags and are removable
  test('Hashtag pills render from post tags and are removable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Hashtag pills container should exist
    const pillsContainer = modal.locator('.hashtag-pills');
    await expect(pillsContainer).toBeVisible();

    // Should have at least one pill (ralph-loops has tags)
    const pills = modal.locator('.hashtag-pill');
    const pillCount = await pills.count();
    expect(pillCount).toBeGreaterThan(0);

    // Each pill should start with #
    const firstPillText = await pills.first().textContent();
    expect(firstPillText).toMatch(/^#/);

    // Remove a pill by clicking X
    const removeButton = pills.first().locator('.hashtag-remove');
    await removeButton.click();

    // Pill count should decrease by 1
    const newPillCount = await pills.count();
    expect(newPillCount).toBe(pillCount - 1);
  });

  // Test 11: Copy button copies textarea content to clipboard and shows status
  test('Copy button copies textarea content and shows status', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard API only works reliably on Chromium');

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Set known content in LinkedIn textarea
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await textarea.fill('Test syndication content');

    // Click the LinkedIn column's copy button
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const copyButton = linkedinColumn.locator('.syndication-copy-button');
    await copyButton.click();

    // Status should show "Copied!"
    const status = modal.locator('.syndication-status');
    await expect(status).toHaveText('Copied!');

    // Clipboard should contain the textarea content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Test syndication content');
  });

  // Test 12: Modal closes on Escape key and close button
  test('Modal closes on Escape key and close button', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Open modal
    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Close with Escape key
    await page.keyboard.press('Escape');
    await expect(modal).toHaveAttribute('data-open', 'false');

    // Re-open modal
    await linkedinButton.click();
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Close with close button
    const closeButton = modal.locator('.syndication-close-button');
    await closeButton.click();
    await expect(modal).toHaveAttribute('data-open', 'false');
  });

  // Phase 2: AI Integration Tests

  // Test 13: Modal shows loading state when generating draft
  test('Modal shows loading state when generating draft', async ({ page }) => {
    // Intercept API call and delay response
    await page.route('**/api/generate-syndication-draft', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, draft: 'Delayed draft', hashtags: [] })
      });
    });

    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // LinkedIn textarea should show loading state
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).toHaveClass(/loading/);
    await expect(textarea).toHaveValue('Generating draft...');

    // LinkedIn rewrite button should be disabled during loading
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const rewriteButton = linkedinColumn.locator('.syndication-regenerate');
    await expect(rewriteButton).toBeDisabled();

    // Wait for loading to complete
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });
    await expect(textarea).toHaveValue('Delayed draft');
  });

  // Test 14: Modal falls back to template on API failure
  test('Modal falls back to template on API failure', async ({ page }) => {
    // Mock API to return 500 error
    await page.route('**/api/generate-syndication-draft', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error' })
      });
    });

    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Wait for loading to complete
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Should fall back to template text (contains the post title and essay link)
    const value = await textarea.inputValue();
    expect(value).toContain('Ralph');
    expect(value).toContain('https://davidlarpent.com/posts/ralph-loops');

    // Status should show error message
    const status = modal.locator('.syndication-status');
    await expect(status).toHaveText('AI generation failed, using template');
  });

  // Test 15: Rewrite button triggers new API call
  test('Rewrite button triggers new API call', async ({ page }) => {
    let requestCount = 0;

    // Track API calls
    await page.route('**/api/generate-syndication-draft', async (route) => {
      requestCount++;
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          draft: body.platform + ' draft version ' + requestCount,
          hashtags: ['test']
        })
      });
    });

    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Wait for initial generation to complete (both platforms generate simultaneously)
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Both platforms were generated on open, so requestCount should be 2
    const initialCount = requestCount;
    expect(initialCount).toBe(2);

    // Click LinkedIn rewrite
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const rewriteButton = linkedinColumn.locator('.syndication-regenerate');
    await rewriteButton.click();

    // Wait for regeneration
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Verify one more API call was made
    expect(requestCount).toBe(initialCount + 1);
  });

  // Test 16: AI-generated draft is editable in textarea
  test('AI-generated draft is editable in textarea', async ({ page }) => {
    // Mock API to return known text
    await page.route('**/api/generate-syndication-draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          draft: 'AI generated content here',
          hashtags: ['ai', 'test']
        })
      });
    });

    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Wait for generation to complete
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });
    await expect(textarea).toHaveValue('AI generated content here');

    // Type additional text
    await textarea.focus();
    await textarea.press('End');
    await textarea.type(' with my edits');

    // Verify the edit was applied
    const value = await textarea.inputValue();
    expect(value).toContain('AI generated content here');
    expect(value).toContain('with my edits');
  });

  // New tests for side-by-side redesign

  // Test 17: Copy button has blue background styling
  test('Copy button has blue background styling', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Check the LinkedIn copy button has blue background
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const copyButton = linkedinColumn.locator('.syndication-copy-button');
    const bgColor = await copyButton.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // #6ba4ff = rgb(107, 164, 255)
    expect(bgColor).toBe('rgb(107, 164, 255)');
  });

  // Test 18: On mobile viewport, columns stack vertically
  test('On mobile viewport, columns stack vertically', async ({ page, viewport }) => {
    // Only test on mobile viewport (width < 768px)
    test.skip(!viewport || viewport.width >= 768, 'Only applicable to mobile viewports');

    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Get the columns container flex-direction
    const flexDirection = await modal.locator('.syndication-columns').evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).flexDirection;
    });
    expect(flexDirection).toBe('column');

    // Both textareas should still be visible (stacked vertically)
    const linkedinTextarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    const substackTextarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(linkedinTextarea).toBeVisible();
    await expect(substackTextarea).toBeVisible();
  });
});
