import { describe, expect, it } from 'vitest'
import { parseDojoNamesFromHtml } from './parse-dojo-html'

const fixture = `
    '6785-locationAddress': {"content":"<div class=\\"marker__content\\">\\n  <h3>Dojo Westerlo<\\/h3>\\n"},
    '6617-locationAddress': {"content":"<div class=\\"marker__content\\">\\n  <h3>Dojo Balen<\\/h3>\\n"},
    '6811-locationAddress': {"content":"<h3>Dojo Braine l&#039;Alleud<\\/h3>"},
    'session': {"title":"CoderDojo Ternat Summer Launch Event - 25/08/2026"},
`

describe('parseDojoNamesFromHtml', () => {
  it('extracts unique map marker names and decodes entities', () => {
    expect(parseDojoNamesFromHtml(fixture)).toEqual([
      'Balen',
      "Braine l'Alleud",
      'Westerlo',
    ])
  })

  it('does not treat session table titles as dojos', () => {
    const names = parseDojoNamesFromHtml(fixture)
    expect(names.some(name => name.includes('Summer Launch'))).toBe(false)
  })

  it('strips the Dojo prefix from club names', () => {
    const names = parseDojoNamesFromHtml(fixture)
    expect(names.every(name => !/^dojo\s/i.test(name))).toBe(true)
  })
})
