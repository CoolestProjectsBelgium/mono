<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <VotingTimerBar v-if="authStore.loggedIn" />
    <VotingMessageBanner v-if="authStore.loggedIn" />
    <main id="main-content" class="flex-1">
      <div class="mx-auto max-w-5xl px-4 py-8">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const votingSessionStore = useVotingSessionStore()

function syncVotingWindowFromUser() {
  const user = authStore.user
  if (!user?.votingStartDate || !user?.votingEndDate) {
    return
  }

  votingSessionStore.setVotingWindow(user.votingStartDate, user.votingEndDate)
}

watch(
  () => authStore.user,
  () => {
    syncVotingWindowFromUser()
  },
  { immediate: true, deep: true },
)
</script>
