import { Injectable } from '@nestjs/common';
import { Account, Event, Vote, Project, VoteCategory, EventTable } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { VoteDto } from '../dto/vote.dto';
import { ProjectVoteDto } from '../dto/projectvote.dto';

@Injectable()
export class VotingService {
    constructor(
        private readonly sequelize: Sequelize,
        @InjectModel(Account)
        private readonly accountModel: typeof Account,
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
    ) { }

    async submitVotes(
        projectId: number,
        accountId: number,
        votes: VoteDto[]
    ) {
        const activeEvent = await this.eventModel.findOne({
            where: {
                eventBeginDate: { [Op.lt]: Sequelize.literal('CURDATE()') },
                eventEndDate: { [Op.gt]: Sequelize.literal('CURDATE()') },
            },
            attributes: ['id'],
        });

        if (!activeEvent) {
            throw new Error("No Event Found");
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

    async getProjects(skipProjectId: number, languages: string[], accountId: number): Promise<ProjectVoteDto | VoteMessage> {
        const activeEvent = await this.eventModel.findOne({
            where: {
                eventBeginDate: { [Op.lt]: Sequelize.literal('CURDATE()') },
                eventEndDate: { [Op.gt]: Sequelize.literal('CURDATE()') },
            },
            attributes: ['id'],
        });

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

        //const location = (await randomProject.getTables())?.[0]?.name;
        const location = "TODO";

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

    async getAccount(id: number): Promise<AccountDto>{
        const account = await Account.findByPk(id);
        if(!account){
            throw new Error("Account not found");
        }
        return { id: account.id, email: account.email };
    }
}