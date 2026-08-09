import { promises as fs, mkdirSync } from 'fs';
import * as path from 'path';
import { MulterFile } from './multer-file.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attachment, Event, Project, UserProject } from '@coolestprojects/database';
import sharp from 'sharp';

@Injectable()
export class FileUploadService {
  public constructor(
    @InjectModel(UserProject) private readonly userProjectModel: typeof UserProject,
    @InjectModel(Attachment) private readonly attachmentModel: typeof Attachment,
  ) { }

  async generateThumbnail(file: MulterFile): Promise<Buffer> {
    return sharp(file.buffer).resize({ width: 200, height: 200, fit: 'cover' }).toFormat('webp').toBuffer();
  }

  async saveFile(
    userId: number,
    file: MulterFile,
  ): Promise<void> {

    if (!file.buffer) {
      throw new Error('File Error');
    }

    if (!process.env.UPLOAD_ROOT) {
      throw new Error('UPLOAD_ROOT environment variable is not set');
    }

    const project = await this.userProjectModel.findOne({
      where: { userId, deletedAt: null, isOwner: true },
      include: [Event, Project],
    });
    if (!project) {
      throw new Error('Owner not found');
    }

    const folderPath = path.join(
      process.env.UPLOAD_ROOT,
      project.event.folderName,
      `project_${project.project.id}`,
    );

    mkdirSync(folderPath, { recursive: true });

    const filename = crypto.randomUUID() + path.extname(file.originalname);
    const filepath = path.join(folderPath, filename);

    await fs.writeFile(filepath, file.buffer);

    const thumbnailBuffer = await this.generateThumbnail(file);
    const thumbnailName = 'thumbnail_' + filename;
    await fs.writeFile(path.join(folderPath, thumbnailName), thumbnailBuffer);

    await this.attachmentModel.create({
      eventId: project.eventId,
      projectId: project.project.id,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filepath: filepath,
      thumbnailPath: path.join(folderPath, thumbnailName),
    });
  }


  async deleteFile(userId: number, attachmentId: number): Promise<void> {
    const attachment = await this.attachmentModel.findByPk(attachmentId);

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const ownerProject = await this.userProjectModel.findOne({
      where: {
        userId,
        deletedAt: null,
        isOwner: true,
        projectId: attachment.projectId,
      },
    });

    if (!ownerProject) {
      throw new Error('Unauthorized');
    }

    await this.safeUnlink(attachment.filepath);
    await this.safeUnlink(attachment.thumbnailPath);

    await attachment.destroy();
  }

  private async safeUnlink(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

}
