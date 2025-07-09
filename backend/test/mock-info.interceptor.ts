import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InfoDto } from '../src/dto/info.dto';

@Injectable()
export class MockInfoInterceptor implements NestInterceptor {
  constructor(private info: InfoDto) {}
  
  setInfo(info: InfoDto) {
    this.info = info;
  }

  setLanguage(language: string) {
    if (this.info) {
      this.info.language = language;
    } 
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    request['info'] = this.info;
    return next.handle();
  }
}
