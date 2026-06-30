<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :disabled="disabled"
    :class="[variant === 'primary' ? 'btn-primary' : 'btn-cta', { 'opacity-50 pointer-events-none': disabled }]"
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
  variant?: 'primary' | 'cta'
}>()

defineEmits<{
  click: []
}>()
</script>
