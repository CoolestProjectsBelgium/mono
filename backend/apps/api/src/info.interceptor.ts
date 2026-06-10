import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Observable } from 'rxjs';
import { Op } from 'sequelize';
import { Event } from '@coolestprojects/database';
import { Request } from 'express';
import { InfoDto } from './dto/info.dto';

@Injectable()
export class InfoInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

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

    const info: InfoDto = {
      language: request.acceptsLanguages('fr', 'nl', 'en') || 'en',
      currentEvent: null,
      closed: true,
      current: false,
      registrationOpen: false,
      projectClosed: true,
    };

    if (activeEvent) {
      const eventBeginDate = activeEvent.getDataValue('eventBeginDate') as Date;
      const eventEndDate = activeEvent.getDataValue('eventEndDate') as Date;
      const registrationOpenDate = activeEvent.getDataValue(
        'registrationOpenDate',
      ) as Date;
      const registrationClosedDate = activeEvent.getDataValue(
        'registrationClosedDate',
      ) as Date;
      const projectClosedDate = activeEvent.getDataValue(
        'projectClosedDate',
      ) as Date;
      const now = Date.now();

      info.currentEvent = activeEvent.id;
      info.closed =
        now < eventBeginDate.getTime() || now > eventEndDate.getTime();
      info.current =
        now >= eventBeginDate.getTime() && now <= eventEndDate.getTime();
      info.registrationOpen =
        registrationOpenDate.getTime() < now &&
        registrationClosedDate.getTime() > now;
      info.projectClosed = now > projectClosedDate.getTime();
    }

    request['info'] = info;

    return next.handle();
  }
}
