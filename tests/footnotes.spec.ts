import { test, expect } from '@playwright/test';

test.describe('Footnote Editing Protection', () => {
  test('footnotes are non-editable in dev mode', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for DOM initialization script to run
    await page.waitForTimeout(500);

    // Check if footnote references exist in content
    const footnoteRefs = page.locator('.post-content sup a[data-footnote-ref]');
    const count = await footnoteRefs.count();
    expect(count).toBeGreaterThan(0);

    // Check footnote has non-editable styling (opacity < 1, cursor not-allowed)
    const firstFootnote = footnoteRefs.first();
    const opacity = await firstFootnote.evaluate(el => getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);

    const cursor = await firstFootnote.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).toBe('not-allowed');
  });

  test('main content is editable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    // Check if post-content exists and is contenteditable in dev mode
    const contentDiv = page.locator('.post-content');
    await expect(contentDiv).toBeVisible();

    // Content should be editable in dev mode
    const contenteditable = await contentDiv.getAttribute('contenteditable');
    expect(contenteditable).toBe('true');
  });

  test('title is editable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    // Check if title exists and is contenteditable
    const titleEl = page.locator('.post-title');
    await expect(titleEl).toBeVisible();

    // Title should be editable in dev mode
    const contenteditable = await titleEl.getAttribute('contenteditable');
    expect(contenteditable).toBe('true');
  });
});
