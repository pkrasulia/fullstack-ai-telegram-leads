import { Test, TestingModule } from '@nestjs/testing';
import { AiSessionService } from './ai-session.service';

describe('AiSessionService', () => {
  let service: AiSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiSessionService],
    }).compile();

    service = module.get<AiSessionService>(AiSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
