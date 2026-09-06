import { Injectable } from '@nestjs/common';
import { Account, Event, Vote, Project, VoteCategory, EventTable, Award } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { VotesCalculationDto } from '../dto/votescalc.dto';
import { ProjectVoteDto } from '../dto/projectvote.dto';
import { VoteDto } from '../dto/vote.dto';
import { AccountDto } from '../dto/account.dto';
import { VoteMessage } from '../dto/votemessage.dto';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { EventType, VotingEvent } from '../dto/votingevent.dto';
import { AwardAssignmentDto } from '../dto/award-assigment.dto';

@Injectable()
export class VotingService {
    constructor(
        private readonly sequelize: Sequelize,
        @InjectModel(Event)
        private readonly eventModel: typeof Event,
        @InjectModel(Vote)
        private readonly voteModel: typeof Vote,
        @InjectModel(Project)
        private readonly projectModel: typeof Project,
        @InjectModel(VoteCategory)
        private readonly voteCategoryModel: typeof VoteCategory,
        @InjectModel(EventTable)
        private readonly eventTableModel: typeof EventTable,
        @InjectModel(Award)
        private readonly awardModel: typeof Award,
    ) { }

    private readonly events$ = new Subject<VotingEvent>();

    publish(event: VotingEvent) {
        this.events$.next(event);
    }

    stream(): Observable<VotingEvent> {
        return this.events$.asObservable();
    }

    async submitVotes(
        eventId: number,
        projectId: number,
        accountId: number,
        votes: VoteDto[]
    ) {
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (!activeEvent.votingOpen) {
            throw new Error("Voting is not open");
        }

        await this.voteModel.bulkCreate(votes.map((v) => ({
            categoryId: v.id,
            projectId,
            accountId,
            amount: v.value || 0,
            eventId: activeEvent.id,
        })));

        return null;
    }

    async getProjects(eventId: number, skipProjectId: number, languages: string[], accountId: number): Promise<ProjectVoteDto | VoteMessage> {
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        const randomProject = await this.projectModel.findOne({
            limit: 1,
            where: {
                id: {
                    [Op.and]: {
                        [Op.notIn]: Sequelize.literal(
                            `(SELECT DISTINCT vote.projectId FROM Votes AS vote WHERE vote.accountId = ${accountId})`,
                        ),
                        [Op.ne]: skipProjectId,
                    },
                },
                eventId: activeEvent.id,
                deletedAt: null,
                language: { [Op.in]: languages },
            },
            include: [{ model: this.eventTableModel, required: true }],
            attributes: {
                include: [
                    [
                        Sequelize.literal(
                            '(SELECT COUNT(*) FROM Votes AS vote WHERE vote.projectId = Project.id )',
                        ),
                        'votesReceived',
                    ],
                ],
            },
            order: [
                [Sequelize.literal('votesReceived'), 'ASC'],
                [Sequelize.literal('rand()'), 'ASC'],
            ],
        });

        if (!randomProject) {
            return { message: 'finished' };
        }

        const location = (await randomProject.getTable()).name;
        const categories = await this.voteCategoryModel.findAll({
            attributes: ['name', 'max', 'optional', 'id'],
            where: {
                eventId: activeEvent.id,
                public: {
                    [Op.or]: {
                        [Op.eq]: false,
                        [Op.is]: null,
                    },
                },
            },
        });

        return {
            project_id: randomProject.id,
            title: randomProject.name,
            description: randomProject.description,
            language: randomProject.language,
            categories,
            location: location || 'No location',
        };
    }

    async closeVotingNow(eventId: number){
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (activeEvent.votingOpen) {
            activeEvent.votingEndDate = new Date();
            await activeEvent.save();
        }

        this.publish({
            type: EventType.VOTE_TIMER,
            message: '',
            startDate: activeEvent.votingStartDate,
            endDate: activeEvent.votingEndDate,
        });
    }

    async openVotingWithDuration(eventId: number, durationMinutes: number, deletePreviousResults = false){
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
            throw new Error('Voting duration must be greater than zero');
        }

        if (deletePreviousResults) {
            await this.voteModel.destroy({ where: { eventId } });
            await this.awardModel.destroy({ where: { eventId } });
        }

