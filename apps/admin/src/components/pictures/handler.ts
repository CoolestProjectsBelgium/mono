
import { Attachment, Project } from '@coolestprojects/database';
import {
    sequelize,
} from '../../database.js'

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

export const Handler = async (request: any, response: any, context: any): Promise<GroupedAttachments> => {

    const eventId = context.currentAdmin?.eventId;

    const projectsModels = await sequelize.models.Projects.findAll({
        where: { eventId },
        attributes: ['name'],
        include: [{
            model: sequelize.models.Attachments,
            as: 'attachments',
            attributes: ['id', 'name', 'confirmed', 'internal', 'thumbnailPath'],
        }],
    });

    const grouped: GroupedAttachments = {};

    for (const project of projectsModels as Project[]) {
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