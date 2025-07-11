import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { Template } from 'handlebars';
import * as Handlebars from 'handlebars';
import { EmailTemplate } from '../models/email_template.model';
import { createTransport } from 'nodemailer';
import { env } from 'process';
import { Registration } from '../models/registration.model';
import { Event } from '../models/event.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';

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
  ) {}

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
      port: env.SMTP_PORT,
      //secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    }).sendMail({
      from: env.SMTP_FROM,
      to,
      subject: contentSubject,
      text: contentPlain,
      html: contentRich,
    });
  }

  async registrationMail(user: Registration, token: string) {
    const event = await this.eventModel.findByPk(user.eventId);
    const to = [
      user.email,
      ...(user.email_guardian ? [user.email_guardian] : []),
    ].join(',');
    const context = { event, user, token };
    await this.sendMail(
      MailTemplates.registration,
      user.language,
      event,
      to,
      context,
    );
  }
  async waitingListMail(user: Registration) {
    const event = await this.eventModel.findByPk(user.eventId);
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
    const to = [
      user.email,
      ...(user.email_guardian ? [user.email_guardian] : []),
    ].join(',');
    const context = { event, user };
    await this.sendMail(
      MailTemplates.activation,
      user.language,
      event,
      to,
      context,
    );
  }
  async welcomeMailCoWorker() {}
  async deleteMail() {}
  async warningNoProject() {}
  async deadlineApproaching() {}
  async waitingMail() {}
  async activationMail() {}
  async ask4TokenMail() {}
  async emailExistsMail(user: UserDto) {}
  async notifyProjectOwner() {}
}
