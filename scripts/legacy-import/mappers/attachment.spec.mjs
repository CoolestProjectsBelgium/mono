import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapAttachment, sizeByAttachmentId } from './attachment.mjs';

test('mapAttachment derives path, mimetype, and azure size', () => {
  const sizes = sizeByAttachmentId([
    { AttachmentId: 5, size: 4096, blob_name: 'photo.jpg' },
    { AttachmentId: 99, size: 1 },
  ]);
  const mapped = mapAttachment(
    {
      id: 5,
      name: 'team photo',
      filename: 'cat.jpg',
      confirmed: 1,
      internal: 0,
      ProjectId: 9,
      EventId: 1,
    },
    { folderName: 'coolestproject', size: sizes.get(5) },
  );
  assert.equal(mapped.filepath, 'coolestproject/project_9/cat.jpg');
  assert.equal(mapped.mimetype, 'image/jpeg');
  assert.equal(mapped.size, 4096);
  assert.equal(mapped.thumbnailPath, '');
  assert.equal(mapped.projectId, 9);
  assert.equal(sizes.has(99), true);
});

test('sizeByAttachmentId ignores blobs without AttachmentId', () => {
  const sizes = sizeByAttachmentId([{ blob_name: 'orphan.bin', size: 10 }]);
  assert.equal(sizes.size, 0);
});
