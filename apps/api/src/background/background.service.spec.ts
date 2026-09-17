import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  Event,
  User,
  Registration,
  Project,
  Attachment,
  EmailLog,
} from '@coolestprojects/database';
import { BackgroundService } from './background.service';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { RegistrationService } from '../registration/registration.service';

describe('BackgroundService', () => {
  let service: BackgroundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackgroundService,
        { provide: getModelToken(Event), useValue: {} },
        { provide: getModelToken(User), useValue: {} },
        { provide: getModelToken(Registration), useValue: {} },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(Attachment), useValue: {} },
        { provide: getModelToken(EmailLog), useValue: {} },
        { provide: MailerService, useValue: {} },
        { provide: ConfigService, useValue: { get: vi.fn() } },
        {
          provide: SchedulerRegistry,
          useValue: { addCronJob: vi.fn(), deleteCronJob: vi.fn() },
        },
        { provide: TokensService, useValue: {} },
        { provide: RegistrationService, useValue: {} },
      ],
    }).compile();

    service = module.get<BackgroundService>(BackgroundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
