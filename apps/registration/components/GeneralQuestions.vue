<template>
  <FormSection :title="$t('generalQuestions')">
    <div v-for="question in questions" :key="question.id" class="mb-4">
      <p class="font-medium">{{ question.description }}</p>
      <div class="mt-2 flex gap-4">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            :name="`question-${question.id}`"
            :checked="isYes(String(question.id))"
            @click="selectYes(String(question.id))"
          />
          <span>{{ question.positive }}</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            :name="`question-${question.id}`"
            :checked="isNo(String(question.id))"
            @click="selectNo(String(question.id))"
          />
          <span>{{ question.negative }}</span>
        </label>
      </div>
      <p
        v-if="errors?.[`general_questions.${question.id}`]"
        :id="`general_questions-${question.id}-error`"
        class="form-error-text"
        role="alert"
      >
        {{ errors[`general_questions.${question.id}`] }}
      </p>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import type { QuestionDto } from '~/types/api'

const props = defineProps<{
  questions: QuestionDto[]
  answeredIds: string[]
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  'clear-error': [fieldKey: string]
  'answer': [id: string]
}>()

const model = defineModel<string[]>({ required: true })

function isYes(id: string): boolean {
  return model.value.map(String).includes(id)
}

function isNo(id: string): boolean {
  return !isYes(id) && props.answeredIds.map(String).includes(id)
}

function selectYes(id: string) {
  emit('clear-error', `general_questions.${id}`)
  emit('answer', id)
  if (!isYes(id)) {
    model.value = [...model.value, id]
  }
}

function selectNo(id: string) {
  emit('clear-error', `general_questions.${id}`)
  emit('answer', id)
  model.value = model.value.filter(value => String(value) !== id)
}

onMounted(() => {
  for (const id of model.value) {
    emit('answer', String(id))
  }
})
</script>
