import { Account, AdminSession } from '@coolestprojects/database';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class AdminAuthenticationService {
  constructor(
    @InjectModel(AdminSession)
    private readonly adminSessionModel: typeof AdminSession,

    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {}

  async validate(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    const session = await this.adminSessionModel.findByPk(token);

    if (!session || session.expires <= new Date()) {
      throw new UnauthorizedException();
    }

    const sessionData = JSON.parse(session.data) as {
      adminUser?: {
        email?: string;
        eventId?: number;
        role?: string;
      };
    };

    const email = sessionData.adminUser?.email;

    if (!email) {
      throw new UnauthorizedException();
    }

    const account = await this.accountModel.findOne({
      where: {
        email,
        account_type: {
          [Op.in]: ['super_admin', 'admin'],
        },
      },
    });

    if (!account) {
      throw new UnauthorizedException();
    }

    return {
      ...sessionData,
      isAdmin: true,
    };
  }
}