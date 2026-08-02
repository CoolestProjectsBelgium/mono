import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '@coolestprojects/database';
import { UserProject } from '@coolestprojects/database';
import { Op } from 'sequelize';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(UserProject)
    private readonly userProjectModel: typeof UserProject,
  ) { }

  public async generateParticipantVoucher(
    userOwnerId: number,
  ): Promise<UserProject> {
    const projectOwnerUser = await this.userProjectModel.findOne({
      where: { user: userOwnerId, owner: true, deletedAt: null },
      attributes: ['projectId'],
    });
    if (!projectOwnerUser) {
      throw new Error('Project via owner not found');
    }

    const project = await this.projectModel.findByPk(projectOwnerUser.projectId);
    if (!project || project.deletedAt != null) {
      throw new Error('Project not found');
    }

    const totalVouchers = await this.userProjectModel.count({
      where: { projectId: project.id, voucherGuid: { [Op.not]: null }, deletedAt: null },
    });
    if (totalVouchers >= project.maxVoucher) {
      throw new Error(
        'Maximum number of participants reached for this project',
      );
    }

    return this.userProjectModel.create({
      eventId: project.eventId,
      projectId: project.id,
      voucherGuid: this.generateUniqueToken(),
    });
  }
  private generateUniqueToken(): string {
    return crypto.randomUUID();
  }
}
