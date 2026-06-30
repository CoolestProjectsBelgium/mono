<template>
  <div>
    <div class="pt-3 pb-3">
      <b-button variant="info" block size="lg" @click="nextProject">
        Skip Project
      </b-button>
    </div>
    <b-overlay rounded="sm">
      <b-card no-body>
        <b-card-body>
          <b-card-title>{{ value.title }}</b-card-title>
          <b-card-text>{{ value.description }}</b-card-text>
        </b-card-body>
        <b-list-group flush>
          <b-list-group-item>{{ value.location }}</b-list-group-item>
          <b-list-group-item>Project language: {{ value.language }}</b-list-group-item>
        </b-list-group>
      </b-card>
    </b-overlay>
    <b-form class="pt-3" @submit.prevent="submitResult" @reset="resetResult">
      <b-form-group v-for="cat in value.categories" id="input-group-1" :key="cat.id + ''" :label="cat.name">
        <b-form-rating :id="cat.id + ''" v-model="cat.value" size="lg" :show-clear="cat.optional" :stars="cat.max" />
      </b-form-group>
      <div>
        <b-button type="submit" variant="primary" size="lg" block>
          Submit
        </b-button>
        <b-button type="reset" variant="danger" size="lg" block>
          Reset
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },
  emits: ['submit'],
  data () {
    return {
      result: {}
    }
  },
  methods: {
    async nextProject () {
      let result = true
      if (this.value.categories.some(item => !item.optional && item.value)) {
        result = await this.$bvModal.msgBoxConfirm('Do you want to skip to the next project',
          { centered: true, title: 'Confirm', buttonSize: 'lg' })
      }
      if (result) {
        this.$emit('next')
      }
    },
    async submitResult () {
      const data = { ...this.value }
      let result = true
      // check if all mandatory values are filled in
      if (this.value.categories.some(item => !item.optional && !item.value)) {
        result = await this.$bvModal.msgBoxConfirm('All Mandatory categories are not filled in, are you sure to submit ?',
          { centered: true, headerBgVariant: 'warning', title: 'Confirm', buttonSize: 'lg' })
      }

      if (result) {
        this.$emit('submit', data)
      }
    },
    async resetResult () {
      const data = { ...this.value }
      let result = true
      // only ask when != 0
      if (this.value.categories.some(item => item.value !== 0)) {
        result = await this.$bvModal.msgBoxConfirm('Do you want to reset ?',
          { centered: true, headerBgVariant: 'danger', title: 'Reset', buttonSize: 'lg' })
      }
      if (result) {
        for (const element of data.categories) {
          element.value = 0
        }
        this.$emit('input', data)
      }
    }
  }

}
</script>
