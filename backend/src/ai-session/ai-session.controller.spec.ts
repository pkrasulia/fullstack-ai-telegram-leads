import { Test, TestingModule } from '@nestjs/testing';
import { AiSessionController } from './ai-session.controller';
import { AiSessionService } from './ai-session.service';

describe('AiSessionController', () => {
  let controller: AiSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiSessionController],
      providers: [
        {
          provide: AiSessionService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AiSessionController>(AiSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
