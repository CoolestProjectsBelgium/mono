<template>
  <FormField
    :field-id="fieldId"
    :label="label"
    :error="error"
  >
    <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
      <div class="relative">
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
          @blur="onBlur"
          @keydown="onKeydown"
        />
        <ul
          v-if="isOpen && results.length > 0"
          :id="listboxId"
          role="listbox"
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          <li
            v-for="(entry, index) in results"
            :id="`${inputId}-option-${index}`"
            :key="`${entry.postalcode}-${entry.municipality_nl}`"
            role="option"
            :aria-selected="index === highlightedIndex"
            class="cursor-pointer px-3 py-2 text-sm"
            :class="index === highlightedIndex ? 'bg-primary/10 text-primary' : 'text-gray-900 hover:bg-gray-50'"
            @mousedown.prevent="selectEntry(entry)"
          >
            {{ formatPostalCodeOption(entry, locale) }}
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
  findPostalCodeEntry,
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
const isOpen = ref(false)
const highlightedIndex = ref(-1)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const activeDescendantId = computed(() => {
  if (!isOpen.value || highlightedIndex.value < 0) {
    return undefined
  }
  return `${fieldId.value}-option-${highlightedIndex.value}`
})

function isInputFocused(): boolean {
  return inputRef.value === document.activeElement
}

function selectedOptionLabel(): string {
  return resolvePostalCodeLabel(
    model.value.postalcode,
    model.value.municipality_name,
    locale.value as 'nl' | 'fr' | 'en',
  )
}

function syncInputFromModel() {
  if (isInputFocused()) {
    return
  }

  inputText.value = selectedOptionLabel()
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

function runSearch(query: string) {
  results.value = searchPostalCodes(query, locale.value as 'nl' | 'fr' | 'en')
  isOpen.value = results.value.length > 0
  highlightedIndex.value = results.value.length > 0 ? 0 : -1
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

function onBlur() {
  setTimeout(() => {
    isOpen.value = false
    highlightedIndex.value = -1

    const label = selectedOptionLabel()
    if (!inputText.value.trim()) {
      clearSelection()
    }
    else if (inputText.value !== label) {
      clearSelection()
    }
  }, 150)
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
  isOpen.value = false
  highlightedIndex.value = -1
  emit('clear-error')
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value || results.value.length === 0) {
    if (event.key === 'ArrowDown' && inputText.value.trim()) {
      runSearch(inputText.value)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, results.value.length - 1)
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  }
  else if (event.key === 'Enter') {
    event.preventDefault()
    const entry = results.value[highlightedIndex.value]
    if (entry) {
      selectEntry(entry)
    }
  }
  else if (event.key === 'Escape') {
    isOpen.value = false
    highlightedIndex.value = -1
  }
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
