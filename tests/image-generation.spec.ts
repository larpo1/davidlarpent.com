import { test, expect } from '@playwright/test';

test.describe('Image Generation', () => {
  // Helper: remove Astro dev toolbar which can intercept clicks on mobile
  async function dismissDevToolbar(page: any) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const toolbar = document.querySelector('astro-dev-toolbar');
      if (toolbar) toolbar.remove();
    });
  }

  // Helper: select text within the contenteditable content area
  async function selectTextInContent(page: any) {
    // Use page.evaluate to reliably select text cross-browser
    await page.evaluate(() => {
      const content = document.querySelector('[contenteditable][data-field="content"]');
      if (!content) return;
      const firstP = content.querySelector('p');
      if (!firstP) return;
      const range = document.createRange();
      range.selectNodeContents(firstP);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    // Wait for toolbar to appear
    await page.waitForTimeout(300);
  }

  // Test 1: Image generation button appears in toolbar when text is selected (dev mode)
  test('Image generation button appears in toolbar when text is selected', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text in the content area
    await selectTextInContent(page);

    // Toolbar should be visible
    const toolbar = page.locator('#edit-toolbar');
    await expect(toolbar).toBeVisible();

    // Image generation button should be present in toolbar
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await expect(imageButton).toBeVisible();
  });

  // Test 2: Clicking image button with selection opens generation modal with source text
  test('Clicking image button with selection opens generation modal with source text', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text in the content area
    await selectTextInContent(page);

    // Get the selected text before clicking the button
    const selectedText = await page.evaluate(() => {
      const sel = window.getSelection();
      return sel ? sel.toString().trim() : '';
    });

    // Click the image generation button
    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    // Modal should be open
    const modal = page.locator('#image-gen-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Source text should contain the selected text
    const sourceEl = modal.locator('#image-gen-source');
    const sourceContent = await sourceEl.textContent();
    expect(sourceContent!.length).toBeGreaterThan(0);
    expect(selectedText).toContain(sourceContent!.substring(0, 20));
  });

  // Test 3: Generation modal has Generate Prompt, Generate Image, Insert, and Close buttons
  test('Generation modal has Generate Prompt, Generate Image, Insert, and Close buttons', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text and open modal
    await selectTextInContent(page);

    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    const modal = page.locator('#image-gen-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Verify all key buttons exist
    const promptBtn = modal.locator('#image-gen-prompt-btn');
    const imageBtn = modal.locator('#image-gen-image-btn');
    const insertBtn = modal.locator('#image-gen-insert');
    const closeBtn = modal.locator('.image-gen-close-button');

    await expect(promptBtn).toBeVisible();
    await expect(imageBtn).toBeVisible();
    await expect(insertBtn).toBeVisible();
    await expect(closeBtn).toBeVisible();
  });

  // Test 4: Insert button is disabled before image is generated
  test('Insert button is disabled before image is generated', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text and open modal
    await selectTextInContent(page);

    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    const modal = page.locator('#image-gen-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Insert button should be disabled initially
    const insertBtn = modal.locator('#image-gen-insert');
    await expect(insertBtn).toBeDisabled();
  });

  // Test 5: Close button closes the modal without inserting
  test('Close button closes the modal without inserting', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text and open modal
    await selectTextInContent(page);

    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    const modal = page.locator('#image-gen-modal');
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Click close
    const closeBtn = modal.locator('.image-gen-close-button');
    await closeBtn.click();

    // Modal should be closed
    await expect(modal).toHaveAttribute('data-open', 'false');

    // No sketch-illustration images should have been inserted
    const sketchImages = page.locator('.post-content .sketch-illustration');
    await expect(sketchImages).toHaveCount(0);
  });

  // Test 6: Sketch illustration images have correct CSS class and invert in dark mode
  test('Sketch illustration images have correct CSS class and invert in dark mode', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Inject a sketch-illustration image into the content for testing
    await page.evaluate(() => {
      const content = document.querySelector('[contenteditable][data-field="content"]');
      if (!content) return;
      const img = document.createElement('img');
      img.src = '/favicon.svg';
      img.alt = 'test sketch';
      img.className = 'sketch-illustration';
      content.appendChild(img);
    });

    const sketchImg = page.locator('.post-content .sketch-illustration');
    await expect(sketchImg).toHaveCount(1);

    // In dark mode (default), the image should have filter containing invert(1)
    // Note: on desktop (>1200px) the inline image is hidden by CSS (display: none)
    // for the scroll-reveal effect, but the filter rule still applies in the stylesheet.
    // Check computed filter -- even if display:none, getComputedStyle returns the filter.
    const filter = await sketchImg.evaluate((el: Element) => {
      return window.getComputedStyle(el).filter;
    });
    expect(filter).toContain('invert(1)');
  });
});
