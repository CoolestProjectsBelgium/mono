import { Injectable } from '@nestjs/common';
import { EventDto } from '../dto/event.dto';
import { Event } from '@coolestprojects/database';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) { }

  async create(event: EventDto) {
    return await this.eventModel.create({
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
      eventTitle: event.eventTitle,
      maxFileSize: event.maxFileSize,
      allowedFileTypes: event.allowedFileTypes,
    });
  }
}
