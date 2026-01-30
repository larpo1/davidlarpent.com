import { test, expect } from '@playwright/test';

// Use a post with multiple headings for TOC testing
const POST_URL = '/posts/ralph-loops/';

test.describe('Table of Contents - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('TOC is visible on desktop by default', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(300);

    const toc = page.locator('.toc-container');
    await expect(toc).toBeVisible();
  });

  test('TOC contains correct heading links', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.setItem('tocOpen', 'true'));
    await page.reload();

    const tocLinks = page.locator('.toc-link');
    const count = await tocLinks.count();
    expect(count).toBeGreaterThan(0);

    // Each link should have an href starting with #
    for (let i = 0; i < count; i++) {
      const href = await tocLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^#/);
    }
  });

  test('clicking TOC link scrolls to section', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.setItem('tocOpen', 'true'));
    await page.reload();
    await page.waitForTimeout(300);

    // Get first TOC link
    const firstLink = page.locator('.toc-link').first();
    const href = await firstLink.getAttribute('href');
    const targetId = href?.replace('#', '');

    // Click the link
    await firstLink.click();

    // Wait for scroll
    await page.waitForTimeout(500);

    // Target element should be in viewport
    const targetElement = page.locator(`#${targetId}`);
    await expect(targetElement).toBeInViewport();
  });

  test('toggle button is hidden when TOC open on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.setItem('tocOpen', 'true'));
    await page.reload();
    await page.waitForTimeout(300);

    const toc = page.locator('.toc-container');
    const toggle = page.locator('.toc-toggle');

    // TOC is visible
    await expect(toc).toBeVisible();

    // Toggle button should be hidden on desktop when TOC is open (avoids overlap with CONTENTS heading)
    await expect(toggle).not.toBeVisible();
    await expect(toggle).toHaveClass(/open/);
  });

  test('toggle button works on medium screens', async ({ page }) => {
    // Use viewport at 1200px where toggle is still visible when open
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.setItem('tocOpen', 'true'));
    await page.reload();
    await page.waitForTimeout(300);

    const toc = page.locator('.toc-container');
    const toggle = page.locator('.toc-toggle');

    // TOC starts open (overlay mode at this width)
    await expect(toc).toBeVisible();
    await expect(toggle).toHaveClass(/open/);

    // Click toggle to close
    await toggle.click();
    await page.waitForTimeout(300);

    // TOC should be hidden
    await expect(toc).not.toBeVisible();
    await expect(toggle).not.toHaveClass(/open/);

    // Click toggle to reopen
    await toggle.click();
    await page.waitForTimeout(300);

    await expect(toc).toBeVisible();
    await expect(toggle).toHaveClass(/open/);
  });

  test('state persists across reload', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(POST_URL);

    // Close TOC
    await page.evaluate(() => {
      localStorage.setItem('tocOpen', 'false');
    });
    await page.reload();

    // TOC should be closed
    const toc = page.locator('.toc-container');
    await expect(toc).toHaveAttribute('data-open', 'false');

    // Reopen and reload
    await page.evaluate(() => {
      localStorage.setItem('tocOpen', 'true');
    });
    await page.reload();

    await expect(toc).toHaveAttribute('data-open', 'true');
  });
});

test.describe('Table of Contents - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('TOC is hidden by default on mobile', async ({ page }) => {
    const toc = page.locator('.toc-container');
    // On mobile, TOC should be hidden (display: none or off-screen)
    await expect(toc).not.toBeVisible();
  });

  test('toggle button is visible on mobile', async ({ page }) => {
    const toggle = page.locator('.toc-toggle');
    await expect(toggle).toBeVisible();
  });

  test('clicking toggle opens TOC overlay', async ({ page }) => {
    const toggle = page.locator('.toc-toggle');
    const toc = page.locator('.toc-container');

    await toggle.click();
    await page.waitForTimeout(300);

    await expect(toc).toBeVisible();
  });

  test('clicking link closes TOC on mobile', async ({ page }) => {
    const toggle = page.locator('.toc-toggle');
    const toc = page.locator('.toc-container');

    // Open TOC
    await toggle.click();
    await page.waitForTimeout(300);

    // Click a link
    const firstLink = page.locator('.toc-link').first();
    await firstLink.click();
    await page.waitForTimeout(500);

    // TOC should close on mobile
    await expect(toc).not.toBeVisible();
  });
});

test.describe('Active Section Highlighting', () => {
  test('active class applied to current section', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(POST_URL);
    await page.evaluate(() => localStorage.setItem('tocOpen', 'true'));
    await page.reload();

    // Scroll to a heading
    const headings = page.locator('h2[id], h3[id]');
    const count = await headings.count();

    if (count > 1) {
      // Scroll to second heading
      const secondHeading = headings.nth(1);
      await secondHeading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Check that corresponding TOC link has active class
      const headingId = await secondHeading.getAttribute('id');
      const tocLink = page.locator(`.toc-link[data-slug="${headingId}"]`);
      await expect(tocLink).toHaveClass(/active/);
    }
  });
});
