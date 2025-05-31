import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { Template } from 'handlebars';
import * as Handlebars from 'handlebars';
import { EmailTemplate } from 'src/models/email_template.model';
import { createTransport } from 'nodemailer';
import { env } from 'process';
import { Registration } from 'src/models/registration.model';
import { Event } from 'src/models/event.model';

@Injectable()
export class MailerService {

  async registrationMail(user: Registration, token: string) {
    const templateMail = await EmailTemplate.findOne({
      where: { template: 'registration', language: user.language, eventId: user.eventId },
    });

    if (!templateMail) {
      throw new Error('Email template not found');
    }

    const event = await Event.findByPk(user.eventId);

    const templateRitch: Template = Handlebars.compile(templateMail.contentRich, {noEscape: true});
    const templatePlain: Template = Handlebars.compile(templateMail.contentPlain);
    const templateSubject: Template = Handlebars.compile(templateMail.subject);

    const context = { event, user, token }
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
      to: [user.email, ...(user.email_guardian ? [user.email_guardian] : [])].join(","),
      subject: contentSubject, 
      text: contentPlain, 
      html: contentRich,
    });

  }
  async waitingListMail(user: Registration) {
    throw new Error('Method not implemented.');
  }
  constructor() { }

  async welcomeMailOwner() { }
  async welcomeMailCoWorker() { }
  async deleteMail() { }
  async warningNoProject() { }
  async deadlineApproaching() { }
  async waitingMail() { }
  async activationMail() { }
  async ask4TokenMail() { }
  async emailExistsMail(user: UserDto) { }
}
