import { UnauthorizedException } from '@nestjs/common';
import { Op } from 'sequelize';
import { AdminAuthenticationService } from './adminauth.service';

describe('AdminAuthenticationService', () => {
  const future = () => new Date(Date.now() + 60_000);
  const sessionRow = (data: unknown, expires = future()) => ({
    expires,
    data: typeof data === 'string' ? data : JSON.stringify(data),
  });

  let findSession: ReturnType<typeof vi.fn>;
  let findAccount: ReturnType<typeof vi.fn>;
  let service: AdminAuthenticationService;

  beforeEach(() => {
    findSession = vi.fn();
    findAccount = vi.fn();
    service = new AdminAuthenticationService(
      { findByPk: findSession } as never,
      { findOne: findAccount } as never,
    );
  });

  it('returns the session data flagged as admin for a live admin session', async () => {
    const adminUser = { email: 'admin@example.be', eventId: 4, role: 'admin' };
    findSession.mockResolvedValue(sessionRow({ adminUser }));
    findAccount.mockResolvedValue({ id: 1 });

    await expect(service.validate('sid')).resolves.toEqual({
      adminUser,
      isAdmin: true,
    });
    expect(findSession).toHaveBeenCalledWith('sid');
  });

  it('only accepts admin and super_admin accounts', async () => {
    findSession.mockResolvedValue(
      sessionRow({ adminUser: { email: 'jury@example.be' } }),
    );
    findAccount.mockResolvedValue(null);

    await expect(service.validate('sid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(findAccount).toHaveBeenCalledWith({
      where: {
        email: 'jury@example.be',
        account_type: { [Op.in]: ['super_admin', 'admin'] },
      },
    });
  });

  it('rejects a missing token without touching the database', async () => {
    await expect(service.validate('')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(findSession).not.toHaveBeenCalled();
  });

  it('rejects an unknown session', async () => {
    findSession.mockResolvedValue(null);
    await expect(service.validate('sid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an expired session', async () => {
    findSession.mockResolvedValue(
      sessionRow(
        { adminUser: { email: 'admin@example.be' } },
        new Date(Date.now() - 1000),
      ),
    );
    await expect(service.validate('sid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(findAccount).not.toHaveBeenCalled();
  });

  it.each([
    ['a session without a logged-in admin', {}],
    ['a session whose admin has no email', { adminUser: { eventId: 1 } }],
    ['a corrupt session payload', '{not json'],
    ['a null session payload', 'null'],
  ])('rejects %s', async (_label, data) => {
    findSession.mockResolvedValue(sessionRow(data));
    await expect(service.validate('sid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(findAccount).not.toHaveBeenCalled();
  });
});
