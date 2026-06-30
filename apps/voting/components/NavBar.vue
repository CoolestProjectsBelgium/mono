<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-container>
      <b-nav-form @submit.prevent="logout">
        <b-button type="submit" size="lg">
          Logout
        </b-button>
      </b-nav-form>
      <b-nav-form>
        <b-button type="submit" class="ml-2" to="/language" size="lg">
          Change languages
        </b-button>
      </b-nav-form>
      <b-navbar-nav class="ml-auto">
        <b-nav-text right>
          Welcome {{ $auth.user.name }}
        </b-nav-text>
      </b-navbar-nav>
    </b-container>
  </b-navbar>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    async logout () {
      await this.$auth.logout()
    }
  }
}
</script>
