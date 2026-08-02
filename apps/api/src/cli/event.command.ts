import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Event } from '@coolestprojects/database';
import { Tshirt } from '@coolestprojects/database';
import { TshirtGroup } from '@coolestprojects/database';
import { TshirtGroupTranslation } from '@coolestprojects/database';
import { TshirtTranslation } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { QuestionTranslation } from '@coolestprojects/database';
import { EventTable } from '@coolestprojects/database';
import { EmailTemplate } from '@coolestprojects/database';
import { InjectModel } from '@nestjs/sequelize';
import { seedDatabase } from '../seeder/seed';
import { Account } from '@coolestprojects/database';

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
    );
  }
}
