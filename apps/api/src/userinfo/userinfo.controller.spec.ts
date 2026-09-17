import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserinfoController } from './userinfo.controller';
import { UserinfoService } from './userinfo.service';
import { TokensService } from '../tokens/tokens.service';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

describe('UserinfoController', () => {
  let controller: UserinfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserinfoController],
      providers: [
        { provide: UserinfoService, useValue: {} },
        { provide: TokensService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        UserCookieInterceptor,
      ],
    }).compile();

    controller = module.get<UserinfoController>(UserinfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
