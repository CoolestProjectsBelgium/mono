import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserinfoService } from './userinfo.service';
import { User } from '@coolestprojects/database';

describe('UserinfoService', () => {
  let service: UserinfoService;

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
    municipality_name: 'City',
    street: 'Street',
    house_number: '1',
    box_number: '',
    birthmonth: new Date(2010, 5, 1),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserinfoService,
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn().mockResolvedValue(mockUser),
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
    expect(dto.year).toBe(2010);
    expect(dto.month).toBe(5);
  });
});
