import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { Event } from '../models/event.model';
import { Tshirt } from '../models/tshirt.model';
import { TshirtGroup } from '../models/tshirt_group.model';
import { TshirtGroupTranslation } from '../models/tshirt_group_translation.model';
import { TshirtTranslation } from '../models/tshirt_translation.model';
import { Question } from '../models/question.model';
import { QuestionTranslation } from '../models/question_translation.model';
import { Location } from '../models/location.model';
import { EventTable } from '../models/event_table.model';
import { EmailTemplate } from '../models/email_template.model';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { InjectModel } from '@nestjs/sequelize';
import { ParticipantService } from '../participant/participant.service';
import { seedDatabase } from 'src/seeder/seed';

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
    @InjectModel(Location)
    private readonly locationModel: typeof Location,
    @InjectModel(EventTable)
    private readonly eventTableModel: typeof EventTable,
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
    private readonly registrationService: RegistrationService,
    private readonly participantService: ParticipantService,
    private readonly tokenService: TokensService,
  ) {}

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
      this.locationModel,
      this.eventTableModel,
      this.emailTemplateModel,
      this.tshirtTranslationModel
    )
  }
}
