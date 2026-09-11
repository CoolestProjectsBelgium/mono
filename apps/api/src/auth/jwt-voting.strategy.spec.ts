import { UnauthorizedException } from '@nestjs/common';
import { JwtVotingStrategy } from './jwt-voting.strategy';

describe('JwtVotingStrategy', () => {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('voting-secret'),
  };
  const accountModel = { findOne: jest.fn() };
  const strategy = new JwtVotingStrategy(
    configService as never,
    accountModel as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('re-validates the account against the DB and returns the payload on success', async () => {
    accountModel.findOne.mockResolvedValue({ id: 5, account_type: 'jury' });
    const payload = { id: 5, email: 'jury@example.be', eventId: 1 };

    const result = await strategy.validate(payload);

    expect(accountModel.findOne).toHaveBeenCalledWith({
      where: { id: 5, account_type: 'jury' },
    });
    expect(result).toEqual(payload);
  });

  it('rejects when the account has been deleted since the token was issued', async () => {
    accountModel.findOne.mockResolvedValue(null);

    await expect(
      strategy.validate({ id: 5, email: 'jury@example.be', eventId: 1 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when the account is no longer a jury account', async () => {
    accountModel.findOne.mockResolvedValue(null); // findOne itself is scoped by account_type in the query

    await expect(
      strategy.validate({ id: 5, email: 'promoted@example.be', eventId: 1 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(accountModel.findOne).toHaveBeenCalledWith({
      where: { id: 5, account_type: 'jury' },
    });
  });
});
