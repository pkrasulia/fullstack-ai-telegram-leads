import axios from 'axios';
import { Message } from 'node-telegram-bot-api';
import { mainLogger } from '../app/logs/logger';

export interface MessageData {
  telegramMessageId: string;
  chatId: string;
  fromUserId?: string;
  fromUsername?: string;
  fromFirstName?: string;
  fromLastName?: string;
  text?: string;
  type: MessageType;
  direction: MessageDirection;
  messageDate: string;
  mediaInfo?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  replyTo?: {
    messageId: string;
    text?: string;
    fromUsername?: string;
  };
  forwardInfo?: {
    fromChatId?: string;
    fromMessageId?: string;
    fromUsername?: string;
    date?: Date;
  };
  isBusiness?: boolean;
  businessConnectionId?: string;
  rawData?: any;
  isBot?: boolean;
}

export enum MessageType {
  TEXT = 'text',
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  VOICE = 'voice',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACT = 'contact',
  ANIMATION = 'animation',
  VIDEO_NOTE = 'video_note',
  OTHER = 'other',
}

export enum MessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export class MessageStorageService {
  private readonly backendUrl: string;
  private readonly apiVersion: string = 'v1';

  constructor(backendUrl: string = process.env.BACKEND_URL || 'http://backend:4343') {
    this.backendUrl = backendUrl;
  }

  /**
   * Определяет тип сообщения на основе содержимого
   */
  private determineMessageType(msg: Message): MessageType {
    if (msg.photo) return MessageType.PHOTO;
    if (msg.video) return MessageType.VIDEO;
    if (msg.audio) return MessageType.AUDIO;
    if (msg.voice) return MessageType.VOICE;
    if (msg.document) return MessageType.DOCUMENT;
    if (msg.sticker) return MessageType.STICKER;
    if (msg.location) return MessageType.LOCATION;
    if (msg.contact) return MessageType.CONTACT;
    if (msg.animation) return MessageType.ANIMATION;
    if (msg.video_note) return MessageType.VIDEO_NOTE;
    if (msg.text) return MessageType.TEXT;
    return MessageType.OTHER;
  }

  /**
   * Извлекает информацию о медиа из сообщения
   */
  private extractMediaInfo(msg: Message): MessageData['mediaInfo'] | undefined {
    if (msg.photo && msg.photo.length > 0) {
      const photo = msg.photo[msg.photo.length - 1]; // Берем самое большое фото
      return {
        fileId: photo.file_id,
        fileSize: photo.file_size,
        width: photo.width,
        height: photo.height,
      };
    }

    if (msg.video) {
      return {
        fileId: msg.video.file_id,
        fileName: (msg.video as any).file_name,
        fileSize: msg.video.file_size,
        mimeType: msg.video.mime_type,
        width: msg.video.width,
        height: msg.video.height,
        duration: msg.video.duration,
      };
    }

    if (msg.audio) {
      return {
        fileId: msg.audio.file_id,
        fileName: (msg.audio as any).file_name,
        fileSize: msg.audio.file_size,
        mimeType: msg.audio.mime_type,
        duration: msg.audio.duration,
      };
    }

    if (msg.voice) {
      return {
        fileId: msg.voice.file_id,
        fileSize: msg.voice.file_size,
        mimeType: msg.voice.mime_type,
        duration: msg.voice.duration,
      };
    }

    if (msg.document) {
      return {
        fileId: msg.document.file_id,
        fileName: msg.document.file_name,
        fileSize: msg.document.file_size,
        mimeType: msg.document.mime_type,
      };
    }

    if (msg.sticker) {
      return {
        fileId: msg.sticker.file_id,
        fileSize: msg.sticker.file_size,
        width: msg.sticker.width,
        height: msg.sticker.height,
      };
    }

    if (msg.animation) {
      return {
        fileId: msg.animation.file_id,
        fileName: msg.animation.file_name,
        fileSize: msg.animation.file_size,
        mimeType: msg.animation.mime_type,
        width: msg.animation.width,
        height: msg.animation.height,
        duration: msg.animation.duration,
      };
    }

    if (msg.video_note) {
      return {
        fileId: msg.video_note.file_id,
        fileSize: msg.video_note.file_size,
        duration: msg.video_note.duration,
      };
    }

    return undefined;
  }

