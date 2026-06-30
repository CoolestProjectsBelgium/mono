import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '@coolestprojects/database';
import { Voucher } from '@coolestprojects/database';

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

  public async removeParticipant(
    ownerUserId: number,
    participantUserId: number,
  ): Promise<boolean> {
    const project = await this.projectModel.findOne({
      where: { ownerId: ownerUserId },
    });
    if (!project) {
      return false;
    }

    const voucher = await this.voucherModel.findOne({
      where: { projectId: project.id, participantId: participantUserId },
    });
    if (!voucher) {
      return false;
    }

    await voucher.update({ participantId: null });
    return true;
  }
}
