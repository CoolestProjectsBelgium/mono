import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import {
  Attachment,
  AzureBlob,
  Event,
  Project,
} from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { randomUUID } from 'crypto';
import { AzureBlobService } from '../azureblob/azureblob.service';
import { CreateAttachmentDto } from '../dto/create-attachment.dto';
import { SASToken } from '../dto/sas-token.dto';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(Event) private readonly eventModel: typeof Event,
    @InjectModel(Attachment) private readonly attachmentModel: typeof Attachment,
    @InjectModel(AzureBlob) private readonly azureBlobModel: typeof AzureBlob,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async createAttachment(
    dto: CreateAttachmentDto,
    userId: number,
  ): Promise<SASToken> {
    return this.sequelize.transaction(async () => {
      const project = await this.projectModel.findOne({
        where: { ownerId: userId },
      });
      if (!project) {
        throw new NotFoundException('No project found');
      }

      const event = await this.eventModel.findByPk(project.eventId);
      if (!event) {
        throw new NotFoundException('No event found');
      }

      if (dto.size > event.maxFileSize) {
        throw new BadRequestException('File validation failed');
      }

      const fileExt = dto.filename.split('.').pop();
      const blobName = `${randomUUID()}.${fileExt}`;
      const containerName = event.azure_storage_container;

      await this.azureBlobService.syncContainer(containerName);

      const attachment = await this.attachmentModel.create(
        {
          name: dto.name,
          filename: dto.filename,
          projectId: project.id,
          eventId: event.id,
          confirmed: false,
          internal: false,
          azureBlob: {
            container_name: containerName,
            blob_name: blobName,
            size: dto.size,
            eventId: event.id,
          },
        },
        { include: [{ association: 'azureBlob' }] },
      );

      if (!attachment) {
        throw new BadRequestException('Attachment failed');
      }

      return this.azureBlobService.generateSAS(
        blobName,
        'w',
        null,
        containerName,
      );
    });
  }

  async getAttachmentSAS(name: string, userId: number): Promise<SASToken> {
    const project = await this.projectModel.findOne({
      where: { ownerId: userId },
      attributes: ['id'],
    });
    if (!project) {
      throw new NotFoundException('No project found');
    }

    const azureInfo = await this.azureBlobModel.findOne({
      where: { blob_name: name },
      include: [
        {
          model: Attachment,
          where: { projectId: project.id },
          required: true,
        },
      ],
    });

    if (!azureInfo) {
      throw new NotFoundException('No attachment found');
    }

    return this.azureBlobService.generateSAS(
      name,
      'w',
      null,
      azureInfo.container_name,
    );
  }

  async deleteAttachment(name: string, userId: number): Promise<void> {
    await this.sequelize.transaction(async () => {
      const project = await this.projectModel.findOne({
        where: { ownerId: userId },
        attributes: ['id'],
      });
      if (!project) {
        throw new NotFoundException('No project found');
      }

      const azureInfo = await this.azureBlobModel.findOne({
        where: { blob_name: name },
        include: [
          {
            model: Attachment,
            where: {
              projectId: project.id,
              confirmed: false,
              internal: false,
            },
            required: true,
          },
        ],
      });

      if (!azureInfo) {
        throw new NotFoundException('No attachment found');
      }

      await this.attachmentModel.destroy({
        where: { id: azureInfo.attachmentId },
      });
      await this.azureBlobService.deleteBlob(
        name,
        azureInfo.container_name,
      );
    });
  }
}
