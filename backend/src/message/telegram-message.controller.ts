import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './entities/message.entity';

@ApiTags('telegram-messages')
@Controller({
  path: 'telegram/messages',
  version: '1',
})
export class TelegramMessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать сообщение от Telegram бота (без авторизации)',
  })
  @ApiResponse({
    status: 201,
    description: 'Сообщение успешно создано',
    type: MessageEntity,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Body() createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    return this.messageService.create(createMessageDto);
  }
}
