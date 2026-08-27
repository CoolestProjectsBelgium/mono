import { ExecutionContext, CallHandler } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import {
  UserCookieInterceptor,
  resolveParticipantUserId,
} from './user-cookie.interceptor';
import { TokensService } from './tokens/tokens.service';

function createContext(user: unknown) {
  const response = { cookie: jest.fn(), clearCookie: jest.fn() };
  const request = { user, secure: true, headers: {} };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
  const next: CallHandler = { handle: () => of('payload') };
  return { context, next, response };
}

describe('resolveParticipantUserId', () => {
  it('accepts participant users', () => {
    expect(resolveParticipantUserId({ id: 7 })).toBe(7);
    expect(resolveParticipantUserId({ id: '7' })).toBe(7);
  });

  it('rejects admin sessions and principals without an id', () => {
    expect(
      resolveParticipantUserId({ adminUser: { email: 'admin' }, isAdmin: true }),
    ).toBeNull();
    expect(resolveParticipantUserId({ id: undefined })).toBeNull();
    expect(resolveParticipantUserId(null)).toBeNull();
  });
});

describe('UserCookieInterceptor', () => {
  const tokensService = {
    generateLoginToken: jest.fn(() => 'signed-token'),
  } as unknown as TokensService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes the jwt cookie for participants', async () => {
    const interceptor = new UserCookieInterceptor(tokensService);
    const { context, next, response } = createContext({ id: 42 });

    await lastValueFrom(interceptor.intercept(context, next));

    expect(tokensService.generateLoginToken).toHaveBeenCalledWith(42);
    expect(response.cookie).toHaveBeenCalledWith(
      'jwt',
      'signed-token',
      expect.objectContaining({ httpOnly: true, signed: true }),
    );
  });

  it('leaves the jwt cookie alone for AdminJS sessions', async () => {
    const interceptor = new UserCookieInterceptor(tokensService);
    const { context, next, response } = createContext({
      adminUser: { email: 'admin', eventId: 1 },
      isAdmin: true,
    });

    await lastValueFrom(interceptor.intercept(context, next));

    expect(tokensService.generateLoginToken).not.toHaveBeenCalled();
    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).not.toHaveBeenCalled();
  });
});