  /**
   * Извлекает информацию о reply
   */
  private extractReplyInfo(msg: Message): MessageData['replyTo'] {
    if (msg.reply_to_message) {
      return {
        messageId: msg.reply_to_message.message_id.toString(),
        text: msg.reply_to_message.text || msg.reply_to_message.caption,
        fromUsername: msg.reply_to_message.from?.username,
      };
    }
    return undefined;
  }

  /**
   * Извлекает информацию о forward
   */
  private extractForwardInfo(msg: Message): MessageData['forwardInfo'] {
    if (msg.forward_from || msg.forward_from_chat) {
      return {
        fromChatId: msg.forward_from_chat?.id?.toString(),
        fromMessageId: msg.forward_from_message_id?.toString(),
        fromUsername: msg.forward_from?.username,
        date: msg.forward_date ? new Date(msg.forward_date * 1000) : undefined,
      };
    }
    return undefined;
  }

  /**
   * Преобразует Telegram сообщение в формат для API
   */
  private convertTelegramMessage(
    msg: Message, 
    direction: MessageDirection = MessageDirection.INCOMING,
    isBusiness: boolean = false,
    businessConnectionId?: string
  ): MessageData {
    return {
      telegramMessageId: msg.message_id.toString(),
      chatId: msg.chat.id.toString(),
      fromUserId: msg.from?.id?.toString(),
      fromUsername: msg.from?.username,
      fromFirstName: msg.from?.first_name,
      fromLastName: msg.from?.last_name,
      text: msg.text,
      type: this.determineMessageType(msg),
      direction,
      messageDate: new Date(msg.date * 1000).toISOString(),
      mediaInfo: this.extractMediaInfo(msg),
      replyTo: this.extractReplyInfo(msg),
      forwardInfo: this.extractForwardInfo(msg),
      isBusiness,
      businessConnectionId,
      rawData: msg,
      isBot: direction === MessageDirection.OUTGOING || msg.from?.is_bot || false,
    };
  }

  /**
   * Сохраняет сообщение в базу данных
   */
  async saveMessage(
    msg: Message, 
    direction: MessageDirection = MessageDirection.INCOMING,
    isBusiness: boolean = false,
    businessConnectionId?: string
  ): Promise<boolean> {
    const messageData = this.convertTelegramMessage(msg, direction, isBusiness, businessConnectionId);
    
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/${this.apiVersion}/telegram/messages`,
        messageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.status === 201) {
        mainLogger.info('Message saved to database', {
          messageId: messageData.telegramMessageId,
          chatId: messageData.chatId,
          type: messageData.type,
          direction: messageData.direction,
        });
        return true;
      }

      mainLogger.warn('Unexpected response when saving message', {
        status: response.status,
        messageId: messageData.telegramMessageId,
      });
      return false;

    } catch (error: any) {
      let errorMessage = 'Unknown error';
      let errorCode = 'UNKNOWN';
        
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorMessage = `Backend connection failed: ${this.backendUrl}`;
        errorCode = 'CONNECTION_FAILED';
      } else if (error.response) {
        errorMessage = `Backend API error: ${error.response.status} - ${error.response.statusText}`;
        errorCode = 'API_ERROR';
      } else if (error.request) {
        errorMessage = 'No response from backend server';
        errorCode = 'NO_RESPONSE';
      } else {
        errorMessage = error.message || 'Unknown error';
      }

      mainLogger.error('Failed to save message to database', {
        messageId: messageData.telegramMessageId,
        chatId: messageData.chatId,
        backendUrl: this.backendUrl,
        errorCode,
        error: errorMessage,
        ...(errorCode === 'UNKNOWN' && { stack: error.stack }),
      });
      return false;
    }
  }

  /**
   * Сохраняет входящее сообщение
   */
  async saveIncomingMessage(msg: Message, isBusiness: boolean = false, businessConnectionId?: string): Promise<boolean> {
    return this.saveMessage(msg, MessageDirection.INCOMING, isBusiness, businessConnectionId);
  }

  /**
   * Сохраняет исходящее сообщение
   */
  async saveOutgoingMessage(msg: Message, isBusiness: boolean = false, businessConnectionId?: string): Promise<boolean> {
    return this.saveMessage(msg, MessageDirection.OUTGOING, isBusiness, businessConnectionId);
  }

  /**
   * Проверяет доступность backend API
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.backendUrl}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error: any) {
      mainLogger.warn('Backend health check failed', { error: error.message });
      return false;
    }
  }
}
