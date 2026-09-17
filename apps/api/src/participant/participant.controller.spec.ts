import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantController } from './participant.controller';
import { RegistrationService } from '../registration/registration.service';

describe('ParticipantController', () => {
  let controller: ParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [{ provide: RegistrationService, useValue: {} }],
    }).compile();

    controller = module.get<ParticipantController>(ParticipantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
