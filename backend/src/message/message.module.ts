import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageEntity } from './entities/message.entity';
import { TelegramMessageEntity } from 'src/telegram-message/entities/telegram-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, TelegramMessageEntity])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
