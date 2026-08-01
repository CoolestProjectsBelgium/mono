import { promises as fs, mkdirSync } from 'fs';
import * as path from 'path';
import { MulterFile } from './multer-file.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project, Attachment, User, Event } from '@coolestprojects/database';

@Injectable()
export class FileUploadService {
  public constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(Attachment) private readonly attachmentModel: typeof Attachment,
  ) { }

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

    const project = await this.projectModel.findOne({ where: { ownerId: userId }, include: [Event] });
    if (!project) {
      throw new Error('Owner not found');
    }

    const folderPath = path.join(
      process.env.UPLOAD_ROOT,
      project.event.folderName,
      `project_${project.id}`,
    );

    mkdirSync(folderPath, { recursive: true });

    const filename = crypto.randomUUID() + path.extname(file.originalname);
    const filepath = path.join(folderPath, filename);

    await fs.writeFile(filepath, file.buffer);

    await this.attachmentModel.create({
      projectId: project.id,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filepath: filepath,
    });
  }


  async deleteFile(userId: number, attachmentId: number): Promise<void> {

    const attachment = await this.attachmentModel.findByPk(attachmentId, {
      include: ['Project'],
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    if ((await attachment.project.getOwner())?.id !== userId) {
      throw new Error('Unauthorized');
    }

    await fs.unlink(attachment.filepath);

    await attachment.destroy();
  }

}
