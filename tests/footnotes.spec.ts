import { test, expect } from '@playwright/test';

test.describe('Footnote Editing Protection', () => {
  test('footnotes are non-editable in dev mode', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the script to run
    await page.waitForTimeout(500);

    // Check footnote references are non-editable
    const footnoteRef = page.locator('sup a[data-footnote-ref]').first();
    await expect(footnoteRef).toHaveAttribute('contenteditable', 'false');

    // Check footnotes section is non-editable
    const footnotesSection = page.locator('.footnotes');
    await expect(footnotesSection).toHaveAttribute('contenteditable', 'false');

    // Check footnote has faded appearance (opacity < 1)
    const opacity = await footnotesSection.evaluate(el => getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
  });

  test('main content is editable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    const postContent = page.locator('.post-content');
    await expect(postContent).toHaveAttribute('contenteditable', 'true');
  });

  test('title is editable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');

    const title = page.locator('.post-title');
    await expect(title).toHaveAttribute('contenteditable', 'true');
  });
});
