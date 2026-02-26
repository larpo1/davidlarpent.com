export interface ParsedNote {
  timestamp: string;
  tags: string[];
  published: boolean;
  spotify?: string;
  content: string;
}

/**
 * Parse structured note blocks from source markdown body.
 * Notes are delimited by `<!-- note: TIMESTAMP -->` comment headers.
 * Subsequent comment lines extract metadata (tags, published, spotify).
 * Everything else is the note content.
 */
export function parseNotes(body: string): ParsedNote[] {
  const notePattern = /<!-- note: (.+?) -->/g;
  const matches = [...body.matchAll(notePattern)];

  if (matches.length === 0) return [];

  return matches.map((match, i) => {
    const timestamp = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : body.length;
    const block = body.slice(startIndex, endIndex).trim();

    let published = false;
    let tags: string[] = [];
    let spotify: string | undefined;
    const contentLines: string[] = [];

    for (const line of block.split('\n')) {
      const trimmed = line.trim();

      const tagsMatch = trimmed.match(/^<!-- tags: (.+?) -->$/);
      if (tagsMatch) {
        tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
        continue;
      }

      const publishedMatch = trimmed.match(/^<!-- published: (true|false) -->$/);
      if (publishedMatch) {
        published = publishedMatch[1] === 'true';
        continue;
      }

      const spotifyMatch = trimmed.match(/^<!-- spotify: (.+?) -->$/);
      if (spotifyMatch) {
        spotify = spotifyMatch[1].trim();
        continue;
      }

      contentLines.push(line);
    }

    const content = contentLines.join('\n').trim();

    const note: ParsedNote = { timestamp, tags, published, content };
    if (spotify) note.spotify = spotify;
    return note;
  });
}
