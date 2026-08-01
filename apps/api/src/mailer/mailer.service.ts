import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { Template } from 'handlebars';
import * as Handlebars from 'handlebars';
import { EmailTemplate } from '@coolestprojects/database';
import { createTransport } from 'nodemailer';
import { env } from 'process';
import { Registration } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  buildLoginUrl,
  eventYear,
  registrationAppUrl,
  registrationWebsiteUrl,
} from './mail-context';

export enum MailTemplates {
  registration = 'registration',
  waiting = 'waiting',
  welcomeOwner = 'welcomeOwner',
  welcomeCoWorker = 'welcomeCoWorker',
  delete = 'delete',
  warningNoProject = 'warningNoProject',
  deadlineApproaching = 'deadlineApproaching',
  waitingMail = 'waitingMail',
  activation = 'activation',
  ask4Token = 'ask4Token',
  emailExists = 'emailExists',
}

@Injectable()
export class MailerService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(EmailTemplate)
    private readonly emailTemplateModel: typeof EmailTemplate,
  ) { }

  private buildRegistrationContext(
    registration: Registration,
    event: Event,
    token?: string,
  ) {
    const language =
      registration.getDataValue('language') ?? registration.language ?? 'en';
    const year = eventYear(event);
    const website = registrationWebsiteUrl();
    const url = token
      ? buildLoginUrl(registrationAppUrl(), language, token)
      : undefined;

    return {
      event,
      user: registration,
      registration: {
        firstname:
          registration.getDataValue('firstname') ?? registration.firstname,
        email_guardian:
          registration.getDataValue('email_guardian') ??
          registration.email_guardian,
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
  ) {
    const language = user.getDataValue('language') ?? user.language ?? 'en';
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
    context: any,
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
    );
    const templateSubject: Template = Handlebars.compile(templateMail.subject);

    const contentRich = templateRitch(context);
    const contentPlain = templatePlain(context);
    const contentSubject = templateSubject(context);

    await createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587', 10),
      //secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    } as SMTPTransport.Options).sendMail({
      from: env.SMTP_FROM,
      to,
      subject: contentSubject,
      text: contentPlain,
      html: contentRich,
    });
  }

  async registrationMail(user: Registration, token: string) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const email = user.getDataValue('email') ?? user.email;
    const emailGuardian =
      user.getDataValue('email_guardian') ?? user.email_guardian;
    const language = user.getDataValue('language') ?? user.language ?? 'en';
    const to = this.formatRecipients(email, emailGuardian);
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

    const to = [
      user.email,
      ...(user.email_guardian ? [user.email_guardian] : []),
    ].join(',');
    const context = { event, user };
    await this.sendMail(
      MailTemplates.waiting,
      user.language,
      event,
      to,
      context,
    );
  }

  async welcomeMailOwner(user: User) {
    const event = await this.eventModel.findByPk(user.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const to = this.formatRecipients(user.email, user.email_guardian);
    const context = { event, user };
    await this.sendMail(
      MailTemplates.activation,
      user.language,
      event,
      to,
      context,
    );
  }

  async loginMail(user: User, token: string) {
    const eventId = user.getDataValue('eventId') ?? user.eventId;
    const event = await this.eventModel.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const email = user.getDataValue('email') ?? user.email;
    const emailGuardian =
      user.getDataValue('email_guardian') ?? user.email_guardian;
    const language = user.getDataValue('language') ?? user.language ?? 'en';
    const to = this.formatRecipients(email, emailGuardian);
    const context = this.buildUserMailContext(user, event, token);
    await this.sendMail(
      MailTemplates.ask4Token,
      language,
      event,
      to,
      context,
    );
  }
  async welcomeMailCoWorker() { }
  async deleteMail() { }
  async warningNoProject() { }
  async deadlineApproaching() { }
  async waitingMail() { }
  async activationMail() { }
  async ask4TokenMail() { }
  async emailExistsMail(user: UserDto) { }
  async notifyProjectOwner() { }
}
