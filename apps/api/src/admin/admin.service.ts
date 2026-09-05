import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '@coolestprojects/database';
import { UserProject } from '@coolestprojects/database';
import { Op } from 'sequelize';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(UserProject)
    private readonly userProjectModel: typeof UserProject,
  ) { }

  public async getMailContext(
    eventId: number,
    id: number,
    mailTemplate: string,
  ): Promise<any> {
    // TODO extract the mail context from mailer class and return it here
  }

  public async getListContext(
    eventId: number,
  ): Promise<any> {
    // TODO list mail context for the given eventId
  }
}
