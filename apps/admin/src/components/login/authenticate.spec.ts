import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// authenticate.ts imports the real `sequelize` instance (top-level
// `await sequelize.authenticate()` in database.ts), so it can't be imported
// and exercised directly without a live DB connection — same constraint as
// floorplans/handler.spec.ts and presentation/handler.spec.ts. This asserts
// the security-relevant shape of the 2FA logic instead.
test('Authenticate enforces 2FA without leaking a password oracle', () => {
  const authenticatePath = fileURLToPath(
    new URL('./authenticate.ts', import.meta.url),
  );
  const source = readFileSync(authenticatePath, 'utf8');

  // Wrong email/password stays the generic `null` rejection.
  assert.match(source, /!account \|\| !account\.verifyPassword\(password\)/);

  // Required-but-unenrolled gets a distinct, actionable message (thrown, so
  // @adminjs/express surfaces error.message instead of the generic notice).
  assert.match(
    source,
    /account\.twoFactorRequired && !account\.twoFactorEnabled/,
  );
  assert.match(source, /throw new Error\(/);

  // A wrong/missing TOTP code must fall back to the same `return null` as a
  // wrong password — never a distinct message that would let an attacker
  // infer the password was correct.
  assert.match(source, /if \(account\.twoFactorEnabled\)/);
  const enabledBranch = source.slice(
    source.indexOf('if (account.twoFactorEnabled)'),
  );
  assert.match(enabledBranch, /if \(!isValidTotp\) {\s*return null;/);

  // Verification goes through otplib, not a hand-rolled comparison.
  assert.match(
    source,
    /verify\(\{ secret: account\.twoFactorSecret, token: totpToken \}\)/,
  );
});
