import { describe, expect, it } from 'vitest'
import { linkifyRulesDescription } from './linkify-rules-description'

describe('linkifyRulesDescription', () => {
  it('wraps the Dutch rules word', () => {
    expect(linkifyRulesDescription(
      'Ga je akkoord met onze regels?',
      'regels',
      'Reglement',
    )).toEqual([
      { type: 'text', text: 'Ga je akkoord met onze ' },
      { type: 'link', text: 'regels' },
      { type: 'text', text: '?' },
    ])
  })

  it('wraps the English rules word case-insensitively', () => {
    expect(linkifyRulesDescription(
      'Do you agree to our rules?',
      'rules',
      'Rules',
    )).toEqual([
      { type: 'text', text: 'Do you agree to our ' },
      { type: 'link', text: 'rules' },
      { type: 'text', text: '?' },
    ])
  })

  it('wraps the French rules word', () => {
    expect(linkifyRulesDescription(
      "Es-tu d'accord avec nos règles ?",
      'règles',
      'Des règles',
    )).toEqual([
      { type: 'text', text: "Es-tu d'accord avec nos " },
      { type: 'link', text: 'règles' },
      { type: 'text', text: ' ?' },
    ])
  })

  it('appends a fallback link when the rules word is missing', () => {
    expect(linkifyRulesDescription('Agree', 'regels', 'Reglement')).toEqual([
      { type: 'text', text: 'Agree ' },
      { type: 'link', text: 'Reglement' },
    ])
  })

  it('uses the fallback when the description is empty', () => {
    expect(linkifyRulesDescription('  ', 'regels', 'Reglement')).toEqual([
      { type: 'link', text: 'Reglement' },
    ])
  })
})
