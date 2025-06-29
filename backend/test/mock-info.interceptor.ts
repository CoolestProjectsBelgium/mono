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
  constructor(
    private info: InfoDto,
  ) {
    console.error('MockInfoInterceptor initialized with info:', this.info);
  }
  
  setInfo(info: InfoDto) {
    console.log('updated:', this.info);
    this.info = info;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.error('MockInfoInterceptor called', this.info);
    const request = context.switchToHttp().getRequest();
    request['info'] = this.info;
    return next.handle();
  }
}
