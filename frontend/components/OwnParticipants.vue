<template>
  <FormSection :title="$t('participants')">
    <ApiUnavailableBanner
      v-if="inviteUnavailable"
      message-key="apiUnavailable.participant"
    />
    <template v-else>
      <table v-if="participants.length" class="w-full text-left text-sm">
        <thead>
          <tr class="border-b">
            <th class="py-2">{{ $t('label_Voornaam:') }}</th>
            <th class="py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in participants" :key="p.id" class="border-b">
            <td class="py-2">{{ p.name }}</td>
            <td class="py-2 text-right">
              <button
                v-if="!p.self"
                type="button"
                class="text-red-600 hover:underline"
                @click="$emit('remove', p.id)"
              >
                {{ $t('Delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <CtaButton variant="primary" class="mt-4" @click="$emit('add')">
        {{ $t('AddToken') }}
      </CtaButton>
    </template>
  </FormSection>
</template>

<script setup lang="ts">
import type { ParticipantDto } from '~/types/api'

defineProps<{
  participants: ParticipantDto[]
  inviteUnavailable?: boolean
}>()

defineEmits<{
  add: []
  remove: [id: number]
}>()
</script>
