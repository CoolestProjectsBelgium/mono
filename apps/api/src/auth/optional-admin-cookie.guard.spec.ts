import { ExecutionContext } from '@nestjs/common';
import { OptionalAdminCookieGuard } from './optional-admin-cookie.guard';

function mockContext(request: {
  signedCookies?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('OptionalAdminCookieGuard', () => {
  const guard = new OptionalAdminCookieGuard();

  it('allows requests with no adminjs cookie', () => {
    expect(guard.canActivate(mockContext({ signedCookies: {}, cookies: {} }))).toBe(
      true,
    );
  });

  it('allows requests when signedCookies is missing', () => {
    expect(guard.canActivate(mockContext({ cookies: {} }))).toBe(true);
  });

  it('does not treat a null user as unauthorized', () => {
    expect(guard.handleRequest(undefined, null)).toBeNull();
  });

  it('rethrows strategy errors', () => {
    expect(() => guard.handleRequest(new Error('boom'), null)).toThrow('boom');
  });
});
