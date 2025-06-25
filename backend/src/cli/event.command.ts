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
      this.tshirtTranslationModel,
    );

    //trigger project creation / user
    /*
    const r = await registrationService.create(
      {
        currentEvent: event.id,
        language: 'en',
      },
      {
        user: {
          email: 'test@test.be',
          firstname: 'John',
          lastname: 'Doe',
          address: {
            postalcode: 1000,
            municipality_name: 'Test City',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          language: 'en',
          email_guardian: 'guardian@test.be',
          gsm: '1234567890',
          gsm_guardian: '0987654321',
          general_questions: [],
          mandatory_approvals: [questions[2].id],
          sex: 'x',
          year: 2010,
          month: 5,
          t_size: tshirts[1].id,
          via: '',
          medical: '',
        },
        project: {
          own_project: {
            project_name: 'Test Project',
            project_descr: 'This is a test project',
            project_type: 'test',
            project_lang: 'en',
          },
        },
      },
    );

    const token = tokenService.generateRegistrationToken(r.id);
    const user = await registrationService.activateRegistration(token);
    
    const voucher = await participantService.generateParticipantVoucher(user.id);
    const r1 = await registrationService.create(
      {
        currentEvent: event.id,
        language: 'en',
      },
      {
        user: {
          email: 'test1@test.be',
          firstname: 'John',
          lastname: 'Doe',
          address: {
            postalcode: 1000,
            municipality_name: 'Test City',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          language: 'en',
          email_guardian: 'guardian1@test.be',
          gsm: '1234567890',
          gsm_guardian: '0987654321',
          general_questions: [],
          mandatory_approvals: [questions[2].id],
          sex: 'x',
          year: 2010,
          month: 5,
          t_size: tshirts[2].id,
          via: '',
          medical: '',
        },
        project: {
          other_project: {
            project_code: voucher.voucherGuid,
          },
        },
      },
    );

    const token1 = tokenService.generateRegistrationToken(r1.id);
    await registrationService.activateRegistration(token1);
    */

  }
}
