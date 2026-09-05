<template>
  <div class="project-map-layout">
    <div class="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
      <label class="block text-sm font-medium text-gray-700" for="map-search">
        Search projects
      </label>
      <input
        id="map-search"
        v-model="searchQuery"
        type="search"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Project name or participant"
        data-testid="map-search"
      >
      <ul
        v-if="searchQuery && filteredLayers.length"
        class="mt-2 max-h-40 overflow-auto rounded-md border border-gray-200 bg-white shadow-sm"
      >
        <li
          v-for="layer in filteredLayers"
          :key="layer.project.id"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            @click="focusLayer(layer.tableNumber)"
          >
            {{ layer.searchLabel }}
          </button>
        </li>
      </ul>
    </div>

    <div class="project-map-canvas bg-gray-100">
      <div
        v-if="floorplanLoading"
        class="absolute inset-0 z-10 flex items-center justify-center text-sm text-gray-600"
        data-testid="map-loading"
      >
        Loading floor plan...
      </div>
      <div
        v-else-if="loadError"
        class="absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-sm text-red-700"
        data-testid="map-load-error"
      >
        {{ loadError }}
      </div>
      <div
        v-else-if="mapReady && layers.length === 0"
        class="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 py-3 text-sm text-gray-500"
        data-testid="map-empty"
      >
        No projects with table assignments are available on this map yet.
      </div>
      <div
        ref="mapContainer"
        class="absolute inset-0 z-0"
        data-testid="project-map"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap, LayerGroup, Polygon } from 'leaflet'
import type { EventguideProject } from '~/types/api'
import {
  extractTableBounds,
  mapProjectsToLayers,
} from '~/composables/useFloorplanMap'
import { resolveFloorplanUrl } from '~/utils/floorplan'
import { resolveApiBase } from '~/utils/api-base'
import {
  mapHeightFromBounds,
  readViewBoxBounds,
  readViewBoxFromSvgText,
  type LeafletBounds,
} from '~/utils/viewbox-bounds'

const props = defineProps<{
  projects: EventguideProject[]
  floorplanPath?: string
  floorplanVersion?: string | null
}>()

const config = useRuntimeConfig()
const mapContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const floorplanBounds = ref<LeafletBounds | null>(null)
const floorplanLoading = ref(true)
const mapReady = ref(false)
const loadError = ref<string | null>(null)

let map: LeafletMap | null = null
let markersLayer: LayerGroup | null = null
let floorplanObjectUrl: string | null = null
const polygonByTable = new Map<number, Polygon>()

function revokeFloorplanObjectUrl() {
  if (floorplanObjectUrl) {
    URL.revokeObjectURL(floorplanObjectUrl)
    floorplanObjectUrl = null
  }
}

const floorplanUrl = computed(() =>
  resolveFloorplanUrl(
    props.floorplanPath,
    resolveApiBase(config.public.apiBaseURL as string),
    props.floorplanVersion,
  ),
)

const tableBounds = ref<Record<number, import('~/composables/useFloorplanMap').TableBounds> | null>(null)

const layers = computed(() => {
  if (!tableBounds.value) {
    return []
  }
  return mapProjectsToLayers(props.projects, tableBounds.value)
})

const filteredLayers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return []
  }
  return layers.value.filter((layer) =>
    layer.searchLabel.toLowerCase().includes(query),
  )
})

function buildPopupHtml(project: EventguideProject, title: string): string {
  const participants = project.participants
    .map((name) => `<span class="inline-block rounded bg-gray-100 px-2 py-1 text-xs">${name}</span>`)
    .join(' ')

  const photoIcon = project.agreedToPhoto ? '📷' : '🚫'
  const image = project.thumbnailUrl
    ? `<img src="${project.thumbnailUrl}" alt="${project.name}" style="width:100%;border-radius:0.375rem;margin-bottom:0.5rem;" />`
    : ''

  return `
    <div>
      <strong>${title}</strong>
      ${image}
      <div style="display:flex;gap:0.5rem;align-items:center;margin:0.5rem 0;">
        <span style="font-size:0.75rem;font-weight:600;text-transform:uppercase;">${project.language}</span>
        <span>${photoIcon}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.5rem;">${participants}</div>
      <p style="margin:0;font-size:0.875rem;">${project.description}</p>
    </div>
  `
}

