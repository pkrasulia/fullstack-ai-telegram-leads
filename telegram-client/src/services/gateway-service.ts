import dotenv from "dotenv";
import fs from "fs";
import { adkLogger } from "../app/logs/logger";

dotenv.config({ path: "../../.env" });
import crypto from "crypto";
import { makeAuthenticatedRequest } from "./auth-service";
import { ChatService, ChatSession } from "./chat-service";

// Auth and HTTP logic is delegated to auth-service

export interface UserSession {
  userId: string;
  sessionId: string;
  userName: string;
  lastMessageTime: number;
  totalMessages: number;
  chatSessionId?: string; // ID сессии в новом Chat API
}

export const SESSIONS_FILE = "user_sessions.json";
export let userSessions = new Map<number, UserSession>();

// Инициализируем ChatService
const chatService = new ChatService();

/**
 * Load user sessions from a JSON file into memory.
 */
export function loadUserSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, "utf8");
      const sessions = JSON.parse(data);

      for (const [chatId, session] of Object.entries(sessions)) {
        const userSession = session as UserSession;
        
        // Если у сессии нет chatSessionId, создаем его
        if (!userSession.chatSessionId) {
          adkLogger.info("Creating missing chatSessionId for existing session", { 
            chatId, 
            userId: userSession.userId 
          });
          // Пока оставляем пустым, будет создан при первом сообщении
          userSession.chatSessionId = undefined;
        }
        
        userSessions.set(parseInt(chatId), userSession);
      }

      adkLogger.info("User sessions loaded", { sessionCount: userSessions.size });
    }
  } catch (error: any) {
    adkLogger.error("Error loading user sessions", { message: error?.message });
    userSessions = new Map();
  }
}

/**
 * Persist user sessions to a JSON file on disk.
 */
export function saveUserSessions(): void {
  try {
    const sessionsObj = Object.fromEntries(userSessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2));
    adkLogger.info("User sessions saved", { userCount: userSessions.size });
  } catch (error: any) {
    adkLogger.error("Error saving user sessions", { message: error?.message });
  }
}

/**
 * Generate a random session ID for the user session mapping.
 */
function generateSessionId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Get an existing session for a chat or create a new one.
 */
export async function getOrCreateUserSession(chatId: number, userName: string): Promise<UserSession | null> {
  if (userSessions.has(chatId)) {
    const existingSession = userSessions.get(chatId)!;
    existingSession.lastMessageTime = Date.now();
    existingSession.userName = userName;
    
    // Если у существующей сессии нет chatSessionId, создаем его
    if (!existingSession.chatSessionId) {
      adkLogger.info("Creating missing chatSessionId for existing session", { 
        chatId, 
        userId: existingSession.userId,
        userName 
      });
      
      const chatSession = await chatService.createSession(
        existingSession.userId, 
        `Telegram Chat with ${userName}`,
        {
          chatId: chatId.toString(),
          userName,
          source: 'telegram',
          existingSessionId: existingSession.sessionId
        }
      );

      if (chatSession) {
        existingSession.chatSessionId = chatSession.id;
        saveUserSessions();
        adkLogger.info("Chat session created for existing user session", { 
          chatId, 
          chatSessionId: chatSession.id 
        });
      } else {
        adkLogger.error("Failed to create chat session for existing user session", { 
          chatId, 
          userId: existingSession.userId 
        });
        return null;
      }
    }
    
    return existingSession;
  }

  const userId = `tg_user_${chatId}`;
  const sessionId = generateSessionId();

  // Создаем сессию в новом Chat API
  const chatSession = await chatService.createSession(
    userId, 
    `Telegram Chat with ${userName}`,
    {
      chatId: chatId.toString(),
      userName,
      source: 'telegram'
    }
  );

  if (!chatSession) {
    adkLogger.error("Failed to create chat session in backend", { userName, chatId, userId });
    return null;
  }

  const newSession: UserSession = {
    userId,
    sessionId,
    userName,
    lastMessageTime: Date.now(),
    totalMessages: 0,
    chatSessionId: chatSession.id,
  };

  userSessions.set(chatId, newSession);
  saveUserSessions();

  adkLogger.info("New user session created", { 
    userName, 
    chatId, 
    userId, 
    sessionId,
    chatSessionId: chatSession.id
  });
  return newSession;
}

/**
 * Send message text to Backend Chat API and return the generated reply.
 */
export async function sendMessageToGateway(session: UserSession, message: string): Promise<string | null> {
  try {
    if (!session.chatSessionId) {
      adkLogger.error("No chat session ID available", { userId: session.userId, sessionId: session.sessionId });
      return null;
    }

    adkLogger.info("Sending message to Backend Chat API", {
      userId: session.userId,
      sessionId: session.sessionId,
      chatSessionId: session.chatSessionId,
      messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    });

    const response = await chatService.sendMessage(
      session.chatSessionId,
      message,
      {
        telegramUserId: session.userId,
        telegramSessionId: session.sessionId,
        userName: session.userName,
      }
    );

    if (!response) {
      adkLogger.warn("No response from Chat API", { userId: session.userId, chatSessionId: session.chatSessionId });
      return null;
    }

    // Возвращаем ответ от AI, если он есть
    if (response.aiResponse?.message?.text) {
      const aiResponse = response.aiResponse.message.text;
      adkLogger.info("Backend AI response processed", {
        userId: session.userId,
        chatSessionId: session.chatSessionId,
        responsePreview: aiResponse.substring(0, 50) + (aiResponse.length > 50 ? "..." : ""),
      });
      return aiResponse;
    }

    adkLogger.warn("No AI response in Chat API response", { 
      userId: session.userId, 
      chatSessionId: session.chatSessionId,
      hasMessage: !!response.message,
      hasAiResponse: !!response.aiResponse
    });
    return null;
  } catch (error: any) {
    adkLogger.error("Error sending message to Backend Chat API", {
      message: error?.message,
      status: error?.response?.status,
      responseData: error?.response?.data,
      userId: session.userId,
      sessionId: session.sessionId,
      chatSessionId: session.chatSessionId,
    });
    return null;
  }
}


