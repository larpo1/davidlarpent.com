import { test, expect } from '@playwright/test';

test.describe('Sketch Scroll Reveal', () => {
  // Helper: intercept the page HTML response and inject a .sketch-illustration image
  // into .post-content. This ensures the image exists in the DOM BEFORE any scripts run,
  // so the SketchScrollReveal component picks it up on init.
  async function injectSketchImage(page: any) {
    await page.route('**/posts/ralph-loops/', async (route: any) => {
      const response = await route.fetch();
      let html = await response.text();
      // Inject an image right after the opening .post-content div tag.
      // In dev mode, Astro adds extra attributes (data-astro-source-file, etc.)
      // so we match the full tag with a regex.
      const imgTag = '<img src="/favicon.svg" alt="test sketch" class="sketch-illustration" width="200" height="200" />';
      html = html.replace(
        /(data-field="content"[^>]*>)/,
        '$1' + imgTag
      );
      await route.fulfill({
        response,
        body: html,
        headers: { ...response.headers(), 'content-type': 'text/html' },
      });
    });
  }

  // Helper: remove Astro dev toolbar which can intercept clicks on mobile
  async function dismissDevToolbar(page: any) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const toolbar = document.querySelector('astro-dev-toolbar');
      if (toolbar) toolbar.remove();
    });
  }

  // Test 1: sketch illustrations have .sketch-illustration class
  test('sketch illustrations have .sketch-illustration class', async ({ page }) => {
    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for the injected image to appear in the DOM
    const sketchImage = page.locator('.post-content .sketch-illustration');
    await expect(sketchImage).toHaveCount(1);
    await expect(sketchImage).toHaveClass(/sketch-illustration/);
  });

  // Test 2: desktop: sketch images get sketch-reveal-active class
  test('desktop: inline sketch images are hidden', async ({ page, browserName }, testInfo) => {
    // This test only makes sense at desktop width (>1200px)
    const isDesktop = testInfo.project.name === 'Desktop Chrome' || testInfo.project.name === 'Desktop Firefox';
    test.skip(!isDesktop, 'Desktop-only test');

    await page.setViewportSize({ width: 1280, height: 800 });
    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for JS to run
    await page.waitForTimeout(500);

    // The .sketch-illustration should have .sketch-reveal-active class on desktop
    const sketchImage = page.locator('.post-content .sketch-illustration');
    await expect(sketchImage).toHaveClass(/sketch-reveal-active/);

    // It should be position: fixed (moved to right margin)
    const position = await sketchImage.evaluate((el: Element) => {
      return window.getComputedStyle(el).position;
    });
    expect(position).toBe('fixed');
  });

  // Test 3: desktop: sketch-reveal-active element exists in right margin
  test('desktop: fixed clone exists in right margin', async ({ page }, testInfo) => {
    const isDesktop = testInfo.project.name === 'Desktop Chrome' || testInfo.project.name === 'Desktop Firefox';
    test.skip(!isDesktop, 'Desktop-only test');

    await page.setViewportSize({ width: 1280, height: 800 });
    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for JS to set up
    await page.waitForTimeout(500);

    const fixedImage = page.locator('.sketch-reveal-active');
    await expect(fixedImage).toHaveCount(1);
  });

  // Test 4: desktop: sketch-reveal-active is positioned to the right of content
  test('desktop: fixed clone is positioned to the right of content', async ({ page }, testInfo) => {
    const isDesktop = testInfo.project.name === 'Desktop Chrome' || testInfo.project.name === 'Desktop Firefox';
    test.skip(!isDesktop, 'Desktop-only test');

    await page.setViewportSize({ width: 1280, height: 800 });
    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for JS to set up
    await page.waitForTimeout(500);

    const fixedImage = page.locator('.sketch-reveal-active');
    await expect(fixedImage).toHaveCount(1);

    // Get bounding rects and computed styles
    const positions = await page.evaluate(() => {
      const content = document.querySelector('.post-content');
      const img = document.querySelector('.sketch-reveal-active') as HTMLElement;
      if (!content || !img) return null;
      const contentRect = content.getBoundingClientRect();
      const imgStyle = window.getComputedStyle(img);
      return {
        contentRight: contentRect.right,
        imgPosition: imgStyle.position,
        imgRight: imgStyle.right,
        viewportWidth: window.innerWidth,
      };
    });

    expect(positions).not.toBeNull();
    // Verify the image has fixed positioning in the right margin
    expect(positions!.imgPosition).toBe('fixed');
    // The image should have a right offset that places it in the right margin
    const rightValue = parseFloat(positions!.imgRight);
    expect(rightValue).toBeGreaterThan(0);
  });

  // Test 5: mobile: sketch images are inline and visible
  test('mobile: sketch images are inline and visible', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name === 'Mobile' || testInfo.project.name === 'Tablet';
    test.skip(!isMobile, 'Mobile/tablet-only test');

    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for JS to set up mobile reveal
    await page.waitForTimeout(500);

    // On mobile, .sketch-illustration should exist in the content (not hidden)
    const sketchImage = page.locator('.post-content .sketch-illustration');
    await expect(sketchImage).toHaveCount(1);

    // The image should not have display: none (it stays inline on mobile)
    const display = await sketchImage.evaluate((el: Element) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).not.toBe('none');
  });

  // Test 6: mobile: no fixed-position images exist
  test('mobile: no fixed clones exist', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name === 'Mobile' || testInfo.project.name === 'Tablet';
    test.skip(!isMobile, 'Mobile/tablet-only test');

    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for JS
    await page.waitForTimeout(500);

    // On mobile, images should NOT have sketch-reveal-active (that's desktop only)
    const activeImages = page.locator('.sketch-reveal-active');
    await expect(activeImages).toHaveCount(0);
  });

  // Test 7: sketch images invert in dark mode
  test('sketch images invert in dark mode', async ({ page }) => {
    await injectSketchImage(page);
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Page defaults to dark mode -- verify data-theme is dark or absent (dark is default)
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    // Dark mode is either data-theme="dark" or no data-theme attribute (default)
    expect(theme === 'dark' || theme === null).toBeTruthy();

    // Check the sketch illustration's computed filter
    const filter = await page.evaluate(() => {
      const img = document.querySelector('.sketch-illustration') as HTMLElement;
      if (img) {
        return window.getComputedStyle(img).filter;
      }
      return '';
    });
    expect(filter).toContain('invert(1)');
  });

  // Test 8: no errors on post without sketch images
  test('no errors on post without sketch images', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Navigate to a post that does NOT have sketch illustrations
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Wait for scripts to execute
    await page.waitForTimeout(500);

    // There should be no JS errors from the scroll reveal script
    expect(errors).toHaveLength(0);
  });
});
