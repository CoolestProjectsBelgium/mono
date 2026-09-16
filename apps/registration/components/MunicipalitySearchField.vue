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
        >
          <li
            v-for="(entry, index) in results"
            :id="`${inputId}-option-${index}`"
            :key="`${entry.postalcode}-${entry.municipality_name_nl}`"
            role="option"
            :aria-selected="index === highlightedIndex"
            class="p-0"
          >
            <button
              type="button"
              tabindex="-1"
              class="w-full cursor-pointer px-3 py-2 text-left text-sm touch-manipulation"
              :class="index === highlightedIndex ? 'bg-primary/10 text-primary' : 'text-gray-900 hover:bg-gray-50'"
              @mousedown="onOptionMouseDown(entry, $event)"
              @click="onOptionClick(entry)"
            >
              {{ formatMunicipalityOption(entry, locale) }}
            </button>
          </li>
        </ul>
      </div>
    </template>
  </FormField>
</template>

<script setup lang="ts">
import type { AddressDto } from '~/types/api'
import type { MunicipalityEntry } from '~/utils/municipalities/types'
import {
  formatMunicipalityOption,
  resolveMunicipalityLabel,
  searchMunicipalities,
} from '~/utils/municipalities/search-municipalities'

const model = defineModel<AddressDto>({ required: true })

const props = defineProps<{
  fieldId?: string
  label: string
  placeholder?: string
  disabled?: boolean
  error?: string
  entries?: MunicipalityEntry[]
}>()

const emit = defineEmits<{
  'clear-error': []
}>()

const { locale } = useI18n()

const fieldId = computed(() => props.fieldId ?? 'postalcode')
const listboxId = computed(() => `${fieldId.value}-listbox`)
const inputRef = ref<HTMLInputElement | null>(null)
const inputText = ref('')
const results = ref<MunicipalityEntry[]>([])
let searchTimer: ReturnType<typeof setTimeout> | undefined

function selectedOptionLabel(): string {
  return resolveMunicipalityLabel(
    props.entries ?? [],
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

function selectEntry(entry: MunicipalityEntry) {
  const municipalityName = locale.value === 'fr'
    ? entry.municipality_name_fr
    : entry.municipality_name_nl

  model.value = {
    ...model.value,
    postalcode: entry.postalcode,
    municipality_name: municipalityName,
  }
  inputText.value = formatMunicipalityOption(entry, locale.value as 'nl' | 'fr' | 'en')
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
  onOptionMouseDown,
  onOptionClick,
  onInputBlur,
  onInputKeydown,
} = useComboboxListbox<MunicipalityEntry>({
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
  results.value = searchMunicipalities(props.entries ?? [], query, locale.value as 'nl' | 'fr' | 'en')
  reveal()
}

function onInput(event: Event) {
  // Android keyboards keep an IME composition open for the whole word, and
  // v-model does not sync until it ends (vuejs/core#5580). Read the element
  // directly so the search runs on what the user actually typed.
  const value = (event.target as HTMLInputElement).value
  inputText.value = value

  emit('clear-error')

  const label = selectedOptionLabel()
  if (label && value !== label) {
    clearSelection()
  }

  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    runSearch(value)
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
