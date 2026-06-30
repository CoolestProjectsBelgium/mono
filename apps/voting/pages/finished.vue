<template>
  <div>
    <NavBar />
    <b-container fluid>
      <h1>No projects</h1>
      <p>
        Congratulations, you voted on all projects!! 
      </p>
      <p>
        Suggestion: choose another language and help the other jury members.
      </p>
    </b-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      project: {}
    }
  },
  methods: {
  }
}
</script>
