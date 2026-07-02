import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const key = process.env.JWT_KEY || '';
const c = await mysql.createConnection({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'coolestprojects',
  password: process.env.DB_PASSWORD || 'Se84KCCCJlnfkdfv',
  database: process.env.DB_NAME || 'coolestproject',
});

const [users] = await c.query(
  'SELECT u.id, u.email, p.id AS ownedProjectId, v.id AS voucherId FROM Users u LEFT JOIN Projects p ON p.ownerId = u.id LEFT JOIN Vouchers v ON v.participantId = u.id ORDER BY u.id',
);
console.log('users:', users);

const coworker = users.find((u) => u.voucherId && !u.ownedProjectId);
if (!coworker) {
  console.log('No pure coworker user found');
  await c.end();
  process.exit(0);
}

const token = jwt.sign(
  { userID: coworker.id, iat: Math.floor(Date.now() / 1000) - 30 },
  key,
  { expiresIn: '6d' },
);

const loginRes = await fetch('http://127.0.0.1:3001/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
  body: JSON.stringify({ jwt: token }),
});
const cookie = (loginRes.headers.get('set-cookie') || '').split(';')[0];
console.log('login', loginRes.status, cookie.slice(0, 40));

const piRes = await fetch('http://127.0.0.1:3001/projectinfo', {
  headers: { Cookie: cookie, Accept: 'application/json' },
});
const body = await piRes.json();
console.log('projectinfo status', piRes.status);
console.log('is_owner:', body?.is_owner);
console.log('has participants:', body?.own_project?.participants !== undefined);
console.log(JSON.stringify(body?.own_project, null, 2));

await c.end();
