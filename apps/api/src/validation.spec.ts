import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { InfoDto } from './dto/info.dto';
import { LoginMailDto } from './dto/logon-mail.dto';
import { OtherProjectDto } from './dto/other-project.dto';
import { RegistrationDto } from './dto/registration.dto';
import { UserDto } from './dto/user.dto';
import { createValidationPipe } from './validation';

const body = (metatype: ArgumentMetadata['metatype']): ArgumentMetadata => ({
  type: 'body',
  metatype,
});

const validUser = () => ({
  language: 'nl',
  email: 'kid@example.be',
  firstname: 'Jan',
  lastname: 'Peeters',
  sex: 'x',
  gsm: '0470123456',
  general_questions: ['1'],
  mandatory_approvals: [3],
  year: 2014,
  month: 5,
  t_size: 1,
  gsm_guardian: '',
  email_guardian: '',
  via: '',
  via_type: '',
  medical: '',
  address: {
    street: 'Straat',
    house_number: '1',
    municipality_name: 'Brussel',
    box_number: '',
    postalcode: 1000,
  },
});

const validRegistration = () => ({
  user: validUser(),
  project: {
    own_project: {
      project_name: 'Robot',
      project_descr: 'A robot',
      project_type: 'hardware',
      project_lang: 'nl',
    },
  },
});

async function messageFor(
  value: unknown,
  metatype: ArgumentMetadata['metatype'],
) {
  try {
    await createValidationPipe().transform(value, body(metatype));
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return (error as BadRequestException).message;
  }
  throw new Error('expected validation to fail');
}

describe('createValidationPipe', () => {
  const pipe = createValidationPipe();

  it('accepts a valid registration and returns the plain body untouched', async () => {
    const input = validRegistration();
    const result: unknown = await pipe.transform(input, body(RegistrationDto));
    expect(result).toBe(input);
  });

  it('accepts a registration that joins another project by code', async () => {
    const input = {
      user: validUser(),
      project: { other_project: { project_code: 'abc-123' } },
    };
    await expect(pipe.transform(input, body(RegistrationDto))).resolves.toBe(
      input,
    );
  });

  it('accepts the profile the API itself returns for a legacy user', async () => {
    // Mirrors UserinfoService.mapUserToDto for a user without birth month,
    // t-shirt or postal code — the SPA echoes this back on update.
    const input = {
      ...validUser(),
      id: 7,
      delete_possible: true,
      year: 0,
      month: -1,
      t_size: 0,
      address: {
        street: '',
        house_number: '',
        municipality_name: '',
        box_number: '',
        postalcode: 0,
      },
    };
    await expect(pipe.transform(input, body(UserDto))).resolves.toBe(input);
  });

  it('rejects a registration without user or project', async () => {
    const message = await messageFor({}, RegistrationDto);
    expect(message).toMatch(/^Validation: /);
    expect(message).toContain('user:');
    expect(message).toContain('project:');
  });

  it('reports nested field paths', async () => {
    const input = validRegistration();
    input.user.address.postalcode = 'abc' as unknown as number;
    input.user.email = 'not-an-email';
    const message = await messageFor(input, RegistrationDto);
    expect(message).toContain('user.email:');
    expect(message).toContain('user.address.postalcode:');
  });

  it('rejects a non-string email (operator-object injection)', async () => {
    const message = await messageFor({ email: { $ne: '' } }, LoginMailDto);
    expect(message).toContain('email:');
  });

  it('rejects an invalid guardian email but allows an empty one', async () => {
    const bad = { ...validUser(), email_guardian: 'nope' };
    expect(await messageFor(bad, UserDto)).toContain('email_guardian:');
    const empty = { ...validUser(), email_guardian: '' };
    await expect(pipe.transform(empty, body(UserDto))).resolves.toBe(empty);
  });

  it('rejects unknown enum values and malformed question ids', async () => {
    const input = {
      ...validUser(),
      sex: 'q',
      language: 'de',
      mandatory_approvals: [{ id: 1 }],
    };
    const message = await messageFor(input, UserDto);
    expect(message).toContain('sex:');
    expect(message).toContain('language:');
    expect(message).toContain('mandatory_approvals:');
  });

  it('rejects an empty project code', async () => {
    expect(await messageFor({ project_code: '' }, OtherProjectDto)).toContain(
      'project_code:',
    );
  });

  it('lets DTOs without validation decorators pass through', async () => {
    const input = { anything: 'goes' };
    await expect(pipe.transform(input, body(InfoDto))).resolves.toBe(input);
  });
});
