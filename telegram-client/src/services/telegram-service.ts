import TelegramBot, { Message } from "node-telegram-bot-api";
import { telegramLogger } from "../app/logs/logger";

export class TelegramService {
  private bot: TelegramBot;

  constructor(token: string) {
    telegramLogger.info("Initializing Telegram service");
    this.bot = new TelegramBot(token, {
      polling: {
        interval: 300,
        params: {
          allowed_updates: ["message", "business_connection", "business_message", "edited_business_message"],
        },
      },
    });

    this.setupErrorHandlers();
    telegramLogger.info("Telegram service initialized successfully");
  }

  private setupErrorHandlers(): void {
    this.bot.on("error", (error: any) => {
      telegramLogger.error("Bot error", { message: error?.message, stack: error?.stack });
    });

    this.bot.on("polling_error", (error: any) => {
      telegramLogger.error("Polling error", { message: error?.message });
      if (error?.message?.includes("404")) {
        telegramLogger.error("Check bot token in .env file - 404 error indicates invalid token");
      }
    });
  }

  // Функция эмуляции печати
  async simulateTyping(chatId: number, businessConnectionId?: string, text?: string): Promise<void> {
    try {
      const options = businessConnectionId ? ({ business_connection_id: businessConnectionId } as any) : {};
      await this.bot.sendChatAction(chatId, "typing", options);
      const typingTime = text ? Math.min(Math.max(text.length * 30, 1000), 5000) : 1000;
      await new Promise(resolve => setTimeout(resolve, typingTime));
    } catch (error: any) {
      telegramLogger.warn("Failed to show typing indicator", {
        chatId,
        businessConnectionId,
        message: error?.message || "unknown error",
      });
    }
  }

  // Функция отправки сообщения частями с эмуляцией печати
  async sendMessageWithTyping(chatId: number, text: string, businessConnectionId?: string): Promise<void> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length <= 1) {
      // Если одно предложение, отправляем целиком
      await this.simulateTyping(chatId, businessConnectionId, text);
      try {
        const options = businessConnectionId ? ({ business_connection_id: businessConnectionId } as any) : {};
        await this.bot.sendMessage(chatId, text, options);
      } catch (error: any) {
        telegramLogger.error("Error sending single message", {
          chatId,
          businessConnectionId,
          message: error?.message,
        });
      }
      return;
    }

    // Отправляем по предложениям
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      await this.simulateTyping(chatId, businessConnectionId, sentence);
      const messageText = sentence + (i < sentences.length - 1 ? "." : "");

      try {
        const options = businessConnectionId ? ({ business_connection_id: businessConnectionId } as any) : {};
        await this.bot.sendMessage(chatId, messageText, options);

        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error: any) {
        telegramLogger.error("Error sending message part", {
          chatId,
          businessConnectionId,
          sentenceIndex: i,
          message: error?.message,
        });
        break;
      }
    }
  }

  async sendMessage(chatId: number, text: string, businessConnectionId?: string): Promise<void> {
    try {
      const options = businessConnectionId ? ({ business_connection_id: businessConnectionId } as any) : {};
      await this.bot.sendMessage(chatId, text, options);
    } catch (error: any) {
      telegramLogger.error("Error sending message", {
        chatId,
        businessConnectionId,
        message: error?.message,
      });
    }
  }

  // Обработчики событий
  onBusinessConnection(callback: (connection: any) => void): void {
    this.bot.on("business_connection", callback);
  }

  onBusinessMessage(callback: (msg: any) => void): void {
    this.bot.on("business_message", callback);
  }

  onMessage(callback: (msg: Message) => void): void {
    this.bot.on("message", callback);
  }

  onCommand(pattern: RegExp, callback: (msg: Message) => void): void {
    this.bot.onText(pattern, callback);
  }

  stopPolling(): void {
    telegramLogger.info("Stopping Telegram bot polling");
    this.bot.stopPolling();
  }
}
