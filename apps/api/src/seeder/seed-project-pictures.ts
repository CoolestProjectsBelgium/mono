import { copyFile, mkdir, stat } from 'node:fs/promises';
import * as path from 'node:path';
import type { Attachment, Event, Project, Question, QuestionUser, User } from '@coolestprojects/database';
import type { CreationAttributes } from 'sequelize';
import { findActiveEvent } from './seed-voting-fixtures';

const FIXTURE_COUNT = 6;
const PHOTO_QUESTION_NAME = 'Agree to Photo';

export interface SeedProjectAttachment {
  eventId: number;
  projectId: number;
  filepath: string;
  thumbnailPath: string;
  name: string;
  mimetype: string;
  confirmed: boolean;
}

function fixtureBasename(index: number): string {
  return String((index % FIXTURE_COUNT) + 1).padStart(2, '0');
}

export async function seedProjectPicture(
  uploadRoot: string,
  eventFolderName: string,
  eventId: number,
  project: Project,
  fixtureIndex: number,
): Promise<SeedProjectAttachment> {
  const basename = fixtureBasename(fixtureIndex);
  const fixtureDir = path.join(__dirname, 'fixtures', 'project-images');
  const fixtureImage = path.join(fixtureDir, `project-${basename}.png`);
  const fixtureThumbnail = path.join(fixtureDir, `thumbnail-${basename}.png`);

  await stat(fixtureImage);
  await stat(fixtureThumbnail);

  const projectDir = path.join(uploadRoot, eventFolderName, `project_${project.id}`);
  await mkdir(projectDir, { recursive: true });

  const filepath = path.join(projectDir, 'project-photo.png');
  const thumbnailPath = path.join(projectDir, 'project-photo-thumbnail.png');
  await copyFile(fixtureImage, filepath);
  await copyFile(fixtureThumbnail, thumbnailPath);

  return {
    eventId,
    projectId: project.id,
    filepath,
    thumbnailPath,
    name: `${project.name} photo`,
    mimetype: 'image/png',
    confirmed: true,
  };
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
      await seedProjectPicture(uploadRoot, eventFolderName, eventId, activeProjects[i], i),
    );
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
    const existingCount = await attachmentModel.count({
      where: { projectId: project.id, confirmed: true },
    });
    if (existingCount === 0) {
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
