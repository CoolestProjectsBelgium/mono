import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLanguageStore } from './language'
import { useProjectStore } from './project'

describe('language store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('stores string language ids', () => {
    const store = useLanguageStore()
    store.updateLanguages(['nl', 'fr'])
    expect(store.languages).toEqual(['nl', 'fr'])
  })
})

describe('project store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('clears project on clearProject', () => {
    const store = useProjectStore()
    store.setProject({
      project_id: 1,
      title: 'Test',
      description: 'Desc',
      language: 'nl',
      categories: [],
      location: 'A1',
    })
    store.clearProject()
    expect(store.project).toBeNull()
  })
})
