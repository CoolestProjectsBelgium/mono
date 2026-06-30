<template>
  <div>
    <NavBar />
    <b-container fluid>
      <b-form-group class="p-3">
        <b-form-checkbox-group
          id="checkbox-group-1"
          v-model="selected"
          size="lg"
          stacked
          :options="languages"
          value-field="id"
          text-field="text"
          name="flavour-1"
        />
      </b-form-group>
      <b-button variant="primary" size="lg" block @click="set_languages">
        Select
      </b-button>
    </b-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      languages: [],
      selected: this.$store.state.localStorage.languages
    }
  },
  async fetch () {
    this.languages = await this.$axios.$get('/voting/languages')
  },
  computed: {
  },
  methods: {
    set_languages () {
      this.$store.commit('localStorage/updateLanguages', this.selected)
      this.$router.push('/')
    }
  }
}
</script>
