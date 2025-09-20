import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  MessageEntity,
  MessageType,
  MessageDirection,
} from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    // Проверяем, не существует ли уже сообщение с таким telegramMessageId и chatId
    const existingMessage = await this.messageRepository.findOne({
      where: {
        telegramMessageId: createMessageDto.telegramMessageId,
        chatId: createMessageDto.chatId,
      },
    });

    if (existingMessage) {
      // Если сообщение уже существует, возвращаем его
      return existingMessage;
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      messageDate: new Date(createMessageDto.messageDate),
    });

    return await this.messageRepository.save(message);
  }

  async findAll(options?: {
    chatId?: string;
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

    if (options?.limit) {
      findOptions.take = options.limit;
    }

    if (options?.offset) {
      findOptions.skip = options.offset;
    }

    const where: any = {};

    if (options?.chatId) {
      where.chatId = options.chatId;
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.direction) {
      where.direction = options.direction;
    }

    if (options?.dateFrom && options?.dateTo) {
      where.messageDate = Between(options.dateFrom, options.dateTo);
    } else if (options?.dateFrom) {
      where.messageDate = Between(options.dateFrom, new Date());
    }

    if (Object.keys(where).length > 0) {
      findOptions.where = where;
    }

    return await this.messageRepository.find(findOptions);
  }

  async findOne(id: number): Promise<MessageEntity> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async findByChatId(chatId: string, limit = 100): Promise<MessageEntity[]> {
    return await this.messageRepository.find({
      where: { chatId },
      order: { messageDate: 'DESC' },
      take: limit,
    });
  }

  async findByTelegramMessageId(
    telegramMessageId: string,
    chatId: string,
  ): Promise<MessageEntity | null> {
    return await this.messageRepository.findOne({
      where: { telegramMessageId, chatId },
    });
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageEntity> {
    const message = await this.findOne(id);
    Object.assign(message, updateMessageDto);

    if (updateMessageDto.messageDate) {
      message.messageDate = new Date(updateMessageDto.messageDate);
    }

    return await this.messageRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  async getMessageStats(chatId?: string): Promise<{
    totalMessages: number;
    messagesByType: Record<MessageType, number>;
    messagesByDirection: Record<MessageDirection, number>;
    dateRange: { from: Date; to: Date } | null;
  }> {
    const where = chatId ? { chatId } : {};

    const totalMessages = await this.messageRepository.count({ where });

    // Получаем статистику по типам
    const typeStats = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(chatId ? 'message.chatId = :chatId' : '1=1', { chatId })
      .groupBy('message.type')
      .getRawMany();

    // Получаем статистику по направлениям
    const directionStats = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.direction', 'direction')
      .addSelect('COUNT(*)', 'count')
      .where(chatId ? 'message.chatId = :chatId' : '1=1', { chatId })
      .groupBy('message.direction')
      .getRawMany();

    // Получаем диапазон дат
    const dateRange = await this.messageRepository
      .createQueryBuilder('message')
      .select('MIN(message.messageDate)', 'from')
      .addSelect('MAX(message.messageDate)', 'to')
      .where(chatId ? 'message.chatId = :chatId' : '1=1', { chatId })
      .getRawOne();

    // Формируем результат
    const messagesByType = Object.values(MessageType).reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<MessageType, number>,
    );

    typeStats.forEach((stat) => {
      messagesByType[stat.type] = parseInt(stat.count);
    });

    const messagesByDirection = Object.values(MessageDirection).reduce(
      (acc, direction) => {
        acc[direction] = 0;
        return acc;
      },
      {} as Record<MessageDirection, number>,
    );

    directionStats.forEach((stat) => {
      messagesByDirection[stat.direction] = parseInt(stat.count);
    });

    return {
      totalMessages,
      messagesByType,
      messagesByDirection,
      dateRange:
        dateRange.from && dateRange.to
          ? {
              from: dateRange.from,
              to: dateRange.to,
            }
          : null,
    };
  }

  async getChatList(): Promise<
    Array<{
      chatId: string;
      messageCount: number;
      lastMessageDate: Date;
      lastMessageText?: string;
    }>
  > {
    const chats = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.chatId', 'chatId')
      .addSelect('COUNT(*)', 'messageCount')
      .addSelect('MAX(message.messageDate)', 'lastMessageDate')
      .groupBy('message.chatId')
      .orderBy('MAX(message.messageDate)', 'DESC')
      .getRawMany();

    // Получаем последнее сообщение для каждого чата
    const result: Array<{
      chatId: string;
      messageCount: number;
      lastMessageDate: Date;
      lastMessageText?: string;
    }> = [];

    for (const chat of chats) {
      const lastMessage = await this.messageRepository.findOne({
        where: { chatId: chat.chatId },
        order: { messageDate: 'DESC' },
      });

      result.push({
        chatId: chat.chatId,
        messageCount: parseInt(chat.messageCount),
        lastMessageDate: chat.lastMessageDate,
        lastMessageText: lastMessage?.text,
      });
    }

    return result;
  }
}
