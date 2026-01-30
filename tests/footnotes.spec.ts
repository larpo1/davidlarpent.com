import { test, expect } from '@playwright/test';

test.describe('Footnote Editing Protection', () => {
  test('footnotes are non-editable in dev mode', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for Tiptap to initialize
    await page.waitForTimeout(1000);

    // Check if footnote references exist in Tiptap editor
    const footnoteRefs = page.locator('.ProseMirror .footnote-ref');
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

    // Wait for Tiptap to initialize
    await page.waitForTimeout(1000);

    // Check if TiptapEditor exists for content
    const tiptapEditor = page.locator('.tiptap-content .ProseMirror');
    await expect(tiptapEditor).toBeVisible();

    // Tiptap editor should be editable (has contenteditable set by Tiptap)
    const contenteditable = await tiptapEditor.getAttribute('contenteditable');
    expect(contenteditable).toBe('true');
  });

  test('title is editable', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for Tiptap to initialize
    await page.waitForTimeout(1000);

    // Check if TiptapEditor exists for title
    const tiptapEditor = page.locator('.tiptap-title .ProseMirror');
    await expect(tiptapEditor).toBeVisible();

    // Tiptap editor should be editable
    const contenteditable = await tiptapEditor.getAttribute('contenteditable');
    expect(contenteditable).toBe('true');
  });
});
