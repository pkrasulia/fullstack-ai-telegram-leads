#!/usr/bin/env node

/**
 * Telegram AI Assistant
 *
 * A professional Telegram bot that integrates with a backend AI service
 * to provide intelligent responses to users. Supports both regular and
 * business messages with comprehensive session management.
 *
 * @author AI Assistant
 * @version 2.0.0
 */

import { TelegramApp } from "./app/telegram-app";
import { mainLogger } from "./app/logs/logger";
import { telegramConfig } from "./config/telegram.config";
import { validateConfig } from "./shared/utils";

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    // Validate configuration
    const configValidation = validateConfig(telegramConfig);
    if (!configValidation.isValid) {
      mainLogger.error("Configuration validation failed", {
        errors: configValidation.errors,
      });
      process.exit(1);
    }

    mainLogger.info("🚀 Starting Telegram AI Assistant v2.0.0");
    mainLogger.info("Configuration validated successfully");

    // Create and start the application
    const app = new TelegramApp();
    await app.start();
  } catch (error) {
    mainLogger.error("Fatal error during application startup", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", error => {
  mainLogger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  mainLogger.error("Unhandled Rejection", {
    reason: reason,
    promise: promise,
  });
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    mainLogger.error("Application failed to start", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  });
}

export { TelegramApp };
