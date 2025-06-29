import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MockInfoInterceptor implements NestInterceptor {
  constructor(
    private readonly eventId: number = 999,
    private readonly language: string = 'en',
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    req.info = {
      currentEvent: this.eventId,
      language: this.language,
    };

    return next.handle();
  }
}
