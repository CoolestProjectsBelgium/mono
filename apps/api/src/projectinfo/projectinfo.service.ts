import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Project, User, Event } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { UserProject } from '@coolestprojects/database';
import { OwnProjectDto } from '../dto/own-project.dto';
import { AttachmentDto } from '../dto/attachment.dto';
import { ParticipantDto } from '../dto/participant.dto';
import { VoucherCreatedDto } from '../dto/voucher-created.dto';
import { createReadStream } from 'node:fs';
import { Attachment } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { randomUUID } from 'crypto';

@Injectable()
export class ProjectinfoService {
    private readonly logger = new Logger(ProjectinfoService.name);

    public constructor(
        @InjectModel(Project) private readonly projectModel: typeof Project,
        @InjectModel(UserProject) private readonly userProjectModel: typeof UserProject,
        @InjectModel(Attachment) private readonly attachmentModel: typeof Attachment,
        @InjectModel(User) private readonly userModel: typeof User,
        @InjectModel(Event) private readonly eventModel: typeof Event,
        @InjectConnection()
        private readonly sequelize: Sequelize,
    ) { }

    public async getThumbnail(userId: number, attachmentId: number): Promise<StreamableFile> {
        const userProject = await this.userProjectModel.findOne({ where: { userId, deletedAt: null } });
        if (!userProject) {
            throw new Error('User is not associated with any project');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('User is not associated with any project');
        }

        const attachment = await this.attachmentModel.findOne({
            where: {
                id: attachmentId, projectId: userProject.projectId, [Op.or]: [
                    { internal: false },
                    { internal: null },
                ],
            }
        });

        if (!attachment) {
            throw new Error('Attachment not found');
        }

        const file = createReadStream(attachment.thumbnailPath);
        return new StreamableFile(file, { type: attachment.mimetype });
    }

    public async getThumbnailAdmin(attachmentId: number): Promise<StreamableFile> {
        const attachment = await this.attachmentModel.findOne({ where: { id: attachmentId } });

        if (!attachment) {
            throw new Error('Attachment not found');
        }

        const file = createReadStream(attachment.thumbnailPath);
        return new StreamableFile(file, { type: attachment.mimetype });
    }

    private getThumbnailUrl(attachmentId: number): string {
        const base = process.env.ATTACHMENT_BASE_URL?.replace(/\/$/, '');
        if (!base) {
            return `/projectinfo/attachments/${attachmentId}`;
        }
        return `${base}/${attachmentId}`;
    }

    private formatParticipantName(firstname?: string | null, lastname?: string | null): string {
        return [firstname, lastname].filter(Boolean).join(' ').trim();
    }

    private isActiveProject(project: Project | null | undefined): project is Project {
        return Boolean(project) && project!.deletedAt == null;
    }

    private async countRegisteredCoParticipants(projectId: number): Promise<number> {
        return this.userProjectModel.count({
            where: {
                projectId,
                userId: { [Op.ne]: null },
                deletedAt: null,
                isOwner: false,
            },
        });
    }

    private async buildParticipants(
        projectId: number,
        userId: number,
    ): Promise<ParticipantDto[]> {
        const memberships = await this.userProjectModel.findAll({
            where: {
                projectId,
                deletedAt: null,
            },
        });

        const registeredMemberships = memberships.filter(
            membership => membership.userId != null,
        );
        const pendingMemberships = memberships.filter(
            membership => membership.userId == null && membership.voucherGuid,
        );

        const registered: ParticipantDto[] = [];
        for (const membership of registeredMemberships) {
            const participant = await this.userModel.findByPk(membership.userId);
            if (!participant) {
                continue;
            }

            registered.push({
                id: participant.id,
                name: this.formatParticipantName(participant.firstname, participant.lastname),
                self: participant.id === userId,
                is_owner: membership.isOwner,
                status: 'registered',
                token: !membership.isOwner ? membership.voucherGuid : undefined,
                delete_possible: false
            });
        }

        const pending: ParticipantDto[] = pendingMemberships.map((membership) => ({
            id: membership.id,
            name: '',
            self: false,
            status: 'pending',
            token: membership.voucherGuid,
            delete_possible: true
        }));

        return [...registered, ...pending];
    }

