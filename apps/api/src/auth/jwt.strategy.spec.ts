import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const userModel = { findByPk: vi.fn() };
  const registrationService = { activateRegistration: vi.fn() };
  const configService = {
    getOrThrow: vi.fn().mockReturnValue('test-secret'),
  } as unknown as ConfigService;

  const strategy = new JwtStrategy(
    userModel as never,
    registrationService as never,
    configService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('activates the registration and returns the resulting user for a registrationID payload', async () => {
    const user = { id: 7 };
    registrationService.activateRegistration.mockResolvedValue(user);

    const result = await strategy.validate({ registrationID: 42 });

    expect(registrationService.activateRegistration).toHaveBeenCalledWith(42);
    expect(result).toBe(user);
  });

  it('looks up the user for a userID payload', async () => {
    const user = { id: 7 };
    userModel.findByPk.mockResolvedValue(user);

    const result = await strategy.validate({ userID: 7 });

    expect(userModel.findByPk).toHaveBeenCalledWith(7);
    expect(result).toBe(user);
  });

  it('rejects when neither lookup resolves a user', async () => {
    userModel.findByPk.mockResolvedValue(null);

    await expect(strategy.validate({ userID: 999 })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an empty payload', async () => {
    await expect(strategy.validate({})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(userModel.findByPk).not.toHaveBeenCalled();
    expect(registrationService.activateRegistration).not.toHaveBeenCalled();
  });
});
