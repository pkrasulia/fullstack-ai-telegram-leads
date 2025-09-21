/**
 * String utility functions
 */

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - Maximum length of the string
 * @param ellipsis - Ellipsis character(s) to append
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number, ellipsis: string = "..."): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a user name from first and last name
 * @param firstName - First name
 * @param lastName - Last name (optional)
 * @returns Formatted full name
 */
export function formatUserName(firstName?: string, lastName?: string): string {
  if (!firstName) return "Unknown User";
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
}

/**
 * Extracts a preview of text for logging purposes
 * @param text - The text to preview
 * @param maxLength - Maximum length of preview
 * @returns Text preview
 */
export function getTextPreview(text: string, maxLength: number = 100): string {
  return truncateString(text, maxLength);
}

/**
 * Checks if a string is a command (starts with /)
 * @param text - The text to check
 * @returns True if the text is a command
 */
export function isCommand(text: string): boolean {
  return text.startsWith("/");
}

/**
 * Extracts command name from command text
 * @param commandText - The command text (e.g., "/start")
 * @returns Command name without the slash
 */
export function extractCommandName(commandText: string): string {
  return commandText.replace(/^\//, "").split(" ")[0];
}

/**
 * Sanitizes text for logging (removes sensitive information)
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeForLogging(text: string): string {
  // Remove potential sensitive information
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CARD]")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]");
}
