import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { MailerService } from '../mailer/mailer.service';
import { Attachment } from '@coolestprojects/database';

@Injectable()
export class BackgroundService {

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
    private readonly attachmentModel: typeof Attachment

  ) { }


  private readonly logger = new Logger(BackgroundService.name);

  //@Cron('0 12 * * *') // Runs every day at noon
  @Cron('*/1 * * * *') // Runs every 5 minutes
  async handleCron() {

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

    if(!activeEvent){
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
         const users = await this.userModel.findAll({ where: {eventId: activeEvent.id }});
         for (const user of users) {
          await this.mailerService.deadlineApproaching(user);
         }
    }

  }
}
