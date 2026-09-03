import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  appendInternalInformation,
  hyperlinksByProjectId,
} from './hyperlink.mjs';

test('hyperlinksByProjectId joins AttachmentId to project', () => {
  const byProject = hyperlinksByProjectId(
    [{ href: 'https://youtu.be/abc', AttachmentId: 5 }],
    [{ id: 5, ProjectId: 9 }],
  );
  assert.deepEqual(byProject.get(9), ['https://youtu.be/abc']);
});

test('appendInternalInformation keeps existing text', () => {
  assert.equal(appendInternalInformation('note', ['https://youtu.be/abc']), 'note\nhttps://youtu.be/abc');
  assert.equal(appendInternalInformation('', ['https://youtu.be/abc']), 'https://youtu.be/abc');
});
