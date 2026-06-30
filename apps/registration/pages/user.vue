<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleUser') }}</h1>
    <ApiUnavailableBanner
      v-if="profileState === 'unavailable'"
      message-key="apiUnavailable.userinfo"
      class="mt-4"
    />
    <template v-else-if="user">
      <UserForm
        v-model="user"
        :settings="settings"
        :disabled="profileState === 'unavailable'"
        class="mt-6"
      />
      <div class="mt-6 flex gap-4">
        <CtaButton variant="primary" :disabled="profileState === 'unavailable'" @click="onSave">
          {{ $t('Aanpassen') }}
        </CtaButton>
        <CtaButton
          v-if="user.delete_possible"
          variant="cta"
          :disabled="profileState === 'unavailable'"
          @click="onDelete"
        >
          {{ $t('Delete') }}
        </CtaButton>
      </div>
    </template>
    <p v-else class="mt-4 text-gray-500">{{ $t('pleaseWait') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { SettingDto, UserDto } from '~/types/api'

definePageMeta({ middleware: 'authenticated' })

const { fetchUser, updateUser, deleteUser, getProfileState } = useUserinfo()
const { fetchSettings } = useSettings()
const { notify } = useNotification()

const user = ref<UserDto | null>(null)
const settings = ref<SettingDto | null>(null)
const profileState = computed(() => getProfileState(user.value))

onMounted(async () => {
  ;[user.value, settings.value] = await Promise.all([fetchUser(), fetchSettings()])
})

async function onSave() {
  if (!user.value) return
  const updated = await updateUser(user.value)
  if (updated) {
    user.value = updated
    notify('success', 'message_successChange')
  }
}

async function onDelete() {
  await deleteUser()
  await navigateTo('/')
}
</script>
