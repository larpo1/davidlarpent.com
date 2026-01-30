# Task: Add Draft/Publish Workflow

Add a simple draft/publish workflow for the blog.

## 1. Drafts Page (dev only)

Create `src/pages/drafts.astro` that:
- Lists all posts where `draft: true`
- Shows title, date, and link to preview
- Only renders content in dev mode (`import.meta.env.DEV`)
- Returns 404 or redirects to home in production

## 2. Publish Script

Create `scripts/publish.ts` that:
- Takes a post slug as argument (e.g., `what-we-lose-when-we-stop-struggling`)
- Finds the corresponding markdown file in `src/content/posts/`
- Updates the frontmatter: sets `draft: false`
- Optionally updates `date` to today if a `--today` flag is passed
- Runs: `git add`, `git commit -m "Publish: {post title}"`, `git push`
- Provides helpful error messages if file not found or already published

## 3. New Post Script

Create `scripts/new-post.ts` that:
- Takes a title as argument (e.g., `"The Joy of Debugging"`)
- Generates a slug from the title (lowercase, hyphens, no special chars)
- Creates a new file in `src/content/posts/{slug}.md`
- Includes frontmatter boilerplate:
  ```yaml
  ---
  title: "The Joy of Debugging"
  date: 2026-01-30  # today's date
  description: ""
  draft: true
  ---
  
  Write your essay here.
  ```
- Opens the file in VS Code (`code {filepath}`)
- Errors gracefully if file already exists

## 4. Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "drafts": "astro dev",
    "publish": "npx tsx scripts/publish.ts",
    "new": "npx tsx scripts/new-post.ts"
  }
}
```

## Usage

```bash
# Create a new draft
npm run new "The Joy of Debugging"

# Preview drafts locally
npm run dev
# Then visit http://localhost:4321/drafts

# Publish a draft
npm run publish the-joy-of-debugging

# Publish and update date to today
npm run publish the-joy-of-debugging --today
```

## Constraints

- Keep it simple
- No new dependencies beyond what's already installed (tsx should be added if not present)
- Use Node.js fs for file operations
- Handle errors gracefully with helpful messages
