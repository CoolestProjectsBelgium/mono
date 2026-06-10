import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Attachment,
  AzureBlob,
  Project,
  Voucher,
} from '@coolestprojects/database';
import { ProjectDto } from '../dto/project.dto';
import { AttachmentDto } from '../dto/attachment.dto';
import { Op } from 'sequelize';
import { AzureBlobService } from '../azureblob/azureblob.service';

@Injectable()
export class ProjectinfoService {
  public constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(Voucher) private readonly voucherModel: typeof Voucher,
    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  private async getAttachmentsForProject(
    projectId: number,
  ): Promise<AttachmentDto[]> {
    const attachments = await this.attachmentModel.findAll({
      where: { projectId, internal: false },
      include: [AzureBlob],
    });

    const result: AttachmentDto[] = [];

    for (const attachment of attachments) {
      const blob = attachment.azureBlob;
      if (!blob) {
        continue;
      }

      let exists = false;
      let url: string | null = null;

      try {
        exists = await this.azureBlobService.checkBlobExists(
          blob.blob_name,
          blob.container_name,
        );
        if (exists) {
          const readSas = await this.azureBlobService.generateSAS(
            blob.blob_name,
            'r',
            attachment.filename,
            blob.container_name,
          );
          url = readSas.url;
        }
      } catch {
        exists = false;
      }

      result.push({
        id: blob.blob_name,
        name: attachment.name,
        url,
        size: blob.size,
        filename: attachment.filename,
        confirmed: attachment.confirmed || false,
        exists,
        type: 'movie',
      });
    }

    return result;
  }

  public async getProjectInfo(userId: number): Promise<ProjectDto> {
    let project: Project | null;
    let isOwner = true;
    project = await this.projectModel.findOne({ where: { ownerId: userId } });
    if (!project) {
      project = await (
        await this.voucherModel.findOne({
          where: { participantId: userId },
        })
      )?.getProject();

      if (!project) {
        throw new Error('Project not found for user');
      }
      isOwner = false;
    }

    const participants = await project.getParticipants();
    for (const participant of participants) {
      if (participant.id === userId) {
      }
    }

    const attachments = await this.getAttachmentsForProject(project.id);

    return {
      own_project: {
        project_id: String(project.id),
        project_name: project.name,
        project_descr: project.description,
        project_type: project.type,
        project_lang: project.language,
        own_project: isOwner,
      },
      attachments,
    };
  }

  public async createProject(
    userId: number,
    createProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    const existingProject = await this.projectModel.findOne({
      where: { ownerId: userId },
    });
    if (existingProject) {
      throw new Error('User already has a project');
    }
    const project = await this.projectModel.create({
      name: createProjectDto.own_project.project_name,
      description: createProjectDto.own_project.project_descr,
      type: createProjectDto.own_project.project_type,
      language: createProjectDto.own_project.project_lang,
      ownerId: userId,
    });
    return {
      own_project: {
        project_id: String(project.id),
        project_name: project.name,
        project_descr: project.description,
        project_type: project.type,
        project_lang: project.language,
      },
    };
  }

  public async updateProject(
    userId: number,
    updateProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectModel.findOne({
      where: { ownerId: userId },
    });
    if (!project) {
      throw new Error('Project not found for user');
    }
    project.name = updateProjectDto.own_project.project_name;
    project.description = updateProjectDto.own_project.project_descr;
    project.type = updateProjectDto.own_project.project_type;
    project.language = updateProjectDto.own_project.project_lang;
    await project.save();
    return {
      own_project: {
        project_id: String(project.id),
        project_name: project.name,
        project_descr: project.description,
        project_type: project.type,
        project_lang: project.language,
      },
    };
  }

  public async deleteProject(userId: number): Promise<void> {
    const project = await this.projectModel.findOne({
      where: { ownerId: userId },
    });
    if (!project) {
      throw new Error('Project not found for user');
    }

    const vouchersInUse = await this.voucherModel.count({
      where: { projectId: project.id, participantId: { [Op.ne]: null } },
    });
    if (vouchersInUse > 0) {
      throw new Error('Cannot delete project with associated vouchers');
    }

    const attachments = await this.attachmentModel.findAll({
      where: { projectId: project.id },
      include: [AzureBlob],
    });

    for (const attachment of attachments) {
      const blob = attachment.azureBlob;
      if (blob) {
        await this.azureBlobService.deleteBlob(
          blob.blob_name,
          blob.container_name,
        );
      }
    }

    await project.destroy();
  }
}
