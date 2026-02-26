import type { APIRoute } from 'astro';
import { buildNoteBlock } from '../../lib/append-note';

export const prerender = false;

const needsQuoting = /[:"'#{}[\]&*?|>!%@`\n]/;
function yamlVal(v: string): string {
  if (!needsQuoting.test(v)) return v;
  return `'${v.replace(/'/g, "''")}'`;
}

function makeSlug(episodeTitle: string, showName: string): string {
  return (episodeTitle + ' ' + showName)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function getSpotifyAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error('Spotify token refresh failed: ' + (data.error_description || data.error || 'unknown'));
  }
  return data.access_token;
}

interface SpotifyEpisode {
  name: string;
  id: string;
  show: { name: string; publisher: string };
  progress_ms: number;
}

async function getCurrentlyPlaying(accessToken: string): Promise<{ episode: SpotifyEpisode } | { error: string }> {
  // Use /me/player (requires user-read-playback-state scope) — the
  // /me/player/currently-playing endpoint often returns item:null for podcasts.
  const res = await fetch('https://api.spotify.com/v1/me/player?additional_types=episode', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 204) {
    return { error: 'Nothing playing on Spotify right now' };
  }

  const data = await res.json();

  if (data.currently_playing_type !== 'episode') {
    return { error: 'Currently playing music, not a podcast episode' };
  }

  if (!data.item) {
    return { error: 'Spotify returned no episode data — try pressing play first' };
  }

  return {
    episode: {
      name: data.item.name,
      id: data.item.id,
      show: { name: data.item.show.name, publisher: data.item.show.publisher },
      progress_ms: data.progress_ms,
    },
  };
}

async function githubGetFile(
  repo: string,
  token: string,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

async function githubPutFile(
  repo: string,
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT failed: ${res.status} ${err.message || ''}`);
  }
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  // --- Auth ---
  const authHeader = request.headers.get('Authorization');
  const secret = import.meta.env.BOOKMARK_SECRET;

  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
    return json({ success: false, message: 'Unauthorized' }, 401);
  }

  // --- Env vars ---
  const spotifyClientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const spotifyRefreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;
  const githubToken = import.meta.env.GITHUB_TOKEN;
  const githubRepo = import.meta.env.GITHUB_REPO;

  if (!spotifyClientId || !spotifyClientSecret || !spotifyRefreshToken) {
    return json({ success: false, message: 'Spotify credentials not configured' }, 500);
  }
  if (!githubToken || !githubRepo) {
    return json({ success: false, message: 'GitHub credentials not configured' }, 500);
  }

  try {
    // --- Dev-only test mock (X-Test-Mock header) ---
    if (import.meta.env.DEV) {
      const testMock = request.headers.get('X-Test-Mock');
      if (testMock === 'nothing-playing') {
        return json({ success: false, message: 'Nothing playing on Spotify right now' });
      }
      if (testMock === 'playing-music') {
        return json({ success: false, message: 'Currently playing music, not a podcast episode' });
      }
    }

    // --- Parse body (optional note) ---
    let note = '';
    try {
      const body = await request.json();
      if (body.note && typeof body.note === 'string') {
        note = body.note.trim();
      }
    } catch {
      // Empty body is fine — note defaults to empty
    }

    // --- Spotify: get currently playing ---
    const accessToken = await getSpotifyAccessToken(spotifyClientId, spotifyClientSecret, spotifyRefreshToken);
    const result = await getCurrentlyPlaying(accessToken);

    if ('error' in result) {
      return json({ success: false, message: result.error });
    }

    const { episode } = result;
    const timestamp = formatTimestamp(episode.progress_ms);
    const spotifyLink = `https://open.spotify.com/episode/${episode.id}?t=${Math.floor(episode.progress_ms / 1000)}`;
    const slug = makeSlug(episode.name, episode.show.name);
    const filePath = `src/content/sources/${slug}.md`;

    // --- Note content ---
    const noteContent = note || `Bookmarked at ${timestamp}`;

    // --- GitHub: check if file exists ---
    const existing = await githubGetFile(githubRepo, githubToken, filePath);

    let fileContent: string;
    let isNew: boolean;

    if (existing) {
      // Append note to existing file
      fileContent = existing.content.trimEnd() + '\n' + buildNoteBlock({ content: noteContent, spotify: spotifyLink });
      isNew = false;
    } else {
      // Create new source file
      const today = new Date().toISOString().split('T')[0];
      const frontmatter = [
        '---',
        `title: ${yamlVal(episode.name)}`,
        `author: ${yamlVal(episode.show.publisher)}`,
        'type: podcast',
        `link: ${spotifyLink}`,
        `date: ${today}`,
        'tags: []',
        '---',
      ].join('\n');

      fileContent = frontmatter + '\n' + buildNoteBlock({ content: noteContent, spotify: spotifyLink });
      isNew = true;
    }

    // --- GitHub: write file ---
    await githubPutFile(
      githubRepo,
      githubToken,
      filePath,
      fileContent,
      `bookmark: ${slug}`,
      existing?.sha
    );

    return json({
      success: true,
      slug,
      episode: episode.name,
      show: episode.show.name,
      timestamp,
      isNew,
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    return json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
};
