import { Test, TestingModule } from '@nestjs/testing';
import { AiGatewayService } from './ai-gateway.service';

describe('AiGatewayService', () => {
  let service: AiGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiGatewayService],
    }).compile();

    service = module.get<AiGatewayService>(AiGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
