import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { Template } from 'handlebars';
import * as Handlebars from 'handlebars';
import { EmailTemplate, MailTemplates } from '@coolestprojects/database';
import { createTransport } from 'nodemailer';
import { env } from 'process';
import { Registration } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
import { EmailLog } from '@coolestprojects/database';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { buildMailContext } from './mail-context';

@Injectable()
export class MailerService {
  constructor(
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(EmailLog)
    private readonly emailLogModel: typeof EmailLog,
  ) {}

  private formatRecipients(
    email: string,
    emailGuardian?: string | null,
  ): string {
    return [email, ...(emailGuardian ? [emailGuardian] : [])].join(',');
  }

  private async sendMail(
    template: string,
    language: string,
    event: Event,
    to: string,
    context: Record<string, unknown>,
    link?: User | Registration,
  ) {
    const templateMail = await this.emailTemplateModel.findOne({
      where: { template, language, eventId: event.id },
    });

    if (!templateMail) {
      throw new Error('Email template not found');
    }

    const templateRitch: Template = Handlebars.compile(
      templateMail.contentRich,
      { noEscape: true },
    );
    const templatePlain: Template = Handlebars.compile(
      templateMail.contentPlain,
      { noEscape: true },
    );
    const templateSubject: Template = Handlebars.compile(templateMail.subject);

    const contentRich = templateRitch(context);
    const contentPlain = templatePlain(context);
    const contentSubject = templateSubject(context);

    // Local/dev without SMTP: log and succeed so registration/login flows work
    if (!env.SMTP_HOST) {
      console.warn(
        `[mailer] SMTP_HOST unset — skipping send. to=${to} subject=${contentSubject}` +
          (context?.url ? ` url=${context.url}` : ''),
      );
      return;
    }

    try {
      const transportOptions: SMTPTransport.Options = {
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || '587', 10),
      };
      if (env.SMTP_USER) {
        transportOptions.auth = {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        };
      }

      const result = await createTransport(transportOptions).sendMail({
        from: env.SMTP_FROM,
        to,
        subject: contentSubject,
        text: contentPlain,
        html: contentRich,
      });

      await this.logEmail({
        eventId: event.id,
        template,
        to,
        messageId: result.messageId,
        status: 'sent',
        user: link instanceof User ? link : undefined,
        registration: link instanceof Registration ? link : undefined,
      });

    } catch (error) {
      await this.logEmail({
        eventId: event.id,
        template,
        to,
        messageId: '',
        status: 'failed',
        error: String(error),
        user: link instanceof User ? link : undefined,
        registration: link instanceof Registration ? link : undefined,
      });
      console.error('[mailer] Failed to send "%s" to %s:', template, to, error);
      if (env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async registrationMail(user: Registration, token: string) {
    const { event, context } = await buildMailContext({
      person: user,
      token,
    });

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    await this.sendMail(
      MailTemplates.registration,
      language,
      event,
      to,
      context,
      user
    );
  }

  async waitingListMail(user: Registration) {
    const { event, context } = await buildMailContext({ person: user });

    const language = user.language ?? 'en';
    const to = this.formatRecipients(user.email, user.email_guardian);
    await this.sendMail(MailTemplates.waiting, language, event, to, context, user);
  }

  async welcomeMailOwner(user: User, project: Project, token: string) {
    const { event, context } = await buildMailContext({
      person: user,
      token,
      project: { id: project.id, name: project.name },
    });

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    await this.sendMail(
      MailTemplates.welcomeOwner,
      language,
      event,
      to,
      context,
      user
    );
  }

  async loginMail(user: User, token: string) {
    const { event, context } = await buildMailContext({
      person: user,
      token,
    });

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    await this.sendMail(
      MailTemplates.ask4Token,
      language,
      event,
      to,
      context,
      user
    );
  }

  async welcomeMailCoWorker(user: User, project: Project, token: string) {
    const { event, context } = await buildMailContext({
      person: user,
      token,
      project: { id: project.id, name: project.name },
    });

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    await this.sendMail(
      MailTemplates.welcomeCoWorker,
      language,
      event,
      to,
      context,
      user
    );
  }

  async emailExistsMail(user: User | Registration) {
    const { event, context } = await buildMailContext({ person: user });

    await this.sendMail(
      MailTemplates.emailExists,
      user.language,
      event,
      user.email,
      context,
      user
    );
  }

  /**
   * One combined reminder covering every applicable reason at once (missing
   * project, missing photo, deadline approaching) — never send these as
   * separate mails; `BackgroundService` groups them per user before calling
   * this. `reasons` is merged directly into the context so the template can
   * gate each section with `{{#if noProject}}`/`{{#if noPhoto}}`/
   * `{{#if deadlineApproaching}}`.
   */
  async sendDailyReminderMail(
    user: User,
    reasons: { noProject: boolean; noPhoto: boolean; deadlineApproaching: boolean },
    token: string,
  ) {
    const { event, context } = await buildMailContext({
      person: user,
      token,
    });

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    await this.sendMail(
      MailTemplates.dailyReminder,
      language,
      event,
      to,
      { ...context, ...reasons },
      user
    );
  }

  async sendRegistrationReminderMail(registration: Registration, token: string) {
    const { event, context } = await buildMailContext({
      person: registration,
      token,
    });

    const to = this.formatRecipients(registration.email, registration.email_guardian);
    const language = registration.language ?? 'en';
    await this.sendMail(
      MailTemplates.registrationReminder,
      language,
      event,
      to,
      context,
      registration
    );
  }

  /** Sent to the project owner when a co-worker joins via their voucher. */
  async notifyProjectOwner(owner: User, coworker: User, project: Project, token: string) {
    const { event, context } = await buildMailContext({
      person: owner,
      token,
      project: { id: project.id, name: project.name },
    });

    const to = this.formatRecipients(owner.email, owner.email_guardian);
    const language = owner.language ?? 'en';
    await this.sendMail(
      MailTemplates.notifyNewProjectOwner,
      language,
      event,
      to,
      { ...context, coworker: { firstname: coworker.firstname, lastname: coworker.lastname } },
      owner
    );
  }

  /** Sent to the project owner when a co-worker leaves the project. */
  async notifyProjectOwnerParticipantLeft(
    owner: User,
    formerParticipant: User,
    project: Project,
    token: string,
  ) {
    const { event, context } = await buildMailContext({
      person: owner,
      token,
      project: { id: project.id, name: project.name },
    });

    const to = this.formatRecipients(owner.email, owner.email_guardian);
    const language = owner.language ?? 'en';
    await this.sendMail(
      MailTemplates.notifyProjectParticipantLeft,
      language,
      event,
      to,
      {
        ...context,
        coworker: { firstname: formerParticipant.firstname, lastname: formerParticipant.lastname },
      },
      owner
    );
  }

  /** The last mail a user ever gets from us — sent before their account row is destroyed. */
  async accountDeletedMail(user: User) {
    const { event, context } = await buildMailContext({ person: user });

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    await this.sendMail(MailTemplates.accountDeleted, language, event, to, context, user);
  }

  async deleteMail() {}
  async waitingMail() {}
  async activationMail() {}
  async ask4TokenMail() {}

  private async logEmail(entry: {
    eventId: number
    template: string
    to: string
    messageId: string
    status: 'sent' | 'failed'
    error?: string
    user?: User
    registration?: Registration
  }): Promise<void> {
    const emailLog = this.emailLogModel.build({
      eventId: entry.eventId,
      template: entry.template,
      to: entry.to,
      messageId: entry.messageId,
      status: entry.status,
      error: entry.error,
      userId: entry.user?.id,
      registrationId: entry.registration?.id,
    });
    
    try {
      await emailLog.save();
    }
    catch (logError) {
      console.error('[mailer] Failed to log email:', logError);
    }
  }
}
