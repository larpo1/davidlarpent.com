interface NoteData {
  content: string;
  tags?: string[];
  published?: boolean;
  spotify?: string;
}

/**
 * Build a note block string to append to a source markdown file.
 */
export function buildNoteBlock(data: NoteData): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

  const lines: string[] = [];
  lines.push(`<!-- note: ${timestamp} -->`);

  if (data.tags && data.tags.length > 0) {
    lines.push(`<!-- tags: ${data.tags.join(', ')} -->`);
  }

  lines.push(`<!-- published: ${data.published ? 'true' : 'false'} -->`);

  if (data.spotify) {
    lines.push(`<!-- spotify: ${data.spotify} -->`);
  }

  lines.push(data.content);

  return '\n' + lines.join('\n');
}
