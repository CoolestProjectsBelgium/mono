import {
    Account as AccountModel,
    Event as EventModel,
    Project as ProjectModel,
    Vote as VoteModel,
    VoteCategory as VoteCategoryModel,
} from '@coolestprojects/database';
import { Op } from 'sequelize';
import { sequelize } from '../../database.js';
import { getCookieHeader, nestFetch, parseNestJson } from '../../api/nest-fetch.js';

const Project = sequelize.models.Project as typeof ProjectModel;
const Vote = sequelize.models.Vote as typeof VoteModel;
const Account = sequelize.models.Account as typeof AccountModel;
const VoteCategory = sequelize.models.VoteCategory as typeof VoteCategoryModel;
const Event = sequelize.models.Event as typeof EventModel;

export interface VotingResult {
    projectId: number;
    categoryId: number;
    categoryName: string;
    projectName: string;
    vote_count: number;
    votes_skipped: number;
    participation_percent: number;
    average_percent: number;
    median_percent: number;
    adjusted_average_percent: number;
    score_stddev: number;
    has_outliers: boolean;
    outlier_count: number;
    min_percent: number;
    max_percent: number;
}

export interface AwardCandidate {
    projectId: number;
    projectName: string;
    categoryId: number;
    categoryName: string;
    rank: number;
    adjustedAveragePercent: number;
    medianPercent: number;
    minPercent: number;
    maxPercent: number;
    outlierCount: number;
}

export interface AwardAssignment {
    id: number;
    categoryId: number | null;
    categoryName?: string;
    projectId: number;
    projectName: string;
    candidates: AwardCandidate[];
}

export interface VotingStatus {
    votingOpen: boolean;
    votingStartDate: string | null;
    votingEndDate: string | null;
}

export interface VotingOverview {
    totalVotes: number;
    totalProjects: number;
    projectsWithVotes: number;
    projectsWithoutVotes: number;
    votesOverTime: Array<{ date: string; votes: number; votesRemaining: number }>;
    totalExpectedVotes: number;
    votesByProjectCategory: Array<{ project: string; [category: string]: string | number }>;
    votingStatus: VotingStatus;
    results: VotingResult[];
    awards: AwardAssignment[];
}

export const Handler = async (request: any, _response: any, context: any): Promise<VotingOverview | { success: true }> => {
    const eventId = context.currentAdmin?.eventId;
    if (!eventId) {
        throw new Error('No event selected');
    }
    const cookieHeader = getCookieHeader(request);

    if (request.method?.toLowerCase() === 'post') {
        const payload = request.payload ?? {};
        const action = String(payload.action ?? '');
        let path = '';
        let body: Record<string, unknown> | undefined;

        if (action === 'start') {
            path = '/admin/voting/start';
            body = {
                durationMinutes: Number(payload.durationMinutes ?? 60),
                deletePreviousResults: payload.deletePreviousResults === true
                    || payload.deletePreviousResults === 'true',
            };
        } else if (action === 'stop') {
            path = '/admin/voting/stop';
        } else if (action === 'message') {
            path = '/admin/voting/message';
            body = { message: String(payload.message ?? '') };
        } else if (action === 'generate-awards') {
            path = '/admin/voting/awards/generate';
        } else if (action === 'assign-award') {
            path = `/admin/voting/awards/${Number(payload.awardId)}/assign`;
            body = {
                categoryId: payload.categoryId === '' || payload.categoryId === null || payload.categoryId === undefined
                    ? null
                    : Number(payload.categoryId),
            };
        } else {
            throw new Error(`Unknown action: ${action}`);
        }

        const response = await nestFetch(path, {
            method: 'POST',
            body,
            cookieHeader,
            adminEventId: Number(eventId),
        });
        await parseNestJson<{ success: true }>(response);
        return { success: true };
    }

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
    const [totalJurors, totalCategories] = await Promise.all([
        Account.count({ where: { account_type: 'jury' } }),
        VoteCategory.count({
            where: {
                eventId,
                public: { [Op.or]: [{ [Op.eq]: false }, { [Op.is]: null }] },
            },
        }),
    ]);
    const totalExpectedVotes = totalProjects * totalJurors * totalCategories;

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

    const sortedVoteIntervals = Array.from(timeTotals, ([date, votes]) => ({ date, votes }))
        .sort((first, second) => first.date.localeCompare(second.date));
    let cumulativeVotes = 0;
    const votesOverTime = sortedVoteIntervals.map((interval) => {
        cumulativeVotes += interval.votes;
        return {
            ...interval,
            votesRemaining: Math.max(totalExpectedVotes - cumulativeVotes, 0),
        };
    });

    const event = await Event.findByPk(eventId, {
        attributes: ['votingStartDate', 'votingEndDate'],
    });
    if (!event) {
        throw new Error('No event found');
    }

    const now = Date.now();
    const status: VotingStatus = {
        votingOpen: Boolean(
            event.votingStartDate
            && event.votingEndDate
            && event.votingStartDate.getTime() < now
            && event.votingEndDate.getTime() > now,
        ),
        votingStartDate: event.votingStartDate?.toISOString() ?? null,
        votingEndDate: event.votingEndDate?.toISOString() ?? null,
    };
    let results: VotingResult[] = [];
    if (!status.votingOpen) {
        try {
            const calculated = await parseNestJson<Array<Omit<VotingResult, 'projectName'>>>(
                await nestFetch('/admin/voting/results', { cookieHeader, adminEventId: Number(eventId) }),
            );
            const projectIds = [...new Set(calculated.map((result) => result.projectId))];
            const projects = await Project.findAll({ where: { eventId, id: { [Op.in]: projectIds } }, attributes: ['id', 'name'] });
            const projectNames = new Map(projects.map((project) => [project.id, project.name]));
            results = calculated.map((result) => ({
                ...result,
                projectName: projectNames.get(result.projectId) ?? `Project #${result.projectId}`,
            }));
        } catch (error) {
            console.error('Failed to load calculated voting results:', error);
        }
    }

    let awards: AwardAssignment[] = [];
    if (!status.votingOpen) {
        try {
            awards = await parseNestJson<AwardAssignment[]>(
                await nestFetch('/admin/voting/awards', { cookieHeader, adminEventId: Number(eventId) }),
            );
        } catch (error) {
            console.error('Failed to load voting awards:', error);
        }
    }

    return {
        totalVotes,
        totalProjects,
        projectsWithVotes,
        projectsWithoutVotes,
        votesOverTime,
        totalExpectedVotes,
        votesByProjectCategory,
        votingStatus: status,
        results,
        awards,
    };
};