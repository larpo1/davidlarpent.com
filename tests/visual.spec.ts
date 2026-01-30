import { test, expect } from '@playwright/test';

const POST_URL = '/posts/ralph-loops/';

test.describe('Visual Regression Tests', () => {
  test('desktop layout with TOC open', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('desktop-toc-open.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.1,
    });
  });

  test('desktop layout with TOC closed', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    // Close TOC
    await page.evaluate(() => {
      localStorage.setItem('tocOpen', 'false');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('desktop-toc-closed.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.1,
    });
  });

  test('tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('tablet-layout.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.1,
    });
  });

  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.1,
    });
  });

  test('mobile overlay open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    // Open TOC
    const toggle = page.locator('.toc-toggle');
    await toggle.click();
    await page.waitForTimeout(400);

    await expect(page).toHaveScreenshot('mobile-overlay.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.1,
    });
  });

  test('light theme', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    // Switch to light theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('light-theme.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.1,
    });
  });
});

test.describe('Overlap Detection', () => {
  test('TOC does not overlap with main content on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    const toc = page.locator('.toc-container');
    const article = page.locator('.post-article');

    const tocBox = await toc.boundingBox();
    const articleBox = await article.boundingBox();

    if (tocBox && articleBox) {
      // TOC right edge should not overlap with article left edge
      const tocRightEdge = tocBox.x + tocBox.width;
      const articleLeftEdge = articleBox.x;

      expect(tocRightEdge).toBeLessThanOrEqual(articleLeftEdge + 10); // 10px tolerance for gaps
    }
  });

  test('TOC and content both visible without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    // Check that page doesn't have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
