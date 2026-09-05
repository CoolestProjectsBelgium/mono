import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProjectTableModal from '~/components/ProjectTableModal.vue'

const floorplanSvg = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g id="table_01"><rect x="10" y="10" width="20" height="20" /></g>
  </svg>
`

describe('ProjectTableModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads and highlights the table after the modal opens', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => floorplanSvg,
    }))

    const wrapper = mount(ProjectTableModal, {
      props: {
        open: false,
        tableNumber: 1,
        projectName: 'Robot Dog',
        floorplanPath: 'eventguide/floorplans/map.svg',
      },
    })

    await wrapper.setProps({ open: true })
    await flushPromises()

    const host = wrapper.get('[data-testid="table-modal-svg"]').element
    expect(host.querySelector('svg')).not.toBeNull()
    expect(host.querySelector('#table_01')?.classList.contains('table-highlight')).toBe(true)
    expect(wrapper.find('[data-testid="table-modal-error"]').exists()).toBe(false)
  })
})
