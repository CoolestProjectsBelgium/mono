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
        const vouchersInUse = await this.projectModel.count({ where: { projectId: project.id, participantId: { [Op.ne]: null } } });
        if (vouchersInUse > 0) {
            throw new Error('Cannot delete project with associated vouchers');
        }

        //TODO delete all attachments associated with the project

        await project.destroy();
    }
}
