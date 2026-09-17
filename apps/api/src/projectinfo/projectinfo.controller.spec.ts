import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { ProjectinfoController } from './projectinfo.controller';
import { ProjectinfoService } from './projectinfo.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FileValidationInterceptor } from '../file-upload/file-validation.interceptor';
import { TokensService } from '../tokens/tokens.service';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

describe('ProjectinfoController', () => {
  let controller: ProjectinfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectinfoController],
      providers: [
        { provide: ProjectinfoService, useValue: {} },
        { provide: FileUploadService, useValue: {} },
        { provide: TokensService, useValue: {} },
        { provide: ConfigService, useValue: { get: vi.fn() } },
        { provide: getModelToken(User), useValue: {} },
        UserCookieInterceptor,
        FileValidationInterceptor,
      ],
    }).compile();

    controller = module.get<ProjectinfoController>(ProjectinfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
