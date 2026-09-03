import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  lintHtml,
  maskHandlebars,
  prepareHtmlForSubmit,
  prettyPrintHtml,
  serializeHtmlEditor,
  unmaskHandlebars,
} from './format-html.js';

test('maskHandlebars round-trips seed-like tokens', () => {
  const input = '{{#if registration.email_guardian}}<p>x</p>{{/if}}';
  const { masked, tokens } = maskHandlebars(input);
  assert.equal(unmaskHandlebars(masked, tokens), input);
});

test('prettyPrintHtml indents HTML while preserving Handlebars tokens', () => {
  const input = '<p>Hi {{registration.firstname}}</p>{{#if registration.email_guardian}}<p>x</p>{{/if}}';
  const formatted = prettyPrintHtml(input);

  assert.match(formatted, /{{registration\.firstname}}/);
  assert.match(formatted, /{{#if registration\.email_guardian}}/);
  assert.match(formatted, /\n/);
  assert.match(formatted, /<\/p>\n/);
});

test('lintHtml warns on unclosed tags', () => {
  const warnings = lintHtml('<p>Hello');
  assert.ok(warnings.some((warning) => /Unclosed <p> tag/.test(warning.message)));
});

test('lintHtml stays quiet on valid seed fragment', () => {
  const warnings = lintHtml('<p>Hi {{registration.firstname}}</p>');
  assert.equal(warnings.length, 0);
});

test('prepareHtmlForSubmit formats and returns warnings without throwing', () => {
  const result = prepareHtmlForSubmit('<p>Hello</p><p>World');
  assert.match(result.formatted, /\n/);
  assert.ok(Array.isArray(result.warnings));
});

test('serializeHtmlEditor normalizes line endings', () => {
  assert.equal(serializeHtmlEditor('a\r\nb'), 'a\nb');
});
