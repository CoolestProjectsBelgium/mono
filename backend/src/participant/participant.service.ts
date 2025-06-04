import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from 'src/models/project.model';
import { Voucher } from 'src/models/voucher.model';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(Voucher)
    private readonly voucherModel: typeof Voucher,
  ) {}

  public async generateParticipantVoucher(
    userOwnerId: number,
  ): Promise<Voucher> {
    const project = await this.projectModel.findOne({
      where: { ownerId: userOwnerId },
      attributes: ['id', 'eventId', 'maxVoucher'],
    });
    if (!project) {
      throw new Error('Project not found for the given user owner ID');
    }

    const totalVouchers = await this.voucherModel.count({
      where: { projectId: project.id },
    });
    if (totalVouchers >= project.maxVoucher) {
      throw new Error(
        'Maximum number of participants reached for this project',
      );
    }

    return this.voucherModel.create({
      eventId: project.eventId,
      projectId: project.id,
      voucherGuid: this.generateUniqueToken(),
    });
  }
  private generateUniqueToken(): string {
    return crypto.randomUUID();
  }
}
