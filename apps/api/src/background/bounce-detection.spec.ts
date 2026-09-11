import { ParsedMail } from 'mailparser';
import {
  extractBounceIdentifier,
  isBounceNotification,
} from './bounce-detection';

function fakeMail(overrides: Partial<ParsedMail>): ParsedMail {
  return {
    attachments: [],
    ...overrides,
  } as ParsedMail;
}

function fakeAttachment(
  contentType: string,
  content = '',
): ParsedMail['attachments'][number] {
  return {
    type: 'attachment',
    contentType,
    content: Buffer.from(content, 'utf8'),
  } as ParsedMail['attachments'][number];
}

describe('isBounceNotification', () => {
  it('recognises a standards-compliant DSN by its message/delivery-status part', () => {
    const mail = fakeMail({
      attachments: [
        fakeAttachment('message/delivery-status'),
        fakeAttachment('message/rfc822'),
      ],
      from: {
        value: [{ address: 'someone@example.com', name: '' }],
        html: '',
        text: '',
      },
    });

    expect(isBounceNotification(mail)).toBe(true);
  });

  it('recognises a non-standard bounce by its mailer-daemon/postmaster sender', () => {
    const mail = fakeMail({
      from: {
        value: [{ address: 'MAILER-DAEMON@googlemail.com', name: '' }],
        html: '',
        text: '',
      },
    });

    expect(isBounceNotification(mail)).toBe(true);

    const postmasterMail = fakeMail({
      from: {
        value: [{ address: 'postmaster@outlook.com', name: '' }],
        html: '',
        text: '',
      },
    });

    expect(isBounceNotification(postmasterMail)).toBe(true);
  });

  it('rejects a genuine reply or autoresponder that merely threads back to a known message', () => {
    const mail = fakeMail({
      from: {
        value: [{ address: 'jan@example.be', name: 'Jan' }],
        html: '',
        text: '',
      },
    });

    expect(isBounceNotification(mail)).toBe(false);
  });
});

describe('extractBounceIdentifier', () => {
  it('prefers the In-Reply-To header', () => {
    const mail = fakeMail({
      inReplyTo: '<abc@sender>',
      references: ['<other@sender>'],
    });

    expect(extractBounceIdentifier(mail)).toBe('abc@sender');
  });

  it('falls back to the first References entry when multiple exist', () => {
    const mail = fakeMail({
      references: ['<first@sender>', '<second@sender>'],
    });

    expect(extractBounceIdentifier(mail)).toBe('first@sender');
  });

  it('handles References being a single string, not an array', () => {
    const mail = fakeMail({ references: '<only@sender>' });

    expect(extractBounceIdentifier(mail)).toBe('only@sender');
  });

  it('extracts the Message-ID from an embedded message/rfc822 original-message part (Gmail/Outlook/Yahoo DSN shape)', () => {
    const mail = fakeMail({
      attachments: [
        fakeAttachment(
          'message/rfc822',
          'Return-Path: <noreply@coolestprojects.be>\r\nMessage-ID: <original-send-id@coolestprojects.be>\r\nSubject: Welcome\r\n',
        ),
      ],
      text: 'Your message could not be delivered to the following recipients.',
    });

    expect(extractBounceIdentifier(mail)).toBe(
      'original-send-id@coolestprojects.be',
    );
  });

  it('extracts the Message-ID from a text/rfc822-headers original-message part', () => {
    const mail = fakeMail({
      attachments: [
        fakeAttachment(
          'text/rfc822-headers',
          'Message-ID: <headers-only-id@coolestprojects.be>\r\n',
        ),
      ],
    });

    expect(extractBounceIdentifier(mail)).toBe(
      'headers-only-id@coolestprojects.be',
    );
  });

  it('falls back to a Message-ID/Original-Message-ID mention in the plaintext body', () => {
    const mail = fakeMail({
      text: 'Delivery failed.\n\nOriginal-Message-ID: <plaintext-id@coolestprojects.be>\n',
    });

    expect(extractBounceIdentifier(mail)).toBe(
      'plaintext-id@coolestprojects.be',
    );
  });

  it('returns null when no identifier can be found anywhere', () => {
    const mail = fakeMail({ text: 'This message has nothing to match on.' });

    expect(extractBounceIdentifier(mail)).toBeNull();
  });
});
