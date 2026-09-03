import assert from 'node:assert/strict';
import { test } from 'node:test';
import { serializeHtmlEditor } from './format-html.js';

test('serializeHtmlEditor returns raw HTML without escaping tags', () => {
  const value = '<p>Hello</p>';
  assert.equal(serializeHtmlEditor(value), value);
  assert.doesNotMatch(serializeHtmlEditor(value), /&lt;p&gt;/);
});
