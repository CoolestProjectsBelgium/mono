import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { MailerService } from '../mailer/mailer.service';
import { Attachment } from '@coolestprojects/database';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { EmailLog, MailTemplates } from '@coolestprojects/database';
import {
  extractBounceIdentifier,
  isBounceNotification,
} from './bounce-detection';
import {
  deriveReminderReasons,
  hasAnyReminderReason,
} from './reminder-reasons';
import { TokensService } from '../tokens/tokens.service';
import { RegistrationService } from '../registration/registration.service';

/** An unseen INBOX message; `delete()` is only valid while its connection is open. */
interface BounceMessage {
  parsed: ParsedMail;
  delete: () => Promise<void>;
}

@Injectable()
export class BackgroundService implements OnModuleInit {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Registration)
    private readonly registrationModel: typeof Registration,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    private readonly mailerService: MailerService,
    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,
    private configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectModel(EmailLog)
    private readonly emaillogModel: typeof EmailLog,
    private readonly tokensService: TokensService,
    private readonly registrationService: RegistrationService,
  ) {}

  private readonly logger = new Logger(BackgroundService.name);

  onModuleInit() {
    const cronBounce = this.configService.get<string>('cron.bounce');
    const cronMailing = this.configService.get<string>('cron.mail');

    if (cronMailing) {
      const mailingJob = new CronJob(cronMailing, () => {
        void this.handleMailing();
      });

      this.schedulerRegistry.addCronJob('mailing-job', mailingJob);
      mailingJob.start();

      this.logger.debug('mail cron started');
    }

    if (cronBounce) {
      const bouncingJob = new CronJob(cronBounce, () => {
        void this.handleBounce();
      });

      this.schedulerRegistry.addCronJob('bouncing-job', bouncingJob);
      bouncingJob.start();

      this.logger.debug('bounce cron started');
    }
  }

  async handleBounce() {
    const activeEvent = await this.eventModel.findOne({
      attributes: [
        'id',
        'eventBeginDate',
        'eventEndDate',
        'registrationOpenDate',
        'registrationClosedDate',
        'projectClosedDate',
      ],
      where: {
        eventBeginDate: { [Op.lt]: new Date() },
        eventEndDate: { [Op.gt]: new Date() },
      },
    });

    if (!activeEvent) {
      this.logger.debug('No Active Event bounce is disabled');
      return;
    }

    // check mails for bounce state; messages are handled while the IMAP
    // connection is still open so `delete()` can reach the server
    try {
      await this.withBounceMessages(async (messages) => {
        this.logger.log(`Found ${messages.length} bounce message(s)`);
        await this.processBounceMessages(messages);
      });
    } catch (error) {
      this.logger.error('Failed to check bounce mailbox', error);
    }
  }

  private async processBounceMessages(messages: BounceMessage[]) {
    for (const message of messages) {
      try {
        if (!isBounceNotification(message.parsed)) {
          this.logger.debug('Skipping non-bounce message in bounce mailbox');
          continue;
        }

        const messageId = extractBounceIdentifier(message.parsed);
        const mailMessage = await this.emaillogModel.findOne({
          where: { messageId: messageId },
        });

        if (!mailMessage) {
          this.logger.debug('email not in email log');
          continue;
        }

        mailMessage.status = 'bounced';
        mailMessage.error = message.parsed.text;

        await mailMessage.save();

        // Only delete after DB processing has completed
        await message.delete();
      } catch (error) {
        this.logger.error(`Failed to process bounce message`, error);
      }
    }
  }

  async handleMailing() {
    const activeEvent = await this.eventModel.findOne({
      attributes: [
        'id',
        'eventBeginDate',
        'eventEndDate',
        'registrationOpenDate',
        'registrationClosedDate',
        'projectClosedDate',
      ],
      where: {
        eventBeginDate: { [Op.lt]: new Date() },
        eventEndDate: { [Op.gt]: new Date() },
      },
    });

    if (!activeEvent) {
      this.logger.debug('No Active Event notifications are disabled');
      return;
    }

    try {
      await this.registrationService.promoteWaitingList(activeEvent.id);
    } catch (error) {
      this.logger.error(
        'Failed to promote waiting-list registrations',
        error instanceof Error ? error.stack : String(error),
      );
    }

    // notify every day that the deadline is approaching 7 days before the deadline
    const deadlineApproachingDate = new Date(activeEvent.projectClosedDate);
    deadlineApproachingDate.setDate(deadlineApproachingDate.getDate() - 7);
    const deadlineApproaching =
      new Date() > deadlineApproachingDate &&
      new Date() < activeEvent.projectClosedDate;

    this.logger.debug('Notification project reminders');

    // One query drives noProject/noPhoto together — a user with no active
    // project at all still comes back with an empty `projects` array, so
    // deriveReminderReasons can tell "no project" apart from "project with
    // no photo" (a plain LEFT-JOIN-null check on attachments.id can't).
    const users = await this.userModel.findAll({
      include: [
        {
          model: this.projectModel,
          as: 'projects',
          required: false,
          through: {
            where: {
              eventId: activeEvent.id,
              deletedAt: null,
            },
          },
          include: [
            {
              model: this.attachmentModel,
              as: 'attachments',
              required: false,
            },
          ],
        },
      ],
      where: {
        eventId: activeEvent.id,
      },
    });

    for (const user of users) {
      const reasons = deriveReminderReasons(user, deadlineApproaching);
      if (!hasAnyReminderReason(reasons)) {
        continue;
      }

      if (
        await this.alreadySentToday(MailTemplates.dailyReminder, {
          userId: user.id,
        })
      ) {
        continue;
      }

      const token = this.tokensService.generateLoginToken(user.id);
      await this.mailerService.sendDailyReminderMail(user, reasons, token);
    }

    this.logger.debug('Notification registration reminders');

    const registrations = await this.registrationModel.findAll({
      where: {
        eventId: activeEvent.id,
        // still-waitlisted registrations were never sent an activation link
        // in the first place — reminding them to "activate" makes no sense
        waiting_list: false,
        createdAt: {
          [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      },
    });

    for (const registration of registrations) {
      if (
        await this.alreadySentToday(MailTemplates.registrationReminder, {
          registrationId: registration.id,
        })
      ) {
        continue;
      }

      const token = this.tokensService.generateRegistrationToken(
        registration.id,
      );
      await this.mailerService.sendRegistrationReminderMail(
        registration,
        token,
      );
    }
  }

  /**
   * Caps a reminder template to at most one send per recipient per calendar
   * day, regardless of how often `CRON_JOB_MAIL` fires — `EmailLog` (already
   * written by every real `MailerService` send) is the source of truth,
   * same as bounce detection reuses it rather than tracking state elsewhere.
   */
  private async alreadySentToday(
    template: MailTemplates,
    where: { userId?: number; registrationId?: number },
  ): Promise<boolean> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existing = await this.emaillogModel.findOne({
      where: { template, ...where, createdAt: { [Op.gte]: startOfToday } },
    });

    return existing !== null;
  }

  private createImapClient(): ImapFlow {
    return new ImapFlow({
      host: this.configService.getOrThrow<string>('mailing.imap_host'),
      port: this.configService.getOrThrow<number>('mailing.imap_port'),
      secure: true,
      tls: { rejectUnauthorized: true },
      auth: {
        user: this.configService.getOrThrow<string>('mailing.imap_user'),
        pass: this.configService.getOrThrow<string>('mailing.imap_password'),
      },
      // imapflow logs every command through pino by default
      logger: false,
    });
  }

  /**
   * Hands every unseen INBOX message to `run` while the connection is open,
   * then logs out. Fetched messages are marked \Seen up front (as before
   * with `markSeen`), so non-bounce or unparseable mail is not re-read on
   * every cron run; `delete()` removes a message by UID.
   */
  private async withBounceMessages(
    run: (messages: BounceMessage[]) => Promise<void>,
  ): Promise<void> {
    const client = this.createImapClient();
    // An unhandled 'error' event would crash the process; commands still
    // reject on their own when the connection drops.
    client.on('error', (error: unknown) => {
      this.logger.error('IMAP connection error', error);
    });

    await client.connect();
    try {
      const lock = await client.getMailboxLock('INBOX');
      try {
        const uids = await client.search({ seen: false }, { uid: true });
        if (!uids || uids.length === 0) {
          await run([]);
          return;
        }

        const fetched = await client.fetchAll(
          uids,
          { uid: true, source: true },
          { uid: true },
        );
        await client.messageFlagsAdd(uids, ['\\Seen'], { uid: true });

        const messages: BounceMessage[] = [];
        for (const message of fetched) {
          if (!message.source) {
            continue;
          }
          try {
            const parsed = await simpleParser(message.source);
            const { uid } = message;
            messages.push({
              parsed,
              delete: async () => {
                await client.messageDelete([uid], { uid: true });
              },
            });
          } catch (error) {
            // one bad message shouldn't block the rest
            this.logger.error('Failed to parse email', error);
          }
        }

        await run(messages);
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => client.close());
    }
  }
}
