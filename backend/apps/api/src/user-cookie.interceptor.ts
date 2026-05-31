import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokensService } from './tokens/tokens.service';

@Injectable()
export class UserCookieInterceptor implements NestInterceptor {
  constructor(private readonly tokensService: TokensService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap({
        next: () => {
          const user = request.user;
          if (user) {
            response.cookie(
              'jwt',
              this.tokensService.generateLoginToken(user.id),
              {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
              },
            );
          }
        },
      }),
    );
  }
}
