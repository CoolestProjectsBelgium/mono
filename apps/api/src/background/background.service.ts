import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BackgroundService {
  private readonly logger = new Logger(BackgroundService.name);

  @Cron('0 0 * * *')
  handleCron() {
    this.logger.debug('Once a day');
    //TODO -> send reminders for missing project
    //TODO -> send reminders for activation
    //TODO -> deadline reminders
  }
}
