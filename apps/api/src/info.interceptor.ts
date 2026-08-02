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
      currentEvent: -1,
      closed: true,
      current: false,
      registrationOpen: false,
      projectClosed: true,
    };

    if(!activeEvent)
      throw new Error("No Active Event")

    if (activeEvent) {
      info.currentEvent = activeEvent.id;
      info.closed =
        Date.now() < new Date(activeEvent.eventBeginDate).getTime() ||
        Date.now() > new Date(activeEvent.eventEndDate).getTime();
      info.current =
        Date.now() >= new Date(activeEvent.eventBeginDate).getTime() &&
        Date.now() <= new Date(activeEvent.eventEndDate).getTime();
      info.registrationOpen =
        Date.now() >= new Date(activeEvent.registrationOpenDate).getTime() &&
        Date.now() <= new Date(activeEvent.registrationClosedDate).getTime();
      info.projectClosed =
        Date.now() > new Date(activeEvent.projectClosedDate).getTime();
    }

    (request as any).info = info;

    return next.handle();
  }
}
