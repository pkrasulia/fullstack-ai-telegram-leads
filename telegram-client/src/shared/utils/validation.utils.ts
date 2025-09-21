/**
 * Validation utility functions
 */

/**
 * Validates if a string is a valid email
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string is a valid bot token
 * @param token - Bot token to validate
 * @returns True if token is valid
 */
export function isValidBotToken(token: string): boolean {
  // Telegram bot tokens typically have format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
  const tokenRegex = /^\d{8,10}:[A-Za-z0-9_-]{35}$/;
  return tokenRegex.test(token);
}

/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns True if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a number is a valid chat ID
 * @param chatId - Chat ID to validate
 * @returns True if chat ID is valid
 */
export function isValidChatId(chatId: number): boolean {
  return Number.isInteger(chatId) && chatId !== 0;
}

/**
 * Validates if a string is not empty and not just whitespace
 * @param str - String to validate
 * @returns True if string is valid
 */
export function isValidNonEmptyString(str: string): boolean {
  return typeof str === "string" && str.trim().length > 0;
}

/**
 * Validates if a value is a positive integer
 * @param value - Value to validate
 * @returns True if value is a positive integer
 */
export function isValidPositiveInteger(value: any): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validates if a value is a non-negative integer
 * @param value - Value to validate
 * @returns True if value is a non-negative integer
 */
export function isValidNonNegativeInteger(value: any): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Validates if a value is within a specified range
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates configuration object
 * @param config - Configuration object to validate
 * @returns Validation result with errors
 */
export function validateConfig(config: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.botToken || !isValidBotToken(config.botToken)) {
    errors.push("Invalid or missing bot token");
  }

  if (!config.backendBaseUrl || !isValidUrl(config.backendBaseUrl)) {
    errors.push("Invalid or missing backend base URL");
  }

  if (!config.serviceAccountLogin || !isValidEmail(config.serviceAccountLogin)) {
    errors.push("Invalid or missing service account email");
  }

  if (!config.serviceAccountPassword || !isValidNonEmptyString(config.serviceAccountPassword)) {
    errors.push("Invalid or missing service account password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
