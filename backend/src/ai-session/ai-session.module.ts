import { Module } from '@nestjs/common';
import { AiSessionService } from './ai-session.service';
import { AiSessionController } from './ai-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiSessionEntity } from './entities/ai-session.entity';
import { AiGatewayModule } from 'src/ai-gateway/ai-gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiSessionEntity]), AiGatewayModule],
  controllers: [AiSessionController],
  providers: [AiSessionService],
})
export class AiSessionModule {}
