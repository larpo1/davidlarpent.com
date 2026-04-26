import { getCollection, type CollectionEntry } from 'astro:content';
import { parseNotes } from './parse-notes';

export type Theme = CollectionEntry<'themes'>;
export type Source = CollectionEntry<'sources'>;
export type Post = CollectionEntry<'posts'>;

export async function getThemes(): Promise<Theme[]> {
  const themes = await getCollection('themes');
  return themes.filter(t => !t.data.draft || import.meta.env.DEV);
}

export function noteCountForSource(source: Source): number {
  return parseNotes(source.body).length;
}

export function sourceTagsUnion(source: Source): string[] {
  const fromFrontmatter = source.data.tags ?? [];
  const fromNotes = parseNotes(source.body).flatMap(n => n.tags);
  return Array.from(new Set([...fromFrontmatter, ...fromNotes].map(t => t.toLowerCase())));
}

function intersects(a: string[], b: string[]): boolean {
  if (!a?.length || !b?.length) return false;
  const lowerA = new Set(a.map(t => t.toLowerCase()));
  return b.some(t => lowerA.has(t.toLowerCase()));
}

function latestNoteTimestamp(source: Source): string {
  const notes = parseNotes(source.body);
  if (notes.length === 0) return '';
  return notes.map(n => n.timestamp).sort().reverse()[0];
}

export function readingForTheme(theme: Theme, sources: Source[]): Source[] {
  const bySlug = new Map(sources.map(s => [s.slug, s]));
  const seen = new Set<string>();
  const ordered: Source[] = [];

  for (const slug of theme.data.sources ?? []) {
    const s = bySlug.get(slug);
    if (s && !seen.has(s.slug)) {
      ordered.push(s);
      seen.add(s.slug);
    }
  }

  const themeTags = theme.data.tags ?? [];
  if (themeTags.length > 0) {
    const stragglers = sources
      .filter(s => !seen.has(s.slug) && intersects(sourceTagsUnion(s), themeTags))
      .sort((a, b) => latestNoteTimestamp(b).localeCompare(latestNoteTimestamp(a)));
    for (const s of stragglers) {
      ordered.push(s);
      seen.add(s.slug);
    }
  }

  return ordered;
}

export function outputForTheme(theme: Theme, posts: Post[]): Post[] {
  const themeTags = theme.data.tags ?? [];
  if (themeTags.length === 0) return [];
  return posts
    .filter(p => !p.data.draft || import.meta.env.DEV)
    .filter(p => intersects(p.data.tags ?? [], themeTags))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function themesForSource(slug: string, themes: Theme[], source: Source): Theme[] {
  const sourceTags = sourceTagsUnion(source);
  return themes.filter(t => {
    if ((t.data.sources ?? []).includes(slug)) return true;
    return intersects(t.data.tags ?? [], sourceTags);
  });
}

export function themesForPost(post: Post, themes: Theme[]): Theme[] {
  const tags = post.data.tags ?? [];
  return themes.filter(t => intersects(t.data.tags ?? [], tags));
}
