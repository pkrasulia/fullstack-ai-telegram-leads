import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  MessageEntity,
  MessageType,
  MessageDirection,
} from './entities/message.entity';

@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.service, RoleEnum.user)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('messages')
@Controller({
  path: 'messages',
  version: '1',
})
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новое сообщение' })
  @ApiResponse({
    status: 201,
    description: 'Сообщение успешно создано',
    type: MessageEntity,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Body() createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все сообщения' })
  @ApiQuery({
    name: 'chatId',
    required: false,
    description: 'Фильтр по ID чата',
  })
  @ApiQuery({
    name: 'type',
    enum: MessageType,
    required: false,
    description: 'Фильтр по типу сообщения',
  })
  @ApiQuery({
    name: 'direction',
    enum: MessageDirection,
    required: false,
    description: 'Фильтр по направлению сообщения',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Лимит количества сообщений',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Смещение для пагинации',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Дата начала периода (ISO string)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Дата окончания периода (ISO string)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Поле для сортировки (по умолчанию messageDate)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Порядок сортировки: ASC или DESC (по умолчанию ASC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Список сообщений',
    type: [MessageEntity],
  })
  async findAll(
    @Query('chatId') chatId?: string,
    @Query('type') type?: MessageType,
    @Query('direction') direction?: MessageDirection,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ): Promise<MessageEntity[]> {
    const options: any = {};

    if (chatId) options.chatId = chatId;
    if (type) options.type = type;
    if (direction) options.direction = direction;
    if (limit) options.limit = parseInt(limit.toString());
    if (offset) options.offset = parseInt(offset.toString());
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);
    if (sortBy) options.sortBy = sortBy;
    if (sortOrder) options.sortOrder = sortOrder;

    return this.messageService.findAll(options);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику сообщений' })
  @ApiQuery({
    name: 'chatId',
    required: false,
    description: 'Фильтр по ID чата',
  })
  @ApiResponse({ status: 200, description: 'Статистика сообщений' })
  async getStats(@Query('chatId') chatId?: string) {
    return this.messageService.getMessageStats(chatId);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Получить список чатов с сообщениями' })
  @ApiResponse({ status: 200, description: 'Список чатов' })
  async getChatList() {
    return this.messageService.getChatList();
  }

  @Get('chat/:chatId')
  @ApiOperation({ summary: 'Получить сообщения по ID чата' })
  @ApiParam({ name: 'chatId', description: 'ID чата' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Лимит количества сообщений (по умолчанию 100)',
  })
  @ApiResponse({ status: 200, description: 'Сообщения чата', type: [MessageEntity] })
  async findByChatId(
    @Param('chatId') chatId: string,
    @Query('limit') limit?: number,
  ): Promise<MessageEntity[]> {
    return this.messageService.findByChatId(chatId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сообщение по ID' })
  @ApiParam({ name: 'id', description: 'ID сообщения' })
  @ApiResponse({ status: 200, description: 'Сообщение найдено', type: MessageEntity })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MessageEntity> {
    return this.messageService.findOne(id);
  }

  @Get('telegram/:telegramMessageId/:chatId')
  @ApiOperation({ summary: 'Найти сообщение по Telegram ID и Chat ID' })
  @ApiParam({ name: 'telegramMessageId', description: 'Telegram Message ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Сообщение найдено', type: MessageEntity })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async findByTelegramMessageId(
    @Param('telegramMessageId') telegramMessageId: string,
    @Param('chatId') chatId: string,
  ): Promise<MessageEntity> {
    const message = await this.messageService.findByTelegramMessageId(
      telegramMessageId,
      chatId,
    );
    if (!message) {
      throw new Error(
        `Message with Telegram ID ${telegramMessageId} in chat ${chatId} not found`,
      );
    }
    return message;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить сообщение' })
  @ApiParam({ name: 'id', description: 'ID сообщения' })
  @ApiResponse({
    status: 200,
    description: 'Сообщение обновлено',
    type: MessageEntity,
  })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<MessageEntity> {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить сообщение' })
  @ApiParam({ name: 'id', description: 'ID сообщения' })
  @ApiResponse({ status: 204, description: 'Сообщение удалено' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messageService.remove(id);
  }
}
