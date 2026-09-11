import {
  baseUrlWithLanguage,
  buildLoginUrl,
  buildMailContext,
  registrationAppUrl,
  resolveMailEvent,
} from './mail-context';
import { Event, Registration, User } from '@coolestprojects/database';

describe('mail-context', () => {
  const base = 'https://registration.coolestprojects.localhost:8443';

  it('baseUrlWithLanguage keeps nl without prefix', () => {
    expect(baseUrlWithLanguage(base, 'nl')).toBe(base);
  });

  it('baseUrlWithLanguage adds language prefix for en and fr', () => {
    expect(baseUrlWithLanguage(base, 'en')).toBe(`${base}/en`);
    expect(baseUrlWithLanguage(base, 'fr')).toBe(`${base}/fr`);
  });

  it('buildLoginUrl includes encoded token', () => {
    const url = buildLoginUrl(base, 'nl', 'abc+token/value');
    expect(url).toBe(
      `${base}/login?token=${encodeURIComponent('abc+token/value')}`,
    );
  });

  it('buildLoginUrl uses locale prefix for non-nl languages', () => {
    expect(buildLoginUrl(base, 'en', 'jwt')).toBe(`${base}/en/login?token=jwt`);
  });

  it('registrationAppUrl falls back to dev default', () => {
    delete process.env.REGISTRATION_URL;
    expect(registrationAppUrl()).toBe(
      'https://registration.coolestprojects.localhost:8443',
    );
  });

  describe('buildMailContext', () => {
    const event = { id: 1, officialStartDate: new Date('2026-06-01') } as Event;

    /** A real `User`/`Registration` instance (via prototype, no DB needed) — `buildMailContext`
     *  tells the two apart with `instanceof`, so a plain object literal won't do here. */
    function fakePerson<T extends User | Registration>(
      Ctor: { prototype: T },
      fields: Record<string, unknown>,
    ): T {
      return Object.assign(Object.create(Ctor.prototype), {
        getEvent: jest.fn().mockResolvedValue(event),
        ...fields,
      });
    }

    const personFields = {
      firstname: 'Jan',
      lastname: 'Janssens',
      email: 'jan@test.be',
      email_guardian: 'ouder@test.be',
      language: 'en',
    };

    const user = fakePerson(User, personFields);
    const registration = fakePerson(Registration, personFields);

    it("resolves the event through the person's own association, not a passed-in model", async () => {
      await buildMailContext({ person: user });

      expect(user.getEvent).toHaveBeenCalled();
    });

    it('nests the person under user or registration depending on its own class', async () => {
      const { context: userContext } = await buildMailContext({ person: user });
      const { context: registrationContext } = await buildMailContext({
        person: registration,
      });

      expect(userContext.user).toEqual(personFields);
      expect(userContext.registration).toBeUndefined();
      expect(registrationContext.registration).toEqual(personFields);
      expect(registrationContext.user).toBeUndefined();
    });

    it('produces the identical shape for a user and a registration', async () => {
      const { context: userContext } = await buildMailContext({
        person: user,
        token: 'abc',
      });
      const { context: registrationContext } = await buildMailContext({
        person: registration,
        token: 'abc',
      });

      expect(Object.keys(userContext.user as object).sort()).toEqual(
        Object.keys(registrationContext.registration as object).sort(),
      );
    });

    it('includes token and locale-aware url only when a token is given', async () => {
      const { context: withToken } = await buildMailContext({
        person: user,
        token: 'abc',
      });
      expect(withToken.token).toBe('abc');
      expect(withToken.url).toBe(`${base}/en/login?token=abc`);

      const { context: withoutToken } = await buildMailContext({
        person: user,
      });
      expect(withoutToken.token).toBeUndefined();
      expect(withoutToken.url).toBeUndefined();
    });

    it('maps project.name to project.title', async () => {
      const { context } = await buildMailContext({
        person: user,
        project: { id: 7, name: 'Robot Dog' },
      });

      expect(context.project).toEqual({ id: 7, title: 'Robot Dog' });
    });

    it('derives year from the event and website from the env default', async () => {
      const { context } = await buildMailContext({ person: user });
      expect(context.year).toBe(2026);
      expect(context.website).toBe('https://coolestprojects.be');
    });
  });

  describe('resolveMailEvent', () => {
    it('looks up the event via the person\'s own association, not a passed-in "active" one', async () => {
      const pastEvent = {
        id: 5,
        officialStartDate: new Date('2024-06-01'),
      } as Event;
      const person = { getEvent: jest.fn().mockResolvedValue(pastEvent) };

      const event = await resolveMailEvent(person);

      expect(person.getEvent).toHaveBeenCalled();
      expect(event).toBe(pastEvent);
    });

    it('throws when the associated event no longer exists', async () => {
      const person = { getEvent: jest.fn().mockResolvedValue(null) };

      await expect(resolveMailEvent(person)).rejects.toThrow('Event not found');
    });
  });
});
