import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AiSessionEntity } from '../ai-session/entities/ai-session.entity';
import { MessageEntity } from '../message/entities/message.entity';

@ApiBearerAuth()
@Roles(RoleEnum.admin, RoleEnum.service)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Chat')
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Создать новую сессию чата' })
  @ApiResponse({
    status: 201,
    description: 'Сессия успешно создана',
    type: AiSessionEntity,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async createSession(@Body() createSessionDto: CreateSessionDto): Promise<AiSessionEntity> {
    try {
      return await this.chatService.createSession(createSessionDto);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Ошибка при создании сессии',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Получить сессию по ID' })
  @ApiParam({ name: 'sessionId', description: 'ID сессии' })
  @ApiResponse({
    status: 200,
    description: 'Сессия найдена',
    type: AiSessionEntity,
  })
  @ApiResponse({ status: 404, description: 'Сессия не найдена' })
  async getSession(@Param('sessionId') sessionId: string): Promise<AiSessionEntity> {
    return this.chatService.getSession(sessionId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Получить все сессии пользователя' })
  @ApiQuery({ name: 'userId', description: 'ID пользователя', required: true })
  @ApiResponse({
    status: 200,
    description: 'Список сессий пользователя',
    type: [AiSessionEntity],
  })
  async getUserSessions(@Query('userId') userId: string): Promise<AiSessionEntity[]> {
    return this.chatService.getUserSessions(userId);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Отправить сообщение в сессию' })
  @ApiResponse({
    status: 201,
    description: 'Сообщение отправлено',
    schema: {
      type: 'object',
      properties: {
        message: { $ref: '#/components/schemas/MessageEntity' },
        aiResponse: {
          type: 'object',
          properties: {
            message: { $ref: '#/components/schemas/MessageEntity' },
            aiResult: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Сессия не найдена' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      return await this.chatService.sendMessage(sendMessageDto);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Ошибка при отправке сообщения',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Получить историю сообщений сессии' })
  @ApiParam({ name: 'sessionId', description: 'ID сессии' })
  @ApiQuery({ name: 'limit', description: 'Количество сообщений', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: 'Смещение', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'История сообщений',
    type: [MessageEntity],
  })
  @ApiResponse({ status: 404, description: 'Сессия не найдена' })
  async getSessionMessages(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<MessageEntity[]> {
    return this.chatService.getSessionMessages(sessionId, limit, offset);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Удалить сессию' })
  @ApiParam({ name: 'sessionId', description: 'ID сессии' })
  @ApiResponse({ status: 200, description: 'Сессия удалена' })
  @ApiResponse({ status: 404, description: 'Сессия не найдена' })
  async deleteSession(@Param('sessionId') sessionId: string): Promise<{ message: string }> {
    await this.chatService.deleteSession(sessionId);
    return { message: 'Сессия успешно удалена' };
  }
}
