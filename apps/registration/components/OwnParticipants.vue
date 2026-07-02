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
            <th class="py-2">{{ $t('participantStatusLabel') }}</th>
            <th class="py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in participants" :key="p.id" class="border-b">
            <td class="py-2">
              {{ p.status === 'pending' ? $t('participantPending') : p.name }}
            </td>
            <td class="py-2">
              <span
                class="inline-flex items-center gap-2"
                :title="p.status === 'pending' ? $t('participantStatusPending') : $t('participantStatusRegistered')"
              >
                <span
                  class="inline-block h-2.5 w-2.5 rounded-full"
                  :class="p.status === 'pending' ? 'bg-amber-400' : 'bg-green-500'"
                  aria-hidden="true"
                />
                <span class="sr-only">
                  {{ p.status === 'pending' ? $t('participantStatusPending') : $t('participantStatusRegistered') }}
                </span>
              </span>
            </td>
            <td class="py-2 text-right">
              <div v-if="!p.self" class="flex flex-wrap justify-end gap-3">
                <div v-if="p.status === 'pending' && p.token" class="flex gap-3">
                  <button
                    type="button"
                    class="text-blue-600 hover:underline"
                    data-testid="copy-invite"
                    @click="onCopy(p.token!)"
                  >
                    {{ $t('participantCopyLink') }}
                  </button>
                  <button
                    type="button"
                    class="text-blue-600 hover:underline"
                    data-testid="mail-invite"
                    @click="onMail(p.token!)"
                  >
                    {{ $t('participantMailLink') }}
                  </button>
                </div>
                <button
                  type="button"
                  class="text-red-600 hover:underline disabled:opacity-50"
                  data-testid="remove-participant"
                  :disabled="removingParticipantId === p.id"
                  @click="onRemove(p)"
                >
                  {{ removingParticipantId === p.id ? $t('pleaseWait') : $t('Delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <CtaButton
        variant="primary"
        class="mt-4"
        :disabled="adding || addDisabled"
        @click="onAdd"
      >
        {{ adding ? $t('pleaseWait') : $t('AddToken') }}
      </CtaButton>
    </template>
  </FormSection>
</template>

<script setup lang="ts">
import type { ParticipantDto } from '~/types/api'

defineProps<{
  participants: ParticipantDto[]
  inviteUnavailable?: boolean
  adding?: boolean
  addDisabled?: boolean
  removingParticipantId?: number | null
}>()

const emit = defineEmits<{
  add: []
  remove: [participant: ParticipantDto]
  copy: [token: string]
  mail: [token: string]
}>()

function onAdd() {
  emit('add')
}

function onRemove(participant: ParticipantDto) {
  emit('remove', participant)
}

function onCopy(token: string) {
  emit('copy', token)
}

function onMail(token: string) {
  emit('mail', token)
}
</script>
