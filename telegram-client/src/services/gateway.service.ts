import { BaseService } from "../shared/base/base-service";
import { AuthService } from "./auth.service";
import { ChatService } from "./chat.service";
import { SessionService } from "./session.service";
import { UserSession, SessionMetadata } from "../shared/types";

/**
 * Gateway service for managing communication between Telegram and backend
 */
export class GatewayService extends BaseService {
  private readonly authService: AuthService;
  private readonly chatService: ChatService;
  private readonly sessionService: SessionService;

  constructor() {
    super("GatewayService");
    this.authService = new AuthService();
    this.chatService = new ChatService(this.authService);
    this.sessionService = new SessionService();
    this.logInitialization();
  }

  /**
   * Gets or creates a user session with backend integration
   * @param chatId - Chat ID
   * @param userName - User name
   * @returns User session or null
   */
  async getOrCreateUserSession(chatId: number, userName: string): Promise<UserSession | null> {
    try {
      this.validateRequired({ chatId, userName }, ["chatId", "userName"]);

      // Get or create local session
      const session = await this.sessionService.getOrCreateUserSession(chatId, userName);
      if (!session) {
        this.logError("Failed to create local session", new Error("Session creation failed"), { chatId, userName });
        return null;
      }

      // If session doesn't have chatSessionId, create one in backend
      if (!session.chatSessionId) {
        this.logInfo("Creating backend chat session for existing user session", {
          chatId,
          userId: session.userId,
          userName,
        });

        const metadata: SessionMetadata = {
          chatId: chatId.toString(),
          userName,
          source: "telegram",
          existingSessionId: session.sessionId,
        };

        const chatSession = await this.chatService.createSession(session.userId, `Telegram Chat with ${userName}`, metadata);

        if (chatSession) {
          session.chatSessionId = chatSession.id;
          this.sessionService.updateUserSession(chatId, { chatSessionId: chatSession.id });

          this.logInfo("Backend chat session created successfully", {
            chatId,
            chatSessionId: chatSession.id,
          });
        } else {
          this.logError("Failed to create backend chat session", new Error("Backend session creation failed"), {
            chatId,
            userId: session.userId,
          });
          return null;
        }
      }

      return session;
    } catch (error) {
      this.logError("Failed to get or create user session", error, { chatId, userName });
      return null;
    }
  }

  /**
   * Sends a message to the backend gateway
   * @param session - User session
   * @param message - Message text
   * @returns AI response or null
   */
  async sendMessageToGateway(session: UserSession, message: string): Promise<string | null> {
    try {
      this.validateRequired({ session, message }, ["session", "message"]);

      if (!session.chatSessionId) {
        this.logError("No chat session ID available", new Error("Missing chatSessionId"), {
          userId: session.userId,
          sessionId: session.sessionId,
        });
        return null;
      }

      this.logInfo("Sending message to backend gateway", {
        userId: session.userId,
        sessionId: session.sessionId,
        chatSessionId: session.chatSessionId,
        messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      });

      const response = await this.chatService.sendMessage(session.chatSessionId, message, {
        source: "telegram",
        telegramUserId: session.userId,
        telegramSessionId: session.sessionId,
        userName: session.userName,
      });

      if (!response) {
        this.logWarning("No response from backend gateway", {
          userId: session.userId,
          chatSessionId: session.chatSessionId,
        });
        return null;
      }

      // Extract AI response
      if (response.aiResponse?.message?.text) {
        const aiResponse = response.aiResponse.message.text;
        this.logInfo("Backend AI response received", {
          userId: session.userId,
          chatSessionId: session.chatSessionId,
          responsePreview: aiResponse.substring(0, 50) + (aiResponse.length > 50 ? "..." : ""),
        });
        return aiResponse;
      }

      this.logWarning("No AI response in backend response", {
        userId: session.userId,
        chatSessionId: session.chatSessionId,
        hasMessage: !!response.message,
        hasAiResponse: !!response.aiResponse,
      });

      return null;
    } catch (error) {
      this.logError("Failed to send message to backend gateway", error, {
        userId: session.userId,
        sessionId: session.sessionId,
        chatSessionId: session.chatSessionId,
      });
      return null;
    }
  }

  /**
   * Updates session message count
   * @param chatId - Chat ID
   * @returns Success status
   */
  updateSessionMessageCount(chatId: number): boolean {
    try {
      const session = this.sessionService.getUserSession(chatId);
      if (!session) {
        this.logWarning("Session not found for message count update", { chatId });
        return false;
      }

      return this.sessionService.updateUserSession(chatId, {
        totalMessages: session.totalMessages + 1,
        lastMessageTime: Date.now(),
      });
    } catch (error) {
      this.logError("Failed to update session message count", error, { chatId });
      return false;
    }
  }

  /**
   * Gets session statistics
   * @returns Session statistics
   */
  getSessionStatistics(): Record<string, any> {
    return this.sessionService.getSessionStatistics();
  }

  /**
   * Cleans up old sessions
   * @returns Number of cleaned sessions
   */
  cleanupOldSessions(): number {
    return this.sessionService.cleanupOldSessions();
  }

  /**
   * Clears all user sessions
   * @returns Number of cleared sessions
   */
  clearAllSessions(): number {
    return this.sessionService.clearAllSessions();
  }

  /**
   * Forces save of all sessions
   */
  saveUserSessions(): void {
    this.sessionService.forceSave();
  }

  /**
   * Loads user sessions
   */
  loadUserSessions(): void {
    // Sessions are loaded automatically in constructor
    this.logInfo("User sessions loaded");
  }

  /**
   * Gets all user sessions
   * @returns Map of user sessions
   */
  getAllUserSessions(): Map<number, UserSession> {
    return this.sessionService.getAllSessions();
  }

  /**
   * Checks if the gateway service is healthy
   * @returns Promise with health status
   */
  async isHealthy(): Promise<boolean> {
    try {
      const authHealthy = this.authService.isTokenValid();
      const chatHealthy = await this.chatService.isHealthy();

      return authHealthy && chatHealthy;
    } catch (error) {
      this.logError("Health check failed", error);
      return false;
    }
  }

  /**
   * Gets service statistics
   * @returns Service statistics
   */
  getServiceStatistics(): Record<string, any> {
    return {
      service: "GatewayService",
      status: "active",
      sessionStats: this.getSessionStatistics(),
      authStatus: this.authService.isTokenValid() ? "authenticated" : "not_authenticated",
    };
  }
}
