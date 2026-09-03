<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : (type ?? 'button')"
    :disabled="disabled"
    :class="[variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-cta', { 'opacity-50 pointer-events-none': disabled }]"
    @click="!to && $emit('click')"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

defineProps<{
  to?: string
  disabled?: boolean
  variant?: 'primary' | 'cta' | 'secondary'
  type?: 'button' | 'submit' | 'reset'
}>()

defineEmits<{
  click: []
}>()
</script>
