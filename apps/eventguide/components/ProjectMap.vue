<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-gray-200 bg-white px-4 py-3">
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
    <div ref="mapContainer" class="min-h-0 flex-1" data-testid="project-map" />
    <object
      id="map_svg"
      ref="svgObject"
      :data="floorplanUrl"
      type="image/svg+xml"
      class="hidden"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap, LayerGroup, Polygon } from 'leaflet'
import type { EventguideProject } from '~/types/api'
import {
  FLOORPLAN_BOUNDS,
  extractTableBounds,
  mapProjectsToLayers,
} from '~/composables/useFloorplanMap'

const props = defineProps<{
  projects: EventguideProject[]
  floorplanPath?: string
}>()

const mapContainer = ref<HTMLElement | null>(null)
const svgObject = ref<HTMLObjectElement | null>(null)
const searchQuery = ref('')

let map: LeafletMap | null = null
let markersLayer: LayerGroup | null = null
const polygonByTable = new Map<number, Polygon>()

const floorplanUrl = computed(() => `/${props.floorplanPath || 'map.svg'}`)

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

const tableBounds = ref<Record<number, import('~/composables/useFloorplanMap').TableBounds> | null>(null)

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

async function initMap() {
  if (!import.meta.client || !mapContainer.value) {
    return
  }

  const leaflet = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  if (map) {
    map.remove()
    map = null
    markersLayer = null
    polygonByTable.clear()
  }

  map = leaflet.map(mapContainer.value, {
    crs: leaflet.CRS.Simple,
    minZoom: -2,
    maxZoom: 20,
  })

  leaflet.imageOverlay(floorplanUrl.value, FLOORPLAN_BOUNDS).addTo(map)
  markersLayer = leaflet.featureGroup().addTo(map)
  map.fitBounds(FLOORPLAN_BOUNDS)

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

function loadTableBoundsFromSvg() {
  const object = svgObject.value
  const svgDocument = object?.contentDocument
  if (!svgDocument) {
    return
  }

  tableBounds.value = extractTableBounds(svgDocument, FLOORPLAN_BOUNDS[1][0])
  void initMap()
}

onMounted(() => {
  const object = svgObject.value
  if (!object) {
    return
  }

  if (object.contentDocument) {
    loadTableBoundsFromSvg()
  }
  else {
    object.addEventListener('load', loadTableBoundsFromSvg)
  }
})

watch(
  () => [props.projects, props.floorplanPath, tableBounds.value],
  () => {
    if (tableBounds.value) {
      void initMap()
    }
  },
)

onBeforeUnmount(() => {
  map?.remove()
})
</script>
