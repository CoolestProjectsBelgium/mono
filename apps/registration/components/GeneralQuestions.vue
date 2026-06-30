<template>
  <FormSection :title="$t('generalQuestions')">
    <div v-for="question in questions" :key="question.id" class="mb-4">
      <p class="font-medium">{{ question.description }}</p>
      <div class="mt-2 flex gap-4">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            :name="`question-${question.id}`"
            :checked="model.includes(String(question.id))"
            @change="selectYes(String(question.id))"
          />
          <span>{{ question.positive }}</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            :name="`question-${question.id}`"
            :checked="!model.includes(String(question.id)) && answered.has(String(question.id))"
            @change="selectNo(String(question.id))"
          />
          <span>{{ question.negative }}</span>
        </label>
      </div>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import type { QuestionDto } from '~/types/api'

const props = defineProps<{
  questions: QuestionDto[]
}>()

const model = defineModel<string[]>({ required: true })
const answered = ref<Set<string>>(new Set())

function selectYes(id: string) {
  answered.value = new Set([...answered.value, id])
  if (!model.value.includes(id)) {
    model.value = [...model.value, id]
  }
}

function selectNo(id: string) {
  answered.value = new Set([...answered.value, id])
  model.value = model.value.filter(value => value !== id)
}

watch(
  () => props.questions,
  () => {
    answered.value = new Set()
  },
)
</script>
