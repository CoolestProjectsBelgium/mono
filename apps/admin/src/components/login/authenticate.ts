import { sequelize } from '../../database.js';
import { Account } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { verify } from 'otplib';

export const Authenticate = async (
  email: string,
  password: string,
  context: any,
) => {
  const fields = (
    context?.req as unknown as Request & { fields?: Record<string, any> }
  )?.fields;
  const eventId = fields?.event;
  const totpToken = fields?.totpToken;

  // Only admin/super_admin log into AdminJS. jury votes through the voting SPA
  // (separate JWT auth) and presentation accounts use a Basic-auth API strategy.
  const account = (await sequelize.models.Account.findOne({
    where: { email, account_type: { [Op.in]: ['admin', 'super_admin'] } },
  })) as Account | null;

  if (!account || !account.verifyPassword(password)) {
    return null;
  }

  if (account.twoFactorRequired && !account.twoFactorEnabled) {
    throw new Error(
      "Two-factor authentication is required for this account but hasn't been set up yet. Contact a super admin.",
    );
  }

  if (account.twoFactorEnabled) {
    // Invalid/missing code returns the same generic `null` as a wrong
    // password — a distinct message here would turn the login form into a
    // password oracle (an attacker would learn the password was correct the
    // moment the error message changes).
    const isValidTotp =
      totpToken &&
      account.twoFactorSecret &&
      (await verify({ secret: account.twoFactorSecret, token: totpToken }))
        .valid;
    if (!isValidTotp) {
      return null;
    }
  }

  return {
    id: account.id,
    email: account.email,
    eventId,
    role: account.account_type,
  };
};
