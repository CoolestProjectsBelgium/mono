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

    const project = await this.userProjectModel.findOne({ where: { id: userId, isOwner: true }, include: [Event, Project] });
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
      projectId: project.project.id,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filepath: filepath,
      thumbnailPath: path.join(folderPath, thumbnailName),
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
    await fs.unlink(attachment.thumbnailPath);

    await attachment.destroy();
  }

}
