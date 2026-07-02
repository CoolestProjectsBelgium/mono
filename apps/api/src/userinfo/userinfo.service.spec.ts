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
    municipality_name: 'Bruxelles',
    street: 'Street',
    house_number: '1',
    box_number: '',
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
  });

  it('reads scalar fields via getDataValue when direct access is empty', async () => {
    const sequelizeStyleUser = {
      id: 2,
      getDataValue: (key: string) => {
        const values: Record<string, unknown> = {
          language: 'nl',
          email: 'seq@example.com',
          firstname: 'Sequelize',
          lastname: 'User',
          sex: 'x',
          gsm: '0470111111',
          tshirtId: 1,
          gsm_guardian: '',
          email_guardian: '',
          via: '',
          medical: '',
          street: 'Main',
          house_number: '2',
          municipality_name: 'Mechelen',
          box_number: '',
          postalcode: 2800,
          birthmonth: new Date(2011, 3, 1),
        };
        return values[key];
      },
      language: undefined,
      email: undefined,
      firstname: undefined,
      lastname: undefined,
      sex: undefined,
      gsm: undefined,
      tshirtId: undefined,
      gsm_guardian: undefined,
      email_guardian: undefined,
      via: undefined,
      medical: undefined,
      street: undefined,
      house_number: undefined,
      municipality_name: undefined,
      box_number: undefined,
      postalcode: undefined,
      birthmonth: undefined,
    } as unknown as User;

    findByPk.mockResolvedValueOnce(sequelizeStyleUser);

    const dto = await service.getUserInfo(2);
    expect(dto.firstname).toBe('Sequelize');
    expect(dto.lastname).toBe('User');
    expect(dto.address.postalcode).toBe(2800);
  });

  it('rejects invalid address on update', async () => {
    await expect(
      service.updateUser(1, {
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
        email_guardian: '',
        via: '',
        medical: '',
        address: {
          postalcode: 2800,
          municipality_name: 'Antwerpen',
          street: '',
          house_number: '',
          box_number: '',
        },
      }),
    ).rejects.toThrow('Postal code and municipality do not match a valid Belgian location.');
  });
});
