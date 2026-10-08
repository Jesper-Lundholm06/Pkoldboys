export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'link'; label: string; href: string }
  | { type: 'break' }

// Only Markdown-style links [label](url) with http(s):// or mailto: URLs are recognized.
// Everything else (including other Markdown and any HTML) stays plain text, which React
// escapes when rendering — so stored content can never inject markup or javascript: URLs.
const LINK_PATTERN = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s()]+)\)/g

function parseLine(line: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let lastIndex = 0

  for (const match of line.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      tokens.push({ type: 'text', text: line.slice(lastIndex, index) })
    }
    tokens.push({ type: 'link', label: match[1], href: match[2] })
    lastIndex = index + match[0].length
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'text', text: line.slice(lastIndex) })
  }

  return tokens
}

// Splits text into paragraphs on blank lines; single newlines become line breaks.
export function parseInlineText(text: string): InlineToken[][] {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) =>
      paragraph.split('\n').flatMap((line, lineIndex) => [
        ...(lineIndex > 0 ? [{ type: 'break' } as const] : []),
        ...parseLine(line),
      ]),
    )
}
