import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '@coolestprojects/database';
import { ProjectDto } from '../dto/project.dto';
import { Op } from 'sequelize';
import { UserProject } from '@coolestprojects/database';
import { OwnProjectDto } from '../dto/own-project.dto';
import { AttachmentDto } from '../dto/attachment.dto';
import { createReadStream } from 'node:fs';
import { Attachment } from '@coolestprojects/database';


@Injectable()
export class ProjectinfoService {

    public constructor(
        @InjectModel(Project) private readonly projectModel: typeof Project,
        @InjectModel(UserProject) private readonly userProjectModel: typeof UserProject,
        @InjectModel(Attachment) private readonly attachmentModel: typeof Attachment
    ) { }

    public async getThumbnail(userId: number, attachmentId: number): Promise<StreamableFile> {
        const userProject = await this.userProjectModel.findOne({ where: { user: userId, deletedAt: null } });
        if (!userProject) {
            throw new Error('User is not associated with any project');
        }

        const attachment = await this.attachmentModel.findOne({ where: { id: attachmentId, projectId: userProject.projectId } });

        if (!attachment) {
            throw new Error('Attachment not found');
        }

        const file = createReadStream(attachment.thumbnailPath);
        return new StreamableFile(file);
    }

    private getThumbnailUrl(attachmentId: number): string {
        return process.env.ATTACHMENT_BASE_URL + '/' + attachmentId;
    }

    public async getProjectInfo(userId: number): Promise<OwnProjectDto> {
        const userProject = await this.userProjectModel.findOne({ where: { user: userId } });

        if (!userProject) {
            throw new Error('User is not associated with any project');
        }

        const project = await userProject.getProject();
        const participants = await project.getParticipants();

        return {
            project_id: project.id,
            project_name: project.name,
            project_descr: project.description,
            project_type: project.type,
            project_lang: project.language,
            is_owner : userProject.isOwner,
            participants: participants.map(participant => ({
                id: participant.id,
                name: participant.firstname && ' ' && participant.lastname,
                self: participant.id === userId
            }))
        };
    }

    public async getAttachments(userId: number): Promise<AttachmentDto[]> {
        const userProject = await this.userProjectModel.findOne({ where: { user: userId } });

        if (!userProject) {
            throw new Error('User is not associated with any project');
        }

        const project = await userProject.getProject();
        const attachments = await project.getAttachments();

        return attachments.map(attachment => ({
            id: attachment.id,
            name: attachment.name,
            thumbnailUrl: this.getThumbnailUrl(attachment.id)
        }));
    }

    public async createProject(userId: number, createProjectDto: OwnProjectDto): Promise<OwnProjectDto> {
        // Check if the user already has a project
        const existingProject = await this.userProjectModel.findOne({ where: { userId: userId, deletedAt: null } });
        if (existingProject) {
            throw new Error('User already has a project');
        }

        const project = await this.projectModel.create({
            name: createProjectDto.project_name,
            description: createProjectDto.project_descr,
            type: createProjectDto.project_type,
            language: createProjectDto.project_lang,
            ownerId: userId,
        });
        return {
            project_id: project.id,
            project_name: project.name,
            project_descr: project.description,
            project_type: project.type,
            project_lang: project.language,
            
        };
    }
    public async updateProject(userId: number, updateProjectDto: OwnProjectDto): Promise<OwnProjectDto> {
        const userProject = await this.userProjectModel.findOne({ where: { userId: userId, deletedAt: null, isOwner: true } });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const project = await userProject.getProject();
        project.name = updateProjectDto.project_name;
        project.description = updateProjectDto.project_descr;
        project.type = updateProjectDto.project_type;
        project.language = updateProjectDto.project_lang;
        await project.save();
        return {
            project_id: project.id,
            project_name: project.name,
            project_descr: project.description,
            project_type: project.type,
            project_lang: project.language, 
        };
    }

    public async deleteProject(userId: number): Promise<void> {
        const userProject = await this.userProjectModel.findOne({ where: { userId: userId, deletedAt: null, isOwner: true } });
        if (!userProject) {
            throw new Error('Project not found for user');
        }
    
        // Check if there are any vouchers associated with the project
        const vouchersInUse = await this.userProjectModel.count({ where: { projectId: userProject.projectId, userId: { [Op.ne]: null }, deletedAt: null, isOwner: false, voucherGuid: { [Op.ne]: null } } });
        if (vouchersInUse > 0) {
            throw new Error('Cannot delete project with associated vouchers');
        }

        userProject.deletedAt = new Date();
        await userProject.save();
    }

    public async generateVoucher(userId: number): Promise<void> {
        const userProject = await this.userProjectModel.findOne({ where: { userId: userId, deletedAt: null, isOwner: true } });
        if (!userProject) {
            throw new Error('Project not found for user');
        } 

        const existingVouchers = await this.userProjectModel.count({ where: { projectId: userProject.projectId, deletedAt: null, isOwner: false, voucherGuid: { [Op.ne]: null } } });

        const project = await userProject.getProject();
        if(project.maxVoucher > existingVouchers) {
            throw new Error('Maximum number of vouchers reached');
        }

        await this.userProjectModel.create({
            userId: null,
            projectId: userProject.projectId,
            isOwner: false,
            voucherGuid: crypto.randomUUID(),
        });
    }

    public async deleteUnusedVoucher(userId: number, voucherGuid: string): Promise<void> {
        const userProject = await this.userProjectModel.findOne({ where: { userId: userId, deletedAt: null, isOwner: true } });
        if (!userProject) {
            throw new Error('Project not found for user');
        }

        const voucher = await this.userProjectModel.findOne({ where: { projectId: userProject.projectId, deletedAt: null, isOwner: false, voucherGuid: voucherGuid, userId: null } });
        if (!voucher) {
            throw new Error('Voucher not found');
        }

        await voucher.destroy();
    }

}
