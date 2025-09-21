/**
 * Time utility functions
 */

/**
 * Converts milliseconds to seconds
 * @param ms - Milliseconds
 * @returns Seconds
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/**
 * Converts seconds to milliseconds
 * @param seconds - Seconds
 * @returns Milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Gets current timestamp in seconds
 * @returns Current timestamp in seconds
 */
export function getCurrentTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Gets current timestamp in milliseconds
 * @returns Current timestamp in milliseconds
 */
export function getCurrentTimestampMs(): number {
  return Date.now();
}

/**
 * Calculates typing delay based on text length
 * @param text - The text to calculate delay for
 * @param msPerChar - Milliseconds per character
 * @param minDelay - Minimum delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Calculated delay in milliseconds
 */
export function calculateTypingDelay(text: string, msPerChar: number = 30, minDelay: number = 1000, maxDelay: number = 5000): number {
  const calculatedDelay = text.length * msPerChar;
  return Math.min(Math.max(calculatedDelay, minDelay), maxDelay);
}

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Timestamp in milliseconds
 * @param locale - Locale string (default: "en-US")
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number, locale: string = "en-US"): string {
  return new Date(timestamp).toLocaleString(locale);
}

/**
 * Checks if a timestamp is older than specified days
 * @param timestamp - Timestamp to check
 * @param days - Number of days
 * @returns True if timestamp is older than specified days
 */
export function isOlderThanDays(timestamp: number, days: number): boolean {
  const daysInMs = days * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp > daysInMs;
}

/**
 * Gets a timestamp from specified days ago
 * @param days - Number of days ago
 * @returns Timestamp from specified days ago
 */
export function getTimestampDaysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

/**
 * Sleeps for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
