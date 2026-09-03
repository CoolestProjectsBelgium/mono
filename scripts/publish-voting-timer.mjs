#!/usr/bin/env node
/**
 * Dev helper: publish a voting timer SSE event via POST / (admin cookie).
 * Usage: node scripts/publish-voting-timer.mjs [minutesFromNow]
 */
const minutesFromNow = Number(process.argv[2] ?? 15)

const adminBase = 'http://127.0.0.1:3000'
const apiBase = 'http://127.0.0.1:3001'

function parseCookies(setCookieHeaders) {
  const jar = new Map()
  for (const header of setCookieHeaders) {
    const [pair] = header.split(';')
    const eq = pair.indexOf('=')
    if (eq === -1) continue
    jar.set(pair.slice(0, eq), pair.slice(eq + 1))
  }
  return jar
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

async function fetchWithCookies(url, options = {}, jar = new Map()) {
  const headers = { ...(options.headers ?? {}) }
  const existing = cookieHeader(jar)
  if (existing) {
    headers.cookie = headers.cookie ? `${headers.cookie}; ${existing}` : existing
  }

  const res = await fetch(url, { ...options, headers, redirect: 'manual' })
  const setCookie = res.headers.getSetCookie?.() ?? []
  for (const header of setCookie) {
    const [pair] = header.split(';')
    const eq = pair.indexOf('=')
    if (eq === -1) continue
    jar.set(pair.slice(0, eq), pair.slice(eq + 1))
  }
  return { res, jar }
}

async function main() {
  const jar = new Map()

  const loginBody = new URLSearchParams({ email: 'admin', password: 'admin' })
  const { res: loginRes } = await fetchWithCookies(`${adminBase}/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: loginBody.toString(),
  }, jar)

  if (loginRes.status !== 302 && loginRes.status !== 200) {
    const text = await loginRes.text()
    throw new Error(`Admin login failed (${loginRes.status}): ${text.slice(0, 200)}`)
  }

  if (!jar.has('adminjs')) {
    throw new Error('Admin login did not return adminjs cookie')
  }

  const { res: csrfRes } = await fetchWithCookies(`${apiBase}/csrf-token`, {
    headers: { 'x-forwarded-proto': 'https' },
  }, jar)
  if (!csrfRes.ok) {
    throw new Error(`CSRF token fetch failed (${csrfRes.status})`)
  }
  const { csrfToken } = await csrfRes.json()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1)
  const endDate = new Date(Date.now() + minutesFromNow * 60 * 1000)

  const payload = {
    type: 'timer',
    message: 'Voting end time updated',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }

  const { res: publishRes } = await fetchWithCookies(`${apiBase}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-proto': 'https',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(payload),
  }, jar)

  const body = await publishRes.text()
  if (!publishRes.ok) {
    throw new Error(`Publish failed (${publishRes.status}): ${body}`)
  }

  console.log(JSON.stringify({ success: true, payload, response: body }, null, 2))
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
