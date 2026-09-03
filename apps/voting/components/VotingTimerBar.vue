<template>
  <div
    v-if="sessionStore.hasVotingWindow"
    class="border-b"
    :class="barClasses"
    role="status"
    aria-live="polite"
    data-testid="voting-timer-bar"
  >
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
      <p class="text-sm font-medium text-white">
        {{ countdownLabel }}
      </p>
      <span
        class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
        :class="badgeClasses"
        data-testid="voting-phase-badge"
      >
        {{ phaseLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useVotingSessionStore } from '~/stores/votingSession'
import { getCountdownLabel, getVotingPhase } from '~/utils/voting-window'

const sessionStore = useVotingSessionStore()
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const phase = computed(() => {
  if (!sessionStore.votingStartDate || !sessionStore.votingEndDate) {
    return 'closed' as const
  }

  return getVotingPhase(now.value, sessionStore.votingStartDate, sessionStore.votingEndDate)
})

const countdownLabel = computed(() => {
  if (!sessionStore.votingStartDate || !sessionStore.votingEndDate) {
    return ''
  }

  return getCountdownLabel(
    phase.value,
    now.value,
    sessionStore.votingStartDate,
    sessionStore.votingEndDate,
  )
})

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'upcoming':
      return 'Upcoming'
    case 'open':
      return 'Open'
    case 'closed':
      return 'Closed'
  }
})

const barClasses = computed(() => {
  switch (phase.value) {
    case 'upcoming':
      return 'border-amber-600 bg-amber-500'
    case 'open':
      return 'border-primary-dark bg-primary'
    case 'closed':
      return 'border-gray-700 bg-gray-600'
  }
})

const badgeClasses = computed(() => {
  switch (phase.value) {
    case 'upcoming':
      return 'bg-white text-amber-700'
    case 'open':
      return 'bg-white text-primary-dark'
    case 'closed':
      return 'bg-white text-gray-700'
  }
})
</script>
