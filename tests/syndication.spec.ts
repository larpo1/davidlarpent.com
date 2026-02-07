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

  // Test 2: Modal opens without triggering API calls (no loading state)
  test('Modal opens without triggering API calls', async ({ page }) => {
    let apiCallCount = 0;

    // Intercept API calls to count them
    await page.route('**/api/generate-syndication-draft', async (route) => {
      apiCallCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, draft: 'Should not appear', hashtags: [] })
      });
    });

    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Neither textarea should be in loading state
    const linkedinTextarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    const substackTextarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(linkedinTextarea).not.toHaveClass(/loading/);
    await expect(substackTextarea).not.toHaveClass(/loading/);

    // No API calls should have been made
    expect(apiCallCount).toBe(0);
  });

  // Test 3: Both textareas start empty when no saved draft exists
  test('Both textareas start empty when no saved draft exists', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Clear any saved drafts
    await page.evaluate(() => {
      localStorage.removeItem('syndication-ralph-loops-linkedin');
      localStorage.removeItem('syndication-ralph-loops-substack');
      localStorage.removeItem('syndication-ralph-loops-hashtags');
    });

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Both textareas should be empty
    const linkedinTextarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    const substackTextarea = modal.locator('.syndication-textarea[data-platform="substack"]');
    await expect(linkedinTextarea).toHaveValue('');
    await expect(substackTextarea).toHaveValue('');
  });

  // Test 4: Generate button triggers loading state and populates textarea
  test('Generate button triggers loading state and populates textarea', async ({ page }) => {
    // Intercept API call with slight delay
    await page.route('**/api/generate-syndication-draft', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          draft: body.platform + ' generated content',
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

    // Textarea should start empty (no auto-generation)
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).toHaveValue('');

    // Click Generate button
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const generateButton = linkedinColumn.locator('.syndication-regenerate');
    await generateButton.click();

    // Should show loading state
    await expect(textarea).toHaveClass(/loading/);
    await expect(textarea).toHaveValue('Generating draft...');
    await expect(generateButton).toBeDisabled();
    await expect(generateButton).toHaveText('Generating...');

    // Wait for generation to complete
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });
    await expect(textarea).toHaveValue('linkedin generated content');
    await expect(generateButton).toHaveText('Generate');
    await expect(generateButton).not.toBeDisabled();
  });

  // Test 5: Substack button opens syndication modal with both columns visible
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

  // Test 6: Syndication modal has correct side-by-side layout
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

    // Check each column has its own Copy and Generate buttons
    const linkedinCopy = linkedinColumn.locator('.syndication-copy-button');
    const substackCopy = substackColumn.locator('.syndication-copy-button');
    await expect(linkedinCopy).toBeVisible();
    await expect(substackCopy).toBeVisible();
    await expect(linkedinCopy).toHaveText('Copy');
    await expect(substackCopy).toHaveText('Copy');

    const linkedinGenerate = linkedinColumn.locator('.syndication-regenerate');
    const substackGenerate = substackColumn.locator('.syndication-regenerate');
    await expect(linkedinGenerate).toBeVisible();
    await expect(substackGenerate).toBeVisible();
    await expect(linkedinGenerate).toHaveText('Generate');
    await expect(substackGenerate).toHaveText('Generate');

    // Check close button exists
    const closeButton = modal.locator('.syndication-close-button');
    await expect(closeButton).toBeVisible();
  });

  // Test 7: API returns markdown (unchanged)
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

  // Test 8: API requires slug (unchanged)
  test('get-post-markdown API requires slug', async ({ request }) => {
    const response = await request.get('/api/get-post-markdown');
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Slug required');
  });

  // Test 9: LinkedIn column shows character count that highlights when over 3000
  test('LinkedIn column shows character count that highlights when over 3000', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Textarea starts empty (no auto-generation)
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');

    // Char count should be visible
    const charCount = modal.locator('.char-count');
    await expect(charCount).toBeVisible();

    // Should not be over limit initially (textarea is empty)
    await expect(charCount).not.toHaveClass(/over-limit/);

    // Type enough text to exceed 3000 chars
    await textarea.fill('x'.repeat(3001));

    // Char count should now show over-limit
    await expect(charCount).toHaveClass(/over-limit/);

    // The current count should show 3001
    const charCurrent = modal.locator('.char-current');
    await expect(charCurrent).toHaveText('3001');
  });

  // Test 10: Link preview card shows post title inside LinkedIn column
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

  // Test 11: Hashtag pills render from post tags and are removable
  test('Hashtag pills render from post tags and are removable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Clear saved hashtags so we get defaults from post tags
    await page.evaluate(() => {
      localStorage.removeItem('syndication-ralph-loops-hashtags');
    });

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

  // Test 12: Copy button copies textarea content to clipboard and shows status
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

  // Test 13: Modal closes on Escape key and close button
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

  // Test 14: Generate button triggers API call and populates textarea
  test('Generate button triggers new API call', async ({ page }) => {
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

    // No API calls on open (no auto-generation)
    expect(requestCount).toBe(0);

    // Click LinkedIn Generate
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const generateButton = linkedinColumn.locator('.syndication-regenerate');
    await generateButton.click();

    // Wait for generation to complete
    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Verify one API call was made
    expect(requestCount).toBe(1);

    // Click Generate again
    await generateButton.click();
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Verify second API call was made
    expect(requestCount).toBe(2);
  });

  // Test 15: Modal falls back to template on API failure via Generate button
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

    // First put some content in the textarea so fallback uses it
    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    const modal = page.locator('#syndication-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    const textarea = modal.locator('.syndication-textarea[data-platform="linkedin"]');
    await textarea.fill('My existing content');

    // Click Generate -- should fail and fall back to current textarea content
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const generateButton = linkedinColumn.locator('.syndication-regenerate');
    await generateButton.click();

    // Wait for loading to complete
    await expect(textarea).not.toHaveClass(/loading/, { timeout: 10000 });

    // Should fall back to the content that was in textarea before Generate was clicked
    const value = await textarea.inputValue();
    expect(value).toContain('My existing content');

    // Status should show error message
    const status = modal.locator('.syndication-status');
    await expect(status).toHaveText('AI generation failed, using template');
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

    // Click Generate to trigger AI
    const linkedinColumn = modal.locator('.syndication-column[data-platform="linkedin"]');
    const generateButton = linkedinColumn.locator('.syndication-regenerate');
    await generateButton.click();

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
