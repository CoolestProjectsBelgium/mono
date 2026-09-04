import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProjectMap from '~/components/ProjectMap.vue'
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
  {
    id: 2,
    name: 'No table',
    description: 'Hidden on map',
    language: 'fr',
    tableNumber: null,
    tableName: null,
    participants: [],
    agreedToPhoto: false,
    thumbnailUrl: null,
  },
]

describe('ProjectMap', () => {
  it('renders search input for map projects', () => {
    const wrapper = mount(ProjectMap, {
      props: {
        projects,
        floorplanPath: 'map.svg',
      },
    })

    expect(wrapper.get('[data-testid="map-search"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="project-map"]').exists()).toBe(true)
  })
})
