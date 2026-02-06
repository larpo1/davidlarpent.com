import { test, expect } from '@playwright/test';

test.describe('Homepage Tabs', () => {
  test('tabs exist and are visible', async ({ page }) => {
    await page.goto('/');

    const notWorkTab = page.locator('[data-tab="not-work"]');
    const workTab = page.locator('[data-tab="work"]');
    const underline = page.locator('.tab-underline');

    await expect(notWorkTab).toBeVisible();
    await expect(workTab).toBeVisible();
    await expect(underline).toBeVisible();
  });

  test('defaults to "Work" tab', async ({ page }) => {
    await page.goto('/');

    const workTab = page.locator('[data-tab="work"]');
    await expect(workTab).toHaveAttribute('aria-pressed', 'true');

    // Should show work posts
    await expect(page.locator('text=When Decisions Stop Scaling')).toBeVisible();

    // Should not show not-work posts initially
    await expect(page.locator('text=Ralph Loops')).toBeHidden();
  });

  test('clicking "Work" tab filters posts and updates URL', async ({ page }) => {
    await page.goto('/');

    const workTab = page.locator('[data-tab="work"]');
    await workTab.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Check URL updated
    expect(page.url()).toContain('?tab=work');

    // Check aria-pressed state
    await expect(workTab).toHaveAttribute('aria-pressed', 'true');

    // Should show work posts
    await expect(page.locator('text=When Decisions Stop Scaling')).toBeVisible();

    // Should not show not-work posts
    await expect(page.locator('text=Ralph Loops')).toBeHidden();
  });

  test('clicking "Not work" tab filters posts', async ({ page }) => {
    await page.goto('/?tab=work');

    const notWorkTab = page.locator('[data-tab="not-work"]');
    await notWorkTab.click();

    await page.waitForTimeout(500);

    expect(page.url()).toContain('?tab=not-work');
    await expect(page.locator('text=Ralph Loops')).toBeVisible();
  });

  test('underline moves between tabs', async ({ page }) => {
    await page.goto('/');

    const underline = page.locator('.tab-underline');
    const notWorkTab = page.locator('[data-tab="not-work"]');

    // Get initial position (under Work)
    const initialPos = await underline.boundingBox();

    // Click Not work tab
    await notWorkTab.click();
    await page.waitForTimeout(500);

    // Underline should have moved
    const newPos = await underline.boundingBox();
    expect(newPos?.x).not.toBe(initialPos?.x);
  });

  test('deep linking: ?tab=work loads Work tab', async ({ page }) => {
    await page.goto('/?tab=work');

    const workTab = page.locator('[data-tab="work"]');
    await expect(workTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('text=When Decisions Stop Scaling')).toBeVisible();
  });

  test('deep linking: ?tab=not-work loads Not work tab', async ({ page }) => {
    await page.goto('/?tab=not-work');

    const notWorkTab = page.locator('[data-tab="not-work"]');
    await expect(notWorkTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('text=Ralph Loops')).toBeVisible();
  });

  test('browser back button navigates between tabs', async ({ page }) => {
    await page.goto('/');

    // Click Not work tab (default is now Work)
    await page.locator('[data-tab="not-work"]').click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('?tab=not-work');

    // Go back
    await page.goBack();
    await page.waitForTimeout(300);

    // Should be back to Work tab
    const workTab = page.locator('[data-tab="work"]');
    await expect(workTab).toHaveAttribute('aria-pressed', 'true');
  });
});
