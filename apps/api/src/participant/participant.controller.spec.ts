import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { ParticipantController } from './participant.controller';
import { ParticipantService } from './participant.service';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

describe('ParticipantController', () => {
  let controller: ParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [
        {
          provide: ParticipantService,
          useValue: {
            generateParticipantVoucher: jest.fn(),
            removeParticipant: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt-cookiecombo'))
      .useValue({ canActivate: () => true })
      .overrideInterceptor(UserCookieInterceptor)
      .useValue({ intercept: (_ctx: unknown, next: { handle: () => unknown }) => next.handle() })
      .compile();

    controller = module.get<ParticipantController>(ParticipantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
