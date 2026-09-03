#!/usr/bin/env node
const csrfRes = await fetch('http://127.0.0.1:3001/csrf-token', { credentials: 'include' })
const cookies = csrfRes.headers.getSetCookie?.() ?? []
const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ')
const { csrfToken } = await csrfRes.json()

const loginRes = await fetch('http://127.0.0.1:3001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
    Cookie: cookieHeader,
  },
  body: JSON.stringify({ username: 'jury', password: 'jury' }),
})
const loginBody = await loginRes.text()
if (!loginRes.ok) {
  console.error('login failed', loginRes.status, loginBody)
  process.exit(1)
}
const { jwt } = JSON.parse(loginBody)
const auth = `Bearer ${jwt}`

const paths = [
  ['direct', `http://127.0.0.1:3001/projects?languages=${encodeURIComponent(JSON.stringify(['nl']))}`],
  ['tls', `https://voting.coolestprojects.localhost:8443/projects?languages=${encodeURIComponent(JSON.stringify(['nl']))}`],
  ['nuxt', `http://127.0.0.1:3005/projects?languages=${encodeURIComponent(JSON.stringify(['nl']))}`],
]

for (const [name, url] of paths) {
  const res = await fetch(url, {
    headers: { Authorization: auth },
    // @ts-expect-error node fetch
    dispatcher: url.startsWith('https') ? undefined : undefined,
  }).catch(async (err) => {
    console.log(name, 'FETCH_ERROR', err.message)
    return null
  })
  if (!res) continue
  const text = await res.text()
  console.log(name, res.status, text.slice(0, 200))
}
