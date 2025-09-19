import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { adkLogger } from "../app/logs/logger";

dotenv.config({ path: "../../.env" });
import crypto from "crypto";

export const backendBaseUrl: string = process.env.BACKEND_BASE_URL || "http://backend:4343/api/v1";
const serviceEmail: string = process.env.SERVICE_ACCOUNT_LOGIN || "service@example.com";
const servicePassword: string = process.env.SERVICE_ACCOUNT_PASSWORD || "secret";

export const backendClient: AxiosInstance = axios.create({
  baseURL: backendBaseUrl,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let jwtToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function loginServiceAccount(): Promise<void> {
  try {
    adkLogger.info("Logging in service account to backend", { serviceEmail });
    const response = await backendClient.post("/auth/email/login", {
      email: serviceEmail,
      password: servicePassword,
    });
    const token = response?.data?.token as string | undefined;
    if (!token) throw new Error("Login response missing token");
    jwtToken = token;
    const now = Math.floor(Date.now() / 1000);
    tokenExpiresAt = now + 55 * 60;
  } catch (error: any) {
    adkLogger.error("Service account login failed", { message: error?.message, status: error?.response?.status });
    throw error;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const now = Math.floor(Date.now() / 1000);
  if (!jwtToken || !tokenExpiresAt || now >= tokenExpiresAt) {
    await loginServiceAccount();
  }
  return { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` };
}

export interface UserSession {
  userId: string;
  sessionId: string;
  userName: string;
  lastMessageTime: number;
  totalMessages: number;
}

export const SESSIONS_FILE = "user_sessions.json";
export let userSessions = new Map<number, UserSession>();

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

export function saveUserSessions(): void {
  try {
    const sessionsObj = Object.fromEntries(userSessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2));
    adkLogger.info("User sessions saved", { userCount: userSessions.size });
  } catch (error: any) {
    adkLogger.error("Error saving user sessions", { message: error?.message });
  }
}

function generateSessionId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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

export async function sendMessageToAdk(session: UserSession, message: string): Promise<string | null> {
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

    const headers = await getAuthHeaders();
    const response = await backendClient.post("/ai-gateway", payload, { headers });
    const data = response?.data;
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
    if (error?.response?.status === 401) {
      try {
        jwtToken = null;
        tokenExpiresAt = null;
        const headers = await getAuthHeaders();
        const retryResponse = await backendClient.post("/ai-gateway", {
          text: message,
          userId: session.userId,
          sessionId: session.sessionId,
        }, { headers });
        const retryData = retryResponse?.data;
        const retryText: string | undefined = retryData?.response;
        if (typeof retryText === "string" && retryText.length > 0) return retryText;
      } catch (e: any) {
        adkLogger.error("Retry after re-auth failed", { message: e?.message, status: e?.response?.status });
      }
    }
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

// ADK connectivity helpers removed: now using Backend AI Gateway
