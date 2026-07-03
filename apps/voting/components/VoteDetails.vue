<template>
  <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Top actions: Skip Project -->
    <div class="mb-6 flex justify-end">
      <UButton
        color="amber"
        variant="soft"
        icon="i-heroicons-forward"
        size="md"
        class="font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
        @click="confirmSkip"
      >
        Skip Project
      </UButton>
    </div>

    <!-- Project Details Card -->
    <UCard
      v-if="modelValue"
      class="overflow-hidden border border-gray-800 bg-slate-900/40 backdrop-blur shadow-2xl transition-all duration-300 hover:border-gray-700/80 hover:shadow-primary-950/10 hover:shadow-2xl"
    >
      <template #header>
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap gap-2">
            <UBadge color="primary" variant="subtle" class="font-medium tracking-wide">
              📍 {{ modelValue.location || 'N/A' }}
            </UBadge>
            <UBadge color="indigo" variant="subtle" class="font-medium tracking-wide">
              🌐 {{ modelValue.language || 'N/A' }}
            </UBadge>
          </div>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {{ modelValue.title }}
          </h2>
        </div>
      </template>

      <p class="text-base leading-relaxed text-gray-300 whitespace-pre-line">
        {{ modelValue.description }}
      </p>
    </UCard>

    <!-- Project Rating Form -->
    <form v-if="modelValue?.categories?.length" class="mt-8 space-y-6" @submit.prevent="submitResult">
      <div class="space-y-4">
        <div
          v-for="cat in modelValue.categories"
          :key="cat.id"
          class="rounded-xl border border-gray-800 bg-slate-950/40 p-5 transition-all hover:border-gray-700/50"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-200 text-lg flex items-center gap-1.5">
              {{ cat.name }}
              <span v-if="!cat.optional" class="text-red-500 text-sm font-bold" title="Required">*</span>
            </span>
            <UBadge v-if="cat.optional" size="xs" color="gray" variant="solid">Optional</UBadge>
          </div>

          <!-- Interactive Glowing Stars -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <button
                v-for="star in cat.max || 5"
                :key="star"
                type="button"
                class="text-4xl focus:outline-none transition-transform hover:scale-110 active:scale-95 duration-100"
                :class="[
                  star <= (hoveredStars[cat.id] ?? cat.value ?? 0)
                    ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                    : 'text-gray-700 hover:text-gray-500'
                ]"
                @mouseenter="hoveredStars[cat.id] = star"
                @mouseleave="hoveredStars[cat.id] = null"
                @click="cat.value = star"
              >
                ★
              </button>
            </div>
            
            <UButton
              v-if="cat.optional && cat.value > 0"
              icon="i-heroicons-trash"
              size="xs"
              color="red"
              variant="ghost"
              class="ml-2 hover:bg-red-950/30"
              title="Clear rating"
              @click="cat.value = 0"
            />
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-4 flex flex-col sm:flex-row gap-4">
        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          class="flex-1 font-bold tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          Submit Score
        </UButton>
        <UButton
          type="button"
          color="gray"
          variant="soft"
          size="lg"
          class="sm:w-32 font-semibold hover:bg-slate-800"
          @click="confirmReset"
        >
          Reset
        </UButton>
      </div>
    </form>

    <!-- Confirmation Modals -->
    <!-- 1. Skip Modal -->
    <UModal v-model="modals.skip">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-800' }" class="bg-slate-900 text-gray-100 border border-gray-800">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-question-mark-circle" class="h-6 w-6 text-amber-500" />
            <h3 class="text-lg font-bold">Skip Project</h3>
          </div>
        </template>
        <p class="text-sm text-gray-300">Are you sure you want to skip to the next project? Your current changes for this project will be lost.</p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="modals.skip = false">Cancel</UButton>
            <UButton color="amber" @click="executeSkip">Yes, Skip</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- 2. Warning Modal (Unfilled mandatory values) -->
    <UModal v-model="modals.submitWarning">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-800' }" class="bg-slate-900 text-gray-100 border border-gray-800">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-500" />
            <h3 class="text-lg font-bold">Missing Required Ratings</h3>
          </div>
        </template>
        <p class="text-sm text-gray-300">Not all mandatory categories have been scored. Are you sure you want to submit your votes for this project anyway?</p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="modals.submitWarning = false">Cancel</UButton>
            <UButton color="red" @click="executeSubmit">Submit Anyway</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- 3. Reset Modal -->
    <UModal v-model="modals.reset">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-800' }" class="bg-slate-900 text-gray-100 border border-gray-800">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 text-red-500" />
            <h3 class="text-lg font-bold">Reset Ratings</h3>
          </div>
        </template>
        <p class="text-sm text-gray-300">Do you want to reset all category ratings back to 0?</p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="modals.reset = false">Cancel</UButton>
            <UButton color="red" @click="executeReset">Reset All</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue', 'submit', 'next'])

const hoveredStars = ref<Record<string, number | null>>({})

const modals = reactive({
  skip: false,
  submitWarning: false,
  reset: false
})

const confirmSkip = () => {
  // If the user has made some changes, confirm first
  const hasChanges = props.modelValue?.categories?.some((item: any) => !item.optional && item.value > 0)
  if (hasChanges) {
    modals.skip = true
  } else {
    executeSkip()
  }
}

const executeSkip = () => {
  modals.skip = false
  emit('next')
}

const submitResult = () => {
  // Check if any mandatory category is not filled
  const hasUnfilledMandatory = props.modelValue?.categories?.some((item: any) => !item.optional && !item.value)
  if (hasUnfilledMandatory) {
    modals.submitWarning = true
  } else {
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
      value: 0
    }))
  }
  emit('update:modelValue', updated)
}
</script>
