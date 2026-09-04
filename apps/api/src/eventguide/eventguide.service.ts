import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Attachment,
  Event,
  EventTable,
  Project,
  Question,
  QuestionUser,
  User,
  UserProject,
} from '@coolestprojects/database';
import { Op } from 'sequelize';
import { createReadStream } from 'node:fs';
import {
  EventguideEventDto,
  EventguideProjectDto,
  EventguideProjectsResponseDto,
} from '../dto/eventguide-project.dto';
import { parseTableNumber } from './parse-table-number';

const PHOTO_QUESTION_NAME = 'Agree to Photo';

@Injectable()
export class EventguideService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(EventTable)
    private readonly eventTableModel: typeof EventTable,
    @InjectModel(UserProject)
    private readonly userProjectModel: typeof UserProject,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Question)
    private readonly questionModel: typeof Question,
    @InjectModel(QuestionUser)
    private readonly questionUserModel: typeof QuestionUser,
    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,
  ) {}

  async getProjects(eventId: number): Promise<EventguideProjectsResponseDto> {
    const event = await this.eventModel.findByPk(eventId, {
      attributes: ['id', 'eventTitle', 'officialStartDate', 'floorplanPath'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const photoQuestion = await this.questionModel.findOne({
      where: { eventId, name: PHOTO_QUESTION_NAME },
      attributes: ['id'],
    });

    const projects = await this.projectModel.findAll({
      where: {
        eventId,
        deletedAt: null,
      },
      include: [
        {
          model: this.eventTableModel,
          required: false,
        },
        {
          model: this.attachmentModel,
          where: { confirmed: true },
          required: false,
        },
      ],
      order: [['id', 'ASC']],
    });

    const projectIds = projects.map((project) => project.id);
    const memberships = projectIds.length
      ? await this.userProjectModel.findAll({
          where: {
            projectId: { [Op.in]: projectIds },
            deletedAt: null,
            userId: { [Op.ne]: null },
          },
        })
      : [];

    const userIds = [...new Set(memberships.map((membership) => membership.userId))];
    const users = userIds.length
      ? await this.userModel.findAll({
          where: { id: { [Op.in]: userIds } },
          attributes: ['id', 'firstname', 'lastname'],
        })
      : [];

    const userById = new Map(users.map((user) => [user.id, user]));

    const photoConsentUserIds = new Set<number>();
    if (photoQuestion && userIds.length) {
      const consents = await this.questionUserModel.findAll({
        where: {
          eventId,
          questionId: photoQuestion.id,
          userId: { [Op.in]: userIds },
        },
        attributes: ['userId'],
      });
      for (const consent of consents) {
        photoConsentUserIds.add(consent.userId);
      }
    }

    const membershipsByProject = new Map<number, typeof memberships>();
    for (const membership of memberships) {
      const list = membershipsByProject.get(membership.projectId) ?? [];
      list.push(membership);
      membershipsByProject.set(membership.projectId, list);
    }

    const mappedProjects: EventguideProjectDto[] = projects.map((project) => {
      const table = project.table;
      const tableName = table?.name ?? null;
      const tableNumber = parseTableNumber(tableName);
      const projectMemberships = membershipsByProject.get(project.id) ?? [];

      const ownerMembership = projectMemberships.find((membership) => membership.isOwner);
      const participantMemberships = projectMemberships.filter(
        (membership) => !membership.isOwner,
      );

      const orderedMemberships = ownerMembership
        ? [ownerMembership, ...participantMemberships]
        : participantMemberships;

      const participants = orderedMemberships
        .map((membership) => userById.get(membership.userId))
        .filter((user): user is User => Boolean(user))
        .map((user) => this.formatParticipantName(user.firstname, user.lastname));

      const agreedToPhoto =
        orderedMemberships.length > 0
        && orderedMemberships.every((membership) =>
          photoConsentUserIds.has(membership.userId),
        );

      const confirmedAttachment = project.attachments?.[0];
      const thumbnailUrl =
        agreedToPhoto && confirmedAttachment
          ? this.getThumbnailUrl(confirmedAttachment.id)
          : null;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        language: project.language,
        tableNumber,
        tableName,
        participants,
        agreedToPhoto,
        thumbnailUrl,
      };
    });

    mappedProjects.sort((left, right) => {
      const leftTable = left.tableNumber ?? Number.MAX_SAFE_INTEGER;
      const rightTable = right.tableNumber ?? Number.MAX_SAFE_INTEGER;
      if (leftTable !== rightTable) {
        return leftTable - rightTable;
      }
      return left.name.localeCompare(right.name);
    });

    return {
      event: this.mapEvent(event),
      projects: mappedProjects,
    };
  }

  async getThumbnailByAttachmentId(attachmentId: number): Promise<StreamableFile> {
    const attachment = await this.attachmentModel.findOne({
      where: {
        id: attachmentId,
        confirmed: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return this.getThumbnail(attachment.eventId, attachmentId);
  }

  async getThumbnail(
    eventId: number,
    attachmentId: number,
  ): Promise<StreamableFile> {
    const attachment = await this.attachmentModel.findOne({
      where: {
        id: attachmentId,
        eventId,
        confirmed: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const project = await this.projectModel.findOne({
      where: {
        id: attachment.projectId,
        eventId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const agreedToPhoto = await this.projectHasPhotoConsent(eventId, project.id);
    if (!agreedToPhoto) {
      throw new NotFoundException('Photo not available');
    }

    const file = createReadStream(attachment.thumbnailPath);
    return new StreamableFile(file, { type: attachment.mimetype });
  }

  private async projectHasPhotoConsent(
    eventId: number,
    projectId: number,
  ): Promise<boolean> {
    const photoQuestion = await this.questionModel.findOne({
      where: { eventId, name: PHOTO_QUESTION_NAME },
      attributes: ['id'],
    });

    if (!photoQuestion) {
      return false;
    }

    const memberships = await this.userProjectModel.findAll({
      where: {
        projectId,
        eventId,
        deletedAt: null,
        userId: { [Op.ne]: null },
      },
    });

    if (memberships.length === 0) {
      return false;
    }

    const consentCount = await this.questionUserModel.count({
      where: {
        eventId,
        questionId: photoQuestion.id,
        userId: { [Op.in]: memberships.map((membership) => membership.userId) },
      },
    });

    return consentCount === memberships.length;
  }

  private mapEvent(event: Event): EventguideEventDto {
    return {
      id: event.id,
      title: event.eventTitle,
      officialStartDate: event.officialStartDate.toISOString(),
      floorplanPath: event.floorplanPath,
    };
  }

  private formatParticipantName(
    firstname?: string | null,
    lastname?: string | null,
  ): string {
    return [firstname, lastname].filter(Boolean).join(' ').trim();
  }

  private getThumbnailUrl(attachmentId: number): string {
    const apiBase = process.env.API_BASE_URL?.replace(/\/$/, '');
    if (!apiBase) {
      return `/eventguide/attachments/${attachmentId}/thumbnail`;
    }
    return `${apiBase}/eventguide/attachments/${attachmentId}/thumbnail`;
  }
}
