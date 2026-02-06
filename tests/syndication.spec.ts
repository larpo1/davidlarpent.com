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

  // Test 1: LinkedIn button opens syndication modal
  test('LinkedIn button opens syndication modal', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await expect(linkedinButton).toBeVisible();

    await linkedinButton.click();

    // Modal should be open
    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // LinkedIn tab should be active
    const linkedinTab = modal.locator('.syndication-tab-button[data-tab="linkedin"]');
    await expect(linkedinTab).toHaveAttribute('aria-pressed', 'true');
  });

  // Test 2: LinkedIn tab shows pre-populated excerpt with title and paragraphs
  test('LinkedIn tab shows pre-populated excerpt with title and paragraphs', async ({ page }) => {
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

  // Test 3: Substack button opens syndication modal on Substack tab
  test('Substack button opens syndication modal on Substack tab', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const substackButton = page.locator('.substack-copy-button');
    await expect(substackButton).toBeVisible();

    await substackButton.click();

    // Modal should be open
    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Substack tab should be active
    const substackTab = modal.locator('.syndication-tab-button[data-tab="substack"]');
    await expect(substackTab).toHaveAttribute('aria-pressed', 'true');
  });

  // Test 4: Substack tab shows raw markdown with canonical footer
  test('Substack tab shows raw markdown with canonical footer', async ({ page }) => {
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

  // Test 5: Syndication modal has correct layout
  test('syndication modal has correct layout (full-screen, tabs, textarea, copy button)', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Check modal content fills viewport
    const content = modal.locator('.syndication-modal-content');
    await expect(content).toBeVisible();

    // Check tabs exist
    const linkedinTab = modal.locator('.syndication-tab-button[data-tab="linkedin"]');
    const substackTab = modal.locator('.syndication-tab-button[data-tab="substack"]');
    await expect(linkedinTab).toBeVisible();
    await expect(substackTab).toBeVisible();

    // Check textarea exists
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).toBeVisible();

    // Check copy button exists
    const copyButton = modal.locator('.syndication-copy-button');
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toHaveText('Copy');

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

  // Test 8: LinkedIn tab shows character count that highlights when over 3000
  test('LinkedIn tab shows character count that highlights when over 3000', async ({ page }) => {
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

  // Test 9: Link preview card shows post title and description
  test('Link preview card shows post title and description', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Link preview card should be visible
    const previewCard = modal.locator('.link-preview-card');
    await expect(previewCard).toBeVisible();

    // Title should contain post title
    const previewTitle = modal.locator('.link-preview-title');
    await expect(previewTitle).toContainText('Ralph');

    // Description should contain some text
    const previewDescription = modal.locator('.link-preview-description');
    const descText = await previewDescription.textContent();
    expect(descText?.length).toBeGreaterThan(0);

    // URL should show davidlarpent.com
    const previewUrl = modal.locator('.link-preview-url');
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

    // Set known content in textarea
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await textarea.fill('Test syndication content');

    // Click copy button
    const copyButton = modal.locator('.syndication-copy-button');
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
});
