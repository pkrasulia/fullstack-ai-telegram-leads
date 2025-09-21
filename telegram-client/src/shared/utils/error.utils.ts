/**
 * Error utility functions
 */

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string = "APP_ERROR", statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes for different types of errors
 */
export const ERROR_CODES = {
  // Configuration errors
  INVALID_CONFIG: "INVALID_CONFIG",
  MISSING_CONFIG: "MISSING_CONFIG",

  // Authentication errors
  AUTH_FAILED: "AUTH_FAILED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Telegram errors
  TELEGRAM_ERROR: "TELEGRAM_ERROR",
  INVALID_BOT_TOKEN: "INVALID_BOT_TOKEN",
  MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED",

  // Backend errors
  BACKEND_ERROR: "BACKEND_ERROR",
  BACKEND_UNAVAILABLE: "BACKEND_UNAVAILABLE",
  SESSION_CREATION_FAILED: "SESSION_CREATION_FAILED",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // System errors
  SYSTEM_ERROR: "SYSTEM_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Creates a standardized error object
 * @param message - Error message
 * @param code - Error code
 * @param statusCode - HTTP status code
 * @param details - Additional error details
 * @returns Error object
 */
export function createError(message: string, code: string = ERROR_CODES.UNKNOWN_ERROR, statusCode: number = 500, details?: any): AppError {
  const error = new AppError(message, code, statusCode);
  if (details) {
    (error as any).details = details;
  }
  return error;
}

/**
 * Checks if an error is operational (expected) or programming error
 * @param error - Error to check
 * @returns True if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extracts error message from various error types
 * @param error - Error to extract message from
 * @returns Error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * Extracts error code from various error types
 * @param error - Error to extract code from
 * @returns Error code or default
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Wraps an async function with error handling
 * @param fn - Async function to wrap
 * @param errorMessage - Custom error message
 * @returns Wrapped function
 */
export function withErrorHandling<T extends any[], R>(fn: (...args: T) => Promise<R>, errorMessage?: string) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = errorMessage || getErrorMessage(error);
      const code = getErrorCode(error);
      throw createError(message, code);
    }
  };
}

/**
 * Retries a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise with result or throws error
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: delay = baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
