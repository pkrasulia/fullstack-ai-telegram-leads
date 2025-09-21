/**
 * Chat session interface
 */
export interface ChatSession {
  /** Session ID */
  id: string;
  /** Session title */
  title: string;
  /** User ID */
  userId: string;
  /** ADK session ID */
  adkSessionId: string;
  /** Creation date */
  createdAt: string;
  /** Last update date */
  updatedAt: string;
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  /** Message ID */
  id: string;
  /** Message text */
  text: string;
  /** Message type */
  type: string;
  /** Message direction */
  direction: string;
  /** Message date */
  messageDate: string;
  /** Is bot message */
  isBot: boolean;
  /** Session information */
  session: {
    id: string;
    title: string;
  };
}

/**
 * AI response interface
 */
export interface AIResponse {
  /** AI response message */
  message: ChatMessage;
  /** AI result data */
  aiResult: any;
}

/**
 * Send message response interface
 */
export interface SendMessageResponse {
  /** User message */
  message: ChatMessage;
  /** AI response (optional) */
  aiResponse?: AIResponse;
}

/**
 * Session metadata interface
 */
export interface SessionMetadata {
  /** Source of the session */
  source?: string;
  /** Additional metadata */
  [key: string]: any;
}

/**
 * Message metadata interface
 */
export interface MessageMetadata {
  /** Source of the message */
  source?: string;
  /** Additional metadata */
  [key: string]: any;
}
