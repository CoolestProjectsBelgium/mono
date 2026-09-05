<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    data-testid="table-modal"
    @click.self="$emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-4 shadow-xl">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">
          Table {{ tableNumber }} — {{ projectName }}
        </h2>
        <button
          type="button"
          class="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
      <div
        ref="svgHost"
        class="overflow-hidden rounded-md border border-gray-200 bg-gray-50"
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
}>()

defineEmits<{
  close: []
}>()

const config = useRuntimeConfig()
const svgHost = ref<HTMLElement | null>(null)

async function renderHighlightedSvg() {
  if (!props.open || !svgHost.value || props.tableNumber == null) {
    return
  }

  const floorplanUrl = resolveFloorplanUrl(
    props.floorplanPath,
    resolveApiBase(config.public.apiBaseURL as string),
  )
  const response = await fetch(floorplanUrl)
  const svgText = await response.text()
  svgHost.value.innerHTML = svgText

  const padded = String(props.tableNumber).padStart(2, '0')
  const tableGroup = svgHost.value.querySelector(`#table_${padded}`)
    ?? svgHost.value.querySelector(`#table_${props.tableNumber}`)

  if (tableGroup instanceof SVGElement) {
    tableGroup.classList.add('table-highlight')
  }
}

watch(
  () => [props.open, props.tableNumber, props.floorplanPath],
  () => {
    void renderHighlightedSvg()
  },
  { immediate: true },
)
</script>

<style>
@keyframes table-blink {
  from { opacity: 1; }
  to { opacity: 0.35; }
}

:deep(.table-highlight) {
  animation: table-blink 1s ease-in-out infinite alternate;
}
</style>
