<template>
  <div
    v-if="alert || apiMessage"
    role="alert"
    class="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-900"
    tabindex="-1"
  >
    <template v-if="alert">
      <p class="font-medium">{{ alert.title }}</p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li v-for="item in alert.items" :key="item.key">
          <a
            :href="`#${fieldAnchorId(item.key)}`"
            class="underline decoration-red-400 underline-offset-2 hover:decoration-red-700"
            @click.prevent="scrollToField(item.key)"
          >
            {{ item.label }}
          </a>: {{ item.message }}
        </li>
      </ul>
    </template>
    <p v-else>{{ apiMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { buildValidationAlert, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'

const props = defineProps<{
  fieldErrors?: Record<string, string>
  apiMessage?: string | null
  summaryKey?: string
}>()

const { t } = useI18n()

const alert = computed(() => {
  const errors = props.fieldErrors ?? {}
  return Object.keys(errors).length > 0
    ? buildValidationAlert(errors, t, props.summaryKey)
    : null
})

function fieldAnchorId(key: string): string {
  if (key === 'mandatory_approvals') {
    return 'mandatory_approvals-error'
  }
  return key.replace(/\./g, '-')
}

function scrollToField(key: string) {
  scrollToFirstFieldError({ [key]: '' }, { mandatory_approvals: 'mandatory_approvals-error' })
}
</script>
