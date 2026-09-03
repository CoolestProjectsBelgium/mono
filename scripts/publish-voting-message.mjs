#!/usr/bin/env node
/**
 * Dev helper: publish a voting message SSE event via POST / (admin cookie).
 * Usage: node scripts/publish-voting-message.mjs "Your message here"
 */
const message = process.argv.slice(2).join(' ') || 'Please take a short break — voting resumes in 5 minutes.'

const adminBase = 'http://127.0.0.1:3000'
const apiBase = 'http://127.0.0.1:3001'

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

  const payload = {
    type: 'message',
    message,
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
