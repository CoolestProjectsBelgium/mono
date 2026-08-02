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
import {
  buildLoginUrl,
  eventYear,
  registrationAppUrl,
  registrationWebsiteUrl,
} from './mail-context';

@Injectable()
export class MailerService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(EmailLog)
    private readonly emailLogModel: typeof EmailLog,
  ) {}

  private buildRegistrationContext(
    registration: Registration,
    event: Event,
    token?: string,
  ) {
    const language = registration.language ?? 'en';
    const year = eventYear(event);
    const website = registrationWebsiteUrl();
    const url = token
      ? buildLoginUrl(registrationAppUrl(), language, token)
      : undefined;

    return {
      event,
      user: registration,
      registration: {
        firstname: registration.firstname,
        email_guardian: registration.email_guardian,
        year,
      },
      year,
      website,
      ...(token ? { token, url } : {}),
    };
  }

  private buildUserMailContext(
    user: User,
    event: Event,
    token: string,
    project?: Project,
  ) {
    const language = user.language ?? 'en';
    const year = eventYear(event);
    const website = registrationWebsiteUrl();
    const url = buildLoginUrl(registrationAppUrl(), language, token);

    return {
      event,
      user,
      year,
      website,
      token,
      url,
      ...(project
        ? {
            project: {
              id: project.id,
              title: project.name,
            },
          }
        : {}),
    };
  }

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

      this.emailLogModel.create({
        template,
        to,
        messageId: result.messageId,
        status: 'sent',
      });

    } catch (error) {
      this.emailLogModel.create({
        template,
        to,
        messageId: '',
        status: 'failed',
        error: String(error),  
      });
      console.error('[mailer] Failed to send "%s" to %s:', template, to, error);
      if (env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async registrationMail(user: Registration, token: string) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    const context = this.buildRegistrationContext(user, event, token);
    await this.sendMail(
      MailTemplates.registration,
      language,
      event,
      to,
      context,
    );
  }

  async waitingListMail(user: Registration) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const language = user.language ?? 'en';
    const to = this.formatRecipients(user.email, user.email_guardian);
    const context = this.buildRegistrationContext(user, event);
    await this.sendMail(MailTemplates.waiting, language, event, to, context);
  }

  async welcomeMailOwner(user: User, project: Project, token: string) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    const context = this.buildUserMailContext(user, event, token, project);
    await this.sendMail(
      MailTemplates.welcomeOwner,
      language,
      event,
      to,
      context,
    );
  }

  async loginMail(user: User, token: string) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    const context = this.buildUserMailContext(user, event, token);
    await this.sendMail(
      MailTemplates.ask4Token,
      language,
      event,
      to,
      context,
    );
  }

  async welcomeMailCoWorker(user: User, project: Project, token: string) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const to = this.formatRecipients(user.email, user.email_guardian);
    const language = user.language ?? 'en';
    const context = this.buildUserMailContext(user, event, token, project);
    await this.sendMail(
      MailTemplates.welcomeCoWorker,
      language,
      event,
      to,
      context,
    );
  }

  async emailExistsMail(user: UserDto, eventId: number) {
    const event = await this.eventModel.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const context = {
      event,
      year: eventYear(event),
      website: registrationWebsiteUrl(),
    };
    await this.sendMail(
      MailTemplates.emailExists,
      user.language,
      event,
      user.email,
      context,
    );
  }

  async deleteMail() {}
  async warningNoProject() {}
  async deadlineApproaching() {}
  async waitingMail() {}
  async activationMail() {}
  async ask4TokenMail() {}
  async notifyProjectOwner() {}
}
