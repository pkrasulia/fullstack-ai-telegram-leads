import { Message } from "node-telegram-bot-api";

/**
 * User session interface for managing user state
 */
export interface UserSession {
  /** Unique user identifier */
  userId: string;
  /** Session identifier */
  sessionId: string;
  /** User display name */
  userName: string;
  /** Timestamp of last message */
  lastMessageTime: number;
  /** Total message count in session */
  totalMessages: number;
  /** Backend chat session ID */
  chatSessionId?: string;
}

/**
 * Business connection data
 */
export interface BusinessConnection {
  /** Connection ID */
  id: string;
  /** User information */
  user: {
    first_name: string;
    last_name?: string;
    username?: string;
    id: number;
  };
  /** Connection status */
  status: string;
  /** Connection date */
  date: number;
}

/**
 * Business message data
 */
export interface BusinessMessage extends Message {
  /** Business connection ID */
  business_connection_id: string;
}

/**
 * Telegram message types
 */
export enum MessageType {
  TEXT = "text",
  PHOTO = "photo",
  VIDEO = "video",
  AUDIO = "audio",
  VOICE = "voice",
  DOCUMENT = "document",
  STICKER = "sticker",
  LOCATION = "location",
  CONTACT = "contact",
  ANIMATION = "animation",
  VIDEO_NOTE = "video_note",
  OTHER = "other",
}

/**
 * Message direction
 */
export enum MessageDirection {
  INCOMING = "incoming",
  OUTGOING = "outgoing",
}

/**
 * Media information interface
 */
export interface MediaInfo {
  /** File ID */
  fileId?: string;
  /** File name */
  fileName?: string;
  /** File size in bytes */
  fileSize?: number;
  /** MIME type */
  mimeType?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Duration in seconds */
  duration?: number;
}

/**
 * Reply information interface
 */
export interface ReplyInfo {
  /** Message ID being replied to */
  messageId: string;
  /** Text of the replied message */
  text?: string;
  /** Username of the replied message author */
  fromUsername?: string;
}

/**
 * Forward information interface
 */
export interface ForwardInfo {
  /** Original chat ID */
  fromChatId?: string;
  /** Original message ID */
  fromMessageId?: string;
  /** Original username */
  fromUsername?: string;
  /** Forward date */
  date?: Date;
}

/**
 * Processed message data for storage
 */
export interface ProcessedMessage {
  /** Telegram message ID */
  telegramMessageId: string;
  /** Chat ID */
  chatId: string;
  /** User ID who sent the message */
  fromUserId?: string;
  /** Username */
  fromUsername?: string;
  /** First name */
  fromFirstName?: string;
  /** Last name */
  fromLastName?: string;
  /** Message text */
  text?: string;
  /** Message type */
  type: MessageType;
  /** Message direction */
  direction: MessageDirection;
  /** Message date */
  messageDate: string;
  /** Media information */
  mediaInfo?: MediaInfo;
  /** Reply information */
  replyTo?: ReplyInfo;
  /** Forward information */
  forwardInfo?: ForwardInfo;
  /** Is business message */
  isBusiness?: boolean;
  /** Business connection ID */
  businessConnectionId?: string;
  /** Raw message data */
  rawData?: any;
  /** Is bot message */
  isBot?: boolean;
}

/**
 * Command handler function type
 */
export type CommandHandler = (msg: Message) => void | Promise<void>;

/**
 * Message handler function type
 */
export type MessageHandler = (msg: Message) => void | Promise<void>;

/**
 * Business message handler function type
 */
export type BusinessMessageHandler = (msg: BusinessMessage) => void | Promise<void>;

/**
 * Business connection handler function type
 */
export type BusinessConnectionHandler = (connection: BusinessConnection) => void | Promise<void>;
