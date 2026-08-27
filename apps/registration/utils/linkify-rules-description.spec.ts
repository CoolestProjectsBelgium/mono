import { describe, expect, it } from 'vitest'
import { linkifyRulesDescription } from './linkify-rules-description'

describe('linkifyRulesDescription', () => {
  it('wraps the Dutch rules word', () => {
    expect(linkifyRulesDescription(
      'Lees zeker onze regels. Ga je akkoord?',
      'regels',
      'Reglement',
    )).toEqual([
      { type: 'text', text: 'Lees zeker onze ' },
      { type: 'link', text: 'regels' },
      { type: 'text', text: '. Ga je akkoord?' },
    ])
  })

  it('wraps the English rules word case-insensitively', () => {
    expect(linkifyRulesDescription(
      'Be sure to read our Rules. Do you agree',
      'rules',
      'Rules',
    )).toEqual([
      { type: 'text', text: 'Be sure to read our ' },
      { type: 'link', text: 'Rules' },
      { type: 'text', text: '. Do you agree' },
    ])
  })

  it('wraps the French rules word', () => {
    expect(linkifyRulesDescription(
      "Assure-toi de lire nos règles. Es-tu d'accord ?",
      'règles',
      'Des règles',
    )).toEqual([
      { type: 'text', text: 'Assure-toi de lire nos ' },
      { type: 'link', text: 'règles' },
      { type: 'text', text: ". Es-tu d'accord ?" },
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
