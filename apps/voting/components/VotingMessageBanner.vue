<template>
  <div
    v-if="sessionStore.visibleBroadcastMessage"
    class="border-b border-blue-700 bg-blue-600 px-4 py-3 text-white"
    data-testid="voting-message-banner"
  >
    <div class="mx-auto flex max-w-5xl items-start justify-between gap-3">
      <p class="text-sm font-medium" role="alert">
        {{ sessionStore.visibleBroadcastMessage }}
      </p>
      <button
        type="button"
        class="shrink-0 text-sm font-semibold text-white/90 hover:text-white"
        data-testid="dismiss-broadcast-message"
        @click="sessionStore.dismissBroadcastMessage()"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVotingSessionStore } from '~/stores/votingSession'

const sessionStore = useVotingSessionStore()
</script>
