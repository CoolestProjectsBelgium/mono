export type DescriptionPart =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string }

/**
 * Turns the rules word in an approval description into a link part.
 * Falls back to appending the rules label when the word is missing.
 */
export function linkifyRulesDescription(
  description: string,
  rulesWord: string,
  fallbackLinkText: string,
): DescriptionPart[] {
  const source = description.trim()
  if (!source) {
    return [{ type: 'link', text: fallbackLinkText }]
  }

  const needle = rulesWord.trim()
  if (needle) {
    const idx = source.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase())
    if (idx !== -1) {
      const end = idx + needle.length
      const parts: DescriptionPart[] = []
      if (idx > 0) {
        parts.push({ type: 'text', text: source.slice(0, idx) })
      }
      parts.push({ type: 'link', text: source.slice(idx, end) })
      if (end < source.length) {
        parts.push({ type: 'text', text: source.slice(end) })
      }
      return parts
    }
  }

  return [
    { type: 'text', text: `${source} ` },
    { type: 'link', text: fallbackLinkText },
  ]
}
