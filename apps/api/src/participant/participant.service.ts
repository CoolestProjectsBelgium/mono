import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new NotFoundException('Project not found for the given user owner ID');
    }

    const totalVouchers = await this.voucherModel.count({
      where: { projectId: project.id },
    });
    if (totalVouchers >= project.maxVoucher) {
      throw new BadRequestException(
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
    voucherId: number,
  ): Promise<boolean> {
    const project = await this.projectModel.findOne({
      where: { ownerId: ownerUserId },
    });
    if (!project) {
      return false;
    }

    const voucher = await this.voucherModel.findOne({
      where: { projectId: project.id, id: voucherId },
    });
    if (!voucher) {
      return false;
    }

    if (voucher.participantId == null) {
      await voucher.destroy();
    } else {
      await voucher.update({ participantId: null });
    }

    return true;
  }

  public async leaveProject(userId: number): Promise<void> {
    const ownedProject = await this.projectModel.findOne({
      where: { ownerId: userId },
      attributes: ['id'],
    });
    if (ownedProject) {
      throw new ForbiddenException('Project owners cannot leave their project');
    }

    const voucher = await this.voucherModel.findOne({
      where: { participantId: userId },
    });
    if (!voucher) {
      throw new NotFoundException('No project membership found');
    }

    await voucher.update({ participantId: null });
  }
}
