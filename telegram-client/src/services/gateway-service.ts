import dotenv from "dotenv";
import fs from "fs";
import { adkLogger } from "../app/logs/logger";

dotenv.config({ path: "../../.env" });
import crypto from "crypto";
import { makeAuthenticatedRequest } from "./auth-service";

// Auth and HTTP logic is delegated to auth-service

export interface UserSession {
  userId: string;
  sessionId: string;
  userName: string;
  lastMessageTime: number;
  totalMessages: number;
}

export const SESSIONS_FILE = "user_sessions.json";
export let userSessions = new Map<number, UserSession>();

/**
 * Load user sessions from a JSON file into memory.
 */
export function loadUserSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, "utf8");
      const sessions = JSON.parse(data);

      for (const [chatId, session] of Object.entries(sessions)) {
        userSessions.set(parseInt(chatId), session as UserSession);
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
    return existingSession;
  }

  const userId = `tg_user_${chatId}`;
  const sessionId = generateSessionId();

  const newSession: UserSession = {
    userId,
    sessionId,
    userName,
    lastMessageTime: Date.now(),
    totalMessages: 0,
  };

  userSessions.set(chatId, newSession);
  saveUserSessions();

  adkLogger.info("New user session created", { userName, chatId, userId, sessionId });
  return newSession;
}

/**
 * Send message text to Backend AI Gateway and return the generated reply.
 */
export async function sendMessageToGateway(session: UserSession, message: string): Promise<string | null> {
  try {
    adkLogger.info("Sending message to Backend AI Gateway", {
      userId: session.userId,
      sessionId: session.sessionId,
      messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    });

    const payload = {
      text: message,
      userId: session.userId,
      sessionId: session.sessionId,
    };

    const data = await makeAuthenticatedRequest<any>("POST", "/ai-gateway", { data: payload });
    const aiResponse: string | undefined = data?.response;
    if (typeof aiResponse === "string" && aiResponse.length > 0) {
      adkLogger.info("Backend AI response processed", {
        userId: session.userId,
        responsePreview: aiResponse.substring(0, 50) + (aiResponse.length > 50 ? "..." : ""),
      });
      return aiResponse;
    }
    adkLogger.warn("Backend AI response missing 'response' field", { data });
    return null;
  } catch (error: any) {
    adkLogger.error("Error sending message to Backend AI Gateway", {
      message: error?.message,
      status: error?.response?.status,
      responseData: error?.response?.data,
      userId: session.userId,
      sessionId: session.sessionId,
    });
    return null;
  }
}


