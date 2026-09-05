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


export function renderPreview(input: PreviewInput): PreviewResult {
  try {
    const subject = Handlebars.compile(input.subject)(input.context);
    const html = Handlebars.compile(input.contentRich, { noEscape: true })(input.context);
    const plainText = Handlebars.compile(input.contentPlain)(input.context);

    return { subject, html, plainText };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Handlebars error: ${message}`);
  }
}
