import { test, expect } from '@playwright/test';

test.describe('Homepage Tabs', () => {
  test('Output and Input tabs exist and are visible', async ({ page }) => {
    await page.goto('/');

    const outputTab = page.locator('[data-tab="output"]');
    const inputTab = page.locator('[data-tab="input"]');
    const underline = page.locator('.tab-underline');

    await expect(outputTab).toBeVisible();
    await expect(inputTab).toBeVisible();
    await expect(underline).toBeVisible();
  });

  test('defaults to "Output" tab', async ({ page }) => {
    await page.goto('/');

    const outputTab = page.locator('[data-tab="output"]');
    await expect(outputTab).toHaveAttribute('aria-pressed', 'true');

    // Output panel should be visible
    const outputPanel = page.locator('[data-tab-panel="output"]');
    await expect(outputPanel).toBeVisible();

    // Input panel should be hidden
    const inputPanel = page.locator('[data-tab-panel="input"]');
    await expect(inputPanel).toBeHidden();
  });

  test('clicking "Input" tab shows sources list', async ({ page }) => {
    await page.goto('/');

    const inputTab = page.locator('[data-tab="input"]');
    await inputTab.click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain('?tab=input');
    await expect(inputTab).toHaveAttribute('aria-pressed', 'true');

    // Input panel should be visible
    const inputPanel = page.locator('[data-tab-panel="input"]');
    await expect(inputPanel).toBeVisible();

    // Output panel should be hidden
    const outputPanel = page.locator('[data-tab-panel="output"]');
    await expect(outputPanel).toBeHidden();

    // Should show sources
    await expect(inputPanel.locator('.source-list-item').first()).toBeVisible();
  });

  test('clicking "Output" tab shows essays', async ({ page }) => {
    await page.goto('/?tab=input');

    const outputTab = page.locator('[data-tab="output"]');
    await outputTab.click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain('?tab=output');
    await expect(outputTab).toHaveAttribute('aria-pressed', 'true');

    const outputPanel = page.locator('[data-tab-panel="output"]');
    await expect(outputPanel).toBeVisible();
  });

  test('underline moves between tabs', async ({ page }) => {
    await page.goto('/');

    const underline = page.locator('.tab-underline');
    const inputTab = page.locator('[data-tab="input"]');

    const initialPos = await underline.boundingBox();

    await inputTab.click();
    await page.waitForTimeout(500);

    const newPos = await underline.boundingBox();
    expect(newPos?.x).not.toBe(initialPos?.x);
  });

  test('deep linking: ?tab=output loads Output tab', async ({ page }) => {
    await page.goto('/?tab=output');

    const outputTab = page.locator('[data-tab="output"]');
    await expect(outputTab).toHaveAttribute('aria-pressed', 'true');

    const outputPanel = page.locator('[data-tab-panel="output"]');
    await expect(outputPanel).toBeVisible();
  });

  test('deep linking: ?tab=input loads Input tab', async ({ page }) => {
    await page.goto('/?tab=input');

    const inputTab = page.locator('[data-tab="input"]');
    await expect(inputTab).toHaveAttribute('aria-pressed', 'true');

    const inputPanel = page.locator('[data-tab-panel="input"]');
    await expect(inputPanel).toBeVisible();
  });

  test('backward compat: ?tab=work maps to Output', async ({ page }) => {
    await page.goto('/?tab=work');

    const outputTab = page.locator('[data-tab="output"]');
    await expect(outputTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('backward compat: ?tab=not-work maps to Output', async ({ page }) => {
    await page.goto('/?tab=not-work');

    const outputTab = page.locator('[data-tab="output"]');
    await expect(outputTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('browser back button navigates between tabs', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-tab="input"]').click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('?tab=input');

    await page.goBack();
    await page.waitForTimeout(300);

    const outputTab = page.locator('[data-tab="output"]');
    await expect(outputTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('source list items have type badge', async ({ page }) => {
    await page.goto('/?tab=input');
    await page.waitForTimeout(300);

    const badge = page.locator('.source-type-badge').first();
    await expect(badge).toBeVisible();
  });
});
