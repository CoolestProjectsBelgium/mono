import { Injectable } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { Event } from '../models/event.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async create(event: EventDto) {
    return await this.eventModel.create({
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
