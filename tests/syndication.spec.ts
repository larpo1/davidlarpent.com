import { test, expect } from '@playwright/test';

test.describe('Syndication Buttons', () => {
  // LinkedIn Tests
  test('LinkedIn copy button exists in dev mode', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');

    const linkedinButton = page.locator('.linkedin-copy-button');
    await expect(linkedinButton).toBeVisible();
    await expect(linkedinButton).toHaveAttribute('title', 'Copy for LinkedIn');
  });

  test('LinkedIn copy generates correct format', async ({ page, context, browserName }) => {
    // Skip on Firefox - clipboard permissions don't work the same way
    test.skip(browserName !== 'chromium', 'Clipboard API only works reliably on Chromium');

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/posts/ralph-loops/');

    // Click LinkedIn copy button
    const linkedinButton = page.locator('.linkedin-copy-button');
    await linkedinButton.click();

    // Verify status message
    const status = page.locator('.save-status');
    await expect(status).toHaveText('Copied for LinkedIn!');

    // Read clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // Verify format
    expect(clipboardText).toContain('Ralph');
    expect(clipboardText).toContain('Read the full essay: https://davidlarpent.com/posts/ralph-loops');
    expect(clipboardText).toMatch(/#\w+/); // Has at least one hashtag

    // Verify it's an excerpt, not full content
    expect(clipboardText.length).toBeLessThan(1500);
    expect(clipboardText.length).toBeGreaterThan(300);
  });

  // Substack Tests
  test('Substack copy button exists in dev mode', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');

    const substackButton = page.locator('.substack-copy-button');
    await expect(substackButton).toBeVisible();
    await expect(substackButton).toHaveAttribute('title', 'Copy for Substack');
  });

  test('Substack copy generates full markdown with footer', async ({ page, context, browserName }) => {
    // Skip on Firefox - clipboard permissions don't work the same way
    test.skip(browserName !== 'chromium', 'Clipboard API only works reliably on Chromium');

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/posts/ralph-loops/');

    const substackButton = page.locator('.substack-copy-button');
    await substackButton.click();

    const status = page.locator('.save-status');
    await expect(status).toHaveText('Copied for Substack!');

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // Verify footer
    expect(clipboardText).toContain('---');
    expect(clipboardText).toContain('Originally published at davidlarpent.com');

    // Verify it's markdown (has markdown syntax)
    expect(clipboardText).toMatch(/^##\s+/m); // Has markdown headings

    // Verify footnotes are intact (ralph-loops has footnotes)
    expect(clipboardText).toContain('[^1]');
    expect(clipboardText).toMatch(/\[\^1\]:/); // Footnote definition

    // Verify it's full content, not excerpt
    expect(clipboardText.length).toBeGreaterThan(2000);
  });

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

  test('get-post-markdown API requires slug', async ({ request }) => {
    const response = await request.get('/api/get-post-markdown');
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Slug required');
  });

  // Styling Tests
  test('buttons are visible and properly styled', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');

    const linkedinButton = page.locator('.linkedin-copy-button');
    const substackButton = page.locator('.substack-copy-button');

    // Check visibility
    await expect(linkedinButton).toBeVisible();
    await expect(substackButton).toBeVisible();

    // Check size (should match other edit control buttons - 2rem = ~32px)
    const linkedinBox = await linkedinButton.boundingBox();
    expect(linkedinBox?.width).toBeGreaterThanOrEqual(30);
    expect(linkedinBox?.height).toBeGreaterThanOrEqual(30);

    // Check they're in the edit-controls container
    const editControls = page.locator('.edit-controls');
    await expect(editControls).toBeVisible();

    // Verify buttons are siblings of save/settings buttons
    const saveButton = page.locator('.save-button');
    await expect(saveButton).toBeVisible();
  });
});
