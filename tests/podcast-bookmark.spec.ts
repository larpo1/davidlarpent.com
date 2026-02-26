import { test, expect } from '@playwright/test';

test.describe('Podcast Bookmark API', () => {
  const API_URL = '/api/bookmark-podcast';
  // BOOKMARK_SECRET must be set in .env for dev server
  const SECRET = process.env.BOOKMARK_SECRET || 'test-secret';

  // Test 1: Returns 401 without auth header
  test('returns 401 without auth header', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('Unauthorized');
  });

  // Test 2: Returns 401 with wrong secret
  test('returns 401 with wrong secret', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-secret-value',
      },
      data: {},
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('Unauthorized');
  });

  // Test 3: Returns "Nothing playing" when Spotify has no active playback
  test('returns nothing-playing message via test mock', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET}`,
        'X-Test-Mock': 'nothing-playing',
      },
      data: {},
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Nothing playing');
  });

  // Test 4: Returns "playing music" when Spotify is playing a track (not podcast)
  test('returns playing-music message via test mock', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET}`,
        'X-Test-Mock': 'playing-music',
      },
      data: {},
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('music, not a podcast');
  });
});
