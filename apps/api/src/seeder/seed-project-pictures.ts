import { copyFile, mkdir, stat } from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'crypto';
import type {
  Attachment,
  Event,
  Project,
  Question,
  QuestionUser,
  User,
} from '@coolestprojects/database';
import type { CreationAttributes } from 'sequelize';
import { findActiveEvent } from './seed-voting-fixtures';

const FIXTURE_COUNT = 6;
const PHOTO_QUESTION_NAME = 'Agree to Photo';

// FileUploadService.saveFile() only ever gives the first few projects a
// second, unconfirmed photo in real events (most participants never bother
// re-uploading once their cover photo is approved) — mirrored here so
// admin's PictureSelector has a realistic pending-review case in dev.
const PENDING_REVIEW_PROJECT_COUNT = 3;

export interface SeedProjectAttachment {
  eventId: number;
  projectId: number;
  filepath: string;
  thumbnailPath: string;
  name: string;
  mimetype: string;
  size: number;
  confirmed: boolean;
  internal: boolean;
}

function fixtureBasename(index: number): string {
  return String((index % FIXTURE_COUNT) + 1).padStart(2, '0');
}

/**
 * Copies one fixture image/thumbnail pair into a project's upload folder,
 * naming the files the way FileUploadService.saveFile() names a real
 * upload (random UUID + extension, thumbnail_-prefixed) so seeded
 * attachments are structurally indistinguishable from production ones.
 */
async function copyFixtureAttachment(
  uploadRoot: string,
  eventFolderName: string,
  eventId: number,
  project: Project,
  basename: string,
  confirmed: boolean,
): Promise<SeedProjectAttachment> {
  const originalName = `project-${basename}.png`;
  const fixtureDir = path.join(__dirname, 'fixtures', 'project-images');
  const fixtureImage = path.join(fixtureDir, originalName);
  const fixtureThumbnail = path.join(fixtureDir, `thumbnail-${basename}.png`);

  const imageStat = await stat(fixtureImage);
  await stat(fixtureThumbnail);

  const projectDir = path.join(
    uploadRoot,
    eventFolderName,
    `project_${project.id}`,
  );
  await mkdir(projectDir, { recursive: true });

  const filename = `${randomUUID()}.png`;
  const filepath = path.join(projectDir, filename);
  const thumbnailPath = path.join(projectDir, `thumbnail_${filename}`);
  await copyFile(fixtureImage, filepath);
  await copyFile(fixtureThumbnail, thumbnailPath);

  return {
    eventId,
    projectId: project.id,
    filepath,
    thumbnailPath,
    // Production stores the participant's original filename here; the
    // fixture's own filename plays that role for seeded data.
    name: originalName,
    mimetype: 'image/png',
    size: imageStat.size,
    confirmed,
    internal: false,
  };
}

export async function seedProjectPicture(
  uploadRoot: string,
  eventFolderName: string,
  eventId: number,
  project: Project,
  fixtureIndex: number,
): Promise<SeedProjectAttachment> {
  return copyFixtureAttachment(
    uploadRoot,
    eventFolderName,
    eventId,
    project,
    fixtureBasename(fixtureIndex),
    true,
  );
}

export async function seedPendingProjectPicture(
  uploadRoot: string,
  eventFolderName: string,
  eventId: number,
  project: Project,
  fixtureIndex: number,
): Promise<SeedProjectAttachment> {
  // Offset by one fixture so the pending photo is visibly different from
  // the already-confirmed one sitting next to it.
  return copyFixtureAttachment(
    uploadRoot,
    eventFolderName,
    eventId,
    project,
    fixtureBasename(fixtureIndex + 1),
    false,
  );
}

export async function seedProjectPictures(
  uploadRoot: string,
  eventFolderName: string,
  eventId: number,
  projects: Project[],
): Promise<SeedProjectAttachment[]> {
  const attachments: SeedProjectAttachment[] = [];
  const activeProjects = projects.filter((project) => !project.deletedAt);

  for (let i = 0; i < activeProjects.length && i < FIXTURE_COUNT; i++) {
    attachments.push(
      await seedProjectPicture(
        uploadRoot,
        eventFolderName,
        eventId,
        activeProjects[i],
        i,
      ),
    );
    if (i < PENDING_REVIEW_PROJECT_COUNT) {
      attachments.push(
        await seedPendingProjectPicture(
          uploadRoot,
          eventFolderName,
          eventId,
          activeProjects[i],
          i,
        ),
      );
    }
  }

  return attachments;
}

export async function ensureSeedProjectPictures(
  eventModel: typeof Event,
  projectModel: typeof Project,
  attachmentModel: typeof Attachment,
  questionModel: typeof Question,
  questionUserModel: typeof QuestionUser,
  userModel: typeof User,
): Promise<{ attachmentsCreated: number; photoConsentsCreated: number }> {
  if (!process.env.UPLOAD_ROOT) {
    return { attachmentsCreated: 0, photoConsentsCreated: 0 };
  }

  const event = await findActiveEvent(eventModel);
  if (!event) {
    return { attachmentsCreated: 0, photoConsentsCreated: 0 };
  }

  const projects = await projectModel.findAll({
    where: { eventId: event.id, deletedAt: null },
    order: [['id', 'ASC']],
  });

  const attachmentsToCreate: SeedProjectAttachment[] = [];
  for (let i = 0; i < projects.length && i < FIXTURE_COUNT; i++) {
    const project = projects[i];
    const confirmedCount = await attachmentModel.count({
      where: { projectId: project.id, confirmed: true },
    });
    if (confirmedCount === 0) {
      attachmentsToCreate.push(
        await seedProjectPicture(
          process.env.UPLOAD_ROOT,
          event.folderName,
          event.id,
          project,
          i,
        ),
      );
    }

    if (i < PENDING_REVIEW_PROJECT_COUNT) {
      const pendingCount = await attachmentModel.count({
        where: { projectId: project.id, confirmed: false },
      });
      if (pendingCount === 0) {
        attachmentsToCreate.push(
          await seedPendingProjectPicture(
            process.env.UPLOAD_ROOT,
            event.folderName,
            event.id,
            project,
            i,
          ),
        );
      }
    }
  }

  if (attachmentsToCreate.length > 0) {
    await attachmentModel.bulkCreate(
      attachmentsToCreate as unknown as CreationAttributes<Attachment>[],
    );
  }

  const photoQuestion = await questionModel.findOne({
    where: { eventId: event.id, name: PHOTO_QUESTION_NAME },
  });

  let photoConsentsCreated = 0;
  if (photoQuestion) {
    const users = await userModel.findAll({ where: { eventId: event.id } });
    for (const user of users) {
      const existingConsent = await questionUserModel.findOne({
        where: {
          eventId: event.id,
          userId: user.id,
          questionId: photoQuestion.id,
        },
      });
      if (!existingConsent) {
        await questionUserModel.create({
          eventId: event.id,
          userId: user.id,
          questionId: photoQuestion.id,
        });
        photoConsentsCreated += 1;
      }
    }
  }

  return {
    attachmentsCreated: attachmentsToCreate.length,
    photoConsentsCreated,
  };
}
