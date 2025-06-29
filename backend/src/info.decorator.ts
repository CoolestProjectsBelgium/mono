import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Event } from './models/event.model';
import { Op } from 'sequelize';
import { InfoDto } from 'src/dto/info.dto';

export const Info = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): InfoDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.info;
  },
);
