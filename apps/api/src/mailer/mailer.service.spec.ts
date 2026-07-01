import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import * as nodemailer from 'nodemailer';
import { MailerService } from './mailer.service';
import { Event, EmailTemplate, Registration, User, Project } from '@coolestprojects/database';

jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue({});
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe('MailerService', () => {
  let service: MailerService;

  const event = {
    id: 1,
    officialStartDate: new Date('2026-06-01'),
  } as Event;

  const registrationTemplate = {
    template: 'registration',
    language: 'nl',
    subject: 'Coolest Projects {{year}}: Bevestig jouw registratie aub',
    contentPlain: 'Link: {{url}}',
    contentRich: '<a href="{{url}}">activatielink</a>',
  };

  const emailTemplateModel = {
    findOne: jest.fn().mockResolvedValue(registrationTemplate),
  };

  const eventModel = {
    findByPk: jest.fn().mockResolvedValue(event),
  };

  const projectModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.REGISTRATION_URL =
      'https://registration.coolestprojects.localhost:8443';
    emailTemplateModel.findOne.mockResolvedValue(registrationTemplate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: getModelToken(Event), useValue: eventModel },
        { provide: getModelToken(EmailTemplate), useValue: emailTemplateModel },
        { provide: getModelToken(Project), useValue: projectModel },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('registrationMail sends login url and Coolest Projects subject', async () => {
    const registration = {
      eventId: 1,
      email: 'kid@test.be',
      email_guardian: 'parent@test.be',
      language: 'nl',
      firstname: 'Jan',
      getDataValue: (key: string) =>
        (registration as unknown as Record<string, unknown>)[key],
    } as unknown as Registration;

    await service.registrationMail(registration, 'jwt-token');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'kid@test.be,parent@test.be',
        subject: expect.stringContaining('Coolest Projects 2026'),
        text: expect.stringContaining(
          'https://registration.coolestprojects.localhost:8443/login?token=jwt-token',
        ),
        html: expect.stringContaining(
          'https://registration.coolestprojects.localhost:8443/login?token=jwt-token',
        ),
      }),
    );
  });

  it.each([
    ['nl', 'https://registration.coolestprojects.localhost:8443/login?token=abc'],
    ['en', 'https://registration.coolestprojects.localhost:8443/en/login?token=abc'],
    ['fr', 'https://registration.coolestprojects.localhost:8443/fr/login?token=abc'],
  ])(
    'registrationMail builds locale-aware url for %s',
    async (language, expectedUrl) => {
      emailTemplateModel.findOne.mockResolvedValue({
        ...registrationTemplate,
        language,
      });

      const registration = {
        eventId: 1,
        email: 'kid@test.be',
        language,
        firstname: 'Test',
        getDataValue: (key: string) =>
          (registration as unknown as Record<string, unknown>)[key],
      } as unknown as Registration;

      await service.registrationMail(registration, 'abc');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(expectedUrl),
        }),
      );
    },
  );

  it('loginMail uses ask4Token template', async () => {
    emailTemplateModel.findOne.mockResolvedValue({
      template: 'ask4Token',
      language: 'en',
      subject: 'Coolest Projects {{year}}: Login',
      contentPlain: '{{url}}',
      contentRich: '{{url}}',
    });

    const user = {
      eventId: 1,
      email: 'user@test.be',
      language: 'en',
      firstname: 'Jane',
      getDataValue: (key: string) =>
        (user as unknown as Record<string, unknown>)[key],
    } as unknown as User;

    await service.loginMail(user, 'login-jwt');

    expect(emailTemplateModel.findOne).toHaveBeenCalledWith({
      where: { template: 'ask4Token', language: 'en', eventId: 1 },
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('/en/login?token=login-jwt'),
      }),
    );
  });

  it('welcomeMailOwner uses welcomeOwner template with project context', async () => {
    emailTemplateModel.findOne.mockResolvedValue({
      template: 'welcomeOwner',
      language: 'en',
      subject: 'Coolest Projects {{year}}: Welcome',
      contentPlain: '{{project.title}} {{url}}',
      contentRich: '{{project.title}}',
    });

    const user = {
      eventId: 1,
      email: 'owner@test.be',
      language: 'en',
      firstname: 'Owner',
      getDataValue: (key: string) =>
        (user as unknown as Record<string, unknown>)[key],
    } as unknown as User;

    const project = {
      id: 42,
      name: 'My Project',
    } as Project;

    await service.welcomeMailOwner(user, project, 'welcome-jwt');

    expect(emailTemplateModel.findOne).toHaveBeenCalledWith({
      where: { template: 'welcomeOwner', language: 'en', eventId: 1 },
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('My Project'),
      }),
    );
  });

  it('waitingListMail uses waiting template', async () => {
    emailTemplateModel.findOne.mockResolvedValue({
      template: 'waiting',
      language: 'en',
      subject: 'Coolest Projects {{year}}: Waiting',
      contentPlain: '{{registration.firstname}}',
      contentRich: '{{registration.firstname}}',
    });

    const registration = {
      eventId: 1,
      email: 'wait@test.be',
      language: 'en',
      firstname: 'Waiting',
      getDataValue: (key: string) =>
        (registration as unknown as Record<string, unknown>)[key],
    } as unknown as Registration;

    await service.waitingListMail(registration);

    expect(emailTemplateModel.findOne).toHaveBeenCalledWith({
      where: { template: 'waiting', language: 'en', eventId: 1 },
    });
  });

  it('welcomeMailCoWorker uses welcomeCoWorker template with project context', async () => {
    emailTemplateModel.findOne.mockResolvedValue({
      template: 'welcomeCoWorker',
      language: 'en',
      subject: 'Coolest Projects {{year}}: Welcome',
      contentPlain: '{{project.title}} {{url}}',
      contentRich: '{{project.title}}',
    });

    const user = {
      eventId: 1,
      email: 'coworker@test.be',
      language: 'en',
      firstname: 'Co',
      getDataValue: (key: string) =>
        (user as unknown as Record<string, unknown>)[key],
    } as unknown as User;

    const project = {
      id: 7,
      name: 'Team Project',
    } as Project;

    await service.welcomeMailCoWorker(user, project, 'coworker-jwt');

    expect(emailTemplateModel.findOne).toHaveBeenCalledWith({
      where: { template: 'welcomeCoWorker', language: 'en', eventId: 1 },
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('Team Project'),
      }),
    );
  });

  it('emailExistsMail sends to duplicate registrant', async () => {
    emailTemplateModel.findOne.mockResolvedValue({
      template: 'emailExists',
      language: 'en',
      subject: 'Coolest Projects {{year}}: Exists',
      contentPlain: 'exists',
      contentRich: 'exists',
    });

    await service.emailExistsMail(
      {
        email: 'dup@test.be',
        language: 'en',
      } as Parameters<MailerService['emailExistsMail']>[0],
      1,
    );

    expect(emailTemplateModel.findOne).toHaveBeenCalledWith({
      where: { template: 'emailExists', language: 'en', eventId: 1 },
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'dup@test.be' }),
    );
  });
});
