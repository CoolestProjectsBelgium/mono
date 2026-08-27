import { describe, expect, it } from 'vitest'
import { isHeaderNavActive, stripLocalePrefix } from './header-nav'

describe('stripLocalePrefix', () => {
  it('leaves default-locale paths unchanged', () => {
    expect(stripLocalePrefix('/')).toBe('/')
    expect(stripLocalePrefix('/rules')).toBe('/rules')
    expect(stripLocalePrefix('/project')).toBe('/project')
  })

  it('strips en and fr prefixes', () => {
    expect(stripLocalePrefix('/en')).toBe('/')
    expect(stripLocalePrefix('/en/')).toBe('/')
    expect(stripLocalePrefix('/en/rules')).toBe('/rules')
    expect(stripLocalePrefix('/fr/project')).toBe('/project')
  })
})

describe('isHeaderNavActive', () => {
  it('marks exact matches only', () => {
    expect(isHeaderNavActive('/rules', '/rules')).toBe(true)
    expect(isHeaderNavActive('/en/rules', '/rules')).toBe(true)
    expect(isHeaderNavActive('/rules', '/')).toBe(false)
    expect(isHeaderNavActive('/', '/rules')).toBe(false)
  })

  it('marks home only on the landing page', () => {
    expect(isHeaderNavActive('/', '/')).toBe(true)
    expect(isHeaderNavActive('/en', '/')).toBe(true)
    expect(isHeaderNavActive('/user', '/')).toBe(false)
  })

  it('marks Project for project-related routes', () => {
    expect(isHeaderNavActive('/project', '/project')).toBe(true)
    expect(isHeaderNavActive('/no_project', '/project')).toBe(true)
    expect(isHeaderNavActive('/new_project', '/project')).toBe(true)
    expect(isHeaderNavActive('/upload', '/project')).toBe(true)
    expect(isHeaderNavActive('/en/token', '/project')).toBe(true)
    expect(isHeaderNavActive('/user', '/project')).toBe(false)
  })
})
