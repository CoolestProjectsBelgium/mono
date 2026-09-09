import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserinfoService } from './userinfo.service';
import { User } from '@coolestprojects/database';
import { Affiliation } from '@coolestprojects/database';
import { UserDto } from '../dto/user.dto';
import { MailerService } from '../mailer/mailer.service';

describe('UserinfoService', () => {
  let service: UserinfoService;
  let findByPk: jest.Mock;
  let accountDeletedMail: jest.Mock;

  const mockUser = {
    id: 1,
    language: 'nl',
    email: 'test@example.com',
    firstname: 'Test',
    lastname: 'User',
    sex: 'x',
    gsm: '123',
    tshirtId: 2,
    gsm_guardian: '',
    email_guardian: '',
    via: '',
    via_type: null,
    medical: '',
    postalcode: 1000,
    municipality_name: 'Brussel',
    birthmonth: new Date(2010, 5, 1),
    save: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
  } as unknown as User;

  const updatePayload: UserDto = {
    id: 1,
    language: 'nl',
    email: 'test@example.com',
    firstname: 'Test',
    lastname: 'User',
    sex: 'x',
    gsm: '123',
    general_questions: [],
    mandatory_approvals: [],
    year: 2010,
    month: 5,
    t_size: 2,
    gsm_guardian: '',
    email_guardian: '  ',
    via: '',
    via_type: '',
    medical: '',
    delete_possible: true,
    address: {
      street: '',
      house_number: '',
      municipality_name: 'Brussel',
      box_number: '',
      postalcode: 1000,
    },
  };

  beforeEach(async () => {
    Object.assign(mockUser, {
      via: '',
      via_type: null,
      email_guardian: '',
      email: 'test@example.com',
    });
    findByPk = jest.fn().mockResolvedValue(mockUser);
    accountDeletedMail = jest.fn().mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserinfoService,
        {
          provide: getModelToken(User),
          useValue: {
            findByPk,
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Affiliation),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: { accountDeletedMail },
        },
      ],
    }).compile();

    service = module.get<UserinfoService>(UserinfoService);
  });

  it('maps user to dto', async () => {
    const dto = await service.getUserInfo(1);
    expect(dto.email).toBe('test@example.com');
    expect(dto.firstname).toBe('Test');
    expect(dto.lastname).toBe('User');
    expect(dto.year).toBe(2010);
    expect(dto.month).toBe(5);
    expect(dto.t_size).toBe(2);
    expect(dto.address.postalcode).toBe(1000);
    expect(dto.address.municipality_name).toBe('Brussel');
  });

  it('maps affiliation to dto', async () => {
    Object.assign(mockUser, { via: 'Dojo Balen', via_type: 'dojo' });
    const dto = await service.getUserInfo(1);
    expect(dto.via).toBe('Dojo Balen');
    expect(dto.via_type).toBe('dojo');
  });

  it('clears affiliation on update when type is omitted', async () => {
    await service.updateUser(1, { ...updatePayload });

    expect(mockUser.email_guardian).toBeNull();
    expect(mockUser.via).toBe('');
    expect(mockUser.via_type).toBeNull();
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('keeps the stored email when the payload tries to change it', async () => {
    const dto = await service.updateUser(1, {
      ...updatePayload,
      email: 'attacker@example.com',
    });

    expect(mockUser.email).toBe('test@example.com');
    expect(dto.email).toBe('test@example.com');
  });

  it('strips spaces from gsm fields on update', async () => {
    await service.updateUser(1, {
      ...updatePayload,
      gsm: '0470 12 34 56',
      gsm_guardian: '+32 470 12 34 56',
    });

    expect(mockUser.gsm).toBe('0470123456');
    expect(mockUser.gsm_guardian).toBe('+32470123456');
  });

  describe('deleteUser', () => {
    it('sends the farewell mail before destroying the account', async () => {
      const calls: string[] = [];
      accountDeletedMail.mockImplementation(async () => {
        calls.push('mail');
      });
      (mockUser.destroy as jest.Mock).mockImplementation(async () => {
        calls.push('destroy');
      });

      await service.deleteUser(1);

      expect(accountDeletedMail).toHaveBeenCalledWith(mockUser);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(calls).toEqual(['mail', 'destroy']);
    });

    it('still destroys the account when the farewell mail fails to send', async () => {
      accountDeletedMail.mockRejectedValueOnce(new Error('SMTP down'));

      await service.deleteUser(1);

      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });
});
