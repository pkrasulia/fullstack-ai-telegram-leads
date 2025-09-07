import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { adkLogger } from "../app/logs/logger";

dotenv.config({ path: "../../.env" });

export const adkBaseUrl: string = process.env.ADK_BASE_URL || "http://agent:8000";
export const appName: string = process.env.ADK_APP_NAME || "telegram-assistant";

export const adkClient: AxiosInstance = axios.create({
  baseURL: adkBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export async function createAdkSession(userId: string): Promise<string | null> {
  try {
    adkLogger.info("Creating new ADK session", { userId });

    const response = await adkClient.post(`/apps/${appName}/users/${userId}/sessions`);
    const sessionId = response.data.session_id || response.data.id;

    adkLogger.info("ADK session created", { userId, sessionId });
    return sessionId;
  } catch (error: any) {
    adkLogger.error("Error creating ADK session", {
      userId,
      message: error?.message,
      responseData: error?.response?.data,
    });
    return null;
  }
}

export async function getOrCreateUserSession(chatId: number, userName: string): Promise<UserSession | null> {
  if (userSessions.has(chatId)) {
    const existingSession = userSessions.get(chatId)!;
    existingSession.lastMessageTime = Date.now();
    existingSession.userName = userName;
    return existingSession;
  }

  const userId = `tg_user_${chatId}`;
  const sessionId = await createAdkSession(userId);

  if (!sessionId) {
    adkLogger.error("Failed to create session for user", { chatId, userId });
    return null;
  }

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
    adkLogger.info("Sending message to ADK", {
      userId: session.userId,
      sessionId: session.sessionId,
      messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    });

    const payload = {
      appName: appName,
      userId: session.userId,
      sessionId: session.sessionId,
      newMessage: {
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      },
      streaming: false,
    };

    adkLogger.debug("ADK payload", { payload });

    let response;

    try {
      response = await adkClient.post("/run", payload);
      adkLogger.debug("Request payload sent", { payload });
    } catch (error: any) {
      if (error?.response?.status === 404 && error?.response?.data?.detail?.includes("Session not found")) {
        adkLogger.warn("Session not found, creating new one", { userId: session.userId });
        const newSessionRes = await adkClient.post(`/apps/${appName}/users/${session.userId}/sessions`);
        session.sessionId = newSessionRes.data.session_id || newSessionRes.data.id;
        adkLogger.info("New session created", { sessionId: session.sessionId });
        payload.sessionId = session.sessionId;
        response = await adkClient.post("/run", payload);
      } else {
        throw error;
      }
    }

    const responseData = response.data;
    adkLogger.debug("ADK response received", { responseData });

    let aiResponse = "Sorry, no response received from system";

    if (Array.isArray(responseData)) {
      for (const item of responseData) {
        if (item?.content?.parts) {
          const textPart = item.content.parts.find((part: any) => part.text);
          if (textPart?.text) {
            aiResponse = textPart.text;
            break;
          }
        }
      }
    } else if (typeof responseData === "string") {
      aiResponse = responseData;
    }

    adkLogger.info("ADK response processed", {
      userId: session.userId,
      responsePreview: aiResponse.substring(0, 50) + (aiResponse.length > 50 ? "..." : ""),
    });
    return aiResponse;
  } catch (error: any) {
    adkLogger.error("Error sending message to ADK", {
      message: error?.message,
      status: error?.response?.status,
      responseData: error?.response?.data,
      userId: session.userId,
      sessionId: session.sessionId,
    });
    return null;
  }
}

export async function testAdkEndpoints(): Promise<void> {
  try {
    adkLogger.info("Testing ADK endpoints");

    const appsResponse = await adkClient.get("/list-apps");
    adkLogger.info("/list-apps endpoint working", { apps: appsResponse.data });

    if (appsResponse.data.includes(appName)) {
      try {
        const appInfoResponse = await adkClient.get(`/apps/${appName}`);
        adkLogger.info(`/apps/${appName} endpoint working`, { appInfo: appInfoResponse.data });
      } catch (error: any) {
        adkLogger.warn(`/apps/${appName} endpoint unavailable`, { status: error?.response?.status });
      }
    }

    try {
      const testUserId = "test_user_123";
      const sessionResponse = await adkClient.post(`/apps/${appName}/users/${testUserId}/sessions`);
      adkLogger.info("Session creation working", { sessionData: sessionResponse.data });

      const testSessionId = sessionResponse.data.id || sessionResponse.data.sessionId;

      if (testSessionId) {
        const testPayload = {
          appName: appName,
          userId: testUserId,
          sessionId: testSessionId,
          newMessage: {
            parts: [{ text: "Тестовое сообщение" }],
            role: "user",
          },
          streaming: false,
        };

        const runResponse = await adkClient.post("/run", testPayload);
        adkLogger.info("/run endpoint working", { runData: runResponse.data });
      }
    } catch (error: any) {
      adkLogger.error("Error testing /run endpoint", {
        message: error?.message,
        responseData: error?.response?.data,
      });
    }
  } catch (error: any) {
    adkLogger.error("Error testing endpoints", { message: error?.message });
  }
}

export async function checkAdkConnection(): Promise<void> {
  try {
    adkLogger.info("Checking ADK connection");
    const response = await adkClient.get("/list-apps");
    adkLogger.info("ADK connection working");
    adkLogger.info("Available applications", { apps: response.data });

    await testAdkEndpoints();
  } catch (error: any) {
    adkLogger.error("ADK connection error", { message: error?.message });
  }
}
