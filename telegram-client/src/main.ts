import dotenv from "dotenv";
import { Message } from "node-telegram-bot-api";
import { checkAdkConnection, getOrCreateUserSession, loadUserSessions, saveUserSessions, sendMessageToAdk } from "services/adk-service";
import { TelegramService } from "./services/telegram-service";
import { MessageStorageService, MessageDirection } from "./services/message-storage-service";
import { mainLogger } from "./app/logs/logger";

dotenv.config({ path: "../../.env" });

const token: string = process.env.TELEGRAM_BOT_TOKEN || "7859566653:AAG8JfRotqlK5FldOYMZm9X6MQG48r_2GGw";
const adkBaseUrl: string = process.env.ADK_BASE_URL || "http://agent:8000";
const appName: string = process.env.ADK_APP_NAME || "telegram-assistant";

mainLogger.info("Telegram assistant started with ADK integration");
mainLogger.info("Configuration check:");
mainLogger.info(`- Telegram Bot Token: ${token.length > 10 ? "Configured" : "Missing"}`);
mainLogger.info(`- ADK Base URL: ${adkBaseUrl}`);
mainLogger.info(`- App Name: ${appName}`);

// Проверяем валидность токена
if (!token || token === "YOUR_BOT_TOKEN_HERE") {
  mainLogger.error("ERROR: Telegram Bot Token not found in .env file");
  process.exit(1);
}

const telegramService = new TelegramService(token);
const messageStorageService = new MessageStorageService();

// Настройки
let assistantEnabled = true;
const SESSIONS_FILE = "user_sessions.json";

// Интерфейс для хранения сессий пользователей
interface UserSession {
  userId: string;
  sessionId: string;
  userName: string;
  lastMessageTime: number;
  totalMessages: number;
}

// Хранение сессий пользователей
const userSessions = new Map<number, UserSession>();

