import { Attachment, Account, EmailTemplate, Event, EventTable, Project, Question, QuestionTranslation, Tshirt, TshirtGroup, TshirtGroupTranslation, TshirtTranslation, User, UserProject, Registration } from '@coolestprojects/database';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Command } from 'nestjs-command';
import { seedDatabase } from '../seeder/seed';

@Injectable()
export class EventCommand {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(TshirtGroup)
    private readonly tshirtGroupModel: typeof TshirtGroup,
    @InjectModel(Question)
    private readonly questionModel: typeof Question,
    @InjectModel(QuestionTranslation)
    private readonly questionTranslationModel: typeof QuestionTranslation,
    @InjectModel(Tshirt)
    private readonly tshirtModel: typeof Tshirt,
    @InjectModel(TshirtGroupTranslation)
    private readonly tshirtGroupTranslationModel: typeof TshirtGroupTranslation,
    @InjectModel(TshirtTranslation)
    private readonly tshirtTranslationModel: typeof TshirtTranslation,
    @InjectModel(EventTable)
    private readonly eventTableModel: typeof EventTable,
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,
    @InjectModel(UserProject)
    private readonly userProjectModel: typeof UserProject,
    @InjectModel(Registration)
    private readonly registrationModel: typeof Registration,
  ) { }

  @Command({
    command: 'event:init',
    describe: 'init db',
  })
  async initEventDB() {
    await seedDatabase(
      this.eventModel,
      this.tshirtGroupModel,
      this.questionModel,
      this.questionTranslationModel,
      this.tshirtModel,
      this.tshirtGroupTranslationModel,
      this.eventTableModel,
      this.emailTemplateModel,
      this.tshirtTranslationModel,
      this.accountModel,
      this.projectModel,
      this.userModel,
      this.attachmentModel,
      this.userProjectModel,
      this.registrationModel
    );
  }
}
