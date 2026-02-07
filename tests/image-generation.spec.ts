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

  // Test 2: Clicking image button with selection opens generation panel with prompt pre-filled
  test('Clicking image button with selection opens generation panel with prompt pre-filled', async ({ page }) => {
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

    // Panel should be visible
    const panel = page.locator('#image-gen-panel');
    await expect(panel).toBeVisible();

    // Prompt textarea should be pre-filled with selected text
    const promptTextarea = panel.locator('#image-gen-prompt');
    const promptValue = await promptTextarea.inputValue();
    expect(promptValue.length).toBeGreaterThan(0);
    expect(selectedText).toContain(promptValue.substring(0, 20));
  });

  // Test 3: Generation panel has Generate, Insert, and Cancel buttons
  test('Generation panel has Generate, Insert, and Cancel buttons', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text and open panel
    await selectTextInContent(page);

    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    const panel = page.locator('#image-gen-panel');
    await expect(panel).toBeVisible();

    // Verify all three buttons exist
    const generateBtn = panel.locator('#image-gen-generate');
    const insertBtn = panel.locator('#image-gen-insert');
    const cancelBtn = panel.locator('#image-gen-cancel');

    await expect(generateBtn).toBeVisible();
    await expect(insertBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();
  });

  // Test 4: Insert button is disabled before image is generated
  test('Insert button is disabled before image is generated', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text and open panel
    await selectTextInContent(page);

    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    const panel = page.locator('#image-gen-panel');
    await expect(panel).toBeVisible();

    // Insert button should be disabled initially
    const insertBtn = panel.locator('#image-gen-insert');
    await expect(insertBtn).toBeDisabled();
  });

  // Test 5: Cancel closes the panel without inserting
  test('Cancel closes the panel without inserting', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Select text and open panel
    await selectTextInContent(page);

    const toolbar = page.locator('#edit-toolbar');
    const imageButton = toolbar.locator('button[data-command="generateImage"]');
    await imageButton.click();

    const panel = page.locator('#image-gen-panel');
    await expect(panel).toBeVisible();

    // Click cancel
    const cancelBtn = panel.locator('#image-gen-cancel');
    await cancelBtn.click();

    // Panel should be hidden
    await expect(panel).not.toBeVisible();

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
    await expect(sketchImg).toBeVisible();

    // In dark mode (default), the image should have filter: invert(1)
    const filter = await sketchImg.evaluate((el: Element) => {
      return window.getComputedStyle(el).filter;
    });
    expect(filter).toContain('invert(1)');
  });
});
