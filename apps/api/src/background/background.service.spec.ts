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
import {
  extractBounceIdentifier,
  isBounceNotification,
} from './bounce-detection';

// Records the order of IMAP calls so tests can assert e.g. delete-before-logout.
const calls: string[] = [];
const client = {
  on: vi.fn(),
  connect: vi.fn(async () => {
    calls.push('connect');
  }),
  getMailboxLock: vi.fn(async () => ({
    path: 'INBOX',
    release: vi.fn(() => calls.push('release')),
  })),
  search: vi.fn(),
  fetchAll: vi.fn(),
  messageFlagsAdd: vi.fn(async () => {
    calls.push('seen');
    return true;
  }),
  messageDelete: vi.fn(async (range: number[]) => {
    calls.push(`delete:${range.join(',')}`);
    return true;
  }),
  logout: vi.fn(async () => {
    calls.push('logout');
  }),
  close: vi.fn(),
};

vi.mock('imapflow', () => ({
  ImapFlow: vi.fn(function () {
    return client;
  }),
}));

vi.mock('./bounce-detection', () => ({
  isBounceNotification: vi.fn(),
  extractBounceIdentifier: vi.fn(),
}));

const rawMail = (subject: string) =>
  Buffer.from(
    `From: mailer-daemon@example.test\r\nTo: bounces@example.test\r\nSubject: ${subject}\r\n\r\nDelivery failed\r\n`,
  );

describe('BackgroundService', () => {
  let service: BackgroundService;
  const eventFindOne = vi.fn();
  const emailLogFindOne = vi.fn();

  beforeEach(async () => {
    calls.length = 0;
    vi.clearAllMocks();
    eventFindOne.mockResolvedValue({ id: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackgroundService,
        { provide: getModelToken(Event), useValue: { findOne: eventFindOne } },
        { provide: getModelToken(User), useValue: {} },
        { provide: getModelToken(Registration), useValue: {} },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(Attachment), useValue: {} },
        {
          provide: getModelToken(EmailLog),
          useValue: { findOne: emailLogFindOne },
        },
        { provide: MailerService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
            getOrThrow: vi.fn((key: string) =>
              key === 'mailing.imap_port' ? 993 : `value-of-${key}`,
            ),
          },
        },
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

  describe('handleBounce', () => {
    it('marks a matched bounce as bounced and deletes it before logging out', async () => {
      client.search.mockResolvedValue([7]);
      client.fetchAll.mockResolvedValue([
        { seq: 1, uid: 7, source: rawMail('Undeliverable') },
      ]);
      vi.mocked(isBounceNotification).mockReturnValue(true);
      vi.mocked(extractBounceIdentifier).mockReturnValue(
        '<msg-7@example.test>',
      );
      const mailLog = { status: 'sent', error: null, save: vi.fn() };
      emailLogFindOne.mockResolvedValue(mailLog);

      await service.handleBounce();

      expect(client.search).toHaveBeenCalledWith(
        { seen: false },
        { uid: true },
      );
      expect(client.messageFlagsAdd).toHaveBeenCalledWith([7], ['\\Seen'], {
        uid: true,
      });
      expect(emailLogFindOne).toHaveBeenCalledWith({
        where: { messageId: '<msg-7@example.test>' },
      });
      expect(mailLog.status).toBe('bounced');
      expect(mailLog.error).toContain('Delivery failed');
      expect(mailLog.save).toHaveBeenCalled();
      expect(client.messageDelete).toHaveBeenCalledWith([7], { uid: true });
      expect(calls).toEqual([
        'connect',
        'seen',
        'delete:7',
        'release',
        'logout',
      ]);
    });

    it('keeps non-bounce mail (marked seen, not deleted)', async () => {
      client.search.mockResolvedValue([3]);
      client.fetchAll.mockResolvedValue([
        { seq: 1, uid: 3, source: rawMail('Hello') },
      ]);
      vi.mocked(isBounceNotification).mockReturnValue(false);

      await service.handleBounce();

      expect(client.messageFlagsAdd).toHaveBeenCalledWith([3], ['\\Seen'], {
        uid: true,
      });
      expect(emailLogFindOne).not.toHaveBeenCalled();
      expect(client.messageDelete).not.toHaveBeenCalled();
      expect(client.logout).toHaveBeenCalled();
    });

    it('does not delete a bounce that is not in the email log', async () => {
      client.search.mockResolvedValue([4]);
      client.fetchAll.mockResolvedValue([
        { seq: 1, uid: 4, source: rawMail('Undeliverable') },
      ]);
      vi.mocked(isBounceNotification).mockReturnValue(true);
      vi.mocked(extractBounceIdentifier).mockReturnValue(
        '<unknown@example.test>',
      );
      emailLogFindOne.mockResolvedValue(null);

      await service.handleBounce();

      expect(client.messageDelete).not.toHaveBeenCalled();
    });

    it('skips fetching when there is no unseen mail', async () => {
      client.search.mockResolvedValue([]);

      await service.handleBounce();

      expect(client.fetchAll).not.toHaveBeenCalled();
      expect(client.messageFlagsAdd).not.toHaveBeenCalled();
      expect(calls).toEqual(['connect', 'release', 'logout']);
    });

    it('does not touch the mailbox without an active event', async () => {
      eventFindOne.mockResolvedValue(null);

      await service.handleBounce();

      expect(client.connect).not.toHaveBeenCalled();
    });

    it('logs and swallows a connection failure', async () => {
      client.connect.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(service.handleBounce()).resolves.toBeUndefined();
      expect(client.search).not.toHaveBeenCalled();
    });
  });
});
