#!/usr/bin/env node
/**
 * Verify login sets a jwt cookie and authenticated endpoints accept it.
 * Run inside the dev container:
 *   node apps/registration/scripts/verify-auth-cookie.mjs
 */
import jwt from 'jsonwebtoken'

const API_BASE = process.env.SMOKE_API_BASE || 'http://127.0.0.1:3001'
const ORIGIN = process.env.SMOKE_ORIGIN || 'https://registration.coolestprojects.localhost:8443'
const JWT_KEY = process.env.JWT_KEY || 'U"l!p@@{An31_1dJ60zb6|3'
const USER_ID = Number(process.env.SMOKE_USER_ID || 1)

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
    headers: {
      Origin: ORIGIN,
      'x-forwarded-proto': 'https',
    },
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
      'x-forwarded-proto': 'https',
      cookie: csrfCookies,
    },
    body: JSON.stringify({ jwt: token }),
  })
  if (!loginRes.ok) {
    throw new Error(`login failed: ${loginRes.status} ${await loginRes.text()}`)
  }

  const setCookies = loginRes.headers.getSetCookie?.() ?? []
  console.log('login set-cookie:')
  for (const entry of setCookies) {
    console.log(`  ${entry}`)
  }

  const jwtCookie = pickJwtCookie(setCookies)
  if (!jwtCookie) {
    throw new Error('login response did not include a jwt cookie')
  }
  if (jwtCookie.includes('Domain=')) {
    throw new Error(`localhost dev jwt cookie must be host-only: ${jwtCookie}`)
  }
  if (!jwtCookie.includes('SameSite=None')) {
    throw new Error(`localhost dev jwt cookie must be SameSite=None: ${jwtCookie}`)
  }

  const csrfPart = csrfCookies
  const jwtPart = jwtCookie.split(';')[0]
  const sessionCookies = [csrfPart, jwtPart].filter(Boolean).join('; ')
  for (const path of ['/userinfo', '/projectinfo', '/projectinfo/attachments']) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Origin: ORIGIN,
        Accept: 'application/json',
        'x-forwarded-proto': 'https',
        cookie: sessionCookies,
      },
    })
    if (!res.ok) {
      throw new Error(`${path} failed: ${res.status} ${await res.text()}`)
    }
    console.log(`${path}: ok`)
  }

  console.log('verify-auth-cookie: passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
