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
  activeProjectWhere,
} from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { randomUUID } from 'crypto';
import { AzureBlobService } from '../azureblob/azureblob.service';
import { CreateAttachmentDto } from '../dto/create-attachment.dto';
import { UpdateAttachmentDto } from '../dto/update-attachment.dto';
import { SASToken } from '../dto/sas-token.dto';
import { MAX_PROJECT_ATTACHMENTS } from './attachment.constants';
import {
  assertAllowedUpload,
  getFilenameExtension,
  isCanonicalStorageFilename,
} from './attachment.validation';
import { VideoPosterService } from './video-poster.service';
import { inferAttachmentType } from '../projectinfo/attachment.mapper';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(Event) private readonly eventModel: typeof Event,
    @InjectModel(Attachment) private readonly attachmentModel: typeof Attachment,
    @InjectModel(AzureBlob) private readonly azureBlobModel: typeof AzureBlob,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly azureBlobService: AzureBlobService,
    private readonly videoPosterService: VideoPosterService,
  ) {}

  private async findOwnedAzureBlob(name: string, userId: number) {
    const project = await this.projectModel.findOne({
      where: activeProjectWhere({ ownerId: userId }),
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

    return { project, azureInfo };
  }

  async createAttachment(
    dto: CreateAttachmentDto,
    userId: number,
  ): Promise<SASToken> {
    try {
      assertAllowedUpload(dto);
    }
    catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'File validation failed',
      );
    }

    return this.sequelize.transaction(async () => {
      const project = await this.projectModel.findOne({
        where: activeProjectWhere({ ownerId: userId }),
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

      const attachmentCount = await this.attachmentModel.count({
        where: { projectId: project.id, internal: false },
      });
      if (attachmentCount >= MAX_PROJECT_ATTACHMENTS) {
        throw new BadRequestException('Maximum number of attachments reached');
      }

      const fileExt = getFilenameExtension(dto.filename);
      const blobName = `${randomUUID()}.${fileExt}`;
      const containerName = event.azure_storage_container;

      await this.azureBlobService.syncContainer(containerName);

      const attachment = await this.attachmentModel.create(
        {
          name: dto.name.trim(),
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
    const { azureInfo } = await this.findOwnedAzureBlob(name, userId);

    return this.azureBlobService.generateSAS(
      name,
      'w',
      null,
      azureInfo.getDataValue('container_name') ?? azureInfo.container_name,
    );
  }

  async updateAttachmentName(
    name: string,
    userId: number,
    dto: UpdateAttachmentDto,
  ): Promise<void> {
    const trimmed = dto.name?.trim() ?? '';
    if (!trimmed) {
      throw new BadRequestException('Name is required');
    }
    if (trimmed.length > 50) {
      throw new BadRequestException('Name is too long');
    }

    const { azureInfo } = await this.findOwnedAzureBlob(name, userId);
    const info = azureInfo.get({ plain: true }) as AzureBlob & {
      attachment?: Attachment;
    };
    const attachmentId = info.attachmentId ?? info.attachment?.id;
    if (!attachmentId) {
      throw new NotFoundException('No attachment found');
    }

    await this.attachmentModel.update(
      { name: trimmed },
      { where: { id: attachmentId } },
    );
  }

  async ensureVideoPoster(name: string, userId: number): Promise<void> {
    const { azureInfo } = await this.findOwnedAzureBlob(name, userId);
    const info = azureInfo.get({ plain: true }) as AzureBlob & {
      attachment?: Attachment;
    };
    const attachment = info.attachment;
    if (!attachment || inferAttachmentType(attachment.filename) !== 'movie') {
      return;
    }

    if (azureInfo.poster_blob_name) {
      return;
    }

    const posterName = await this.videoPosterService.ensurePoster(
      name,
      info.container_name,
    );
    if (posterName) {
      await azureInfo.update({ poster_blob_name: posterName });
    }
  }

  async normalizeVideo(name: string, userId: number): Promise<void> {
    const { azureInfo } = await this.findOwnedAzureBlob(name, userId);
    const info = azureInfo.get({ plain: true }) as AzureBlob & {
      attachment?: Attachment;
    };

    if (!isCanonicalStorageFilename(info.attachment?.filename ?? name)) {
      throw new BadRequestException('File validation failed');
    }

    const newSize = await this.videoPosterService.normalizeVideo(
      name,
      info.container_name,
    );
    if (!newSize) {
      throw new BadRequestException('Video normalization failed');
    }

    await azureInfo.update({ size: newSize });
    await this.ensureVideoPoster(name, userId);
  }

  async deleteAttachment(name: string, userId: number): Promise<void> {
    await this.sequelize.transaction(async () => {
      const { azureInfo } = await this.findOwnedAzureBlob(name, userId);

      const info = azureInfo.get({ plain: true }) as AzureBlob & {
        attachment?: Attachment;
      };
      const attachmentId =
        info.attachmentId ?? info.attachment?.id;
      if (!attachmentId) {
        throw new NotFoundException('No attachment found');
      }

      if (info.poster_blob_name) {
        await this.azureBlobService.deleteBlob(
          info.poster_blob_name,
          info.container_name,
        );
      }

      await azureInfo.destroy();
      await this.azureBlobService.deleteBlob(
        name,
        info.container_name,
      );
      await this.attachmentModel.destroy({
        where: { id: attachmentId },
      });
    });
  }
}
