/**
 * LinkedIn Syndication Script
 *
 * TODO: Implement LinkedIn cross-posting functionality
 *
 * This script will:
 * 1. Read a published markdown post from src/content/posts/
 * 2. Extract the first paragraph or create a custom excerpt
 * 3. Use LinkedIn's API to create a post/article
 * 4. Include a link back to the full essay on davidlarpent.com
 * 5. Optionally add relevant hashtags
 *
 * Usage (planned):
 *   npm run syndicate:linkedin -- --post="post-slug" --excerpt="custom excerpt"
 *
 * Configuration needed:
 * - LINKEDIN_ACCESS_TOKEN (environment variable)
 * - LINKEDIN_PERSON_URN (your LinkedIn user ID)
 *
 * References:
 * - LinkedIn API documentation: https://docs.microsoft.com/en-us/linkedin/
 * - LinkedIn Share API
 * - Consider character limits for LinkedIn posts (3000 chars)
 */

export {};
