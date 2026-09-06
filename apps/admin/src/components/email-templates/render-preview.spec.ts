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

test('renderPreview uses loaded user and project.title from context JSON', () => {
  const result = renderPreview({
    subject: 'Welcome',
    contentRich: "<p>Hallo {{user.firstname}},</p><p>Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!</p>",
    contentPlain: "Hallo {{user.firstname}}, Jouw project met titel '{{project.title}}' werd succesvol geactiveerd!",
    guardianEmail: false,
    context: {
      user: { firstname: 'User 1 FN' },
      project: { id: 7, title: 'Robot Dog' },
    },
  });

  assert.match(result.html, /Hallo User 1 FN/);
  assert.match(result.html, /Robot Dog/);
  assert.match(result.plainText, /Robot Dog/);
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
