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
import { ConfigService } from '@nestjs/config';

export { buildAppCookieOptions, buildUserCookieOptions } from './cookie-options';

/**
 * Routes such as `GET /projectinfo/attachments/:id` also accept an AdminJS session
 * cookie. Those principals carry no participant id, so refreshing the `jwt` cookie
 * for them would replace a participant session with a token for no user.
 */
export function resolveParticipantUserId(user: unknown): number | null {
  if (!user || typeof user !== 'object') {
    return null;
  }
  const candidate = user as { id?: unknown; isAdmin?: unknown };
  if (candidate.isAdmin === true) {
    return null;
  }
  const id =
    typeof candidate.id === 'string' ? Number(candidate.id) : candidate.id;
  return typeof id === 'number' && Number.isInteger(id) ? id : null;
}

@Injectable()
export class UserCookieInterceptor implements NestInterceptor {
  constructor(private readonly tokensService: TokensService,
    private readonly config: ConfigService
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap({
        next: () => {
          const user = request.user;
          if (user) {
            clearLegacyJwtCookies(this.config, response, request);
            response.cookie(
              'jwt',
              this.tokensService.generateLoginToken(user.id),
              buildAppCookieOptions(this.config, request),
            );
            const userId = resolveParticipantUserId(request.user);
            if (userId === null) {
              return;
            }
            clearLegacyJwtCookies(this.config, response, request);
            response.cookie(
              'jwt',
              this.tokensService.generateLoginToken(userId),
              buildAppCookieOptions(this.config, request),
            );
          }
        }
      }),
    );
  }
}
