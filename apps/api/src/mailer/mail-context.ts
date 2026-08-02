import { Event } from '@coolestprojects/database';

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

export function registrationAppUrl(): string {
  return (
    process.env.REGISTRATION_URL ||
    'https://registration.coolestprojects.localhost:8443'
  );
}

export function registrationWebsiteUrl(): string {
  return process.env.WEBSITE_URL || 'https://coolestprojects.be';
}
