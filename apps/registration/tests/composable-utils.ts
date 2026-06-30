import type { Pinia } from 'pinia'
import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'

export async function callComposable<T>(composable: () => T, pinia?: Pinia): Promise<T> {
  let result!: T
  const Comp = defineComponent({
    setup() {
      result = composable()
      return () => null
    },
  })
  await mountSuspended(Comp, {
    global: pinia ? { plugins: [pinia] } : undefined,
  })
  return result
}
