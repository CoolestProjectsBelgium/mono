import type { SettingDto } from '~/types/api'
import { mapSettingsToViewModel } from '~/utils/settings'

export function useSettings() {
  const { apiFetch } = useApiClient()
  const { locale } = useI18n()

  async function fetchSettings(): Promise<SettingDto | null> {
    return apiFetch<SettingDto>('/settings', {
      headers: { 'Accept-Language': locale.value },
    })
  }

  async function getSettingsViewModel() {
    const settings = await fetchSettings()
    return mapSettingsToViewModel(settings)
  }

  return {
    fetchSettings,
    getSettingsViewModel,
    mapSettingsToViewModel,
  }
}
