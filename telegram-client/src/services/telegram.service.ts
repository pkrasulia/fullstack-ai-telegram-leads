import TelegramBot, { Message } from "node-telegram-bot-api";
import { telegramConfig } from "../config/telegram.config";
import { BaseService } from "../shared/base/base-service";
import { CommandHandler, MessageHandler, BusinessMessageHandler, BusinessConnectionHandler } from "../shared/types";
import { calculateTypingDelay, sleep, getTextPreview, isCommand } from "../shared/utils";
import { MessageStorageService } from "./message-storage.service";

/**
 * Telegram service for managing bot interactions
 */
export class TelegramService extends BaseService {
  private readonly bot: TelegramBot;
  private readonly messageStorageService: MessageStorageService;

  constructor() {
    super("TelegramService");
    this.messageStorageService = new MessageStorageService();
    this.bot = new TelegramBot(telegramConfig.botToken, {
      polling: {
        interval: telegramConfig.pollingIntervalMs,
        params: {
          allowed_updates: ["message", "business_connection", "business_message", "edited_business_message"],
        },
      },
    });

    this.setupErrorHandlers();
    this.logInitialization();
  }

  /**
   * Sets up error handlers for the bot
   */
  private setupErrorHandlers(): void {
    this.bot.on("error", (error: any) => {
      this.logError("Bot error occurred", error);
    });

    this.bot.on("polling_error", (error: any) => {
      this.logError("Polling error occurred", error);
      if (error?.message?.includes("404")) {
        this.logError("Bot token appears to be invalid (404 error)", error);
      }
    });
  }

  /**
   * Simulates typing indicator
   * @param chatId - Chat ID
   * @param businessConnectionId - Business connection ID (optional)
   * @param text - Text to calculate typing delay for
   */
  async simulateTyping(chatId: number, businessConnectionId?: string, text?: string): Promise<void> {
    try {
      const options = businessConnectionId ? ({ business_connection_id: businessConnectionId } as any) : {};

      await this.bot.sendChatAction(chatId, "typing", options);

      const typingTime = text
        ? calculateTypingDelay(text, telegramConfig.typingDelayMsPerChar, telegramConfig.minTypingDelayMs, telegramConfig.maxTypingDelayMs)
        : telegramConfig.minTypingDelayMs;

      await sleep(typingTime);
    } catch (error) {
      this.logWarning("Failed to show typing indicator", {
        chatId,
        businessConnectionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Sends a message with typing simulation
   * @param chatId - Chat ID
   * @param text - Message text
   * @param businessConnectionId - Business connection ID (optional)
   */
  async sendMessageWithTyping(chatId: number, text: string, businessConnectionId?: string): Promise<void> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length <= 1) {
      // Single sentence - send as is
      await this.simulateTyping(chatId, businessConnectionId, text);
      await this.sendMessage(chatId, text, businessConnectionId);
      return;
    }

    // Multiple sentences - send with delays
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      await this.simulateTyping(chatId, businessConnectionId, sentence);
      const messageText = sentence + (i < sentences.length - 1 ? "." : "");

      try {
        await this.sendMessage(chatId, messageText, businessConnectionId);

        if (i < sentences.length - 1) {
          await sleep(telegramConfig.sentenceDelayMs);
        }
      } catch (error) {
        this.logError("Error sending message part", error, {
          chatId,
          businessConnectionId,
          sentenceIndex: i,
        });
        break;
      }
    }
  }

  /**
   * Sends a message to a chat
   * @param chatId - Chat ID
   * @param text - Message text
   * @param businessConnectionId - Business connection ID (optional)
   */
  async sendMessage(chatId: number, text: string, businessConnectionId?: string): Promise<void> {
    try {
      const options = businessConnectionId ? ({ business_connection_id: businessConnectionId } as any) : {};

      const sentMessage = await this.bot.sendMessage(chatId, text, options);

      // Save outgoing message
      await this.messageStorageService.saveOutgoingMessage(sentMessage as Message, !!businessConnectionId, businessConnectionId);

      this.logInfo("Message sent successfully", {
        chatId,
        messageId: sentMessage.message_id,
        textPreview: getTextPreview(text),
        isBusiness: !!businessConnectionId,
      });
    } catch (error) {
      this.logError("Failed to send message", error, {
        chatId,
        textPreview: getTextPreview(text),
        isBusiness: !!businessConnectionId,
      });
      throw error;
    }
  }

  /**
   * Registers a business connection handler
   * @param callback - Handler function
   */
  onBusinessConnection(callback: BusinessConnectionHandler): void {
    this.bot.on("business_connection", callback);
    this.logInfo("Business connection handler registered");
  }

  /**
   * Registers a business message handler
   * @param callback - Handler function
   */
  onBusinessMessage(callback: BusinessMessageHandler): void {
    this.bot.on("business_message", callback);
    this.logInfo("Business message handler registered");
  }

  /**
   * Registers a regular message handler
   * @param callback - Handler function
   */
  onMessage(callback: MessageHandler): void {
    this.bot.on("message", callback);
    this.logInfo("Message handler registered");
  }

  /**
   * Registers a command handler
   * @param pattern - Command pattern (regex)
   * @param callback - Handler function
   */
  onCommand(pattern: RegExp, callback: CommandHandler): void {
    this.bot.onText(pattern, callback);
    this.logInfo("Command handler registered", { pattern: pattern.toString() });
  }

  /**
   * Stops the bot polling
   */
  stopPolling(): void {
    this.logInfo("Stopping bot polling");
    this.bot.stopPolling();
  }

  /**
   * Gets the underlying bot instance
   * @returns TelegramBot instance
   */
  getBot(): TelegramBot {
    return this.bot;
  }

  /**
   * Checks if a message is a command
   * @param message - Message to check
   * @returns True if message is a command
   */
  isCommand(message: Message): boolean {
    return !!(message.text && isCommand(message.text));
  }

  /**
   * Extracts command name from message
   * @param message - Message to extract command from
   * @returns Command name or null
   */
  getCommandName(message: Message): string | null {
    if (!this.isCommand(message)) return null;
    return message.text!.replace(/^\//, "").split(" ")[0];
  }

  /**
   * Gets message preview for logging
   * @param message - Message to get preview for
   * @returns Message preview
   */
  getMessagePreview(message: Message): string {
    if (message.text) {
      return getTextPreview(message.text);
    }
    // Determine message type from content
    if (message.photo) return "[photo]";
    if (message.video) return "[video]";
    if (message.audio) return "[audio]";
    if (message.voice) return "[voice]";
    if (message.document) return "[document]";
    if (message.sticker) return "[sticker]";
    if (message.location) return "[location]";
    if (message.contact) return "[contact]";
    if (message.animation) return "[animation]";
    if (message.video_note) return "[video_note]";
    return "[unknown]";
  }
}
