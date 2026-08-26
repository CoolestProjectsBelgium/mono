import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokensService } from './tokens/tokens.service';
import { buildAppCookieOptions, clearLegacyJwtCookies } from './cookie-options';

export { buildAppCookieOptions, buildUserCookieOptions } from './cookie-options';

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
            clearLegacyJwtCookies(response, request);
            response.cookie(
              'jwt',
              this.tokensService.generateLoginToken(user.id),
              buildAppCookieOptions(request),
            );
          }
        },
      }),
    );
  }
}
