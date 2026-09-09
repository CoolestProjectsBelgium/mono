import { UnauthorizedException } from '@nestjs/common';
import { PresentationBasicStrategy } from './presentation-basic.strategy';

describe('PresentationBasicStrategy', () => {
  const accountModel = { findOne: jest.fn() };
  const strategy = new PresentationBasicStrategy(accountModel as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes the lookup to presentation accounts and returns a minimal principal on success', async () => {
    const verifyPassword = jest.fn().mockReturnValue(true);
    accountModel.findOne.mockResolvedValue({ id: 5, email: 'pi@example.be', verifyPassword });

    const result = await strategy.validate('pi@example.be', 'secret');

    expect(accountModel.findOne).toHaveBeenCalledWith({
      where: { email: 'pi@example.be', account_type: 'presentation' },
    });
    expect(verifyPassword).toHaveBeenCalledWith('secret');
    expect(result).toEqual({ id: 5, email: 'pi@example.be' });
  });

  it('rejects when no matching presentation account exists', async () => {
    accountModel.findOne.mockResolvedValue(null);

    await expect(strategy.validate('nobody@example.be', 'secret')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when the password does not verify', async () => {
    accountModel.findOne.mockResolvedValue({
      id: 5,
      email: 'pi@example.be',
      verifyPassword: jest.fn().mockReturnValue(false),
    });

    await expect(strategy.validate('pi@example.be', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('never matches an admin/jury account, even with the right password', async () => {
    accountModel.findOne.mockResolvedValue(null); // findOne itself is scoped by account_type in the query

    await expect(strategy.validate('admin@example.be', 'admin-password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(accountModel.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@example.be', account_type: 'presentation' },
    });
  });
});
