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
import { EmailLog } from '@coolestprojects/database';


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
          const messageId = this.extractIdentifier(message.parsed);
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

    // TODO setup logic that we group the mails and not send multiple ones a day

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

    this.logger.debug('Notification missing project reminder');

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
      }],
      where: {
        '$projects.id$': null,
        eventId: activeEvent.id,
      },
    });

    for (const user of users) {
      await this.mailerService.warningNoProject(user);
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
      await this.mailerService.notifyRegistrationActivation(registration);
    }

    this.logger.debug('Notification attachment reminders');

    const noAttachmentUsers = await this.userModel.findAll({
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
        '$projects.attachments.id$': null,
      },
    });

    for (const user of noAttachmentUsers) {
      await this.mailerService.warningNoPhoto(user);
    }

    // notify every day that the deadline is approaching 7 days before the deadline
    const deadlineApproachingDate = new Date(activeEvent.projectClosedDate);
    deadlineApproachingDate.setDate(deadlineApproachingDate.getDate() - 7);

    if (new Date() > deadlineApproachingDate && new Date() < activeEvent.projectClosedDate) {
      const users = await this.userModel.findAll({ where: { eventId: activeEvent.id } });
      for (const user of users) {
        await this.mailerService.deadlineApproaching(user);
      }
    }

  }

  private extractIdentifier(
    mail: ParsedMail,
  ): string | null {
    // Check headers first
    const inReplyTo = mail.inReplyTo;

    if (inReplyTo) {
      return inReplyTo.replace(/[<>]/g, '').trim();
    }

    const references = mail.references;

    if (references?.length) {
      return references[0]
        .replace(/[<>]/g, '')
        .trim();
    }

    const text = mail.text || '';

    const match = text.match(
      /(?:Original-Message-ID|Message-ID):\s*<?([^>\s]+)>?/i,
    );

    return match?.[1]?.trim() ?? null
  }

  private deleteMessage(
    imap: Imap,
    seqno: number,
  ): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        imap.addFlags(
          seqno,
          '\\Deleted',
          (err) => {
            if (err) {
              reject(err);
              return;
            }

            imap.expunge(
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve();
              },
            );
          },
        );
      },
    );
  }

  private getBounceMessages(): Promise<
    Array<{
      parsed: ParsedMail;
      delete: () => Promise<void>;
    }>
  > {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: this.configService.getOrThrow<string>(
          'mailing.imap_user',
        ),

        password: this.configService.getOrThrow<string>(
          'mailing.imap_password',
        ),

        host: this.configService.getOrThrow<string>(
          'mailing.host',
        ),

        port: this.configService.getOrThrow<number>(
          'mailing.imap_port',
        ),

        tls: true,

        tlsOptions: {
          rejectUnauthorized: true,
        },
      });

      const messages: Array<{
        parsed: ParsedMail;
        delete: () => Promise<void>;
      }> = [];

      imap.once('ready', () => {
        imap.openBox(
          'INBOX',
          false,
          (err) => {
            if (err) {
              imap.end();
              reject(err);
              return;
            }

            // Get unread emails
            imap.search(
              ['UNSEEN'],
              (err, uids) => {
                if (err) {
                  imap.end();
                  reject(err);
                  return;
                }

                if (!uids.length) {
                  imap.end();
                  resolve([]);
                  return;
                }

                const fetch = imap.fetch(
                  uids,
                  {
                    bodies: '',
                    markSeen: true,
                  },
                );

                fetch.on(
                  'message',
                  (msg, seqno) => {
                    let buffer = '';

                    msg.on(
                      'body',
                      (stream) => {
                        stream.on(
                          'data',
                          (chunk) => {
                            buffer += chunk.toString();
                          },
                        );

                        stream.once(
                          'end',
                          async () => {
                            try {
                              const parsed =
                                await simpleParser(
                                  buffer,
                                );

                              messages.push({
                                parsed,

                                delete: () =>
                                  this.deleteMessage(
                                    imap,
                                    seqno,
                                  ),
                              });
                            } catch (error) {
                              this.logger.error(
                                'Failed to parse email',
                                error,
                              );
                            }
                          },
                        );
                      },
                    );
                  },
                );

                fetch.once(
                  'error',
                  (error) => {
                    imap.end();
                    reject(error);
                  },
                );

                fetch.once(
                  'end',
                  () => {
                    // Wait for the async mailparser
                    // operations to finish.
                    setTimeout(() => {
                      imap.end();
                      resolve(messages);
                    }, 500);
                  },
                );
              },
            );
          },
        );
      });

      imap.once(
        'error',
        (error) => {
          reject(error);
        },
      );

      imap.connect();
    });
  }

}
