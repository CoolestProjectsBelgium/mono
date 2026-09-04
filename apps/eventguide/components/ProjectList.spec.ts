import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectList from '~/components/ProjectList.vue'
import type { EventguideProject } from '~/types/api'

const projects: EventguideProject[] = [
  {
    id: 1,
    name: 'Robot Dog',
    description: 'A walking robot',
    language: 'nl',
    tableNumber: 3,
    tableName: 'Tafel_03',
    participants: ['Alex Owner'],
    agreedToPhoto: true,
    thumbnailUrl: null,
  },
]

describe('ProjectList', () => {
  it('expands a project accordion to show the description', async () => {
    const wrapper = mount(ProjectList, {
      props: { projects },
      global: {
        stubs: {
          LanguageBadge: true,
          PhotoConsentIcon: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="project-list"]').text()).toContain('Robot Dog')
    expect(wrapper.find('[data-testid="project-panel-1"]').exists()).toBe(false)

    await wrapper.get('[data-testid="project-toggle-1"]').trigger('click')

    expect(wrapper.get('[data-testid="project-panel-1"]').text()).toContain('A walking robot')
  })
})
