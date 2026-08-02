import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserinfoService } from './userinfo.service';
import { User } from '@coolestprojects/database';

describe('UserinfoService', () => {
  let service: UserinfoService;
  let findByPk: jest.Mock;

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
    medical: '',
    postalcode: 1000,
    municipality_name: 'Brussel',
    birthmonth: new Date(2010, 5, 1),
    save: jest.fn().mockResolvedValue(undefined),
  } as unknown as User;

  beforeEach(async () => {
    findByPk = jest.fn().mockResolvedValue(mockUser);
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

  it('stores null for empty guardian email on update', async () => {
    await service.updateUser(1, {
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
      medical: '',
      delete_possible: true,
      address: {
        street: '',
        house_number: '',
        municipality_name: 'Brussel',
        box_number: '',
        postalcode: 1000,
      },
    });

    expect(mockUser.email_guardian).toBeNull();
    expect(mockUser.save).toHaveBeenCalled();
  });
});
