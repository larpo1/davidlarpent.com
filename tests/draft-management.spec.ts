import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Helper: remove Astro dev toolbar which can intercept clicks on mobile
async function dismissDevToolbar(page: any) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    const toolbar = document.querySelector('astro-dev-toolbar');
    if (toolbar) toolbar.remove();
  });
}

test.describe('Publish Toggle', () => {
  test('draft post shows publish toggle unchecked in dev mode', async ({ page }) => {
    // decision-systems is a draft post
    await page.goto('/posts/decision-systems/');

    const toggle = page.locator('.publish-toggle');
    await expect(toggle).toBeVisible();

    // Checkbox should be unchecked for drafts
    const checkbox = toggle.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    // Label text should say "Publish"
    const text = toggle.locator('.publish-toggle-text');
    await expect(text).toHaveText('Publish');
  });

  test('published post shows publish toggle checked in dev mode', async ({ page }) => {
    // ralph-loops is a published post
    await page.goto('/posts/ralph-loops/');

    const toggle = page.locator('.publish-toggle');
    await expect(toggle).toBeVisible();

    // Checkbox should be checked for published posts
    const checkbox = toggle.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();

    // Label text should say "Published"
    const text = toggle.locator('.publish-toggle-text');
    await expect(text).toHaveText('Published');
  });

  test('publish toggle is not visible in production rendering', async () => {
    // Check the production build output HTML for a published post
    const buildPath = path.join(process.cwd(), 'dist', 'client', 'posts', 'ralph-loops', 'index.html');
    const html = fs.readFileSync(buildPath, 'utf-8');

    // Production build should NOT contain publish-toggle (dev-only component)
    expect(html).not.toContain('publish-toggle');

    // Production build of a published post should NOT contain draft-badge either
    expect(html).not.toContain('draft-badge');
  });
});

test.describe('Slide-out Panel', () => {
  test('settings gear opens slide-out panel from right', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Panel should start closed
    const panel = page.locator('#settings-modal');
    await expect(panel).toHaveAttribute('data-open', 'false');

    // Click the settings gear button
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();

    // Panel should now be open
    await expect(panel).toHaveAttribute('data-open', 'true');

    // Verify the panel content is visible and positioned on the right
    const panelContent = page.locator('.settings-modal-content');
    await expect(panelContent).toBeVisible();

    // Check that panel is on the right side of the viewport
    const box = await panelContent.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      // Panel right edge should be at or near the viewport right edge
      expect(box.x + box.width).toBeGreaterThan(viewport.width - 10);
    }
  });

  test('slide-out panel closes on backdrop click', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Open the panel
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();

    const panel = page.locator('#settings-modal');
    await expect(panel).toHaveAttribute('data-open', 'true');

    // Click the backdrop (click at a point far from the panel)
    const backdrop = page.locator('.settings-modal-backdrop');
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Panel should be closed
    await expect(panel).toHaveAttribute('data-open', 'false');
  });

  test('slide-out panel does NOT contain a draft checkbox', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');
    await dismissDevToolbar(page);

    // Open the panel
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();

    const panel = page.locator('#settings-modal');
    await expect(panel).toHaveAttribute('data-open', 'true');

    // Verify there is no draft checkbox
    const draftCheckbox = panel.locator('#post-draft');
    await expect(draftCheckbox).toHaveCount(0);

    // Verify there is no checkbox-group with draft label
    const draftLabel = panel.locator('label[for="post-draft"]');
    await expect(draftLabel).toHaveCount(0);
  });
});
