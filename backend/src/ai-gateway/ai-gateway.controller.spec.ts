import { Test, TestingModule } from '@nestjs/testing';
import { AiGatewayController } from './ai-gateway.controller';
import { AiGatewayService } from './ai-gateway.service';

describe('AiGatewayController', () => {
  let controller: AiGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiGatewayController],
      providers: [AiGatewayService],
    }).compile();

    controller = module.get<AiGatewayController>(AiGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
