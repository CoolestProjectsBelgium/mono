import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderPreview } from './render-preview.js';

const registrationRich = `<p>Hallo {{registration.firstname}},</p>
{{#if registration.email_guardian}}
<p>Je ouders hebben deze mail ook gekregen.</p>
{{/if}}`;

test('renderPreview substitutes variables and keeps HTML tags with noEscape', () => {
  const result = renderPreview({
    subject: 'Coolest Projects {{year}}',
    contentRich: registrationRich,
    contentPlain: 'Hi {{registration.firstname}}',
    guardianEmail: true,
  });

  assert.match(result.subject, /2026/);
  assert.match(result.html, /Hallo Jan/);
  assert.match(result.html, /Je ouders hebben deze mail ook gekregen/);
  assert.match(result.html, /<p>/);
  assert.match(result.plainText, /Hi Jan/);
});

test('renderPreview omits guardian block when guardianEmail is false', () => {
  const result = renderPreview({
    subject: 'Subject',
    contentRich: registrationRich,
    contentPlain: 'plain',
    guardianEmail: false,
  });

  assert.match(result.html, /Hallo Jan/);
  assert.doesNotMatch(result.html, /Je ouders hebben deze mail ook gekregen/);
});

test('renderPreview throws readable error on invalid Handlebars', () => {
  assert.throws(
    () => renderPreview({
      subject: 'Subject',
      contentRich: '{{#if unclosed',
      contentPlain: 'plain',
      guardianEmail: true,
    }),
    /Handlebars error/,
  );
});
