import fs from "fs";
import crypto from "crypto";
import { telegramConfig } from "../config/telegram.config";
import { BaseService } from "../shared/base/base-service";
import { UserSession } from "../shared/types";
import { isOlderThanDays, getCurrentTimestampMs } from "../shared/utils";

/**
 * Session service for managing user sessions
 */
export class SessionService extends BaseService {
  private userSessions = new Map<number, UserSession>();

  constructor() {
    super("SessionService");
    this.loadUserSessions();
    this.logInitialization();
  }

  /**
   * Loads user sessions from file
   */
  private loadUserSessions(): void {
    try {
      if (fs.existsSync(telegramConfig.sessionsFile)) {
        const data = fs.readFileSync(telegramConfig.sessionsFile, "utf8");
        const sessions = JSON.parse(data);

        for (const [chatId, session] of Object.entries(sessions)) {
          const userSession = session as UserSession;
          this.userSessions.set(parseInt(chatId), userSession);
        }

        this.logInfo("User sessions loaded", { sessionCount: this.userSessions.size });
      } else {
        this.logInfo("No sessions file found, starting with empty sessions");
      }
    } catch (error) {
      this.logError("Failed to load user sessions", error);
      this.userSessions = new Map();
    }
  }

  /**
   * Saves user sessions to file
   */
  private saveUserSessions(): void {
    try {
      const sessionsObj = Object.fromEntries(this.userSessions);
      fs.writeFileSync(telegramConfig.sessionsFile, JSON.stringify(sessionsObj, null, 2));
      this.logInfo("User sessions saved", { userCount: this.userSessions.size });
    } catch (error) {
      this.logError("Failed to save user sessions", error);
    }
  }

  /**
   * Generates a random session ID
   * @returns Session ID
   */
  private generateSessionId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  /**
   * Gets or creates a user session
   * @param chatId - Chat ID
   * @param userName - User name
   * @returns User session or null
   */
  async getOrCreateUserSession(chatId: number, userName: string): Promise<UserSession | null> {
    try {
      this.validateRequired({ chatId, userName }, ["chatId", "userName"]);

      if (this.userSessions.has(chatId)) {
        const existingSession = this.userSessions.get(chatId)!;
        existingSession.lastMessageTime = getCurrentTimestampMs();
        existingSession.userName = userName;

        this.logInfo("Updated existing user session", {
          chatId,
          userId: existingSession.userId,
          userName,
          totalMessages: existingSession.totalMessages,
        });

        return existingSession;
      }

      const userId = `tg_user_${chatId}`;
      const sessionId = this.generateSessionId();

      const newSession: UserSession = {
        userId,
        sessionId,
        userName,
        lastMessageTime: getCurrentTimestampMs(),
        totalMessages: 0,
      };

      this.userSessions.set(chatId, newSession);
      this.saveUserSessions();

      this.logInfo("Created new user session", {
        chatId,
        userId,
        sessionId,
        userName,
      });

      return newSession;
    } catch (error) {
      this.logError("Failed to get or create user session", error, { chatId, userName });
      return null;
    }
  }

  /**
   * Gets a user session by chat ID
   * @param chatId - Chat ID
   * @returns User session or undefined
   */
  getUserSession(chatId: number): UserSession | undefined {
    return this.userSessions.get(chatId);
  }

  /**
   * Updates a user session
   * @param chatId - Chat ID
   * @param updates - Session updates
   * @returns Success status
   */
  updateUserSession(chatId: number, updates: Partial<UserSession>): boolean {
    try {
      const session = this.userSessions.get(chatId);
      if (!session) {
        this.logWarning("Session not found for update", { chatId });
        return false;
      }

      Object.assign(session, updates);
      this.saveUserSessions();

      this.logInfo("User session updated", { chatId, updates });
      return true;
    } catch (error) {
      this.logError("Failed to update user session", error, { chatId, updates });
      return false;
    }
  }

  /**
   * Deletes a user session
   * @param chatId - Chat ID
   * @returns Success status
   */
  deleteUserSession(chatId: number): boolean {
    try {
      const deleted = this.userSessions.delete(chatId);
      if (deleted) {
        this.saveUserSessions();
        this.logInfo("User session deleted", { chatId });
      }
      return deleted;
    } catch (error) {
      this.logError("Failed to delete user session", error, { chatId });
      return false;
    }
  }

  /**
   * Clears all user sessions
   * @returns Number of cleared sessions
   */
  clearAllSessions(): number {
    try {
      const count = this.userSessions.size;
      this.userSessions.clear();
      this.saveUserSessions();
      this.logInfo("All user sessions cleared", { clearedCount: count });
      return count;
    } catch (error) {
      this.logError("Failed to clear all sessions", error);
      return 0;
    }
  }

  /**
   * Gets all user sessions
   * @returns Map of user sessions
   */
  getAllSessions(): Map<number, UserSession> {
    return new Map(this.userSessions);
  }

  /**
   * Gets session statistics
   * @returns Session statistics
   */
  getSessionStatistics(): Record<string, any> {
    const sessions = Array.from(this.userSessions.values());
    const totalMessages = sessions.reduce((sum, session) => sum + session.totalMessages, 0);
    const activeSessions = sessions.filter(session => !isOlderThanDays(session.lastMessageTime, 1)).length;

    return {
      totalSessions: this.userSessions.size,
      activeSessions,
      totalMessages,
      averageMessagesPerSession: this.userSessions.size > 0 ? totalMessages / this.userSessions.size : 0,
    };
  }

  /**
   * Cleans up old sessions
   * @returns Number of cleaned sessions
   */
  cleanupOldSessions(): number {
    try {
      let removedCount = 0;
      const cutoffTime = getCurrentTimestampMs() - telegramConfig.sessionExpiryDays * 24 * 60 * 60 * 1000;

      for (const [chatId, session] of this.userSessions.entries()) {
        if (session.lastMessageTime < cutoffTime) {
          this.userSessions.delete(chatId);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        this.saveUserSessions();
        this.logInfo("Old sessions cleaned up", {
          removedCount,
          remainingCount: this.userSessions.size,
        });
      }

      return removedCount;
    } catch (error) {
      this.logError("Failed to cleanup old sessions", error);
      return 0;
    }
  }

  /**
   * Forces save of all sessions
   */
  forceSave(): void {
    this.saveUserSessions();
  }
}
