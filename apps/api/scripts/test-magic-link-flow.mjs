/**
 * End-to-end magic-link integration check (run in devcontainer):
 *   node apps/api/scripts/test-magic-link-flow.mjs
 */
import jwt from 'jsonwebtoken';

const key = process.env.JWT_KEY || '';
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ''}`);
}

const loginToken = jwt.sign(
  { userID: 1, iat: Math.floor(Date.now() / 1000) - 30 },
  key,
  { expiresIn: '6d' },
);

// 1) Direct API: POST /login -> signed cookie -> GET /userinfo
{
  const loginRes = await fetch('http://127.0.0.1:3001/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Forwarded-Proto': 'https',
    },
    body: JSON.stringify({ jwt: loginToken }),
  });
  assert('POST /login returns 201', loginRes.status === 201, String(loginRes.status));
  const setCookie = loginRes.headers.get('set-cookie') ?? '';
  assert('Set-Cookie is signed jwt', /^jwt=s(?::|%3A)/.test(setCookie), setCookie.slice(0, 40));
  const loginBody = await loginRes.json();
  assert('Login body has expires', Boolean(loginBody.expires));
  assert('Login body has language', loginBody.language === 'nl');

  const cookiePair = setCookie.split(';')[0];
  const userinfoRes = await fetch('http://127.0.0.1:3001/userinfo', {
    headers: { Accept: 'application/json', Cookie: cookiePair },
  });
  assert('GET /userinfo with cookie returns 200', userinfoRes.status === 200, String(userinfoRes.status));
}

// 2) Same path through Nuxt dev proxy (browser uses /_api on :3004 or nginx :8443)
{
  const loginRes = await fetch('http://127.0.0.1:3004/_api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Forwarded-Proto': 'https',
    },
    body: JSON.stringify({ jwt: loginToken }),
  });
  assert('POST /_api/login via Nuxt proxy returns 201', loginRes.status === 201, String(loginRes.status));
  const setCookie = loginRes.headers.get('set-cookie') ?? '';
  const cookiePair = setCookie.split(';')[0];
  const userinfoRes = await fetch('http://127.0.0.1:3004/_api/userinfo', {
    headers: { Accept: 'application/json', Cookie: cookiePair },
  });
  assert(
    'GET /_api/userinfo via Nuxt proxy with cookie returns 200',
    userinfoRes.status === 200,
    String(userinfoRes.status),
  );
}

// 3) Invalid token rejected
{
  const res = await fetch('http://127.0.0.1:3001/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt: 'not-valid' }),
  });
  assert('Invalid token returns 401', res.status === 401, String(res.status));
}

// 4) Logout clears signed cookie
{
  const loginRes = await fetch('http://127.0.0.1:3001/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt: loginToken }),
  });
  const cookiePair = (loginRes.headers.get('set-cookie') ?? '').split(';')[0];
  const logoutRes = await fetch('http://127.0.0.1:3001/login/logout', {
    method: 'POST',
    headers: { Cookie: cookiePair },
  });
  assert('POST /login/logout returns 200', logoutRes.status === 201 || logoutRes.status === 200, String(logoutRes.status));
}

console.log(failed === 0 ? '\nAll magic-link integration checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
