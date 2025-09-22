import { Test, TestingModule } from '@nestjs/testing';
import { AiSessionService } from './ai-session.service';
import { AiGatewayService } from 'src/ai-gateway/ai-gateway.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiSessionEntity } from './entities/ai-session.entity';

describe('AiSessionService', () => {
  let service: AiSessionService;
  let repo: Repository<AiSessionEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiSessionService,
        {
          provide: AiGatewayService,
          useValue: { createAdkSession: jest.fn() },
        },
        {
          provide: getRepositoryToken(AiSessionEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiSessionService>(AiSessionService);
    repo = module.get<Repository<AiSessionEntity>>(
      getRepositoryToken(AiSessionEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
