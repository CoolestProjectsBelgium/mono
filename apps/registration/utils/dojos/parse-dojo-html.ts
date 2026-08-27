const H3_PATTERN = /<h3>(.*?)<\\?\/h3>/gi

export function stripDojoPrefix(name: string): string {
  return name.replace(/^dojo\s+/i, '').trim()
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Unique club names from CoderDojo Belgium map marker HTML. */
export function parseDojoNamesFromHtml(html: string): string[] {
  const names = new Set<string>()
  for (const match of html.matchAll(H3_PATTERN)) {
    const name = stripDojoPrefix(decodeHtmlEntities(match[1] ?? ''))
    if (name) {
      names.add(name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'nl'))
}
