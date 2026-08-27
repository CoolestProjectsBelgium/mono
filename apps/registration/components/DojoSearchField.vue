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
            :key="entry.name"
            role="option"
            :aria-selected="index === highlightedIndex"
            class="cursor-pointer px-3 py-2 text-sm"
            :class="index === highlightedIndex ? 'bg-primary/10 text-primary' : 'text-gray-900 hover:bg-gray-50'"
            @mousedown.prevent="selectEntry(entry)"
          >
            {{ entry.name }}
          </li>
        </ul>
      </div>
    </template>
  </FormField>
</template>

<script setup lang="ts">
import type { DojoEntry } from '~/utils/dojos/types'
import { searchDojos } from '~/utils/dojos/search-dojos'

const model = defineModel<string>({ required: true })

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

const fieldId = computed(() => props.fieldId ?? 'via')
const listboxId = computed(() => `${fieldId.value}-listbox`)
const inputRef = ref<HTMLInputElement | null>(null)
const inputText = ref('')
const results = ref<DojoEntry[]>([])
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

function syncInputFromModel() {
  if (isInputFocused()) {
    return
  }
  inputText.value = model.value
}

function runSearch(query: string) {
  results.value = searchDojos(query)
  isOpen.value = results.value.length > 0
  highlightedIndex.value = results.value.length > 0 ? 0 : -1
}

function onInput() {
  emit('clear-error')
  if (model.value && inputText.value !== model.value) {
    model.value = ''
  }
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    runSearch(inputText.value)
  }, 200)
}

function onFocus() {
  runSearch(inputText.value)
}

function onBlur() {
  setTimeout(() => {
    isOpen.value = false
    highlightedIndex.value = -1
    if (!inputText.value.trim()) {
      model.value = ''
    }
    else if (inputText.value !== model.value) {
      model.value = ''
      inputText.value = ''
    }
  }, 150)
}

function selectEntry(entry: DojoEntry) {
  model.value = entry.name
  inputText.value = entry.name
  isOpen.value = false
  highlightedIndex.value = -1
  emit('clear-error')
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value || results.value.length === 0) {
    if (event.key === 'ArrowDown') {
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

watch(() => model.value, () => syncInputFromModel(), { immediate: true })

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>