    public async getProjectInfo(userId: number): Promise<OwnProjectDto> {
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null },
        });

        if (!userProject) {
            throw new Error('User is not associated with any project');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('User is not associated with any project');
        }

        const participants = await this.buildParticipants(project.id, userId);
        const registeredCoParticipants = await this.countRegisteredCoParticipants(project.id);

        return {
            project_id: String(project.id),
            project_name: project.name,
            project_descr: project.description,
            project_type: project.type,
            project_lang: project.language,
            is_owner: userProject.isOwner,
            delete_possible: registeredCoParticipants === 0,
            participants,
        };
    }

    public async getAttachments(userId: number): Promise<AttachmentDto[]> {
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null },
        });

        if (!userProject) {
            throw new Error('User is not associated with any project');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('User is not associated with any project');
        }

        const attachments = await project.getAttachments({
            where: {
                [Op.or]: [
                    { internal: false },
                    { internal: null },
                ],
            }
        });

        return attachments.map(attachment => ({
            id: String(attachment.id),
            name: attachment.name,
            thumbnailUrl: this.getThumbnailUrl(attachment.id),
            delete_possible: !attachment.confirmed
        }));
    }

    public async createProject(userId: number, createProjectDto: OwnProjectDto): Promise<OwnProjectDto> {
        const existingProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null },
        });
        if (existingProject) {
            throw new Error('User already has a project');
        }

        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const event = await this.eventModel.findByPk(user.eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        const project = await this.projectModel.create({
            name: createProjectDto.project_name,
            description: createProjectDto.project_descr,
            type: createProjectDto.project_type,
            language: createProjectDto.project_lang,
            eventId: user.eventId,
            maxVoucher: event.maxVoucher,
            ownerId: userId,
        });

        await this.userProjectModel.create({
            userId,
            projectId: project.id,
            eventId: user.eventId,
            isOwner: true,
        });

        return {
            project_id: String(project.id),
            project_name: project.name,
            project_descr: project.description,
            project_type: project.type,
            project_lang: project.language,
            is_owner: true,
            participants: [],
            delete_possible: true,
        };
    }

    public async updateProject(userId: number, updateProjectDto: OwnProjectDto): Promise<OwnProjectDto> {
        this.logger.log(
            `updateProject user=${userId} name=${JSON.stringify(updateProjectDto?.project_name)}`,
        );
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null, isOwner: true },
        });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('Project not found for user');
        }

        const nextName = updateProjectDto.project_name?.trim();
        if (!nextName) {
            throw new Error('Project name is required');
        }

        await project.update({
            name: nextName,
            description: updateProjectDto.project_descr,
            type: updateProjectDto.project_type,
            language: updateProjectDto.project_lang,
        });
        await project.reload();
        this.logger.log(`updateProject saved name=${JSON.stringify(project.name)}`);

        const registeredCoParticipants = await this.countRegisteredCoParticipants(project.id);

        return {
            project_id: String(project.id),
            project_name: project.name,
            project_descr: project.description,
            project_type: project.type,
            project_lang: project.language,
            is_owner: true,
            participants: await this.buildParticipants(project.id, userId),
            delete_possible: registeredCoParticipants === 0,
        };
    }

    public async deleteProject(userId: number): Promise<void> {
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null, isOwner: true },
        });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('Project not found for user');
        }

        const registeredCoParticipants = await this.countRegisteredCoParticipants(project.id);
        if (registeredCoParticipants > 0) {
            throw new Error('Cannot delete project with associated vouchers');
        }

        const deletedAt = new Date();
        const transaction = await this.sequelize.transaction();

        try {
            const [membershipsUpdated] = await this.userProjectModel.update(
                { deletedAt },
                {
                    where: {
                        projectId: project.id,
                        deletedAt: null,
                    },
                    transaction,
                },
            );

            const [projectUpdated] = await this.projectModel.update(
                { deletedAt },
                {
                    where: { id: project.id, deletedAt: null },
                    transaction,
                },
            );

            if (membershipsUpdated < 1 || projectUpdated < 1) {
                throw new Error('Project delete failed');
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw new Error('Project delete failed');
        }
    }

    public async generateVoucher(userId: number): Promise<VoucherCreatedDto> {
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null, isOwner: true },
        });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const existingVouchers = await this.userProjectModel.count({
            where: {
                projectId: userProject.projectId,
                deletedAt: null,
                isOwner: false,
                voucherGuid: { [Op.ne]: null },
            },
        });

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('Project not found for user');
        }
        if (existingVouchers >= project.maxVoucher) {
            throw new Error('Maximum number of vouchers reached');
        }

        const voucherGuid = randomUUID();
        await this.userProjectModel.create({
            userId: null,
            projectId: userProject.projectId,
            eventId: project.eventId,
            isOwner: false,
            voucherGuid,
        });

        return { project_code: voucherGuid };
    }

    public async deleteUnusedVoucher(userId: number, voucherGuid: string): Promise<void> {
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null, isOwner: true },
        });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('Project not found for user');
        }

        const voucher = await this.userProjectModel.findOne({
            where: {
                projectId: userProject.projectId,
                deletedAt: null,
                isOwner: false,
                voucherGuid,
                userId: null,
            },
        });
        if (!voucher) {
            throw new Error('Voucher not found');
        }

        voucher.deletedAt = new Date();
        await voucher.save();
    }

    public async changeProjectOwner(userId: number, newOwnerId: number): Promise<void> {
        const userProject = await this.userProjectModel.findOne({
            where: { userId, deletedAt: null, isOwner: true },
        });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const project = await userProject.getProject();
        if (!this.isActiveProject(project)) {
            throw new Error('Project not found for user');
        }

        const newOwnerProject = await this.userProjectModel.findOne({
            where: {
                userId: newOwnerId,
                deletedAt: null,
                projectId: userProject.projectId,
                isOwner: false,
            },
        });
        if (!newOwnerProject) {
            throw new Error('New owner is not associated with the project');
        }

        const transaction = await this.sequelize.transaction();

        try {
            userProject.isOwner = false;
            await userProject.save({ transaction });

            newOwnerProject.isOwner = true;
            await newOwnerProject.save({ transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw new Error('Owner change failed');
        }
    }

}
