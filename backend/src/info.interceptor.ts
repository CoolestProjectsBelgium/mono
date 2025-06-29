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
      closed:
        Date.now() < activeEvent.eventBeginDate.getDate() ||
        Date.now() > activeEvent.eventEndDate.getDate(),
      current:
        Date.now() >= activeEvent.eventBeginDate.getDate() &&
        Date.now() <= activeEvent.eventEndDate.getDate(),
      registationClosed:
        Date.now() > activeEvent.registrationClosedDate.getDate(),
      registrationOpen:
        Date.now() < activeEvent.registrationOpenDate.getDate() &&
        activeEvent.registrationClosedDate.getDate() > Date.now(),
      projectClosed: Date.now() > activeEvent.projectClosedDate.getDate(),
    };

    return next.handle();
  }
}
