import { EventTable as EventTableModel, Project as ProjectModel, User as UserModel } from '@coolestprojects/database';
import { sequelize } from '../../database.js';

const EventTable = sequelize.models.EventTable as typeof EventTableModel;
const Project = sequelize.models.Project as typeof ProjectModel;
const User = sequelize.models.User as typeof UserModel;

export interface TableAssignment {
    id: number;
    name: string;
    maxPlaces: number;
    projectId: number | null;
    projectName: string | null;
}

export interface ProjectAssignment {
    id: number;
    name: string;
    type: string | null;
    language: string;
    affiliations: string[];
    tableId: number | null;
    tableName: string | null;
}

export interface TableOverview {
    tables: TableAssignment[];
    projects: ProjectAssignment[];
}

const getOverview = async (eventId: number): Promise<TableOverview> => {
    const [tables, projects] = await Promise.all([
        EventTable.findAll({
            where: { eventId },
            include: [{ model: Project, attributes: ['id', 'name'] }],
            order: [['name', 'ASC']],
        }),
        Project.findAll({
            where: { eventId, deletedAt: null },
            attributes: ['id', 'name', 'type', 'language'],
            include: [
                { model: EventTable, attributes: ['id', 'name'] },
                {
                    model: User,
                    as: 'users',
                    attributes: ['via'],
                    through: { attributes: [] },
                },
            ],
            order: [['name', 'ASC']],
        }),
    ]);

    return {
        tables: tables.map((table) => ({
            id: table.id,
            name: table.name,
            maxPlaces: table.maxPlaces,
            projectId: table.projectId ?? null,
            projectName: table.project?.name ?? null,
        })),
        projects: projects.map((project) => {
            const affiliations = Array.from(new Set(
                (project.users ?? [])
                    .map((user) => user.via?.trim())
                    .filter((via): via is string => Boolean(via)),
            ));
            return {
                id: project.id,
                name: project.name,
                type: project.type ?? null,
                language: project.language,
                affiliations,
                tableId: project.table?.id ?? null,
                tableName: project.table?.name ?? null,
            };
        }),
    };
};

export const Handler = async (request: any, _response: any, context: any): Promise<TableOverview> => {
    const eventId = context.currentAdmin?.eventId;
    const payload = request.payload ?? {};

    if (request.method?.toLowerCase() === 'post') {
        const tableId = Number(payload.tableId);
        const projectId = payload.projectId === '' || payload.projectId == null
            ? null
            : Number(payload.projectId);

        if (payload.action === 'swap-tables') {
            const tableIds: number[] = Array.isArray(payload.tableIds)
                ? payload.tableIds.map((id: unknown) => Number(id))
                : [];
            if (tableIds.length !== 2 || tableIds.some((id) => !Number.isInteger(id))) {
                throw new Error('Select exactly two tables to swap');
            }

            const tables = await EventTable.findAll({ where: { id: tableIds, eventId } });
            if (tables.length !== 2) {
                throw new Error('Tables not found for this event');
            }

            const firstProjectId = tables[0].projectId ?? null;
            await sequelize.transaction(async (transaction) => {
                await EventTable.update(
                    { projectId: tables[1].projectId ?? null },
                    { where: { id: tables[0].id, eventId }, transaction },
                );
                await EventTable.update(
                    { projectId: firstProjectId },
                    { where: { id: tables[1].id, eventId }, transaction },
                );
            });
        } else if (payload.action === 'remove-table') {
            const table = await EventTable.findOne({ where: { id: tableId, eventId } });
            if (table) {
                await table.destroy();
            }
        } else if (payload.action === 'assign') {
            if (projectId !== null) {
                const project = await Project.findOne({ where: { id: projectId, eventId, deletedAt: null } });
                if (!project) {
                    throw new Error('Project not found for this event');
                }

                await EventTable.update(
                    { projectId: null },
                    { where: { eventId, projectId } },
                );
            }

            await EventTable.update(
                { projectId },
                { where: { id: tableId, eventId } },
            );
        }
    }

    return getOverview(eventId);
};
