import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Draft Pill Toggle', () => {
  test('draft post shows amber "Draft" pill in dev mode', async ({ page }) => {
    // decision-systems is a draft post
    await page.goto('/posts/decision-systems/');

    const pill = page.locator('.draft-pill');
    await expect(pill).toBeVisible();
    await expect(pill).toHaveAttribute('data-status', 'draft');
    await expect(pill).toHaveText('Draft');

    // Verify amber background color (#f59e0b)
    const bgColor = await pill.evaluate(el => getComputedStyle(el).backgroundColor);
    // #f59e0b = rgb(245, 158, 11)
    expect(bgColor).toBe('rgb(245, 158, 11)');
  });

  test('published post shows green "Published" pill in dev mode', async ({ page }) => {
    // ralph-loops is a published post
    await page.goto('/posts/ralph-loops/');

    const pill = page.locator('.draft-pill');
    await expect(pill).toBeVisible();
    await expect(pill).toHaveAttribute('data-status', 'published');
    await expect(pill).toHaveText('Published');

    // Verify green background color (#22c55e)
    const bgColor = await pill.evaluate(el => getComputedStyle(el).backgroundColor);
    // #22c55e = rgb(34, 197, 94)
    expect(bgColor).toBe('rgb(34, 197, 94)');
  });

  test('draft pill is not visible in production rendering (static badge only)', async () => {
    // Check the production build output HTML for a published post
    const buildPath = path.join(process.cwd(), 'dist', 'client', 'posts', 'ralph-loops', 'index.html');
    const html = fs.readFileSync(buildPath, 'utf-8');

    // Production build should NOT contain draft-pill (dev-only component)
    expect(html).not.toContain('draft-pill');

    // Production build of a published post should NOT contain draft-badge either
    expect(html).not.toContain('draft-badge');
  });
});

test.describe('Slide-out Panel', () => {
  test('settings gear opens slide-out panel from right', async ({ page }) => {
    await page.goto('/posts/ralph-loops/');

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
