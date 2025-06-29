import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Observable } from 'rxjs';
import { Op } from 'sequelize';
import { Event } from '../src/models/event.model';
import { Request } from 'express';

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
    const req = context.switchToHttp().getRequest<Request>();

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

    const lang = req.acceptsLanguages('fr', 'nl', 'en') || 'en';

    req['info'] = {
      currentEvent: activeEvent?.id ?? null,
      language: lang,
      closed: activeEvent
        ? Date.now() < new Date(activeEvent.eventBeginDate).getTime() ||
          Date.now() > new Date(activeEvent.eventEndDate).getTime()
        : false,
      current: activeEvent
        ? Date.now() >= new Date(activeEvent.eventBeginDate).getTime() &&
          Date.now() <= new Date(activeEvent.eventEndDate).getTime()
        : false,
      registationClosed: activeEvent
        ? Date.now() > new Date(activeEvent.registrationClosedDate).getTime()
        : false,
      registrationOpen: activeEvent
        ? Date.now() < new Date(activeEvent.registrationOpenDate).getTime() &&
          new Date(activeEvent.registrationClosedDate).getTime() > Date.now()
        : false,
      projectClosed: activeEvent
        ? Date.now() > new Date(activeEvent.projectClosedDate).getTime()
        : false,
    };

    return next.handle();
  }
}
