import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class UserCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap({
        next: () => {
          const user = request.user;
          if (user) {
            response.cookie('user_id', user.id, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });
          }
        },
      }),
    );
  }
}
