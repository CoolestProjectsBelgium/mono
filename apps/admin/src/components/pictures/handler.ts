
import { Attachment as AttachmentModel, Project as ProjectModel } from '@coolestprojects/database';
import {
    sequelize,
} from '../../database.js'

const Project = sequelize.models.Project as typeof ProjectModel
const Attachment = sequelize.models.Attachment as typeof AttachmentModel

export interface PictureAttachment {
    id: number;
    name: string;
    confirmed: boolean;
    internal: boolean;
    thumbnailPath: string;
}

export interface GroupedAttachments {
    [projectName: string]: PictureAttachment[];
}

export const Handler = async (_request: any, _response: any, context: any): Promise<GroupedAttachments> => {

    const eventId = context.currentAdmin?.eventId;

    const projectsModels = await Project.findAll({
        where: { eventId },
        attributes: ['name'],
        include: [{
            model: Attachment,
            as: 'attachments',
            attributes: ['id', 'name', 'confirmed', 'internal', 'thumbnailPath'],
        }],
    });

    const grouped: GroupedAttachments = {};

    for (const project of projectsModels) {
        grouped[project.name] = project.attachments.map((a) => ({
            id: a.id,
            name: a.name,
            confirmed: a.confirmed,
            internal: a.internal,
            thumbnailPath: a.thumbnailPath,
        }));
    }

    return grouped;
}