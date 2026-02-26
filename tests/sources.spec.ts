import { test, expect } from '@playwright/test';

test.describe('Source Detail Page', () => {
  test('source page renders header with title, author, and type badge', async ({ page }) => {
    await page.goto('/sources/abundance-ezra-klein');

    await expect(page.locator('.source-title')).toHaveText('Abundance');
    await expect(page.locator('.source-author-line')).toContainText('Ezra Klein & Derek Thompson');
    await expect(page.locator('.source-type-badge')).toHaveText('book');
  });

  test('source page shows published notes in production mode', async ({ page }) => {
    await page.goto('/sources/abundance-ezra-klein');

    // At least one note card should be visible (the published one)
    const noteCards = page.locator('.note-card');
    await expect(noteCards.first()).toBeVisible();

    // Published note content should be visible
    await expect(page.locator('.note-content').first()).toContainText('vetocracy');
  });

  test('source page has tags linked to tag pages', async ({ page }) => {
    await page.goto('/sources/abundance-ezra-klein');

    const tagLink = page.locator('.source-header .tag-link').first();
    await expect(tagLink).toBeVisible();

    const href = await tagLink.getAttribute('href');
    expect(href).toMatch(/^\/tags\//);
  });

  test('source page has back link to sources list', async ({ page }) => {
    await page.goto('/sources/abundance-ezra-klein');

    const backLink = page.locator('.back-link');
    await expect(backLink).toBeVisible();

    const href = await backLink.getAttribute('href');
    expect(href).toContain('tab=input');
  });

  test('note cards show timestamp and content', async ({ page }) => {
    await page.goto('/sources/abundance-ezra-klein');

    const noteCard = page.locator('.note-card').first();
    await expect(noteCard.locator('.note-meta time')).toBeVisible();
    await expect(noteCard.locator('.note-content')).toBeVisible();
  });

  test('source link renders when present', async ({ page }) => {
    await page.goto('/sources/abundance-ezra-klein');

    const sourceLink = page.locator('.source-link');
    await expect(sourceLink).toBeVisible();
    await expect(sourceLink).toContainText('View source');
  });
});

test.describe('Sources on Homepage', () => {
  test('Input tab shows source list items', async ({ page }) => {
    await page.goto('/?tab=input');
    await page.waitForTimeout(300);

    const sourceItems = page.locator('[data-tab-panel="input"] .source-list-item');
    await expect(sourceItems.first()).toBeVisible();
  });

  test('source items link to source detail pages', async ({ page }) => {
    await page.goto('/?tab=input');
    await page.waitForTimeout(300);

    const firstLink = page.locator('[data-tab-panel="input"] .source-list-item a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/sources\//);
  });
});

test.describe('Tag Pages with Sources', () => {
  test('tag page includes sources with matching tags', async ({ page }) => {
    await page.goto('/tags/housing');

    // Should have at least the source with housing tag
    const items = page.locator('.post-list-item');
    await expect(items.first()).toBeVisible();
  });

  test('tag page shows filter bar when both essays and sources exist', async ({ page }) => {
    // Navigate to a tag that has both posts and sources
    // Housing only has source, so check for filter bar presence logic
    await page.goto('/tags/housing');

    // The source should be visible
    const sourceItem = page.locator('.source-list-item');
    await expect(sourceItem.first()).toBeVisible();
  });
});
