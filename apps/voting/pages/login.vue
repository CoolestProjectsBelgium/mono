<template>
  <div>
    <b-container fluid>
      <b-form class="p-3" @submit.prevent="userLogin">
        <b-form-group
          id="input-group-1"
          label="Username:"
          label-for="input-1"
        >
          <b-form-input v-model="login.username" type="text" size="lg" /></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-2" label="Password:" label-for="input-2">
          <b-form-input v-model="login.password" type="password" size="lg" /></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary" size="lg" block>
          Submit
        </b-button>
      </b-form>
    </b-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      login: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async userLogin () {
      try {
        await this.$auth.loginWith('local', { data: this.login })
      } catch (error) {
        this.$toast.error('login failed')
      }
    }
  }
}
</script>
