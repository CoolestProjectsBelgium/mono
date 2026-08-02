<template>
  <div class="form-field">
    <slot name="label" :for="inputId">
      <label v-if="label" :for="inputId" class="form-label">{{ label }}</label>
    </slot>
    <slot
      :input-id="inputId"
      :invalid="!!error"
      :error-id="errorId"
      :input-class="inputClass"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
    />
    <p v-if="error" :id="errorId" class="form-error-text" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string
  fieldId: string
  error?: string
}>()

const inputId = computed(() => props.fieldId)
const errorId = computed(() => `${props.fieldId}-error`)
const inputClass = computed(() =>
  props.error ? 'form-input form-input-error' : 'form-input',
)
</script>
