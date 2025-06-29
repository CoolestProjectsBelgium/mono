import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { InfoDto } from '../src/dto/info.dto';

export const Info = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): InfoDto => {
    const request = ctx.switchToHttp().getRequest();
    console.log('Info decorator called', Object.keys(request));
    return request.info;
  },
);
