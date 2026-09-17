import { mkdtemp, rm, stat } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { seedProjectPictures } from './seed-project-pictures';

describe('seedProjectPictures', () => {
  it('copies fixture images and returns confirmed + pending attachment rows', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'seed-project-pictures-'),
    );
    const projects = [
      { id: 42, name: 'Robot Dog', deletedAt: null },
    ] as never[];

    const attachments = await seedProjectPictures(
      tempRoot,
      'event_seed',
      1,
      projects,
    );

    // The first three projects (this one included) get a confirmed cover
    // photo plus a second, unconfirmed one awaiting review — mirroring a
    // real event's moderation queue.
    expect(attachments).toHaveLength(2);
    const [confirmed, pending] = attachments;
    expect(confirmed).toMatchObject({
      eventId: 1,
      projectId: 42,
      confirmed: true,
      mimetype: 'image/png',
      name: 'project-01.png',
    });
    expect(pending).toMatchObject({
      eventId: 1,
      projectId: 42,
      confirmed: false,
      mimetype: 'image/png',
      name: 'project-02.png',
    });

    for (const attachment of attachments) {
      expect(attachment.size).toBeGreaterThan(0);
      // Filenames are random-UUID-based, like a real upload, not a fixed name.
      expect(path.basename(attachment.filepath)).toMatch(
        /^[0-9a-f-]{36}\.png$/,
      );
      expect(path.basename(attachment.thumbnailPath)).toMatch(
        /^thumbnail_[0-9a-f-]{36}\.png$/,
      );
      await expect(stat(attachment.filepath)).resolves.toBeDefined();
      await expect(stat(attachment.thumbnailPath)).resolves.toBeDefined();
    }

    await rm(tempRoot, { recursive: true, force: true });
  });
});
