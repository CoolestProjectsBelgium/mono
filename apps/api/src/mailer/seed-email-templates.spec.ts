import { buildSeedEmailTemplates } from './seed-email-templates';

describe('buildSeedEmailTemplates', () => {
  const rows = buildSeedEmailTemplates(1);

  it('returns 24 templates (8 keys × en/nl/fr)', () => {
    expect(rows).toHaveLength(24);
    expect(rows.every((row) => row.eventId === 1)).toBe(true);
  });

  it('includes branded Coolest Projects subjects for key templates', () => {
    const subjects = rows.map((row) => `${row.template}:${row.language}:${row.subject}`);
    expect(subjects).toEqual(
      expect.arrayContaining([
        'registration:en:Coolest Projects {{year}}: Please confirm your registration',
        'ask4Token:en:Coolest Projects {{year}}: Receive a token to login into your project',
        'welcomeOwner:en:Coolest Projects {{year}}: Welcome',
      ]),
    );
  });

  it('includes rich registration copy with personalization variables', () => {
    const registrationEn = rows.find(
      (row) => row.template === 'registration' && row.language === 'en',
    );
    expect(registrationEn).toBeDefined();
    expect(registrationEn!.contentPlain).toContain('{{registration.firstname}}');
    expect(registrationEn!.contentPlain).toContain('{{url}}');
    expect(registrationEn!.contentRich).toContain('{{registration.firstname}}');
    expect(registrationEn!.contentRich).toContain('{{url}}');
  });

  it('gates the daily reminder sections on noProject/noPhoto/deadlineApproaching', () => {
    const dailyReminderEn = rows.find(
      (row) => row.template === 'dailyReminder' && row.language === 'en',
    );
    expect(dailyReminderEn).toBeDefined();
    for (const flag of ['noProject', 'noPhoto', 'deadlineApproaching']) {
      expect(dailyReminderEn!.contentRich).toContain(`{{#if ${flag}}}`);
    }
  });

  it('includes a registration-reminder template with a login/activation link', () => {
    const registrationReminderEn = rows.find(
      (row) => row.template === 'registrationReminder' && row.language === 'en',
    );
    expect(registrationReminderEn).toBeDefined();
    expect(registrationReminderEn!.contentPlain).toContain('{{registration.firstname}}');
    expect(registrationReminderEn!.contentRich).toContain('{{url}}');
  });
});
