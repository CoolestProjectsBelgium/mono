import React from 'react'

const MyLogin = () => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111827',
        color: 'white',
      }}
    >
      <form method="POST" action="/admin/login">
        <h1>Custom Admin Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
        />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  )
}

export default MyLogin