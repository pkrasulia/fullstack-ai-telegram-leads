import axios from "axios";
import { Message } from "node-telegram-bot-api";
import { telegramConfig } from "../config/telegram.config";
import { BaseService } from "../shared/base/base-service";
import { ProcessedMessage, MessageType, MessageDirection, MediaInfo, ReplyInfo, ForwardInfo } from "../shared/types";

/**
 * Message storage service for processing and storing Telegram messages
 */
export class MessageStorageService extends BaseService {
  private readonly backendUrl: string;

  constructor() {
    super("MessageStorageService");
    this.backendUrl = telegramConfig.backendUrl;
    this.logInitialization();
  }

  /**
   * Determines the message type based on content
   * @param msg - Telegram message
   * @returns Message type
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
   * Extracts media information from message
   * @param msg - Telegram message
   * @returns Media information or undefined
   */
  private extractMediaInfo(msg: Message): MediaInfo | undefined {
    if (msg.photo && msg.photo.length > 0) {
      const photo = msg.photo[msg.photo.length - 1]; // Get largest photo
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
   * Extracts reply information from message
   * @param msg - Telegram message
   * @returns Reply information or undefined
   */
  private extractReplyInfo(msg: Message): ReplyInfo | undefined {
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
   * Extracts forward information from message
   * @param msg - Telegram message
   * @returns Forward information or undefined
   */
  private extractForwardInfo(msg: Message): ForwardInfo | undefined {
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
   * Converts Telegram message to processed message format
   * @param msg - Telegram message
   * @param direction - Message direction
   * @param isBusiness - Is business message
   * @param businessConnectionId - Business connection ID
   * @returns Processed message
   */
  private convertTelegramMessage(
    msg: Message,
    direction: MessageDirection = MessageDirection.INCOMING,
    isBusiness: boolean = false,
    businessConnectionId?: string,
  ): ProcessedMessage {
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
   * Saves a message to storage
   * @param msg - Telegram message
   * @param direction - Message direction
   * @param isBusiness - Is business message
   * @param businessConnectionId - Business connection ID
   * @returns Promise with success status
   */
  async saveMessage(msg: Message, direction: MessageDirection = MessageDirection.INCOMING, isBusiness: boolean = false, _businessConnectionId?: string): Promise<boolean> {
    try {
      const processedMessage = this.convertTelegramMessage(msg, direction, isBusiness, _businessConnectionId);

      this.logInfo("Message processed for storage", {
        messageId: processedMessage.telegramMessageId,
        chatId: processedMessage.chatId,
        type: processedMessage.type,
        direction: processedMessage.direction,
        isBusiness: processedMessage.isBusiness,
      });

      // Messages are now automatically saved through ChatService.sendMessage()
      // This method is kept for compatibility but doesn't perform HTTP requests
      return true;
    } catch (error) {
      this.logError("Failed to process message for storage", error, {
        messageId: msg.message_id,
        chatId: msg.chat.id,
        direction,
        isBusiness,
        businessConnectionId: _businessConnectionId,
      });
      return false;
    }
  }

  /**
   * Saves an incoming message
   * @param msg - Telegram message
   * @param isBusiness - Is business message
   * @param businessConnectionId - Business connection ID
   * @returns Promise with success status
   */
  async saveIncomingMessage(msg: Message, isBusiness: boolean = false, businessConnectionId?: string): Promise<boolean> {
    return this.saveMessage(msg, MessageDirection.INCOMING, isBusiness, businessConnectionId);
  }

  /**
   * Saves an outgoing message
   * @param msg - Telegram message
   * @param isBusiness - Is business message
   * @param businessConnectionId - Business connection ID
   * @returns Promise with success status
   */
  async saveOutgoingMessage(msg: Message, isBusiness: boolean = false, businessConnectionId?: string): Promise<boolean> {
    return this.saveMessage(msg, MessageDirection.OUTGOING, isBusiness, businessConnectionId);
  }

  /**
   * Checks backend health
   * @returns Promise with health status
   */
  async checkBackendHealth(): Promise<boolean> {
    const result = await this.safeExecute(async () => {
      const response = await axios.get(`${this.backendUrl}/health`, {
        timeout: telegramConfig.healthCheckTimeoutMs,
      });
      return response.status === 200;
    }, "checkBackendHealth");
    return result || false;
  }

  /**
   * Gets message statistics
   * @returns Promise with statistics
   */
  async getMessageStatistics(): Promise<Record<string, any>> {
    // This would typically query the backend for statistics
    // For now, return basic info
    return {
      service: "MessageStorageService",
      status: "active",
      backendUrl: this.backendUrl,
    };
  }
}
