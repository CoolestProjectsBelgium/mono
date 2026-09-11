import { Event, Registration, User } from '@coolestprojects/database';

export function baseUrlWithLanguage(baseUrl: string, language: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  if (language === 'nl') {
    return trimmed;
  }
  return `${trimmed}/${language}`;
}

export function buildLoginUrl(
  baseUrl: string,
  language: string,
  token: string,
): string {
  return `${baseUrlWithLanguage(baseUrl, language)}/login?token=${encodeURIComponent(token)}`;
}

export function buildRegistrationInviteUrl(
  baseUrl: string,
  language: string,
  token: string,
): string {
  return `${baseUrlWithLanguage(baseUrl, language)}/registration?token=${encodeURIComponent(token)}`;
}

export function eventYear(event: Event): number {
  return new Date(event.officialStartDate).getFullYear();
}

/**
 * The one way to resolve which Event a mail belongs to: via the `event`
 * association on the User/Registration itself (`BaseEventModel.getEvent`).
 * Never derive it from "whichever event is currently active" (time-based,
 * or an admin session's selected event) — a person's own event can be over,
 * or not the admin's currently selected one, and they must still be able to
 * receive mail for it (e.g. a login link for a past event).
 */
export async function resolveMailEvent(person: {
  getEvent(): Promise<Event | null>;
}): Promise<Event> {
  const event = await person.getEvent();
  if (!event) {
    throw new Error('Event not found');
  }
  return event;
}

export function registrationAppUrl(): string {
  return (
    process.env.REGISTRATION_URL ||
    'https://registration.coolestprojects.localhost:8443'
  );
}

export function registrationWebsiteUrl(): string {
  return process.env.WEBSITE_URL || 'https://coolestprojects.be';
}

export type MailContextKind = 'user' | 'registration';

export interface MailContextProject {
  id: number;
  name: string;
}

export interface BuildMailContextInput {
  /** Raw Sequelize record — a real `User`/`Registration` row. Never a hand-rolled placeholder.
   *  Its own `event` association is also what the context's Event is resolved from — see `resolveMailEvent`.
   *  Which of `context.user`/`context.registration` it's nested under is recognised from its own
   *  class, via `instanceof` — never passed in separately, so it can't drift from the actual record. */
  person: User | Registration;
  /** Real sends pass a signed JWT here; previews pass PREVIEW_TOKEN. Never generated in this file. */
  token?: string;
  project?: MailContextProject;
}

export interface MailContext {
  event: Event;
  context: Record<string, unknown>;
}

function mailContextKind(person: User | Registration): MailContextKind {
  return person instanceof Registration ? 'registration' : 'user';
}

function projectMailPerson(person: User | Registration) {
  return {
    firstname: person.firstname,
    lastname: person.lastname,
    email: person.email,
    email_guardian: person.email_guardian ?? undefined,
    language: person.language,
  };
}

/**
 * The single context builder used both for real mail sends (MailerService)
 * and for admin template previews (AdminService). Real sends and previews
 * differ only in which `token` and `person` they pass in. Resolves the Event
 * itself (via `resolveMailEvent`, off `person`'s own `event` association) so
 * callers never resolve it separately and risk it drifting from the record
 * they built the context for — the resolved Event is handed back for
 * callers that still need it (e.g. to look up which template to send).
 */
export async function buildMailContext(
  input: BuildMailContextInput,
): Promise<MailContext> {
  const { person, token, project } = input;
  const event = await resolveMailEvent(person);
  const language = person.language ?? 'en';
  const year = eventYear(event);
  const website = registrationWebsiteUrl();
  const url = token
    ? buildLoginUrl(registrationAppUrl(), language, token)
    : undefined;
  const kind = mailContextKind(person);

  return {
    event,
    context: {
      year,
      website,
      ...(token ? { token, url } : {}),
      [kind]: projectMailPerson(person),
      ...(project ? { project: { id: project.id, title: project.name } } : {}),
    },
  };
}

/** Placeholder token used for admin previews — never a real signed JWT. */
export const PREVIEW_TOKEN = 'preview-token';
