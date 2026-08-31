import { Injectable } from '@nestjs/common';
import { Account, Event, Vote, Project, VoteCategory, EventTable, Award } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { VotesCalculationDto } from '../dto/votescalc.dto';
import { ProjectVoteDto } from '../dto/projectvote.dto';
import { VoteDto } from '../dto/vote.dto';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { VotingEvent } from '../dto/votingevent.dto';

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
                project_lang: { [Op.in]: languages },
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
            attributes: ['id'],
        });

        if (!activeEvent) {
            throw new Error("No Active Event Found");
        }

        return { id: account.id, email: account.email, eventId: activeEvent.id };
    }

    async generateAwards(eventId: number): Promise<void> {
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (activeEvent.votingOpen) {
            throw new Error("Voting is open, please close first");
        }

        const projects = await this.projectModel.findAll({
            where: {
                eventId: eventId,
                deletedAt: null
            }
        })

        await this.awardModel.bulkCreate(projects.map((p) => ({ eventId: eventId, projectId: p.id })), { ignoreDuplicates: true });
    }

    async assignAward(eventId: number, awardId: number, categoryId: number){
        const activeEvent = await this.eventModel.findByPk(eventId);

        if (!activeEvent) {
            throw new Error("No Event Found");
        }

        if (activeEvent.votingOpen) {
            throw new Error("Voting is open, please close first");
        }

        const award = await this.awardModel.findOne({
            where: {
                eventId: eventId,
                id: awardId
            }
        })

        if(!award) {
            throw new Error("Award not found");
        }

        award.categoryId = awardId;
        award.save();
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
                has_outliers: vote.has_outliers,
                outlier_count: vote.outlier_count,
                outlier_min_percent: vote.outlier_min_percent,
                outlier_max_percent: vote.outlier_max_percent,
            };
        });
    }
}