        const now = new Date();
        activeEvent.votingStartDate = now;
        activeEvent.votingEndDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
        await activeEvent.save();
        this.publish({
            type: EventType.VOTE_TIMER,
            message: '',
            startDate: activeEvent.votingStartDate,
            endDate: activeEvent.votingEndDate,
        });
    }

    publishMessage(message: string): void {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            throw new Error('Message cannot be empty');
        }

        this.publish({ type: EventType.MESSAGE, message: trimmedMessage });
    }

    async getVotingStatus(eventId: number): Promise<{
        votingOpen: boolean;
        votingStartDate: string | null;
        votingEndDate: string | null;
    }> {
        const event = await this.eventModel.findByPk(eventId);
        if (!event) {
            throw new Error('No Event Found');
        }

        return {
            votingOpen: event.votingOpen,
            votingStartDate: event.votingStartDate?.toISOString() ?? null,
            votingEndDate: event.votingEndDate?.toISOString() ?? null,
        };
    }

    async getAccount(id: number): Promise<AccountDto> {
        const account = await Account.findByPk(id);
        if (!account) {
            throw new Error("Account not found");
        }

        const activeEvent = await this.eventModel.findOne({
            where: {
                eventBeginDate: { [Op.lt]: Sequelize.literal('CURDATE()') },
                eventEndDate: { [Op.gt]: Sequelize.literal('CURDATE()') },
            },
            attributes: ['id', 'votingStartDate', 'votingEndDate'],
        });

        if (!activeEvent) {
            throw new Error("No Active Event Found");
        }

        return {
            id: account.id,
            email: account.email,
            eventId: activeEvent.id,
            votingStartDate: activeEvent.votingStartDate
                ? activeEvent.votingStartDate.toISOString()
                : new Date(0).toISOString(),
            votingEndDate: activeEvent.votingEndDate
                ? activeEvent.votingEndDate.toISOString()
                : new Date(0).toISOString(),
        };
    }

    async generateAwards(eventId: number): Promise<AwardAssignmentDto[]> {
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (activeEvent.votingOpen) {
            throw new Error("Voting is open, please close first");
        }

        const projects = await this.projectModel.findAll({
            where: { eventId, deletedAt: null },
            attributes: ['id', 'name'],
        });
        const projectNames = new Map(projects.map((project) => [project.id, project.name]));
        const existingAwards = await this.awardModel.findAll({ where: { eventId } });
        const awardsByProject = new Map(existingAwards.map((award) => [award.projectId, award]));
        for (const project of projects) {
            const award = awardsByProject.get(project.id)
                ?? await this.awardModel.create({ eventId, projectId: project.id, categoryId: null });
            award.categoryId = null;
            awardsByProject.set(project.id, award);
        }

        const results = await this.calculateVotes(eventId);
        const usedProjectIds = new Set<number>();
        const assignments: AwardAssignmentDto[] = [];
        const byCategory = new Map<number, VotesCalculationDto[]>();

        for (const result of results) {
            const categoryResults = byCategory.get(result.categoryId) ?? [];
            categoryResults.push(result);
            byCategory.set(result.categoryId, categoryResults);
        }

        for (const [categoryId, categoryResults] of byCategory) {
            const candidates = categoryResults
                .slice()
                .sort((first, second) => second.adjusted_average_percent - first.adjusted_average_percent)
                .map((result, index) => ({
                    projectId: result.projectId,
                    projectName: projectNames.get(result.projectId) ?? `Project #${result.projectId}`,
                    categoryId: result.categoryId,
                    categoryName: result.categoryName,
                    rank: index + 1,
                    adjustedAveragePercent: Number(result.adjusted_average_percent),
                    medianPercent: Number(result.median_percent),
                    minPercent: Number((result as any).min_percent ?? 0),
                    maxPercent: Number((result as any).max_percent ?? 100),
                    outlierCount: Number(result.outlier_count),
                }));
            const winner = candidates.find((candidate) => !usedProjectIds.has(candidate.projectId));
            if (!winner) continue;

            usedProjectIds.add(winner.projectId);
            const award = awardsByProject.get(winner.projectId);
            if (!award) continue;
            award.categoryId = categoryId;
            await award.save();

            assignments.push({
                id: award.id,
                categoryId,
                categoryName: categoryResults[0].categoryName,
                projectId: winner.projectId,
                projectName: winner.projectName,
                candidates,
            });
        }

        return assignments;
    }

    async assignAward(eventId: number, awardId: number, categoryId: number | null): Promise<void> {
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (activeEvent.votingOpen) {
            throw new Error("Voting is open, please close first");
        }

        const award = await this.awardModel.findOne({ where: { eventId, id: awardId } });

        if (!award) {
            throw new Error("Award not found");
        }

        const conflictingAward = categoryId === null
            ? null
            : await this.awardModel.findOne({
                where: { eventId, categoryId, id: { [Op.ne]: awardId } },
            });
        if (conflictingAward) {
            throw new Error('Each award category can only be assigned once');
        }

        award.categoryId = categoryId;
        await award.save();
    }

    async getAwardAssignments(eventId: number): Promise<AwardAssignmentDto[]> {
        const results = await this.calculateVotes(eventId);
        const projectIds = [...new Set(results.map((result) => result.projectId))];
        const projects = await this.projectModel.findAll({ where: { eventId, id: { [Op.in]: projectIds } }, attributes: ['id', 'name'] });
        const projectNames = new Map(projects.map((project) => [project.id, project.name]));
        const awards = await this.awardModel.findAll({ where: { eventId } });
        return awards.map((award: any) => {
            const categoryResults = results
                .filter((result) => result.projectId === award.projectId)
                .sort((first, second) => second.adjusted_average_percent - first.adjusted_average_percent);
            const candidates = categoryResults.map((result) => ({
                projectId: result.projectId,
                projectName: projectNames.get(result.projectId) ?? `Project #${result.projectId}`,
                categoryId: result.categoryId,
                categoryName: result.categoryName,
                rank: categoryResults.findIndex((candidate) => candidate.categoryId === result.categoryId) + 1,
                adjustedAveragePercent: Number(result.adjusted_average_percent),
                medianPercent: Number(result.median_percent),
                minPercent: Number((result as any).min_percent ?? 0),
                maxPercent: Number((result as any).max_percent ?? 100),
                outlierCount: Number(result.outlier_count),
            }));
            return {
                id: award.id,
                categoryId: award.categoryId,
                projectId: award.projectId,
                projectName: projectNames.get(award.projectId) ?? `Project #${award.projectId}`,
                candidates,
            };
        });
    }

    async calculateVotes(eventId: number): Promise<VotesCalculationDto[]> {
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        // calculation can only happen when all the votes are in
        if (activeEvent.votingOpen) {
            throw new Error("Voting is open, please close first");
        }

        const results = await this.sequelize.query(`
            WITH jury_count AS (
                SELECT COUNT(*) AS total_jurors
                FROM \`Accounts\`
                WHERE account_type = 'jury'
            ),

            normalized_votes AS (
                SELECT
                    v.\`projectId\`,
                    v.\`categoryId\`,
                    v.amount,

                    vc.name AS categoryName,
                    vc.min AS category_min,
                    vc.max AS category_max,
                    vc.optional AS category_optional,

                    /*
                    * Normalize vote to 0-100%.
                    */
                    CASE
                        WHEN vc.max = vc.min THEN 100
                        ELSE
                            (
                                (v.amount - vc.min) /
                                NULLIF(vc.max - vc.min, 0)
                            ) * 100
                    END AS score_percent

                FROM \`Votes\` v

                INNER JOIN \`VoteCategories\` vc
                    ON vc.id = v.\`categoryId\`

                WHERE v.eventId = :eventId
            ),

            vote_analysis AS (
                SELECT
                    nv.*,

                    /*
                    * Average for project/category.
                    */
                    AVG(score_percent) OVER (
                        PARTITION BY \`projectId\`, \`categoryId\`
                    ) AS project_average,

                    /*
                    * Population standard deviation.
                    */
                    STDDEV_POP(score_percent) OVER (
                        PARTITION BY \`projectId\`, \`categoryId\`
                    ) AS project_stddev

                FROM normalized_votes nv
            ),

            marked_votes AS (
                SELECT
                    va.*,

                    /*
                    * Mark votes >= 2 standard deviations
                    * away from the average.
                    */
                    CASE
                        WHEN project_stddev = 0 THEN 0

                        WHEN ABS(score_percent - project_average)
                            / project_stddev >= 2
                        THEN 1

                        ELSE 0
                    END AS is_outlier

                FROM vote_analysis va
            ),

            /*
            * Calculate median for each project/category.
            */
            ordered_scores AS (
                SELECT
                    \`projectId\`,
                    \`categoryId\`,
                    score_percent,

                    ROW_NUMBER() OVER (
                        PARTITION BY \`projectId\`, \`categoryId\`
                        ORDER BY score_percent
                    ) AS rn,

                    COUNT(*) OVER (
                        PARTITION BY \`projectId\`, \`categoryId\`
                    ) AS cnt

                FROM marked_votes
            ),

            median_scores AS (
                SELECT
                    \`projectId\`,
                    \`categoryId\`,

                    AVG(score_percent) AS median_percent

                FROM ordered_scores

                WHERE rn IN (
                    FLOOR((cnt + 1) / 2),
                    FLOOR((cnt + 2) / 2)
                )

                GROUP BY
                    \`projectId\`,
                    \`categoryId\`
            ),

            project_category_stats AS (
                SELECT
                    mv.\`projectId\`,
                    mv.\`categoryId\`,

                    MAX(mv.categoryName) AS categoryName,
                    MAX(mv.category_min) AS category_min,
                    MAX(mv.category_max) AS category_max,
                    MAX(mv.category_optional) AS category_optional,

                    COUNT(*) AS vote_count,

                    /*
                    * Main average.
                    */
                    AVG(mv.score_percent) AS average_percent,

                    /*
                    * Median.
                    */
                    ms.median_percent,

                    /*
                    * Average excluding outliers.
                    */
                    SUM(
                        CASE
                            WHEN mv.is_outlier = 0
                            THEN mv.score_percent
                            ELSE 0
                        END
                    )
                    /
                    NULLIF(
                        SUM(
                            CASE
                                WHEN mv.is_outlier = 0 THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS adjusted_average_percent,

                    /*
                    * Score distribution.
                    */
                    STDDEV_POP(mv.score_percent) AS score_stddev,

                    MIN(mv.score_percent) AS min_percent,
                    MAX(mv.score_percent) AS max_percent,

                    /*
                    * Outlier count.
                    */
                    SUM(
                        CASE
                            WHEN mv.is_outlier = 1 THEN 1
                            ELSE 0
                        END
                    ) AS outlier_count,

                    /*
                    * Equivalent of PostgreSQL BOOL_OR().
                    */
                    MAX(mv.is_outlier) AS has_outliers,

                    /*
                    * Outlier range.
                    */
                    MIN(
                        CASE
                            WHEN mv.is_outlier = 1
                            THEN mv.score_percent
                        END
                    ) AS outlier_min_percent,

                    MAX(
                        CASE
                            WHEN mv.is_outlier = 1
                            THEN mv.score_percent
                        END
                    ) AS outlier_max_percent

                FROM marked_votes mv

                INNER JOIN median_scores ms
                    ON ms.\`projectId\` = mv.\`projectId\`
                    AND ms.\`categoryId\` = mv.\`categoryId\`

                GROUP BY
                    mv.\`projectId\`,
                    mv.\`categoryId\`,
                    ms.median_percent
            )

            SELECT
                pcs.*,

                jc.total_jurors,

                /*
                * Jurors who didn't submit a vote.
                */
                jc.total_jurors - pcs.vote_count AS votes_skipped,

                /*
                * Participation percentage.
                */
                ROUND(
                    (
                        pcs.vote_count / NULLIF(jc.total_jurors, 0)
                    ) * 100,
                    2
                ) AS participation_percent

            FROM project_category_stats pcs

            CROSS JOIN jury_count jc

            ORDER BY
                pcs.\`categoryId\`,
                pcs.average_percent DESC;`,
            {
                type: QueryTypes.SELECT,
                replacements: { eventId },
            }
        );

        return results.map((vote: any) => {
            return {
                projectId: vote.projectId,
                categoryId: vote.categoryId,
                categoryName: vote.categoryName,
                category_min: vote.category_min,
                category_max: vote.category_max,
                category_optional: vote.category_optional,
                total_jurors: vote.total_jurors,
                vote_count: vote.vote_count,
                votes_skipped: vote.votes_skipped,
                participation_percent: vote.participation_percent,
                average_percent: vote.average_percent,
                median_percent: vote.median_percent,
                adjusted_average_percent: vote.adjusted_average_percent,
                score_stddev: vote.score_stddev,
                min_percent: vote.min_percent,
                max_percent: vote.max_percent,
                has_outliers: vote.has_outliers,
                outlier_count: vote.outlier_count,
                outlier_min_percent: vote.outlier_min_percent,
                outlier_max_percent: vote.outlier_max_percent,
            };
        });
    }
}