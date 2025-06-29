import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InfoDto } from 'src/dto/info.dto';

@Injectable()
export class MockInfoInterceptor implements NestInterceptor {
  constructor(
    private readonly info: InfoDto = {
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      registrationOpen: true,
      registationClosed: false,
      projectClosed: false,
    }
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    req.info = this.info;
    return next.handle();
  }
}
