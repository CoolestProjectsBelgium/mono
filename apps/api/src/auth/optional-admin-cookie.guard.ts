import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

type CookieRequest = {
  signedCookies?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
};

@Injectable()
export class OptionalAdminCookieGuard extends AuthGuard(
  'optional-admin-cookie',
) {
  handleRequest<TUser>(err: Error | undefined, user: TUser): TUser | null {
    if (err) {
      throw err;
    }
    return user ?? null;
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<CookieRequest>();
    // passport-cookie 401s when the cookie is missing; skip Passport for anonymous users.
    if (!request.signedCookies?.adminjs) {
      return true;
    }
    return super.canActivate(context);
  }
}
