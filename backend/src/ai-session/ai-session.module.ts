import { Module } from '@nestjs/common';
import { AiSessionService } from './ai-session.service';
import { AiSessionController } from './ai-session.controller';

@Module({
  controllers: [AiSessionController],
  providers: [AiSessionService],
})
export class AiSessionModule {}
