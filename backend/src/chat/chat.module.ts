import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiSessionEntity } from '../ai-session/entities/ai-session.entity';
import { MessageEntity } from '../message/entities/message.entity';
import { TelegramMessageEntity } from '../telegram-message/entities/telegram-message.entity';
import { AiSessionService } from '../ai-session/ai-session.service';
import { MessageService } from '../message/message.service';
import { AiGatewayService } from '../ai-gateway/ai-gateway.service';
import { TelegramMessageModule } from '../telegram-message/telegram-message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiSessionEntity,
      MessageEntity,
      TelegramMessageEntity,
    ]),
    TelegramMessageModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, AiSessionService, MessageService, AiGatewayService],
  exports: [ChatService],
})
export class ChatModule {}
