import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { generateSecret, generateURI, verify } from 'otplib';
import { toDataURL } from 'qrcode';

// Record action on the Account resource. GET (re)issues a pending secret to
// scan; POST confirms the code the owner just scanned and flips
// twoFactorEnabled on. Reopening the setup screen before confirming simply
// overwrites the pending secret, so an abandoned attempt needs no cleanup.
export const twoFactorSetupHandler: ActionHandler<
  RecordActionResponse
> = async (request, _response, context) => {
  const { record, currentAdmin } = context;
  if (!record) {
    throw new Error('No record found');
  }

  if (request.method === 'post') {
    const code = String(request.payload?.code ?? '').trim();
    const secret = record.get('twoFactorSecret') as string | null;
    const result = secret ? await verify({ secret, token: code }) : null;

    if (!result?.valid) {
      return {
        record: record.toJSON(currentAdmin),
        notice: { message: 'Invalid code. Please try again.', type: 'error' },
      };
    }

    await record.update({ twoFactorEnabled: true }, context);
    return {
      record: record.toJSON(currentAdmin),
      notice: {
        message: 'Two-factor authentication is now enabled.',
        type: 'success',
      },
    };
  }

  const secret = generateSecret();
  await record.update(
    { twoFactorSecret: secret, twoFactorEnabled: false },
    context,
  );
  const uri = generateURI({
    issuer: 'Coolest Projects Admin',
    label: record.get('email') as string,
    secret,
  });

  return {
    record: record.toJSON(currentAdmin),
    secret,
    qrCode: await toDataURL(uri),
  };
};

export const twoFactorDisableHandler: ActionHandler<
  RecordActionResponse
> = async (_request, _response, context) => {
  const { record, currentAdmin } = context;
  if (!record) {
    throw new Error('No record found');
  }

  await record.update(
    { twoFactorSecret: null, twoFactorEnabled: false },
    context,
  );
  return {
    record: record.toJSON(currentAdmin),
    notice: {
      message: 'Two-factor authentication disabled.',
      type: 'success',
    },
  };
};
