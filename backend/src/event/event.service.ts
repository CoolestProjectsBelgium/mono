import { Injectable } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
//import { User } from 'src/models/user.model';
import { Event } from '../models/event.model';

@Injectable()
export class EventService {
  constructor() {}

  async create(event: EventDto) {
    return await Event.create({
      azure_storage_container: event.azureStorageContainer,
      minAge: event.minAge,
      maxAge: event.maxAge,
      minGuardianAge: event.minGuardianAge,
      maxRegistration: event.maxRegistration,
      maxVoucher: event.maxVoucher,
      eventBeginDate: event.eventBeginDate,
      registrationOpenDate: event.registrationOpenDate,
      registrationClosedDate: event.registrationClosedDate,
      projectClosedDate: event.projectClosedDate,
      officialStartDate: event.officialStartDate,
      eventEndDate: event.eventEndDate,
      event_title: event.event_title,
      maxFileSize: event.maxFileSize,
    });
  }
}
