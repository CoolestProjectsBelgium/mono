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
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          @pointerdown="onListPointerDown"
        >
          <li
            v-for="(entry, index) in results"
            :id="`${inputId}-option-${index}`"
            :key="entry.name"
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
              @click="onOptionClick(entry)"
            >
              {{ entry.name }}
            </button>
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
  dojos?: DojoEntry[]
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
let searchTimer: ReturnType<typeof setTimeout> | undefined

function selectEntry(entry: DojoEntry) {
  model.value = entry.name
  inputText.value = entry.name
  emit('clear-error')
}

function onDismiss() {
  if (!inputText.value.trim()) {
    model.value = ''
  }
  else if (inputText.value !== model.value) {
    model.value = ''
    inputText.value = ''
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
  onOptionClick,
  onInputBlur,
  onInputKeydown,
} = useComboboxListbox<DojoEntry>({
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
  inputText.value = model.value
}

function runSearch(query: string) {
  results.value = searchDojos(props.dojos ?? [], query)
  reveal()
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

watch(() => model.value, () => syncInputFromModel(), { immediate: true })

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>
