import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateUniversalMessageDto } from './dto/create-universal-message.dto';
import {
  MessageEntity,
  MessageType,
  MessageDirection,
} from './entities/message.entity';
import { TelegramMessageEntity } from '../telegram-message/entities/telegram-message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(TelegramMessageEntity)
    private readonly telegramMessageRepository: Repository<TelegramMessageEntity>,
  ) {}

  /** Создание универсального сообщения и, при необходимости, данных Telegram */
  async create(createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    let existingMessage: MessageEntity | null = null;

    // Если DTO содержит telegramMessageId, проверяем существование в telegramMessageRepository
    if (createMessageDto.telegramMessageId) {
      const telegramMessage = await this.telegramMessageRepository.findOne({
        where: { telegramMessageId: createMessageDto.telegramMessageId },
        relations: ['message'],
      });
      if (telegramMessage) {
        return telegramMessage.message;
      }
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      messageDate: new Date(createMessageDto.messageDate),
    });

    const savedMessage = await this.messageRepository.save(message);

    // Если есть данные для Telegram, создаём расширение
    if (createMessageDto.telegramMessageId) {
      const telegramMessage = this.telegramMessageRepository.create({
        message: savedMessage,
        telegramMessageId: createMessageDto.telegramMessageId,
        fromUserId: createMessageDto.fromUserId,
        fromUsername: createMessageDto.fromUsername,
        mediaInfo: createMessageDto.mediaInfo,
        replyTo: createMessageDto.replyTo,
        forwardInfo: createMessageDto.forwardInfo,
      });
      await this.telegramMessageRepository.save(telegramMessage);
    }

    return savedMessage;
  }

  /** Получение сообщений с фильтрацией, пагинацией и сортировкой */
  async findAll(options?: {
    type?: MessageType;
    direction?: MessageDirection;
    limit?: number;
    offset?: number;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<MessageEntity[]> {
    const sortBy = options?.sortBy || 'messageDate';
    const sortOrder = options?.sortOrder || 'DESC';

    const findOptions: FindManyOptions<MessageEntity> = {
      order: { [sortBy]: sortOrder },
    };

    if (options?.limit) findOptions.take = options.limit;
    if (options?.offset) findOptions.skip = options.offset;

    const where: any = {};

    if (options?.type) where.type = options.type;
    if (options?.direction) where.direction = options.direction;
    if (options?.dateFrom && options?.dateTo) {
      where.messageDate = Between(options.dateFrom, options.dateTo);
    } else if (options?.dateFrom) {
      where.messageDate = Between(options.dateFrom, new Date());
    }

    if (Object.keys(where).length > 0) findOptions.where = where;

    return await this.messageRepository.find(findOptions);
  }

  async findOne(id: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  /** Обновление сообщения */
  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<MessageEntity> {
    const message = await this.findOne(id);
    Object.assign(message, updateMessageDto);

    if (updateMessageDto.messageDate) {
      message.messageDate = new Date(updateMessageDto.messageDate);
    }

    return await this.messageRepository.save(message);
  }

  /** Удаление сообщения */
  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  /** Получение статистики сообщений */
  async getMessageStats(): Promise<{
    totalMessages: number;
    messagesByType: Record<MessageType, number>;
    messagesByDirection: Record<MessageDirection, number>;
    dateRange: { from: Date; to: Date } | null;
  }> {
    const totalMessages = await this.messageRepository.count();

    const typeStats = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.type')
      .getRawMany();

    const directionStats = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.direction', 'direction')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.direction')
      .getRawMany();

    const dateRange = await this.messageRepository
      .createQueryBuilder('message')
      .select('MIN(message.messageDate)', 'from')
      .addSelect('MAX(message.messageDate)', 'to')
      .getRawOne();

    const messagesByType = Object.values(MessageType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<MessageType, number>);

    typeStats.forEach((stat) => {
      messagesByType[stat.type] = parseInt(stat.count);
    });

    const messagesByDirection = Object.values(MessageDirection).reduce((acc, dir) => {
      acc[dir] = 0;
      return acc;
    }, {} as Record<MessageDirection, number>);

    directionStats.forEach((stat) => {
      messagesByDirection[stat.direction] = parseInt(stat.count);
    });

    return {
      totalMessages,
      messagesByType,
      messagesByDirection,
      dateRange: dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : null,
    };
  }

  /** Получение списка чатов с последними сообщениями */
  async getChatList(): Promise<
    Array<{
      sessionId: string;
      messageCount: number;
      lastMessageDate: Date;
      lastMessageText?: string;
    }>
  > {
    const sessions = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.sessionId', 'sessionId')
      .addSelect('COUNT(*)', 'messageCount')
      .addSelect('MAX(message.messageDate)', 'lastMessageDate')
      .groupBy('message.sessionId')
      .orderBy('MAX(message.messageDate)', 'DESC')
      .getRawMany();

    const result: Array<{ sessionId: string; messageCount: number; lastMessageDate: Date; lastMessageText?: string }> = [];

    for (const session of sessions) {
      const lastMessage = await this.messageRepository.findOne({
        where: { session: { id: session.sessionId } },
        order: { messageDate: 'DESC' },
      });

      result.push({
        sessionId: session.sessionId,
        messageCount: parseInt(session.messageCount),
        lastMessageDate: session.lastMessageDate,
        lastMessageText: lastMessage?.text,
      });
    }

    return result;
  }

  /** Создание универсального сообщения без привязки к Telegram */
  async createUniversal(createUniversalMessageDto: CreateUniversalMessageDto): Promise<MessageEntity> {
    const message = this.messageRepository.create({
      text: createUniversalMessageDto.text,
      type: createUniversalMessageDto.type || MessageType.TEXT,
      direction: createUniversalMessageDto.direction || MessageDirection.INCOMING,
      messageDate: new Date(),
      isBot: createUniversalMessageDto.isBot || false,
      rawData: createUniversalMessageDto.metadata,
    });

    return await this.messageRepository.save(message);
  }
}