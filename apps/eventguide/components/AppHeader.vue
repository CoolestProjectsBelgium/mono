<template>

  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">

    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">

      <div class="flex min-w-0 items-center gap-3">

        <NuxtLink :to="homePath" class="flex shrink-0 items-center" data-testid="site-logo-link">

          <img

            src="/logo-coolest-projects-belgium.png"

            alt="Coolest Projects Belgium"

            width="189"

            height="141"

            class="h-12 w-auto lg:h-16"

            data-testid="site-logo"

          >

        </NuxtLink>

        <div v-if="eventTitle" class="min-w-0">

          <p class="truncate text-sm font-semibold text-gray-900">

            {{ eventTitle }}

          </p>

          <p v-if="eventDate" class="text-xs text-gray-500">

            {{ eventDate }}

          </p>

        </div>

      </div>



      <nav class="flex items-center gap-2" aria-label="Event guide navigation">

        <NuxtLink

          :to="listPath"

          class="rounded-md px-3 py-2 text-sm font-semibold transition"

          :class="isListActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"

          data-testid="nav-list"

        >

          List

        </NuxtLink>

        <NuxtLink

          :to="mapPath"

          class="rounded-md px-3 py-2 text-sm font-semibold transition"

          :class="isMapActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"

          data-testid="nav-map"

        >

          Map

        </NuxtLink>

      </nav>

    </div>

  </header>

</template>



<script setup lang="ts">

import { formatEventDate } from '~/utils/floorplan'



const props = defineProps<{

  eventId?: number

}>()



const route = useRoute()

const store = useEventguideStore()



const basePath = computed(() =>

  props.eventId != null ? `/event/${props.eventId}` : '',

)



const homePath = computed(() => basePath.value || '/')

const listPath = computed(() => basePath.value || '/')

const mapPath = computed(() => `${basePath.value}/map`)



const isListActive = computed(() => route.path === listPath.value || route.path === `${listPath.value}/`)

const isMapActive = computed(() => route.path === mapPath.value)



const eventTitle = computed(() => store.data?.event.title)

const eventDate = computed(() =>

  store.data ? formatEventDate(store.data.event.officialStartDate) : undefined,

)

</script>


