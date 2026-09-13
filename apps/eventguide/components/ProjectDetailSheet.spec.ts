import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectDetailSheet from '~/components/ProjectDetailSheet.vue'
import type { EventguideProject } from '~/types/api'

const project: EventguideProject = {
  id: 1,
  name: 'Robot Dog',
  description: 'A walking robot',
  language: 'nl',
  tableNumber: 3,
  tableName: 'Tafel_03',
  participants: ['Alex Owner'],
  agreedToPhoto: false,
  thumbnailUrl: 'https://api.example/eventguide/attachments/1/thumbnail',
}

describe('ProjectDetailSheet', () => {
  it('renders project details and photo when open', () => {
    const wrapper = mount(ProjectDetailSheet, {
      props: { open: true, project },
      global: {
        stubs: {
          LanguageBadge: true,
          PhotoConsentIcon: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="project-detail-sheet"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="project-detail-photo"]').attributes('src')).toBe(
      project.thumbnailUrl,
    )
    expect(wrapper.get('[data-testid="project-detail-description"]').text()).toBe(
      project.description,
    )
    expect(wrapper.get('[data-testid="project-detail-participants"]').text()).toBe(
      'Alex Owner',
    )
  })

  it('shows a close control when open', () => {
    const wrapper = mount(ProjectDetailSheet, {
      props: { open: true, project },
      global: {
        stubs: {
          LanguageBadge: true,
          PhotoConsentIcon: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="project-detail-close"]').exists()).toBe(true)
  })

  it('does not render when closed', () => {
    const wrapper = mount(ProjectDetailSheet, {
      props: { open: false, project },
    })

    expect(wrapper.find('[data-testid="project-detail-sheet"]').exists()).toBe(false)
  })
})
