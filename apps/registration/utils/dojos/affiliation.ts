import { isKnownDojoName } from '~/utils/dojos/search-dojos'
import type { DojoEntry } from '~/utils/dojos/types'
import type { ViaType } from '~/utils/dojos/types'

export function normalizeViaType(value: string | null | undefined): ViaType {
  return value === 'dojo' || value === 'other' ? value : ''
}

export function isAffiliationComplete(
  viaType: ViaType,
  via: string,
  dojos: DojoEntry[] = [],
): boolean {
  if (!viaType) {
    return true
  }
  const name = via.trim()
  if (!name) {
    return false
  }
  if (viaType === 'dojo') {
    return isKnownDojoName(dojos, name)
  }
  return name.length <= 255
}
