import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiSessionEntity } from '../ai-session/entities/ai-session.entity';
import {
  MessageEntity,
  MessageType,
  MessageDirection,
} from '../message/entities/message.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AiSessionService } from '../ai-session/ai-session.service';
import { MessageService } from '../message/message.service';
import { AiGatewayService } from '../ai-gateway/ai-gateway.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(AiSessionEntity)
    private readonly sessionRepository: Repository<AiSessionEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly aiSessionService: AiSessionService,
    private readonly messageService: MessageService,
    private readonly aiGatewayService: AiGatewayService,
  ) {}

  /**
   * Создать новую сессию чата
   */
  async createSession(
    createSessionDto: CreateSessionDto,
  ): Promise<AiSessionEntity> {
    return this.aiSessionService.create({
      title: createSessionDto.title,
      user_id: createSessionDto.userId,
      user_name: createSessionDto.userName,
    });
  }

  /**
   * Получить сессию по ID
   */
  async getSession(sessionId: string): Promise<AiSessionEntity> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['messages'],
    });

    if (!session) {
      throw new NotFoundException(`Сессия с ID ${sessionId} не найдена`);
    }

    return session;
  }

  /**
   * Получить все сессии пользователя
   */
  async getUserSessions(userId: string): Promise<AiSessionEntity[]> {
    return this.sessionRepository.find({
      where: { userId },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Отправить сообщение в сессию
   */
  async sendMessage(
    sendMessageDto: SendMessageDto,
  ): Promise<{ message: MessageEntity; aiResponse?: any }> {
    // Проверяем существование сессии
    const session = await this.getSession(sendMessageDto.sessionId);

    // Создаем сообщение пользователя
    const userMessage = await this.messageService.createUniversal({
      text: sendMessageDto.text,
      type: sendMessageDto.type || MessageType.TEXT,
      direction: sendMessageDto.direction || MessageDirection.INCOMING,
      isBot: sendMessageDto.isBot || false,
      metadata: sendMessageDto.metadata,
    });

    // Связываем сообщение с сессией
    userMessage.session = session;
    await this.messageRepository.save(userMessage);

    // Отправляем запрос в AI Gateway для получения ответа
    let aiResponse: { message: MessageEntity; aiResult: any } | null = null;
    try {
      const aiResult = await this.aiGatewayService.create({
        text: sendMessageDto.text,
        userId: session.userId,
        sessionId: session.adkSessionId,
      });

      if (aiResult.success && aiResult.response) {
        // Создаем ответное сообщение от AI
        const aiMessage = await this.messageService.createUniversal({
          text: aiResult.response,
          type: MessageType.TEXT,
          direction: MessageDirection.OUTGOING,
          isBot: true,
        });

        aiMessage.session = session;
        await this.messageRepository.save(aiMessage);

        aiResponse = {
          message: aiMessage,
          aiResult: aiResult,
        };
      }
    } catch (error) {
      console.error('Ошибка при получении ответа от AI:', error);
      // Не прерываем выполнение, просто логируем ошибку
    }

    return {
      message: userMessage,
      aiResponse,
    };
  }

  /**
   * Получить историю сообщений сессии
   */
  async getSessionMessages(
    sessionId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageEntity[]> {
    const session = await this.getSession(sessionId);

    return this.messageRepository.find({
      where: { session: { id: sessionId } },
      order: { messageDate: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Удалить сессию
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    await this.sessionRepository.softDelete(sessionId);
  }
}