// Fallback response when ADK is unavailable
function getFallbackResponse(): string {
  const responses = ["Service temporarily unavailable. Please try again.", "Connection error. Retrying...", "Technical issues detected. Please retry your request."];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Business connection handler
telegramService.onBusinessConnection((connection: any) => {
  mainLogger.info("Business account connection", {
    user: connection.user.first_name,
    connectionId: connection.id,
  });
});

// Главная логика// Обработчик business сообщений
telegramService.onBusinessMessage(async (msg: any) => {
  if (!assistantEnabled) return;

  const chatId = msg.chat.id;
  const messageText = msg.text || "";
  const businessConnectionId = msg.business_connection_id;

  // Сохраняем сообщение в базу данных
  await messageStorageService.saveIncomingMessage(msg, true, businessConnectionId);

  mainLogger.info("Business message received", {
    chatId,
    messageText: messageText.substring(0, 100),
    userName: msg.from?.first_name || "Unknown",
    businessConnectionId
  });

  // Проверяем, является ли сообщение командой
  if (messageText.startsWith('/')) {
    mainLogger.info("Business message is a command, processing separately", { command: messageText });
    return; // Команды не отправляем в ADK
  }

  try {
    // Получаем или создаем сессию
    const userName = msg.from?.first_name || "Unknown";
    const session = await getOrCreateUserSession(chatId, userName);
    if (!session) {
      mainLogger.error("Failed to get user session", { chatId, userName });
      await telegramService.sendMessage(chatId, getFallbackResponse(), businessConnectionId);
      return;
    }

    // Отправляем сообщение в ADK
    const adkResponse = await sendMessageToAdk(session, messageText);

    let responseText: string;
    if (adkResponse) {
      responseText = adkResponse;
      session.totalMessages++;
    } else {
      responseText = getFallbackResponse();
    }

    // Отправляем ответ с эмуляцией печати
    await telegramService.sendMessageWithTyping(chatId, responseText, businessConnectionId);

    mainLogger.info("Response sent", { userName, chatId, responseLength: responseText.length });

    // Сохраняем сессии
    saveUserSessions();
  } catch (error: any) {
    mainLogger.error("Critical error in main logic", {
      message: error?.message,
      stack: error?.stack,
      chatId,
      userName: msg.from?.first_name || "Unknown",
    });

    const fallbackResponse = getFallbackResponse();
    await telegramService.sendMessage(chatId, fallbackResponse, businessConnectionId);
  }
});

// Обработка обычных сообщений (не business)
telegramService.onMessage(async (msg: Message) => {
  if (!assistantEnabled || !msg.text) return;

  const chatId = msg.chat.id;
  const messageText = msg.text;
  const userName = msg.from?.first_name || "user";

  // Сохраняем сообщение в базу данных
  await messageStorageService.saveIncomingMessage(msg, false);

  mainLogger.info("Regular message received", {
    userName,
    chatId,
    messageText: messageText.substring(0, 100) + (messageText.length > 100 ? "..." : ""),
  });

  try {
    // Получаем или создаем сессию
    const session = await getOrCreateUserSession(chatId, userName);
    if (!session) {
      await telegramService.sendMessage(chatId, getFallbackResponse());
      return;
    }

    // Отправляем сообщение в ADK
    const adkResponse = await sendMessageToAdk(session, messageText);

    let responseText: string;
    if (adkResponse) {
      responseText = adkResponse;
      session.totalMessages++;
    } else {
      responseText = getFallbackResponse();
    }

    // Эмуляция печати для обычных сообщений
    await telegramService.simulateTyping(chatId, undefined, responseText);
    await telegramService.sendMessage(chatId, responseText);

    mainLogger.info("Response sent", { userName, chatId, responseLength: responseText.length });
    saveUserSessions();
  } catch (error: any) {
    mainLogger.error("Error processing regular message", {
      message: error?.message,
      chatId,
      userName,
    });
    await telegramService.sendMessage(chatId, getFallbackResponse());
  }
});

// Команды управления
telegramService.onCommand(/\/start/, (msg: Message) => {
  const helpMessage = `
🤖 **Telegram Assistant (ADK + History)**

🔗 **Подключения:**
- Google Agent Development Kit
- Telegram Business API
- Анализ истории переписки

📊 **Статус:** ${assistantEnabled ? "🟢 Активен" : "🔴 Неактивен"}
👥 **Активных сессий:** ${userSessions.size}

⚙️ **Основные команды:**
/on - включить ассистента
/off - выключить ассистента  
/status - показать статус и статистику
/sessions - информация о сессии

📚 **Работа с историей:**
/print_history - вывести историю чата в консоль (простой)
/history - базовый анализ истории переписки
/advanced_history - продвинутый анализ с захватом в реальном времени
/export_leads - экспорт найденных лидов
/export_advanced_leads - детальный экспорт с оценкой качества лидов

🛠 **Управление данными:**
/clear - очистить все сессии
/save - принудительно сохранить сессии

🔧 **Настройки окружения:**
- ADK URL: ${adkBaseUrl}
- App Name: ${appName}

💡 **Возможности анализа истории:**
- Автоматический поиск контактов (email, телефоны)
- Выявление потенциальных лидов
- Статистика по типам сообщений
- Экспорт данных в CSV формат
    `;

  telegramService.sendMessage(msg.chat.id, helpMessage);
});

telegramService.onCommand(/\/sessions/, (msg: Message) => {
  const chatId = msg.chat.id;
  const userSession = userSessions.get(chatId);

  if (!userSession) {
    telegramService.sendMessage(chatId, "No active session found. Send any message to create one.");
    return;
  }

  const sessionInfo = `
Session Information:

Name: ${userSession.userName}
User ID: ${userSession.userId}
Session ID: ${userSession.sessionId}
Messages: ${userSession.totalMessages}
Last activity: ${new Date(userSession.lastMessageTime).toLocaleString("en-US")}

ADK App: ${appName}
ADK URL: ${adkBaseUrl}
  `;

  telegramService.sendMessage(chatId, sessionInfo);
});

telegramService.onCommand(/\/save/, (msg: Message) => {
  saveUserSessions();
  telegramService.sendMessage(msg.chat.id, "Sessions force saved successfully.");
});

telegramService.onCommand(/\/on/, (msg: Message) => {
  assistantEnabled = true;
  telegramService.sendMessage(msg.chat.id, "AI assistant ENABLED. Ready to work with ADK.");
});

telegramService.onCommand(/\/off/, (msg: Message) => {
  assistantEnabled = false;
  telegramService.sendMessage(msg.chat.id, "AI assistant DISABLED");
});

telegramService.onCommand(/\/status/, (msg: Message) => {
  const status = assistantEnabled ? "ACTIVE" : "INACTIVE";
  const activeSessions = userSessions.size;
  const totalMessages = Array.from(userSessions.values()).reduce((sum, session) => sum + session.totalMessages, 0);

  telegramService.sendMessage(
    msg.chat.id,
    `
Telegram Assistant Status (ADK):

State: ${status}
Active sessions: ${activeSessions}
Total messages: ${totalMessages}
ADK URL: ${adkBaseUrl}
App Name: ${appName}
Sessions file: ${SESSIONS_FILE}
Started: ${new Date().toLocaleString("en-US")}

Send any message to test functionality
    `,
  );
});

telegramService.onCommand(/\/clear/, (msg: Message) => {
  const clearedCount = userSessions.size;
  userSessions.clear();
  saveUserSessions();
  telegramService.sendMessage(msg.chat.id, `Cleared ${clearedCount} sessions`);
});

// Удалены команды работы с историей - заменены на сохранение в БД

// Обработчик завершения работы
process.on('SIGINT', () => {
  mainLogger.info("Telegram assistant shutting down...");
  mainLogger.info("Saving sessions...");
  saveUserSessions();
  telegramService.stopPolling();
  mainLogger.info("All data saved. Goodbye!");
  process.exit(0);
});

// Обработчик ошибок
process.on('uncaughtException', (error) => {
  mainLogger.error("Uncaught Exception", { 
    message: error.message, 
    stack: error.stack 
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  mainLogger.error("Unhandled Rejection", { 
    reason: reason, 
    promise: promise 
  });
});

// Запуск проверки подключения к ADK
(async () => {
  try {
    await checkAdkConnection();
    mainLogger.info("✅ ADK connection successful");
  } catch (error) {
    mainLogger.warn("⚠️ ADK connection failed - using fallback responses");
  }
  
  // Загружаем сессии пользователей
  loadUserSessions();
  mainLogger.info(`📱 Telegram assistant is ready! Loaded ${userSessions.size} user sessions`);
})();

// Периодическое сохранение сессий
setInterval(
  () => {
    saveUserSessions();
  },
  5 * 60 * 1000,
); // Каждые 5 минут

// Периодическая очистка старых сессий
setInterval(
  () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 дня
    let removedCount = 0;

    for (const [chatId, session] of userSessions.entries()) {
      if (session.lastMessageTime < threeDaysAgo) {
        userSessions.delete(chatId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      mainLogger.info("Session cleanup completed", {
        removedCount,
        activeCount: userSessions.size,
      });
      saveUserSessions();
    }
  },
  60 * 60 * 1000,
); // Каждый час

// Удалены команды экспорта - заменены на сохранение в БД

// Периодическое сохранение сессий
setInterval(
  () => {
    saveUserSessions();
  },
  5 * 60 * 1000,
); // Каждые 5 минут

// Периодическая очистка старых сессий
setInterval(
  () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 дня
    let removedCount = 0;

    for (const [chatId, session] of userSessions.entries()) {
      if (session.lastMessageTime < threeDaysAgo) {
        userSessions.delete(chatId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      mainLogger.info("Session cleanup completed", {
        removedCount,
        activeCount: userSessions.size,
      });
      saveUserSessions();
    }
  },
  60 * 60 * 1000,
); // Каждый час

loadUserSessions();
checkAdkConnection();

// Graceful shutdown с сохранением сессий
process.on("SIGINT", () => {
  mainLogger.info("Telegram assistant (ADK) shutting down...");
  mainLogger.info("Saving sessions...");
  saveUserSessions();
  telegramService.stopPolling();
  mainLogger.info("All data saved. Goodbye!");
  process.exit(0);
});