function focusLayer(tableNumber: number) {
  const polygon = polygonByTable.get(tableNumber)
  if (!polygon || !map) {
    return
  }
  map.fitBounds(polygon.getBounds(), { maxZoom: 2 })
  polygon.openPopup()
  searchQuery.value = ''
}

function renderProjectLayers(leaflet: typeof import('leaflet')) {
  if (!map || !markersLayer) {
    return
  }

  markersLayer.clearLayers()
  polygonByTable.clear()

  for (const layer of layers.value) {
    const coord: [number, number][] = [
      [layer.bounds.y0, layer.bounds.x0],
      [layer.bounds.y1, layer.bounds.x1],
      [layer.bounds.y2, layer.bounds.x2],
      [layer.bounds.y3, layer.bounds.x3],
    ]

    const polygon = leaflet.polygon(coord, {
      color: '#00AEA9',
      weight: 1,
      fillOpacity: 0.35,
    })

    polygon.bindPopup(buildPopupHtml(layer.project, layer.title))
    markersLayer.addLayer(polygon)
    polygonByTable.set(layer.tableNumber, polygon)
  }
}

async function initMap(svgText: string) {
  if (!import.meta.client || !mapContainer.value || !floorplanBounds.value) {
    return
  }

  try {
    await nextTick()

    const leaflet = await import('leaflet')
    await import('leaflet/dist/leaflet.css')

    if (map) {
      map.remove()
      map = null
      markersLayer = null
      polygonByTable.clear()
    }

    revokeFloorplanObjectUrl()
    floorplanObjectUrl = URL.createObjectURL(
      new Blob([svgText], { type: 'image/svg+xml' }),
    )

    map = leaflet.map(mapContainer.value, {
      crs: leaflet.CRS.Simple,
      minZoom: -2,
      maxZoom: 20,
    })

    leaflet.imageOverlay(floorplanObjectUrl, floorplanBounds.value).addTo(map)
    markersLayer = leaflet.featureGroup().addTo(map)
    map.fitBounds(floorplanBounds.value)
    renderProjectLayers(leaflet)

    await nextTick()
    map.invalidateSize()
    requestAnimationFrame(() => map?.invalidateSize())

    mapReady.value = true
    floorplanLoading.value = false
    loadError.value = null
  }
  catch (error: unknown) {
    loadError.value = error instanceof Error ? error.message : 'Map could not be initialized.'
    floorplanLoading.value = false
  }
}

async function loadFloorplan() {
  mapReady.value = false
  loadError.value = null
  floorplanLoading.value = true
  tableBounds.value = null
  floorplanBounds.value = null
  revokeFloorplanObjectUrl()

  try {
    const response = await fetch(floorplanUrl.value, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Floor plan could not be loaded (${response.status}).`)
    }

    const svgText = await response.text()
    if (!svgText.includes('<svg')) {
      throw new Error('Floor plan response was not a valid SVG.')
    }

    floorplanBounds.value = readViewBoxFromSvgText(svgText)
    if (!floorplanBounds.value) {
      const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml')
      const svg = svgDocument.querySelector('svg')
      if (svg) {
        floorplanBounds.value = readViewBoxBounds(svg)
      }
    }

    if (!floorplanBounds.value) {
      throw new Error('Floor plan SVG is missing a viewBox.')
    }

    try {
      const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml')
      tableBounds.value = extractTableBounds(
        svgDocument,
        mapHeightFromBounds(floorplanBounds.value),
      )
    }
    catch {
      tableBounds.value = {}
    }

    await initMap(svgText)
  }
  catch (error: unknown) {
    loadError.value = error instanceof Error ? error.message : 'Floor plan could not be loaded.'
    floorplanLoading.value = false
    revokeFloorplanObjectUrl()
  }
}

onMounted(() => {
  void loadFloorplan()
})

watch(
  () => [props.projects, tableBounds.value],
  async () => {
    if (!map || !tableBounds.value) {
      return
    }

    const leaflet = await import('leaflet')
    renderProjectLayers(leaflet)
  },
)

watch(floorplanUrl, () => {
  void loadFloorplan()
})

onBeforeUnmount(() => {
  revokeFloorplanObjectUrl()
  map?.remove()
})
</script>
