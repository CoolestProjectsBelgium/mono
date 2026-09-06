
import { Op } from 'sequelize';
import {
    Attachment as AttachmentModel,
    Project as ProjectModel,
    UserProject as UserProjectModel,
    User as UserModel,
    Question as QuestionModel,
    QuestionUser as QuestionUserModel,
} from '@coolestprojects/database';
import {
    sequelize,
} from '../../database.js'

const Project = sequelize.models.Project as typeof ProjectModel
const Attachment = sequelize.models.Attachment as typeof AttachmentModel
const UserProject = sequelize.models.UserProject as typeof UserProjectModel
const User = sequelize.models.User as typeof UserModel
const Question = sequelize.models.Question as typeof QuestionModel
const QuestionUser = sequelize.models.QuestionUser as typeof QuestionUserModel

const PHOTO_QUESTION_NAME = 'Agree to Photo';

function getAttachmentBaseUrl(): string {
    const apiBase = process.env.API_BASE_URL!.replace(/\/$/, '')
    return `${apiBase}/projectinfo/attachments`
}

function getThumbnailUrl(attachmentId: number): string {
    return `${getAttachmentBaseUrl()}/${attachmentId}`
}

function getOriginalUrl(attachmentId: number): string {
    return `${getAttachmentBaseUrl()}/original/${attachmentId}`
}

export interface PictureAttachment {
    id: number;
    name: string;
    confirmed: boolean;
    internal: boolean;
    thumbnailUrl: string;
    originalUrl: string;
}

export interface ProjectParticipant {
    id: number;
    name: string;
    agreedToPhoto: boolean;
    isOwner: boolean;
}

export interface ProjectPictures {
    participants: ProjectParticipant[];
    attachments: PictureAttachment[];
}

export interface GroupedAttachments {
    [projectName: string]: ProjectPictures;
}

export const Handler = async (_request: any, _response: any, context: any): Promise<GroupedAttachments> => {

    const eventId = context.currentAdmin?.eventId;

    const projectsModels = await Project.findAll({
        where: { eventId, deletedAt: null },
        attributes: ['id', 'name'],
        include: [{
            model: Attachment,
            as: 'attachments',
            attributes: ['id', 'name', 'confirmed', 'internal', 'thumbnailPath'],
        }],
    });

    const projectIds = projectsModels.map((project) => project.id);

    const memberships = projectIds.length
        ? await UserProject.findAll({
            where: {
                projectId: { [Op.in]: projectIds },
                deletedAt: null,
                userId: { [Op.ne]: null },
            },
        })
        : [];

    const userIds = [...new Set(memberships.map((membership) => membership.userId))];

    const users = userIds.length
        ? await User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'firstname', 'lastname'],
        })
        : [];
    const userById = new Map(users.map((user) => [user.id, user]));

    const photoQuestion = await Question.findOne({
        where: { eventId, name: PHOTO_QUESTION_NAME },
        attributes: ['id'],
    });

    const photoConsentUserIds = new Set<number>();
    if (photoQuestion && userIds.length) {
        const consents = await QuestionUser.findAll({
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

    const grouped: GroupedAttachments = {};

    for (const project of projectsModels) {
        const projectMemberships = membershipsByProject.get(project.id) ?? [];
        const ownerMembership = projectMemberships.find((membership) => membership.isOwner);
        const otherMemberships = projectMemberships.filter((membership) => !membership.isOwner);
        const orderedMemberships = ownerMembership ? [ownerMembership, ...otherMemberships] : otherMemberships;

        const participants: ProjectParticipant[] = orderedMemberships
            .map((membership) => ({ membership, user: userById.get(membership.userId) }))
            .filter((entry): entry is { membership: UserProjectModel; user: UserModel } => Boolean(entry.user))
            .map(({ membership, user }) => ({
                id: user.id,
                name: [user.firstname, user.lastname].filter(Boolean).join(' ').trim(),
                agreedToPhoto: photoConsentUserIds.has(user.id),
                isOwner: membership.isOwner,
            }));

        grouped[project.name] = {
            participants,
            attachments: project.attachments.map((a) => ({
                id: a.id,
                name: a.name,
                confirmed: a.confirmed,
                internal: a.internal,
                thumbnailUrl: getThumbnailUrl(a.id),
                originalUrl: getOriginalUrl(a.id)
            })),
        };
    }

    return grouped;
}
