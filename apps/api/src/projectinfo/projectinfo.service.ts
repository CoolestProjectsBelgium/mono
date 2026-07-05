import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '@coolestprojects/database';
import { ProjectDto } from '../dto/project.dto';
import { Voucher } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { generateSignature } from '../auth/file-sign.strategy';

@Injectable()
export class ProjectinfoService {

    public constructor(
        @InjectModel(Project) private readonly projectModel: typeof Project,
        @InjectModel(Voucher) private readonly voucherModel: typeof Voucher
    ) { }

    private getAttachmentUrl(filepath: string): string {
        const expirationTime = new Date(Date.now() + parseInt(process.env.FILE_SIGNATURE_EXPIRATION || '300') * 1000);
        return process.env.ATTACHMENT_BASE_URL + '/' + filepath + '?sig=' + generateSignature(process.env.FILE_SIGN_SECRET!, filepath, expirationTime) + '&exp=' + expirationTime.getTime();
    }

    public async getProjectInfo(userId: number): Promise<ProjectDto> {
        let project: Project | null | undefined;
        let isOwner = true;
        // First, try to find the project where the user is the owner
        project = await this.projectModel.findOne({ where: { ownerId: userId } });
        if (!project) {
            // If not found, check if the user is a participant
            project = await (await this.voucherModel.findOne({
                where: { participantId: userId },
            }))?.getProject();

            if (!project) {
                throw new Error('Project not found for user');
            }
            isOwner = false;
        }

        const participants = await project.getParticipants();
        for (const participant of participants) {
            if (participant.id === userId) {
            }
        }

        const attachments = await project.getAttachments();

        //TODO check if we dont want a different DTO
        return {
            own_project: {
                project_id: project.id,
                project_name: project.name,
                project_descr: project.description,
                project_type: project.type,
                project_lang: project.language,
                attachments: attachments.map((attachment) => ({
                    id: attachment.id,
                    name: attachment.name,
                    filename: attachment.filepath,
                    size: attachment.size,
                    confirmed: attachment.confirmed,
                    exists: true,
                    url: this.getAttachmentUrl(attachment.filepath),
                })),
            }
        }
    }

    public async createProject(userId: number, createProjectDto: ProjectDto): Promise<ProjectDto> {
        // Check if the user already has a project
        const existingProject = await this.projectModel.findOne({ where: { ownerId: userId } });
        if (existingProject) {
            throw new Error('User already has a project');
        }
        if (createProjectDto.own_project == null) {
            throw new Error("Project Creation Failed");
        }
        const project = await this.projectModel.create({
            name: createProjectDto.own_project.project_name,
            description: createProjectDto.own_project.project_descr,
            type: createProjectDto.own_project.project_type,
            language: createProjectDto.own_project.project_lang,
            ownerId: userId,
        });
        return {
            own_project: {
                project_id: project.id,
                project_name: project.name,
                project_descr: project.description,
                project_type: project.type,
                project_lang: project.language,
            }
        };
    }
    public async updateProject(userId: number, updateProjectDto: ProjectDto): Promise<ProjectDto> {
        const project = await this.projectModel.findOne({ where: { ownerId: userId } });
        if (!project) {
            throw new Error('Project not found for user');
        }
        if (!updateProjectDto.own_project) {
            throw new Error('Data not provided');
        }
        project.name = updateProjectDto.own_project.project_name;
        project.description = updateProjectDto.own_project.project_descr;
        project.type = updateProjectDto.own_project.project_type;
        project.language = updateProjectDto.own_project.project_lang;
        await project.save();
        return {
            own_project: {
                project_id: project.id,
                project_name: project.name,
                project_descr: project.description,
                project_type: project.type,
                project_lang: project.language,
            }
        };
    }

    public async deleteProject(userId: number): Promise<void> {
        const project = await this.projectModel.findOne({ where: { ownerId: userId } });
        if (!project) {
            throw new Error('Project not found for user');
        }

        // Check if there are any vouchers associated with the project
        const vouchersInUse = await this.voucherModel.count({ where: { projectId: project.id, participantId: { [Op.ne]: null } } });
        if (vouchersInUse > 0) {
            throw new Error('Cannot delete project with associated vouchers');
        }

        //TODO delete all attachments associated with the project

        await project.destroy();
    }
}
