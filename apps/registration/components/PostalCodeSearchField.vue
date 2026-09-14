<template>
  <FormField
    :field-id="fieldId"
    :label="label"
    :error="error"
  >
    <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
      <div ref="rootRef" class="relative">
        <input
          :id="inputId"
          ref="inputRef"
          v-model="inputText"
          type="text"
          autocomplete="off"
          role="combobox"
          :class="inputClass"
          :disabled="disabled"
          :placeholder="placeholder"
          :aria-invalid="ariaInvalid"
          :aria-describedby="ariaDescribedby"
          :aria-expanded="isOpen"
          :aria-controls="listboxId"
          :aria-activedescendant="activeDescendantId"
          aria-autocomplete="list"
          @input="onInput"
          @focus="onFocus"
          @blur="onInputBlur"
          @keydown="onKeydown"
        />
        <ul
          v-if="isOpen && results.length > 0"
          :id="listboxId"
          role="listbox"
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg touch-pan-y"
          @pointerdown="onListPointerDown"
        >
          <li
            v-for="(entry, index) in results"
            :id="`${inputId}-option-${index}`"
            :key="`${entry.postalcode}-${entry.municipality_nl}`"
            role="option"
            :aria-selected="index === highlightedIndex"
            class="p-0"
          >
            <button
              type="button"
              tabindex="-1"
              class="w-full cursor-pointer px-3 py-2 text-left text-sm touch-manipulation"
              :class="index === highlightedIndex ? 'bg-primary/10 text-primary' : 'text-gray-900 hover:bg-gray-50'"
              @pointerdown="onOptionPointerDown(entry, $event)"
              @pointerup="onOptionPointerUp(entry, $event)"
              @pointercancel="onOptionPointerCancel(entry, $event)"
              @touchstart="onOptionTouchStart(entry, $event)"
              @touchend="onOptionTouchEnd(entry, $event)"
              @click="onOptionClick(entry)"
            >
              {{ formatPostalCodeOption(entry, locale) }}
            </button>
          </li>
        </ul>
      </div>
    </template>
  </FormField>
</template>

<script setup lang="ts">
import type { AddressDto } from '~/types/api'
import type { PostalCodeEntry } from '~/utils/postal-codes/types'
import {
  formatPostalCodeOption,
  resolvePostalCodeLabel,
  searchPostalCodes,
} from '~/utils/postal-codes/search-postal-codes'

const model = defineModel<AddressDto>({ required: true })

const props = defineProps<{
  fieldId?: string
  label: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'clear-error': []
}>()

const { locale } = useI18n()

const fieldId = computed(() => props.fieldId ?? 'postalcode')
const listboxId = computed(() => `${fieldId.value}-listbox`)
const inputRef = ref<HTMLInputElement | null>(null)
const inputText = ref('')
const results = ref<PostalCodeEntry[]>([])
let searchTimer: ReturnType<typeof setTimeout> | undefined

function selectedOptionLabel(): string {
  return resolvePostalCodeLabel(
    model.value.postalcode,
    model.value.municipality_name,
    locale.value as 'nl' | 'fr' | 'en',
  )
}

function clearSelection() {
  if (model.value.postalcode === 0 && !model.value.municipality_name) {
    return
  }
  model.value = {
    ...model.value,
    postalcode: 0,
    municipality_name: '',
  }
}

function selectEntry(entry: PostalCodeEntry) {
  const municipalityName = locale.value === 'fr'
    ? entry.municipality_fr
    : entry.municipality_nl

  model.value = {
    ...model.value,
    postalcode: entry.postalcode,
    municipality_name: municipalityName,
  }
  inputText.value = formatPostalCodeOption(entry, locale.value as 'nl' | 'fr' | 'en')
  emit('clear-error')
}

function onDismiss() {
  const label = selectedOptionLabel()
  if (!inputText.value.trim()) {
    clearSelection()
  }
  else if (inputText.value !== label) {
    clearSelection()
  }
}

const {
  isOpen,
  highlightedIndex,
  rootRef,
  reveal,
  onListPointerDown,
  onOptionPointerDown,
  onOptionPointerUp,
  onOptionPointerCancel,
  onOptionTouchStart,
  onOptionTouchEnd,
  onOptionClick,
  onInputBlur,
  onInputKeydown,
} = useComboboxListbox<PostalCodeEntry>({
  items: results,
  onSelect: selectEntry,
  onDismiss,
})

const activeDescendantId = computed(() => {
  if (!isOpen.value || highlightedIndex.value < 0) {
    return undefined
  }
  return `${fieldId.value}-option-${highlightedIndex.value}`
})

function isInputFocused(): boolean {
  return inputRef.value === document.activeElement
}

function syncInputFromModel() {
  if (isInputFocused()) {
    return
  }

  inputText.value = selectedOptionLabel()
}

function runSearch(query: string) {
  results.value = searchPostalCodes(query, locale.value as 'nl' | 'fr' | 'en')
  reveal()
}

function onInput() {
  emit('clear-error')

  const label = selectedOptionLabel()
  if (label && inputText.value !== label) {
    clearSelection()
  }

  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    runSearch(inputText.value)
  }, 200)
}

function onFocus() {
  if (inputText.value.trim()) {
    runSearch(inputText.value)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value || results.value.length === 0) {
    if (event.key === 'ArrowDown' && inputText.value.trim()) {
      runSearch(inputText.value)
    }
    return
  }

  onInputKeydown(event)
}

watch(
  () => [model.value.postalcode, model.value.municipality_name] as const,
  () => syncInputFromModel(),
  { immediate: true },
)

watch(locale, () => {
  if (isInputFocused()) {
    if (inputText.value.trim()) {
      runSearch(inputText.value)
    }
    return
  }
  syncInputFromModel()
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>
