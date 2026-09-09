import { ParsedMail } from 'mailparser';

/**
 * Real DSN bounces (RFC 3464 — what Gmail, Outlook/Microsoft 365, and Yahoo
 * all send) embed the original message, or just its headers, as a
 * `message/rfc822`/`text/rfc822-headers` MIME part. mailparser exposes that
 * as an attachment rather than folding it into `mail.text`.
 */
function findOriginalMessageHeaders(mail: ParsedMail): string | null {
  const part = mail.attachments.find(
    (attachment) =>
      attachment.contentType === 'message/rfc822' ||
      attachment.contentType === 'text/rfc822-headers',
  );

  return part ? part.content.toString('utf8') : null;
}

/**
 * A message only counts as a bounce notification if it's shaped like a
 * standards-compliant DSN (carries the `message/delivery-status` part every
 * RFC 3464 report has — Gmail, Outlook/Microsoft 365, and Yahoo all send
 * this) or comes from a conventional bounce sender (`mailer-daemon@`/
 * `postmaster@`, for non-standard bounce generators that skip the full DSN
 * structure). Without this check, any inbox message that happens to thread
 * back to a known Message-ID — a genuine reply, an out-of-office
 * autoresponder — would be misfiled as a bounce.
 */
export function isBounceNotification(mail: ParsedMail): boolean {
  const hasDeliveryStatusPart = mail.attachments.some(
    (attachment) => attachment.contentType === 'message/delivery-status',
  );
  if (hasDeliveryStatusPart) {
    return true;
  }

  const from = mail.from?.value?.[0]?.address?.toLowerCase() ?? '';
  return /^(mailer-daemon|postmaster)@/.test(from);
}

/**
 * Ties a bounce notification back to the `EmailLog` row it's for. Tries, in
 * order:
 * 1. The `In-Reply-To`/`References` threading headers — set by some MTAs
 *    (e.g. Postfix's `enable_threaded_bounces`), but not part of RFC 3464
 *    itself, so not guaranteed for any given provider.
 * 2. The embedded original-message headers — what a standards-compliant DSN
 *    (Gmail, Outlook/Microsoft 365, Yahoo) actually carries.
 * 3. A last-resort regex over the human-readable body text, for bounce
 *    formats that neither thread nor embed the original headers properly.
 */
export function extractBounceIdentifier(mail: ParsedMail): string | null {
  const inReplyTo = mail.inReplyTo;
  if (inReplyTo) {
    return inReplyTo.replace(/[<>]/g, '').trim();
  }

  const references = mail.references;
  if (references) {
    const first = Array.isArray(references) ? references[0] : references;
    if (first) {
      return first.replace(/[<>]/g, '').trim();
    }
  }

  const originalHeaders = findOriginalMessageHeaders(mail);
  if (originalHeaders) {
    const match = originalHeaders.match(/^Message-ID:\s*<?([^>\s]+)>?/im);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  const text = mail.text || '';
  const match = text.match(
    /(?:Original-Message-ID|Message-ID):\s*<?([^>\s]+)>?/i,
  );
  return match?.[1]?.trim() ?? null;
}
