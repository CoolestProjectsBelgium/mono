#!/usr/bin/env node
/**
 * Smoke test: login via proxy URLs and call /userinfo from a cross-origin context.
 * Run inside the dev container:
 *   node apps/registration/scripts/auth-cross-origin-smoke.mjs
 */
import jwt from 'jsonwebtoken'

const API_BASE = process.env.SMOKE_API_BASE || 'https://api.coolestprojects.localhost:8443'
const ORIGIN = process.env.SMOKE_ORIGIN || 'https://registration.coolestprojects.localhost:8443'
const JWT_KEY = process.env.JWT_KEY || 'U"l!p@@{An31_1dJ60zb6|3'
const USER_ID = Number(process.env.SMOKE_USER_ID || 1)
const PROXY_HEADERS = API_BASE.includes('127.0.0.1') || API_BASE.includes('localhost:3001')
  ? { 'x-forwarded-proto': 'https' }
  : {}

function parseSetCookie(headers) {
  const raw = headers.getSetCookie?.() ?? []
  return raw.map((entry) => entry.split(';')[0]).join('; ')
}

function pickJwtCookie(setCookies) {
  const jwtEntries = setCookies.filter(entry => entry.startsWith('jwt='))
  const active = jwtEntries.find(entry => /Max-Age=\d+/.test(entry) && !entry.includes('Max-Age=0'))
  return active ?? jwtEntries.at(-1)
}

async function main() {
  const csrfRes = await fetch(`${API_BASE}/csrf-token`, {
    headers: { Origin: ORIGIN, ...PROXY_HEADERS },
  })
  if (!csrfRes.ok) {
    throw new Error(`csrf-token failed: ${csrfRes.status}`)
  }
  const { csrfToken } = await csrfRes.json()
  const csrfCookies = parseSetCookie(csrfRes.headers)

  const token = jwt.sign(
    { userID: USER_ID, iat: Math.floor(Date.now() / 1000) - 30 },
    JWT_KEY,
    { expiresIn: '1h' },
  )
  const loginRes = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
      Origin: ORIGIN,
      ...PROXY_HEADERS,
      cookie: csrfCookies,
    },
    body: JSON.stringify({ jwt: token }),
  })
  if (!loginRes.ok) {
    throw new Error(`login failed: ${loginRes.status} ${await loginRes.text()}`)
  }

  const setCookies = loginRes.headers.getSetCookie?.() ?? []
  console.log('login set-cookie:', setCookies)
  const jwtCookie = pickJwtCookie(setCookies)
  if (!jwtCookie) {
    throw new Error('login response did not include a jwt cookie')
  }
  if (!jwtCookie.includes('SameSite=None')) {
    throw new Error(`jwt cookie must be SameSite=None: ${jwtCookie}`)
  }

  const sessionCookies = [csrfCookies, jwtCookie.split(';')[0]].filter(Boolean).join('; ')
  const userinfoRes = await fetch(`${API_BASE}/userinfo`, {
    headers: {
      Origin: ORIGIN,
      Accept: 'application/json',
      ...PROXY_HEADERS,
      cookie: sessionCookies,
    },
  })
  if (!userinfoRes.ok) {
    throw new Error(`userinfo failed: ${userinfoRes.status} ${await userinfoRes.text()}`)
  }

  const body = await userinfoRes.json()
  console.log(`userinfo ok email=${body.email ?? 'n/a'}`)
  console.log('auth-cross-origin-smoke: passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
