import { Message } from "node-telegram-bot-api";
import { telegramConfig } from "../config/telegram.config";
import { mainLogger } from "./logs/logger";
import { TelegramService, GatewayService, MessageStorageService } from "../services";
import { BusinessConnection, BusinessMessage } from "../shared/types";
import { getTextPreview, isCommand, formatUserName } from "../shared/utils";

/**
 * Main Telegram application class
 */
export class TelegramApp {
  private readonly telegramService: TelegramService;
  private readonly gatewayService: GatewayService;
  private readonly messageStorageService: MessageStorageService;
  private assistantEnabled: boolean;

  constructor() {
    this.telegramService = new TelegramService();
    this.gatewayService = new GatewayService();
    this.messageStorageService = new MessageStorageService();
    this.assistantEnabled = telegramConfig.assistantEnabledByDefault;

    this.setupEventHandlers();
    this.setupCommandHandlers();
    this.setupPeriodicTasks();
    this.setupGracefulShutdown();

    mainLogger.info("Telegram application initialized");
  }

  /**
   * Sets up event handlers for the bot
   */
  private setupEventHandlers(): void {
    // Business connection handler
    this.telegramService.onBusinessConnection((connection: BusinessConnection) => {
      mainLogger.info("Business account connection established", {
        user: connection.user.first_name,
        connectionId: connection.id,
        status: connection.status,
      });
    });

    // Business message handler
    this.telegramService.onBusinessMessage(async (msg: BusinessMessage) => {
      await this.handleBusinessMessage(msg);
    });

    // Regular message handler
    this.telegramService.onMessage(async (msg: Message) => {
      await this.handleRegularMessage(msg);
    });
  }

  /**
   * Sets up command handlers
   */
  private setupCommandHandlers(): void {
    // Start command
    this.telegramService.onCommand(/\/start/, (msg: Message) => {
      this.handleStartCommand(msg);
    });

    // Status command
    this.telegramService.onCommand(/\/status/, (msg: Message) => {
      this.handleStatusCommand(msg);
    });

    // Sessions command
    this.telegramService.onCommand(/\/sessions/, (msg: Message) => {
      this.handleSessionsCommand(msg);
    });

    // Enable assistant command
    this.telegramService.onCommand(/\/on/, (msg: Message) => {
      this.handleEnableCommand(msg);
    });

    // Disable assistant command
    this.telegramService.onCommand(/\/off/, (msg: Message) => {
      this.handleDisableCommand(msg);
    });

    // Save command
    this.telegramService.onCommand(/\/save/, (msg: Message) => {
      this.handleSaveCommand(msg);
    });

    // Clear command
    this.telegramService.onCommand(/\/clear/, (msg: Message) => {
      this.handleClearCommand(msg);
    });

    // Migrate command
    this.telegramService.onCommand(/\/migrate/, (msg: Message) => {
      this.handleMigrateCommand(msg);
    });
  }

  /**
   * Sets up periodic tasks
   */
  private setupPeriodicTasks(): void {
    // Periodic session saving
    setInterval(
      () => {
        this.gatewayService.saveUserSessions();
      },
      telegramConfig.sessionSaveIntervalMinutes * 60 * 1000,
    );

    // Periodic session cleanup
    setInterval(
      () => {
        const cleanedCount = this.gatewayService.cleanupOldSessions();
        if (cleanedCount > 0) {
          mainLogger.info("Periodic session cleanup completed", { cleanedCount });
        }
      },
      telegramConfig.sessionCleanupIntervalHours * 60 * 60 * 1000,
    );
  }

  /**
   * Sets up graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    process.on("SIGINT", () => {
      this.shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      this.shutdown("SIGTERM");
    });

    process.on("uncaughtException", error => {
      mainLogger.error("Uncaught Exception", {
        message: error.message,
        stack: error.stack,
      });
      this.shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      mainLogger.error("Unhandled Rejection", {
        reason: reason,
        promise: promise,
      });
    });
  }

  /**
   * Handles business messages
   * @param msg - Business message
   */
  private async handleBusinessMessage(msg: BusinessMessage): Promise<void> {
    if (!this.assistantEnabled) return;

    const chatId = msg.chat.id;
    const messageText = msg.text || "";
    const businessConnectionId = msg.business_connection_id;
    const userName = formatUserName(msg.from?.first_name, msg.from?.last_name);

    // Save incoming message
    await this.messageStorageService.saveIncomingMessage(msg, true, businessConnectionId);

    mainLogger.info("Business message received", {
      chatId,
      messageText: getTextPreview(messageText),
      userName,
      businessConnectionId,
    });

    // Skip commands
    if (isCommand(messageText)) {
      mainLogger.info("Business message is a command, skipping AI processing", {
        command: messageText,
      });
      return;
    }

    await this.processMessage(chatId, messageText, userName, businessConnectionId);
  }

