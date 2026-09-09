import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { EmailLog, MailTemplates } from '@coolestprojects/database';
import { extractBounceIdentifier, isBounceNotification } from './bounce-detection';
import { deriveReminderReasons, hasAnyReminderReason } from './reminder-reasons';
import { TokensService } from '../tokens/tokens.service';


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
  ) { }

  private readonly logger = new Logger(BackgroundService.name);

  onModuleInit() {
    const cronBounce = this.configService.get('cron.bounce');
    const cronMailing = this.configService.get('cron.mail');

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

    // check mails for bounce state
    try {
      const messages = await this.getBounceMessages();

      this.logger.log(
        `Found ${messages.length} bounce message(s)`,
      );

      for (const message of messages) {
        try {
          if (!isBounceNotification(message.parsed)) {
            this.logger.debug('Skipping non-bounce message in bounce mailbox');
            continue;
          }

          const messageId = extractBounceIdentifier(message.parsed);
          const mailMessage = await this.emaillogModel.findOne({ where: { "messageId": messageId } })

          if (!mailMessage) {
            this.logger.debug("email not in email log")
            continue;
          }

          mailMessage.status = 'bounced';
          mailMessage.error = message.parsed.text

          await mailMessage.save()

          // Only delete after DB processing has completed
          await message.delete();

        } catch (error) {
          this.logger.error(
            `Failed to process bounce message`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to check bounce mailbox',
        error,
      );
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

    // notify every day that the deadline is approaching 7 days before the deadline
    const deadlineApproachingDate = new Date(activeEvent.projectClosedDate);
    deadlineApproachingDate.setDate(deadlineApproachingDate.getDate() - 7);
    const deadlineApproaching =
      new Date() > deadlineApproachingDate && new Date() < activeEvent.projectClosedDate;

    this.logger.debug('Notification project reminders');

    // One query drives noProject/noPhoto together — a user with no active
    // project at all still comes back with an empty `projects` array, so
    // deriveReminderReasons can tell "no project" apart from "project with
    // no photo" (a plain LEFT-JOIN-null check on attachments.id can't).
    const users = await this.userModel.findAll({
      include: [{
        model: this.projectModel,
        as: 'projects',
        required: false,
        through: {
          where: {
            eventId: activeEvent.id,
            deletedAt: null,
          },
        },
        include: [{
          model: this.attachmentModel,
          as: 'attachments',
          required: false,
        }],
      }],
      where: {
        eventId: activeEvent.id,
      },
    });

    for (const user of users) {
      const reasons = deriveReminderReasons(user, deadlineApproaching);
      if (!hasAnyReminderReason(reasons)) {
        continue;
      }

      if (await this.alreadySentToday(MailTemplates.dailyReminder, { userId: user.id })) {
        continue;
      }

      const token = this.tokensService.generateLoginToken(user.id);
      await this.mailerService.sendDailyReminderMail(user, reasons, token);
    }

    this.logger.debug('Notification registration reminders');

    const registrations = await this.registrationModel.findAll({
      where: {
        eventId: activeEvent.id,
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

      const token = this.tokensService.generateRegistrationToken(registration.id);
      await this.mailerService.sendRegistrationReminderMail(registration, token);
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

  private deleteMessage(
    imap: Imap,
    seqno: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      imap.addFlags(seqno, '\\Deleted', (err) => {
        if (err) {
          reject(err);
          return;
        }

        imap.expunge((err) => (err ? reject(err) : resolve()));
      });
    });
  }

  /** Connects and resolves once the connection is ready to open a mailbox. */
  private connectImap(): Promise<Imap> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: this.configService.getOrThrow<string>('mailing.imap_user'),
        password: this.configService.getOrThrow<string>('mailing.imap_password'),
        host: this.configService.getOrThrow<string>('mailing.imap_host'),
        port: this.configService.getOrThrow<number>('mailing.imap_port'),
        tls: true,
        tlsOptions: { rejectUnauthorized: true },
      });

      imap.once('ready', () => resolve(imap));
      imap.once('error', reject);
      imap.connect();
    });
  }

  private openInbox(imap: Imap): Promise<void> {
    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', false, (err) => (err ? reject(err) : resolve()));
    });
  }

  private searchUnseenMessages(imap: Imap): Promise<number[]> {
    return new Promise((resolve, reject) => {
      imap.search(['UNSEEN'], (err, uids) => (err ? reject(err) : resolve(uids)));
    });
  }

  /**
   * Runs `run` against a freshly connected IMAP client, always closing the
   * connection afterwards. Races `run` against the connection's own `error`
   * event so a drop mid-fetch (which would otherwise leave `run` awaiting a
   * response that never arrives) rejects instead of hanging the cron job.
   */
  private async withImapConnection<T>(
    run: (imap: Imap) => Promise<T>,
  ): Promise<T> {
    const imap = await this.connectImap();

    try {
      return await new Promise<T>((resolve, reject) => {
        imap.once('error', reject);
        run(imap).then(resolve, reject);
      });
    } finally {
      imap.end();
    }
  }

  /** Buffers a fetched message's raw body until the stream ends. */
  private readMessageBody(msg: Imap.ImapMessage): Promise<string> {
    return new Promise((resolve) => {
      let buffer = '';

      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          buffer += chunk.toString();
        });
        stream.once('end', () => resolve(buffer));
      });
    });
  }

  /**
   * Fetches and parses every given UID. A message that fails to parse is
   * logged and dropped rather than failing the whole batch — one bad
   * message shouldn't block the rest.
   */
  private fetchAndParseMessages(
    imap: Imap,
    uids: number[],
  ): Promise<Array<{ parsed: ParsedMail; delete: () => Promise<void> }>> {
    return new Promise((resolve, reject) => {
      const fetch = imap.fetch(uids, { bodies: '', markSeen: true });
      const pending: Array<Promise<{ parsed: ParsedMail; delete: () => Promise<void> } | null>> = [];

      fetch.on('message', (msg, seqno) => {
        pending.push(
          this.readMessageBody(msg)
            .then((buffer) => simpleParser(buffer))
            .then((parsed) => ({
              parsed,
              delete: () => this.deleteMessage(imap, seqno),
            }))
            .catch((error): null => {
              this.logger.error('Failed to parse email', error);
              return null;
            }),
        );
      });

      fetch.once('error', reject);
      fetch.once('end', () => {
        Promise.all(pending).then((results) =>
          resolve(results.filter((message) => message !== null)),
        );
      });
    });
  }

  private getBounceMessages(): Promise<
    Array<{
      parsed: ParsedMail;
      delete: () => Promise<void>;
    }>
  > {
    return this.withImapConnection(async (imap) => {
      await this.openInbox(imap);
      const uids = await this.searchUnseenMessages(imap);
      return uids.length ? this.fetchAndParseMessages(imap, uids) : [];
    });
  }

}
