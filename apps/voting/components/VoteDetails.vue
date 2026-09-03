<template>
  <div class="mx-auto max-w-2xl">
    <AlertBanner
      v-if="phaseNotice"
      :variant="phaseNotice.variant"
      :message="phaseNotice.message"
      class="mb-6"
      data-testid="voting-phase-notice"
    />

    <div class="mb-6 flex justify-end">
      <CtaButton variant="secondary" @click="confirmSkip">
        Skip project
      </CtaButton>
    </div>

    <article
      v-if="modelValue"
      class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div class="border-b border-gray-200 bg-hero px-6 py-4">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {{ modelValue.location || 'N/A' }}
          </span>
          <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {{ modelValue.language || 'N/A' }}
          </span>
        </div>
        <h2 class="mt-3 text-2xl font-bold sm:text-3xl">
          {{ modelValue.title }}
        </h2>
      </div>

      <p class="whitespace-pre-line px-6 py-5 leading-relaxed text-gray-700">
        {{ modelValue.description }}
      </p>
    </article>

    <form v-if="modelValue?.categories?.length && votingOpen" class="mt-8 space-y-6" @submit.prevent="submitResult">
      <div class="space-y-4">
        <div
          v-for="cat in modelValue.categories"
          :key="cat.id"
          class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-lg font-semibold text-gray-800">
              {{ cat.name }}
              <span v-if="!cat.optional" class="text-sm font-bold text-red-500" title="Required">*</span>
            </span>
            <span
              v-if="cat.optional"
              class="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
            >
              Optional
            </span>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <button
                v-for="star in cat.max || 5"
                :key="star"
                type="button"
                class="text-4xl transition-transform duration-100 hover:scale-110 focus:outline-none active:scale-95"
                :class="star <= (hoveredStars[cat.id] ?? cat.value ?? 0)
                  ? 'text-amber-400'
                  : 'text-gray-300 hover:text-gray-400'"
                @mouseenter="hoveredStars[cat.id] = star"
                @mouseleave="hoveredStars[cat.id] = null"
                @click="cat.value = star"
              >
                ★
              </button>
            </div>

            <button
              v-if="cat.optional && cat.value > 0"
              type="button"
              class="ml-2 text-sm text-red-600 hover:underline"
              title="Clear rating"
              @click="cat.value = 0"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 pt-4 sm:flex-row">
        <CtaButton type="submit" variant="primary" class="flex-1 justify-center" :disabled="!votingOpen">
          Submit score
        </CtaButton>
        <CtaButton type="button" variant="secondary" class="sm:w-32 justify-center" @click="confirmReset">
          Reset
        </CtaButton>
      </div>
    </form>

    <ConfirmDialog
      v-model:open="modals.skip"
      title="Skip project"
      message="Are you sure you want to skip to the next project? Your current changes for this project will be lost."
      confirm-label="Yes, skip"
      cancel-label="Cancel"
      @confirm="executeSkip"
    />

    <ConfirmDialog
      v-model:open="modals.submitWarning"
      title="Missing required ratings"
      message="Not all mandatory categories have been scored. Are you sure you want to submit your votes for this project anyway?"
      confirm-label="Submit anyway"
      cancel-label="Cancel"
      @confirm="executeSubmit"
    />

    <ConfirmDialog
      v-model:open="modals.reset"
      title="Reset ratings"
      message="Do you want to reset all category ratings back to 0?"
      confirm-label="Reset all"
      cancel-label="Cancel"
      @confirm="executeReset"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useVotingSessionStore } from '~/stores/votingSession'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue', 'submit', 'next'])

const sessionStore = useVotingSessionStore()
const votingOpen = computed(() => sessionStore.phase === 'open')

const phaseNotice = computed(() => {
  switch (sessionStore.phase) {
    case 'upcoming':
      return {
        variant: 'warning' as const,
        message: 'Voting has not started yet. You can review projects, but scores cannot be submitted until voting opens.',
      }
    case 'closed':
      return {
        variant: 'error' as const,
        message: 'Voting is closed. Scores can no longer be submitted.',
      }
    default:
      return null
  }
})

const hoveredStars = ref<Record<string, number | null>>({})

const modals = reactive({
  skip: false,
  submitWarning: false,
  reset: false,
})

const confirmSkip = () => {
  const hasChanges = props.modelValue?.categories?.some((item: any) => !item.optional && item.value > 0)
  if (hasChanges) {
    modals.skip = true
  }
  else {
    executeSkip()
  }
}

const executeSkip = () => {
  modals.skip = false
  emit('next')
}

const submitResult = () => {
  if (!votingOpen.value) {
    return
  }

  const hasUnfilledMandatory = props.modelValue?.categories?.some((item: any) => !item.optional && !item.value)
  if (hasUnfilledMandatory) {
    modals.submitWarning = true
  }
  else {
    executeSubmit()
  }
}

const executeSubmit = () => {
  modals.submitWarning = false
  emit('submit', props.modelValue)
}

const confirmReset = () => {
  const hasSomeScore = props.modelValue?.categories?.some((item: any) => item.value > 0)
  if (hasSomeScore) {
    modals.reset = true
  }
}

const executeReset = () => {
  modals.reset = false
  const updated = { ...props.modelValue }
  if (updated.categories) {
    updated.categories = updated.categories.map((cat: any) => ({
      ...cat,
      value: 0,
    }))
  }
  emit('update:modelValue', updated)
}
</script>