  /**
   * Handles regular messages
   * @param msg - Regular message
   */
  private async handleRegularMessage(msg: Message): Promise<void> {
    if (!this.assistantEnabled || !msg.text) return;

    const chatId = msg.chat.id;
    const messageText = msg.text;
    const userName = formatUserName(msg.from?.first_name, msg.from?.last_name);

    // Save incoming message
    await this.messageStorageService.saveIncomingMessage(msg, false);

    mainLogger.info("Regular message received", {
      chatId,
      messageText: getTextPreview(messageText),
      userName,
    });

    await this.processMessage(chatId, messageText, userName);
  }

  /**
   * Processes a message through the AI gateway
   * @param chatId - Chat ID
   * @param messageText - Message text
   * @param userName - User name
   * @param businessConnectionId - Business connection ID (optional)
   */
  private async processMessage(chatId: number, messageText: string, userName: string, businessConnectionId?: string): Promise<void> {
    try {
      // Get or create user session
      const session = await this.gatewayService.getOrCreateUserSession(chatId, userName);
      if (!session) {
        mainLogger.error("Failed to get user session", { chatId, userName });
        await this.sendFallbackResponse(chatId, businessConnectionId);
        return;
      }

      // Send message to AI gateway
      const aiResponse = await this.gatewayService.sendMessageToGateway(session, messageText);

      let responseText: string;
      if (aiResponse) {
        responseText = aiResponse;
        this.gatewayService.updateSessionMessageCount(chatId);
      } else {
        responseText = this.getFallbackResponse();
      }

      // Send response with typing simulation
      await this.telegramService.sendMessageWithTyping(chatId, responseText, businessConnectionId);

      mainLogger.info("Response sent successfully", {
        chatId,
        userName,
        responseLength: responseText.length,
        isBusiness: !!businessConnectionId,
      });
    } catch (error) {
      mainLogger.error("Error processing message", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        chatId,
        userName,
      });

      await this.sendFallbackResponse(chatId, businessConnectionId);
    }
  }

  /**
   * Sends a fallback response when AI is unavailable
   * @param chatId - Chat ID
   * @param businessConnectionId - Business connection ID (optional)
   */
  private async sendFallbackResponse(chatId: number, businessConnectionId?: string): Promise<void> {
    const fallbackResponse = this.getFallbackResponse();
    await this.telegramService.sendMessage(chatId, fallbackResponse, businessConnectionId);
  }

  /**
   * Gets a random fallback response
   * @returns Fallback response text
   */
  private getFallbackResponse(): string {
    const responses = [
      "Service temporarily unavailable. Please try again.",
      "Connection error. Retrying...",
      "Technical issues detected. Please retry your request.",
      "I'm having trouble connecting right now. Please try again in a moment.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Handles start command
   * @param msg - Message object
   */
  private handleStartCommand(msg: Message): void {
    const helpMessage = this.getHelpMessage();
    this.telegramService.sendMessage(msg.chat.id, helpMessage);
  }

  /**
   * Handles status command
   * @param msg - Message object
   */
  private handleStatusCommand(msg: Message): void {
    const stats = this.gatewayService.getSessionStatistics();
    const status = this.assistantEnabled ? "ACTIVE" : "INACTIVE";

    const statusMessage = `
🤖 **Telegram Assistant Status**

**State:** ${status}
**Active Sessions:** ${stats.activeSessions}
**Total Sessions:** ${stats.totalSessions}
**Total Messages:** ${stats.totalMessages}
**Backend URL:** ${telegramConfig.backendBaseUrl}
**Sessions File:** ${telegramConfig.sessionsFile}
**Started:** ${new Date().toLocaleString("en-US")}

Send any message to test functionality
    `;

    this.telegramService.sendMessage(msg.chat.id, statusMessage);
  }

  /**
   * Handles sessions command
   * @param msg - Message object
   */
  private handleSessionsCommand(msg: Message): void {
    const chatId = msg.chat.id;
    const session = this.gatewayService.getAllUserSessions().get(chatId);

    if (!session) {
      this.telegramService.sendMessage(chatId, "No active session found. Send any message to create one.");
      return;
    }

    const sessionInfo = `
📊 **Session Information**

**Name:** ${session.userName}
**User ID:** ${session.userId}
**Session ID:** ${session.sessionId}
**Chat Session ID:** ${session.chatSessionId || "Not created"}
**Messages:** ${session.totalMessages}
**Last Activity:** ${new Date(session.lastMessageTime).toLocaleString("en-US")}

**Backend URL:** ${telegramConfig.backendBaseUrl}
    `;

    this.telegramService.sendMessage(chatId, sessionInfo);
  }

  /**
   * Handles enable command
   * @param msg - Message object
   */
  private handleEnableCommand(msg: Message): void {
    this.assistantEnabled = true;
    this.telegramService.sendMessage(msg.chat.id, "✅ AI assistant ENABLED. Ready to use Backend Chat API.");
  }

  /**
   * Handles disable command
   * @param msg - Message object
   */
  private handleDisableCommand(msg: Message): void {
    this.assistantEnabled = false;
    this.telegramService.sendMessage(msg.chat.id, "❌ AI assistant DISABLED");
  }

  /**
   * Handles save command
   * @param msg - Message object
   */
  private handleSaveCommand(msg: Message): void {
    this.gatewayService.saveUserSessions();
    this.telegramService.sendMessage(msg.chat.id, "💾 Sessions force saved successfully.");
  }

  /**
   * Handles clear command
   * @param msg - Message object
   */
  private handleClearCommand(msg: Message): void {
    const clearedCount = this.gatewayService.clearAllSessions();
    this.telegramService.sendMessage(msg.chat.id, `🗑️ Cleared ${clearedCount} sessions`);
  }

  /**
   * Handles migrate command
   * @param msg - Message object
   */
  private async handleMigrateCommand(msg: Message): Promise<void> {
    const chatId = msg.chat.id;
    const session = this.gatewayService.getAllUserSessions().get(chatId);

    if (!session) {
      this.telegramService.sendMessage(chatId, "No active session found. Send any message to create one.");
      return;
    }

    if (session.chatSessionId) {
      this.telegramService.sendMessage(chatId, "Session already migrated to new Chat API.");
      return;
    }

    try {
      const newSession = await this.gatewayService.getOrCreateUserSession(chatId, session.userName);
      if (newSession && newSession.chatSessionId) {
        this.telegramService.sendMessage(chatId, `✅ Session migrated successfully! Chat Session ID: ${newSession.chatSessionId}`);
      } else {
        this.telegramService.sendMessage(chatId, "❌ Failed to migrate session. Please try again.");
      }
    } catch (error) {
      mainLogger.error("Migration error", {
        error: error instanceof Error ? error.message : String(error),
        chatId,
      });
      this.telegramService.sendMessage(chatId, "❌ Migration failed. Please try again later.");
    }
  }

  /**
   * Gets help message
   * @returns Help message text
   */
  private getHelpMessage(): string {
    const stats = this.gatewayService.getSessionStatistics();

    return `
🤖 **Telegram Assistant (Backend Chat API + History)**

🔗 **Connections:**
- Backend Chat API
- Telegram Business API
- Message history analysis

📊 **Status:** ${this.assistantEnabled ? "🟢 Active" : "🔴 Inactive"}
👥 **Active Sessions:** ${stats.activeSessions}

⚙️ **Main Commands:**
/on - enable assistant
/off - disable assistant  
/status - show status and statistics
/sessions - session information

🛠 **Data Management:**
/clear - clear all sessions
/save - force save sessions
/migrate - migrate session to new Chat API

🔧 **Environment Settings:**
- Backend URL: ${telegramConfig.backendBaseUrl}

💡 **History Analysis Features:**
- Automatic contact detection (emails, phones)
- Lead identification
- Message type statistics
- CSV data export
    `;
  }

  /**
   * Shuts down the application gracefully
   * @param signal - Shutdown signal
   */
  private async shutdown(signal: string): Promise<void> {
    mainLogger.info(`Telegram assistant shutting down (${signal})...`);
    mainLogger.info("Saving sessions...");
    this.gatewayService.saveUserSessions();
    this.telegramService.stopPolling();
    mainLogger.info("All data saved. Goodbye!");
    process.exit(0);
  }

  /**
   * Starts the application
   */
  async start(): Promise<void> {
    try {
      mainLogger.info("Starting Telegram assistant...");
      mainLogger.info("Configuration check:");
      mainLogger.info(`- Telegram Bot Token: ${telegramConfig.botToken.length > 10 ? "Configured" : "Missing"}`);
      mainLogger.info(`- Backend Base URL: ${telegramConfig.backendBaseUrl}`);

      // Load existing sessions
      this.gatewayService.loadUserSessions();

      const stats = this.gatewayService.getSessionStatistics();
      mainLogger.info(`📱 Telegram assistant is ready! Loaded ${stats.totalSessions} user sessions`);
    } catch (error) {
      mainLogger.error("Failed to start Telegram assistant", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      process.exit(1);
    }
  }
}
