<template>
  <div>
    <div v-if="loggedIn">
      <h1>Welcome, {{ user?.email || 'User' }}</h1>
      <p>Email: {{ user?.email }}</p>
      <button @click="handleLogout">
        Sign Out
      </button>
    </div>
    <div v-else>
      <p>You are not signed in.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>