import { mainLogger } from "../../app/logs/logger";
import { AppError, ERROR_CODES } from "../utils/error.utils";

/**
 * Base service class with common functionality
 */
export abstract class BaseService {
  protected readonly logger = mainLogger;
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Logs service initialization
   */
  protected logInitialization(): void {
    this.logger.info(`${this.serviceName} initialized`);
  }

  /**
   * Logs service error with context
   * @param message - Error message
   * @param error - Error object
   * @param context - Additional context
   */
  protected logError(message: string, error: unknown, context?: Record<string, any>): void {
    this.logger.error(`${this.serviceName}: ${message}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }

  /**
   * Logs service warning with context
   * @param message - Warning message
   * @param context - Additional context
   */
  protected logWarning(message: string, context?: Record<string, any>): void {
    this.logger.warn(`${this.serviceName}: ${message}`, context);
  }

  /**
   * Logs service info with context
   * @param message - Info message
   * @param context - Additional context
   */
  protected logInfo(message: string, context?: Record<string, any>): void {
    this.logger.info(`${this.serviceName}: ${message}`, context);
  }

  /**
   * Creates a standardized error
   * @param message - Error message
   * @param code - Error code
   * @param context - Additional context
   * @returns AppError instance
   */
  protected createError(message: string, code: string = ERROR_CODES.SYSTEM_ERROR, context?: Record<string, any>): AppError {
    const error = new AppError(message, code);
    if (context) {
      (error as any).context = context;
    }
    return error;
  }

  /**
   * Handles async operations with error logging
   * @param operation - Async operation to execute
   * @param operationName - Name of the operation for logging
   * @param context - Additional context
   * @returns Promise with result or null
   */
  protected async safeExecute<T>(operation: () => Promise<T>, operationName: string, context?: Record<string, any>): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.logError(`Failed to execute ${operationName}`, error, context);
      return null;
    }
  }

  /**
   * Validates required parameters
   * @param params - Parameters to validate
   * @param requiredFields - Required field names
   * @throws AppError if validation fails
   */
  protected validateRequired(params: Record<string, any>, requiredFields: string[]): void {
    const missing = requiredFields.filter(field => !params[field]);
    if (missing.length > 0) {
      throw this.createError(`Missing required parameters: ${missing.join(", ")}`, ERROR_CODES.VALIDATION_ERROR, { missing, provided: Object.keys(params) });
    }
  }
}
