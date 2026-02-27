import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_SLUG = 'mitchell-hashimotos-new-way-of-writing-code-the-pragmatic-engineer';
const SOURCE_PATH = path.join(process.cwd(), 'src', 'content', 'sources', `${SOURCE_SLUG}.md`);
const SOURCE_URL = `/sources/${SOURCE_SLUG}`;

// Save and restore the source file around each test to avoid side effects
let originalContent: string;

test.beforeEach(() => {
  originalContent = fs.readFileSync(SOURCE_PATH, 'utf-8');
});

test.afterEach(() => {
  fs.writeFileSync(SOURCE_PATH, originalContent, 'utf-8');
});

test.describe('Note tag editing', () => {
  test('adding a tag to a note with a duplicate timestamp modifies the correct note', async ({ page }) => {
    // The source has two notes with timestamp 2026-02-27T09:22:
    //   1st: "Always have an agent..." (published, tags: [agentic-coding])
    //   2nd: "Identify the tasks..." (private, tags: [])
    // Adding a tag to the 2nd must only modify that note.

    await page.goto(SOURCE_URL);

    const noteCards = page.locator('.note-card[data-timestamp="2026-02-27T09:22"]');
    await expect(noteCards).toHaveCount(2);

    const secondCard = noteCards.nth(1);
    await expect(secondCard.locator('.note-content')).toContainText('Identify the tasks');
    expect(JSON.parse(await secondCard.getAttribute('data-tags') || '[]')).toEqual([]);

    // Add a tag to the second card
    const apiPromise = page.waitForResponse(r =>
      r.url().includes('/api/update-note') && r.status() === 200
    );
    await secondCard.locator('.note-tag-input').fill('test-duplicate-tag');
    await secondCard.locator('.note-tag-input').press('Enter');

    // Optimistic UI update should show the tag immediately
    await expect(secondCard.locator('.note-tag-pill')).toContainText('#test-duplicate-tag');

    const resp = await apiPromise;
    expect((await resp.json()).success).toBe(true);

    // Wait for deferred file write (200ms + buffer)
    await page.waitForTimeout(500);

    // Verify the file: tag appears on the SECOND note, not the first
    const content = fs.readFileSync(SOURCE_PATH, 'utf-8');
    const blocks = content.split('<!-- note: 2026-02-27T09:22 -->');
    expect(blocks).toHaveLength(3); // before + 2 notes
    expect(blocks[2]).toContain('<!-- tags: test-duplicate-tag -->');
    expect(blocks[1]).not.toContain('test-duplicate-tag');
  });

  test('adding a tag to a note persists to disk', async ({ page }) => {
    await page.goto(SOURCE_URL);

    const card = page.locator('.note-card[data-timestamp="2026-02-27T09:25"]');
    await expect(card).toHaveCount(1);

    const apiPromise = page.waitForResponse(r =>
      r.url().includes('/api/update-note') && r.status() === 200
    );
    await card.locator('.note-tag-input').fill('test-persist-tag');
    await card.locator('.note-tag-input').press('Enter');

    await expect(card.locator('.note-tag-pill').filter({ hasText: '#test-persist-tag' })).toBeVisible();
    await apiPromise;
    await page.waitForTimeout(500);

    // Verify the file has the new tag alongside originals
    const content = fs.readFileSync(SOURCE_PATH, 'utf-8');
    expect(content).toContain('<!-- tags: agentic-coding, productivity, test-persist-tag -->');
  });

  test('toggling published on a note with duplicate timestamp modifies the correct note', async ({ page }) => {
    await page.goto(SOURCE_URL);

    const noteCards = page.locator('.note-card[data-timestamp="2026-02-27T09:22"]');
    await expect(noteCards).toHaveCount(2);

    const secondCard = noteCards.nth(1);
    await expect(secondCard).toHaveClass(/note-draft/);

    // Toggle the second card to published
    const apiPromise = page.waitForResponse(r =>
      r.url().includes('/api/update-note') && r.status() === 200
    );
    await secondCard.locator('.publish-toggle-slider').click();

    const resp = await apiPromise;
    expect((await resp.json()).success).toBe(true);
    await page.waitForTimeout(500);

    // Verify the file: second note now published, first unchanged
    const content = fs.readFileSync(SOURCE_PATH, 'utf-8');
    const blocks = content.split('<!-- note: 2026-02-27T09:22 -->');
    expect(blocks).toHaveLength(3);
    expect(blocks[2]).toContain('<!-- published: true -->');
    expect(blocks[1]).toContain('<!-- published: true -->');
  });

  test('note cards have data-note-index attributes for correct API targeting', async ({ page }) => {
    await page.goto(SOURCE_URL);

    const noteCards = page.locator('.note-card');
    const count = await noteCards.count();
    expect(count).toBeGreaterThan(0);

    // Each card should have a sequential data-note-index
    for (let i = 0; i < count; i++) {
      const idx = await noteCards.nth(i).getAttribute('data-note-index');
      expect(idx).toBe(String(i));
    }
  });
});
