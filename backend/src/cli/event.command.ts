import { Command, Positional, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
//import { RegistrationService } from '../registration/registration.service';
import { EventService } from '../event/event.service';

@Injectable()
export class EventCommand {
  constructor(private readonly eventService: EventService) {}

  @Command({
    command: 'event:create',
    describe: 'create new event',
  })
  async createEvent(
    @Option({
      name: 'azureStorageContainer',
      type: 'string',
      default: 'testcontainer',
    })
    azureStorageContainer: string,
    @Option({
      name: 'minAge',
      type: 'number',
      default: '8',
    })
    minAge: number,
    @Option({
      name: 'maxAge',
      type: 'number',
      default: '8',
    })
    maxAge: number,
    @Option({
      name: 'minGuardianAge',
      type: 'number',
      default: '8',
    })
    minGuardianAge: number,
    @Option({
      name: 'maxRegistration',
      type: 'number',
      default: '8',
    })
    maxRegistration: number,
    @Option({
      name: 'maxVoucher',
      type: 'number',
      default: '8',
    })
    maxVoucher: number,
    @Option({
      name: 'eventBeginDate',
      type: 'string',
      default: new Date(),
    })
    eventBeginDate: string,
    @Option({
      name: 'registrationOpenDate',
      type: 'string',
      default: new Date(),
    })
    registrationOpenDate: string,
    @Option({
      name: 'registrationClosedDate',
      type: 'string',
      default: new Date(),
    })
    registrationClosedDate: string,
    @Option({
      name: 'projectClosedDate',
      type: 'string',
      default: new Date(),
    })
    projectClosedDate: string,
    @Option({
      name: 'officialStartDate',
      type: 'string',
      default: new Date(),
    })
    officialStartDate: string,
    @Option({
      name: 'eventEndDate',
      type: 'string',
      default: new Date(),
    })
    eventEndDate: string,
    @Option({
      name: 'eventEndDate',
      type: 'string',
      default: 'test 123',
    })
    eventTitle: string,
    @Option({
      name: 'maxFileSize',
      type: 'number',
      default: 1,
    })
    maxFileSize: number,
  ) {
    const event = await this.eventService.create({
      azureStorageContainer,
      minAge,
      maxAge,
      minGuardianAge,
      maxRegistration,
      maxVoucher,
      eventBeginDate: new Date(eventBeginDate),
      registrationOpenDate: new Date(registrationOpenDate),
      registrationClosedDate: new Date(registrationClosedDate),
      projectClosedDate: new Date(projectClosedDate),
      officialStartDate: new Date(officialStartDate),
      eventEndDate: new Date(eventEndDate),
      event_title: eventTitle,
      maxFileSize,
    });
    console.log('Event created %d', event.id);
  }

  @Command({
    command: 'event:close',
    describe: 'close event',
  })
  async closeEvent() {
    console.log('Close event');
  }
}
