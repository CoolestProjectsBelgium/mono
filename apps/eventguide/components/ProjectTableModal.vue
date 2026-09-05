<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    data-testid="table-modal"
    @click.self="emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-4 shadow-xl">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">
          Table {{ tableNumber }} — {{ projectName }}
        </h2>
        <button
          type="button"
          class="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
      <div
        v-if="loadError"
        class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        data-testid="table-modal-error"
      >
        {{ loadError }}
      </div>
      <div
        ref="svgHost"
        class="overflow-hidden rounded-md border border-gray-200 bg-gray-50 [&_svg]:h-auto [&_svg]:w-full"
        data-testid="table-modal-svg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveFloorplanUrl } from '~/utils/floorplan'
import { resolveApiBase } from '~/utils/api-base'

const props = defineProps<{
  open: boolean
  tableNumber: number | null
  projectName: string
  floorplanPath?: string
  floorplanVersion?: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const config = useRuntimeConfig()
const svgHost = ref<HTMLElement | null>(null)
const loadError = ref<string | null>(null)

const HIGHLIGHT_STYLE = `
@keyframes table-blink {
  from { opacity: 1; }
  to { opacity: 0.35; }
}
.table-highlight {
  animation: table-blink 1s ease-in-out infinite alternate;
}
`

function tableElementId(tableNumber: number): string[] {
  const padded = String(tableNumber).padStart(2, '0')
  return [`table_${padded}`, `table_${tableNumber}`]
}

async function renderHighlightedSvg() {
  loadError.value = null

  if (!props.open || props.tableNumber == null) {
    if (svgHost.value) {
      svgHost.value.innerHTML = ''
    }
    return
  }

  await nextTick()
  if (!svgHost.value) {
    return
  }

  const floorplanUrl = resolveFloorplanUrl(
    props.floorplanPath,
    resolveApiBase(config.public.apiBaseURL as string),
    props.floorplanVersion,
  )

  try {
    const response = await fetch(floorplanUrl, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Floor plan could not be loaded (${response.status}).`)
    }

    const svgText = await response.text()
    if (!svgText.includes('<svg')) {
      throw new Error('Floor plan response was not a valid SVG.')
    }

    svgHost.value.innerHTML = svgText

    if (!svgHost.value.querySelector('style[data-table-highlight]')) {
      const style = document.createElement('style')
      style.setAttribute('data-table-highlight', '')
      style.textContent = HIGHLIGHT_STYLE
      svgHost.value.prepend(style)
    }

    const svg = svgHost.value.querySelector('svg')
    if (svg) {
      svg.removeAttribute('width')
      svg.removeAttribute('height')
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    const tableGroup = tableElementId(props.tableNumber)
      .map((id) => svgHost.value?.querySelector(`#${id}`))
      .find((node): node is SVGElement => node instanceof SVGElement)

    if (!tableGroup) {
      loadError.value = `Table ${props.tableNumber} was not found on this floor plan.`
      return
    }

    tableGroup.classList.add('table-highlight')
    tableGroup.scrollIntoView({ block: 'center', inline: 'center' })
  }
  catch (error: unknown) {
    loadError.value = error instanceof Error ? error.message : 'Floor plan could not be loaded.'
    if (svgHost.value) {
      svgHost.value.innerHTML = ''
    }
  }
}

watch(
  () => [props.open, props.tableNumber, props.floorplanPath, props.floorplanVersion],
  () => {
    void renderHighlightedSvg()
  },
  { flush: 'post' },
)
</script>
