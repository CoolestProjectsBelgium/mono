import { describe, expect, it } from 'vitest'
import { linkifyRulesDescription } from './linkify-rules-description'

describe('linkifyRulesDescription', () => {
  it('wraps the Dutch rules word', () => {
    expect(linkifyRulesDescription(
      'Ik heb de regels gelezen en ga ermee akkoord.',
      'regels',
      'Reglement',
    )).toEqual([
      { type: 'text', text: 'Ik heb de ' },
      { type: 'link', text: 'regels' },
      { type: 'text', text: ' gelezen en ga ermee akkoord.' },
    ])
  })

  it('wraps the English rules word case-insensitively', () => {
    expect(linkifyRulesDescription(
      'I have read the rules and I agree.',
      'rules',
      'Rules',
    )).toEqual([
      { type: 'text', text: 'I have read the ' },
      { type: 'link', text: 'rules' },
      { type: 'text', text: ' and I agree.' },
    ])
  })

  it('wraps the French rules word', () => {
    expect(linkifyRulesDescription(
      "J'ai lu les règles et je les accepte.",
      'règles',
      'Des règles',
    )).toEqual([
      { type: 'text', text: "J'ai lu les " },
      { type: 'link', text: 'règles' },
      { type: 'text', text: ' et je les accepte.' },
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
