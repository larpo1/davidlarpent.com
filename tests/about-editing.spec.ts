import { test, expect } from '@playwright/test';

test.describe('About Page Editing', () => {
  test('can create a link using the toolbar on /about', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const aboutContent = page.locator('[data-field="about"]');
    await expect(aboutContent).toBeVisible();

    // Verify contenteditable is enabled (dev mode)
    const contenteditable = await aboutContent.getAttribute('contenteditable');
    expect(contenteditable).toBe('true');

    // Get the first paragraph element inside about content
    const firstParagraph = aboutContent.locator('p').first();
    await expect(firstParagraph).toBeVisible();

    // Triple-click to select the whole first paragraph
    await firstParagraph.click({ clickCount: 3 });
    await page.waitForTimeout(300);

    // Verify we have a non-empty selection inside the contenteditable
    const selectedText = await page.evaluate(() => {
      const sel = window.getSelection();
      return sel ? sel.toString().trim() : '';
    });
    expect(selectedText.length).toBeGreaterThan(0);

    // Wait for toolbar to appear
    const toolbar = page.locator('#edit-toolbar');
    await expect(toolbar).toBeVisible({ timeout: 3000 });

    // Click the "L" (link) button on the toolbar
    const linkButton = toolbar.locator('button[data-command="createLink"]');
    await linkButton.click();

    // Wait for the link input popover to appear
    const linkPopover = page.locator('#link-input-popover');
    await expect(linkPopover).toBeVisible({ timeout: 3000 });

    // Type a URL into the link input
    const linkInput = page.locator('#link-url-input');
    await linkInput.fill('https://example.com/about-link-test');

    // Press Enter to apply the link
    await linkInput.press('Enter');

    // Wait for link creation
    await page.waitForTimeout(500);

    // Assert that the selected text is now wrapped in an <a> tag with the entered URL
    const createdLink = aboutContent.locator('a[href="https://example.com/about-link-test"]');
    await expect(createdLink).toBeVisible({ timeout: 3000 });

    // Verify the link contains the expected text
    const linkText = await createdLink.textContent();
    expect(linkText).toContain(selectedText.substring(0, 20));
  });
});
