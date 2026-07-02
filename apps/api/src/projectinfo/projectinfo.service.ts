import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Attachment,
  AzureBlob,
  Project,
  User,
  Voucher,
  activeProjectWhere,
} from '@coolestprojects/database';
import { ProjectDto } from '../dto/project.dto';
import { AttachmentDto } from '../dto/attachment.dto';
import { Op } from 'sequelize';
import { AzureBlobService } from '../azureblob/azureblob.service';
import {
  canDeleteProject,
  mapParticipantsForProject,
  type VoucherInput,
} from '../participant/participant.mapper';

@Injectable()
export class ProjectinfoService {
  public constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(Voucher) private readonly voucherModel: typeof Voucher,
    @InjectModel(User) private readonly userModel: typeof User,
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
      const a = attachment.get({ plain: true }) as Attachment & {
        azureBlob?: AzureBlob;
      };
      const blob = a.azureBlob;
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

  private async getParticipantsForProject(
    projectId: number,
    ownerId: number,
    currentUserId: number,
  ) {
    const owner = await this.userModel.findByPk(ownerId, {
      attributes: ['id', 'firstname'],
    });
    if (!owner) {
      return { participants: [], delete_possible: true };
    }

    const vouchers = await this.voucherModel.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'participant',
          attributes: ['firstname'],
          required: false,
        },
      ],
      order: [['id', 'ASC']],
    });

    const voucherInputs: VoucherInput[] = vouchers.map((voucher) => {
      const plain = voucher.get({ plain: true }) as VoucherInput;
      return {
        id: plain.id,
        voucherGuid: plain.voucherGuid,
        participantId: plain.participantId,
        participant: plain.participant,
      };
    });

    return {
      participants: mapParticipantsForProject(
        {
          id: owner.getDataValue('id') as number,
          firstname: owner.getDataValue('firstname') as string,
        },
        voucherInputs,
        currentUserId,
      ),
      delete_possible: canDeleteProject(voucherInputs),
    };
  }

  public async getProjectInfo(userId: number): Promise<ProjectDto> {
    let project: Project | null;
    let isOwner = true;
    project = await this.projectModel.findOne({
      where: activeProjectWhere({ ownerId: userId }),
    });
    if (!project) {
      const voucher = await this.voucherModel.findOne({
        where: { participantId: userId },
      });
      if (!voucher) {
        throw new Error('Project not found for user');
      }
      const projectId = voucher.getDataValue('projectId') as number;
      project = await this.projectModel.findOne({
        where: activeProjectWhere({ id: projectId }),
      });
      if (!project) {
        throw new Error('Project not found for user');
      }
      isOwner = false;
    }

    const p = project.get({ plain: true });
    const attachments = await this.getAttachmentsForProject(p.id);
    const participantInfo = await this.getParticipantsForProject(
      p.id,
      p.ownerId,
      userId,
    );

    return {
      is_owner: isOwner,
      own_project: {
        project_id: String(p.id),
        project_name: p.name,
        project_descr: p.description,
        project_type: p.type,
        project_lang: p.language,
        participants: participantInfo.participants,
        ...(isOwner ? { delete_possible: participantInfo.delete_possible } : {}),
      },
      attachments,
    };
  }

  public async createProject(
    userId: number,
    createProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    const existingProject = await this.projectModel.findOne({
      where: activeProjectWhere({ ownerId: userId }),
    });
    if (existingProject) {
      throw new Error('User already has a project');
    }
    if (!createProjectDto.own_project) {
      throw new Error('Project Creation Failed');
    }
    const project = await this.projectModel.create({
      name: createProjectDto.own_project.project_name,
      description: createProjectDto.own_project.project_descr,
      type: createProjectDto.own_project.project_type,
      language: createProjectDto.own_project.project_lang,
      ownerId: userId,
      eventId: 1,
    });
    const created = project.get({ plain: true });
    return {
      is_owner: true,
      own_project: {
        project_id: String(created.id),
        project_name: created.name,
        project_descr: created.description,
        project_type: created.type,
        project_lang: created.language,
      },
    };
  }

  public async updateProject(
    userId: number,
    updateProjectDto: ProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectModel.findOne({
      where: activeProjectWhere({ ownerId: userId }),
    });
    if (!project) {
      throw new Error('Project not found for user');
    }
    if (!updateProjectDto.own_project) {
      throw new Error('Data not provided');
    }
    project.name = updateProjectDto.own_project.project_name;
    project.description = updateProjectDto.own_project.project_descr;
    project.type = updateProjectDto.own_project.project_type;
    project.language = updateProjectDto.own_project.project_lang;
    await project.save();
    const updated = project.get({ plain: true });
    return {
      is_owner: true,
      own_project: {
        project_id: String(updated.id),
        project_name: updated.name,
        project_descr: updated.description,
        project_type: updated.type,
        project_lang: updated.language,
      },
    };
  }

  public async deleteProject(userId: number): Promise<void> {
    const project = await this.projectModel.findOne({
      where: activeProjectWhere({ ownerId: userId }),
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

    project.removedAt = new Date();
    await project.save();
  }
}
