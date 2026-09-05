import Handlebars from 'handlebars';

export interface PreviewResult {
  subject: string;
  html: string;
  plainText: string;
}

export interface PreviewInput {
  subject: string;
  contentRich: string;
  contentPlain: string;
  guardianEmail: boolean;
  context?: Record<string, unknown>;
}

export function buildDummyContext(guardianEmail: boolean): Record<string, unknown> {
  return {
    year: 2026,
    website: 'https://coolestprojects.be',
    url: 'https://registration.coolestprojects.localhost:8443/login?token=dummy-preview-token',
    token: 'dummy-preview-token',
    registration: {
      firstname: 'Jan',
      email_guardian: guardianEmail,
    },
    user: {
      firstname: 'Jan',
      lastname: 'Janssens',
      email: 'jan@example.be',
    },
    project: {
      id: 42,
      title: 'My Coolest Project',
    },
    event: {
      id: 1,
    },
  };
}

export function renderPreview(input: PreviewInput): PreviewResult {
  const context = input.context ?? buildDummyContext(input.guardianEmail);

  try {
    const subject = Handlebars.compile(input.subject)(context);
    const html = Handlebars.compile(input.contentRich, { noEscape: true })(context);
    const plainText = Handlebars.compile(input.contentPlain)(context);

    return { subject, html, plainText };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Handlebars error: ${message}`);
  }
}
