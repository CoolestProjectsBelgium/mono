#!/usr/bin/env node
/**
 * Smoke test: login and call GET /projectinfo twice (upload + project page).
 * Run inside the dev container: node apps/registration/scripts/auth-navigation-smoke.mjs
 */
import jwt from 'jsonwebtoken'

const { sign } = jwt

const API_BASE = process.env.SMOKE_API_BASE || process.env.API_BASE_URL || 'http://127.0.0.1:3001'
const JWT_KEY = process.env.JWT_KEY || 'U"l!p@@{An31_1dJ60zb6|3'
const USER_ID = Number(process.env.SMOKE_USER_ID || 1)

function parseSetCookie(headers) {
  const raw = headers.getSetCookie?.() ?? []
  return raw.map((entry) => entry.split(';')[0]).join('; ')
}

async function main() {
  const csrfRes = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' })
  if (!csrfRes.ok) {
    throw new Error(`csrf-token failed: ${csrfRes.status}`)
  }
  const { csrfToken } = await csrfRes.json()
  const csrfCookies = parseSetCookie(csrfRes.headers)

  const jwt = sign({ userID: USER_ID, iat: Math.floor(Date.now() / 1000) - 30 }, JWT_KEY, { expiresIn: '1h' })
  const loginRes = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
      cookie: csrfCookies,
    },
    body: JSON.stringify({ jwt }),
  })
  if (!loginRes.ok) {
    throw new Error(`login failed: ${loginRes.status} ${await loginRes.text()}`)
  }
  const loginBody = await loginRes.json()
  const sessionCookies = [csrfCookies, parseSetCookie(loginRes.headers)].filter(Boolean).join('; ')

  for (const attempt of [1, 2]) {
    const res = await fetch(`${API_BASE}/projectinfo`, {
      credentials: 'include',
      headers: { cookie: sessionCookies, accept: 'application/json' },
    })
    if (!res.ok) {
      throw new Error(`projectinfo attempt ${attempt} failed: ${res.status} ${await res.text()}`)
    }
    const body = await res.json()
    console.log(`attempt ${attempt}: ok project_name=${body.project_name ?? 'n/a'}`)
  }

  console.log(`login expires=${loginBody.expires}`)
  console.log('auth-navigation-smoke: passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
