#!/usr/bin/env node
/**
 * One-time Spotify OAuth setup script.
 * Walks through the Authorization Code flow to obtain a refresh token.
 *
 * Prerequisites:
 *   1. Create an app at https://developer.spotify.com/dashboard
 *   2. Add redirect URI: http://localhost:8888/callback
 *   3. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
 *
 * Usage: npm run spotify:auth
 */

import { createServer } from 'http';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment.');
  console.error('Add them to .env and run: npx tsx scripts/spotify-auth.ts');
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost:8888/callback';
const SCOPE = 'user-read-currently-playing';

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPE,
    redirect_uri: REDIRECT_URI,
  }).toString();

console.log('\n1. Open this URL in your browser:\n');
console.log(`   ${authUrl}\n`);
console.log('2. Log in to Spotify and approve the permissions.');
console.log('3. You will be redirected to localhost:8888 — the script will capture the code.\n');

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:8888`);

  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h1>Authorization failed</h1><p>' + (error || 'No code received') + '</p>');
    console.error('Authorization failed:', error || 'No code received');
    server.close();
    process.exit(1);
    return;
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.refresh_token) {
      throw new Error(data.error_description || data.error || 'Token exchange failed');
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success!</h1><p>You can close this tab. Check your terminal.</p>');

    console.log('\n✅ Got refresh token!\n');
    console.log('Add this to your Vercel environment variables:\n');
    console.log(`   SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Token exchange failed</h1>');
    console.error('Token exchange failed:', err);
  }

  server.close();
});

server.listen(8888, () => {
  console.log('Waiting for Spotify callback on http://localhost:8888/callback ...\n');
});
