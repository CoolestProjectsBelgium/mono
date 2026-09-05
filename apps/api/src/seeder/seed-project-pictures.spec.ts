import { copyFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { seedProjectPictures } from './seed-project-pictures';

describe('seedProjectPictures', () => {
  it('copies fixture images and returns confirmed attachment rows', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'seed-project-pictures-'));
    const projects = [{ id: 42, name: 'Robot Dog', deletedAt: null }] as never[];

    const attachments = await seedProjectPictures(tempRoot, 'event_seed', 1, projects);

    expect(attachments).toHaveLength(1);
    expect(attachments[0]).toMatchObject({
      eventId: 1,
      projectId: 42,
      confirmed: true,
      mimetype: 'image/png',
      name: 'Robot Dog photo',
    });
    await expect(stat(attachments[0].filepath)).resolves.toBeDefined();
    await expect(stat(attachments[0].thumbnailPath)).resolves.toBeDefined();

    await rm(tempRoot, { recursive: true, force: true });
  });
});
