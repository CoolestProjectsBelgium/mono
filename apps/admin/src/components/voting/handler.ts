import { Project as ProjectModel, Vote as VoteModel } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { sequelize } from '../../database.js';

const Project = sequelize.models.Project as typeof ProjectModel;
const Vote = sequelize.models.Vote as typeof VoteModel;

export interface VotingOverview {
    totalVotes: number;
    totalProjects: number;
    projectsWithVotes: number;
    projectsWithoutVotes: number;
    votesOverTime: Array<{ date: string; votes: number }>;
    votesByProjectCategory: Array<{ project: string; [category: string]: string | number }>;
}

export const Handler = async (_request: any, _response: any, context: any): Promise<VotingOverview> => {
    const eventId = context.currentAdmin?.eventId;
    const projectWhere = { eventId, deletedAt: { [Op.is]: null } };

    const [totalVotes, totalProjects, projectsWithVotes] = await Promise.all([
        Vote.count({ where: { eventId } }),
        Project.count({ where: projectWhere }),
        Vote.count({
            distinct: true,
            col: 'projectId',
            where: { eventId },
        }),
    ]);

    const projectsWithoutVotes = Math.max(totalProjects - projectsWithVotes, 0);

    const votes = await Vote.findAll({
        where: { eventId },
        include: [
            { model: Project, attributes: ['name'] },
            { model: sequelize.models.VoteCategory, attributes: ['name'] },
        ],
        attributes: ['createdAt'],
        raw: true,
    }) as unknown as Array<{
        createdAt: Date;
        'project.name': string;
        'category.name': string;
    }>;

    const timeTotals = new Map<string, number>();
    const projectCategories = new Map<string, Record<string, number>>();

    for (const vote of votes) {
        const voteTime = new Date(vote.createdAt);
        voteTime.setUTCMinutes(Math.floor(voteTime.getUTCMinutes() / 5) * 5, 0, 0);
        const interval = voteTime.toISOString();
        timeTotals.set(interval, (timeTotals.get(interval) ?? 0) + 1);

        const project = vote['project.name'];
        const category = vote['category.name'];
        const categories = projectCategories.get(project) ?? {};
        categories[category] = (categories[category] ?? 0) + 1;
        projectCategories.set(project, categories);
    }

    const votesByProjectCategory = Array.from(projectCategories, ([project, categories]) => ({
        project,
        ...categories,
    }));

    return {
        totalVotes,
        totalProjects,
        projectsWithVotes,
        projectsWithoutVotes,
        votesOverTime: Array.from(timeTotals, ([date, votes]) => ({ date, votes }))
            .sort((first, second) => first.date.localeCompare(second.date)),
        votesByProjectCategory,
    };
};