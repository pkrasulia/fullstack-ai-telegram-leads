import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TelegramMessageController } from './telegram-message.controller';
import { MessageEntity } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  controllers: [MessageController, TelegramMessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
