import dotenv from "dotenv";

// Load environment variables from .env.telegram file
dotenv.config({ path: "../../.env.telegram" });

/**
 * Configuration interface for Telegram client
 */
export interface TelegramConfig {
  // Telegram Bot Configuration
  botToken: string;

  // Backend API Configuration
  backendBaseUrl: string;
  backendUrl: string;

  // Service Account Authentication
  serviceAccountLogin: string;
  serviceAccountPassword: string;

  // Session Management
  sessionCleanupIntervalHours: number;
  sessionExpiryDays: number;
  sessionSaveIntervalMinutes: number;

  // Telegram Bot Settings
  pollingIntervalMs: number;
  typingDelayMsPerChar: number;
  minTypingDelayMs: number;
  maxTypingDelayMs: number;
  sentenceDelayMs: number;

  // Logging Configuration
  logLevel: string;
  logFileMaxSize: string;
  logFileMaxFiles: number;

  // Application Settings
  assistantEnabledByDefault: boolean;
  fallbackResponsesEnabled: boolean;
  healthCheckTimeoutMs: number;
  requestTimeoutMs: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: TelegramConfig = {
  botToken: "YOUR_BOT_TOKEN_HERE",
  backendBaseUrl: "http://backend:4343/api/v1",
  backendUrl: "http://backend:4343",
  serviceAccountLogin: "service@example.com",
  serviceAccountPassword: "secret",
  sessionCleanupIntervalHours: 1,
  sessionExpiryDays: 3,
  sessionSaveIntervalMinutes: 5,
  pollingIntervalMs: 300,
  typingDelayMsPerChar: 30,
  minTypingDelayMs: 1000,
  maxTypingDelayMs: 5000,
  sentenceDelayMs: 800,
  logLevel: "info",
  logFileMaxSize: "10MB",
  logFileMaxFiles: 5,
  assistantEnabledByDefault: true,
  fallbackResponsesEnabled: true,
  healthCheckTimeoutMs: 5000,
  requestTimeoutMs: 20000,
};

/**
 * Load configuration from environment variables with fallback to defaults
 */
export function loadTelegramConfig(): TelegramConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || DEFAULT_CONFIG.botToken,
    backendBaseUrl: process.env.BACKEND_BASE_URL || DEFAULT_CONFIG.backendBaseUrl,
    backendUrl: process.env.BACKEND_URL || DEFAULT_CONFIG.backendUrl,
    serviceAccountLogin: process.env.SERVICE_ACCOUNT_LOGIN || DEFAULT_CONFIG.serviceAccountLogin,
    serviceAccountPassword: process.env.SERVICE_ACCOUNT_PASSWORD || DEFAULT_CONFIG.serviceAccountPassword,
    sessionCleanupIntervalHours: parseInt(process.env.SESSION_CLEANUP_INTERVAL_HOURS || DEFAULT_CONFIG.sessionCleanupIntervalHours.toString()),
    sessionExpiryDays: parseInt(process.env.SESSION_EXPIRY_DAYS || DEFAULT_CONFIG.sessionExpiryDays.toString()),
    sessionSaveIntervalMinutes: parseInt(process.env.SESSION_SAVE_INTERVAL_MINUTES || DEFAULT_CONFIG.sessionSaveIntervalMinutes.toString()),
    pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || DEFAULT_CONFIG.pollingIntervalMs.toString()),
    typingDelayMsPerChar: parseInt(process.env.TYPING_DELAY_MS_PER_CHAR || DEFAULT_CONFIG.typingDelayMsPerChar.toString()),
    minTypingDelayMs: parseInt(process.env.MIN_TYPING_DELAY_MS || DEFAULT_CONFIG.minTypingDelayMs.toString()),
    maxTypingDelayMs: parseInt(process.env.MAX_TYPING_DELAY_MS || DEFAULT_CONFIG.maxTypingDelayMs.toString()),
    sentenceDelayMs: parseInt(process.env.SENTENCE_DELAY_MS || DEFAULT_CONFIG.sentenceDelayMs.toString()),
    logLevel: process.env.LOG_LEVEL || DEFAULT_CONFIG.logLevel,
    logFileMaxSize: process.env.LOG_FILE_MAX_SIZE || DEFAULT_CONFIG.logFileMaxSize,
    logFileMaxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || DEFAULT_CONFIG.logFileMaxFiles.toString()),
    assistantEnabledByDefault: process.env.ASSISTANT_ENABLED_BY_DEFAULT === "true" || DEFAULT_CONFIG.assistantEnabledByDefault,
    fallbackResponsesEnabled: process.env.FALLBACK_RESPONSES_ENABLED === "true" || DEFAULT_CONFIG.fallbackResponsesEnabled,
    healthCheckTimeoutMs: parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || DEFAULT_CONFIG.healthCheckTimeoutMs.toString()),
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || DEFAULT_CONFIG.requestTimeoutMs.toString()),
  };
}

/**
 * Validate configuration and throw error if invalid
 */
export function validateConfig(config: TelegramConfig): void {
  if (!config.botToken || config.botToken === "YOUR_BOT_TOKEN_HERE") {
    throw new Error("TELEGRAM_BOT_TOKEN is required and must be set to a valid bot token");
  }

  if (!config.backendBaseUrl) {
    throw new Error("BACKEND_BASE_URL is required");
  }

  if (!config.serviceAccountLogin || !config.serviceAccountPassword) {
    throw new Error("SERVICE_ACCOUNT_LOGIN and SERVICE_ACCOUNT_PASSWORD are required");
  }
}

// Export singleton config instance
export const telegramConfig = loadTelegramConfig();
validateConfig(telegramConfig);
