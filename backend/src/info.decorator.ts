import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Event } from './models/event.model';
import { Op } from 'sequelize';
import { InfoDto } from 'src/dto/info.dto';

export const Info = createParamDecorator(async function (
  data: unknown,
  ctx: ExecutionContext,
) {
  const request = ctx.switchToHttp().getRequest();
  const activeEvent = await Event.findOne({
    where: {
      eventBeginDate: { [Op.lt]: Date.now() },
      eventEndDate: { [Op.gt]: Date.now() },
    },
  });
  const lang = request.acceptsLanguages('fr', 'nl', 'en');
  request.currentEvent = activeEvent ? activeEvent.id : null; //side effect

  return { currentEvent: request.currentEvent, language: lang };
});
