import { makeAuthenticatedRequest } from './auth-service';
import { adkLogger } from '../app/logs/logger';

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  adkSessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  type: string;
  direction: string;
  messageDate: string;
  isBot: boolean;
  session: {
    id: string;
    title: string;
  };
}

export interface SendMessageResponse {
  message: ChatMessage;
  aiResponse?: {
    message: ChatMessage;
    aiResult: any;
  };
}

export class ChatService {
  /**
   * Создать новую сессию чата
   */
  async createSession(userId: string, title: string, metadata?: Record<string, any>): Promise<ChatSession | null> {
    try {
      adkLogger.info('Creating new chat session', { userId, title });

      const payload = {
        title,
        userId,
        metadata: {
          source: 'telegram',
          ...metadata,
        },
      };

      const response = await makeAuthenticatedRequest<ChatSession>('POST', '/chat/sessions', { data: payload });
      
      adkLogger.info('Chat session created successfully', { 
        sessionId: response.id, 
        userId: response.userId 
      });
      
      return response;
    } catch (error: any) {
      adkLogger.error('Failed to create chat session', {
        message: error?.message,
        status: error?.response?.status,
        userId,
        title,
      });
      return null;
    }
  }

  /**
   * Получить сессию по ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const response = await makeAuthenticatedRequest<ChatSession>('GET', `/chat/sessions/${sessionId}`);
      return response;
    } catch (error: any) {
      adkLogger.error('Failed to get chat session', {
        message: error?.message,
        status: error?.response?.status,
        sessionId,
      });
      return null;
    }
  }

  /**
   * Получить все сессии пользователя
   */
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      const response = await makeAuthenticatedRequest<ChatSession[]>('GET', `/chat/sessions?userId=${userId}`);
      return response;
    } catch (error: any) {
      adkLogger.error('Failed to get user sessions', {
        message: error?.message,
        status: error?.response?.status,
        userId,
      });
      return [];
    }
  }

  /**
   * Отправить сообщение в сессию
   */
  async sendMessage(
    sessionId: string, 
    text: string, 
    metadata?: Record<string, any>
  ): Promise<SendMessageResponse | null> {
    try {
      adkLogger.info('Sending message to chat session', { 
        sessionId, 
        textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '') 
      });

      const payload = {
        sessionId,
        text,
        type: 'text',
        direction: 'incoming',
        isBot: false,
        metadata: {
          source: 'telegram',
          ...metadata,
        },
      };

      const response = await makeAuthenticatedRequest<SendMessageResponse>('POST', '/chat/messages', { data: payload });
      
      adkLogger.info('Message sent successfully', { 
        sessionId, 
        messageId: response.message.id,
        hasAiResponse: !!response.aiResponse
      });
      
      return response;
    } catch (error: any) {
      adkLogger.error('Failed to send message', {
        message: error?.message,
        status: error?.response?.status,
        sessionId,
        textPreview: text.substring(0, 50),
      });
      return null;
    }
  }

  /**
   * Получить историю сообщений сессии
   */
  async getSessionMessages(sessionId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const response = await makeAuthenticatedRequest<ChatMessage[]>(
        'GET', 
        `/chat/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error: any) {
      adkLogger.error('Failed to get session messages', {
        message: error?.message,
        status: error?.response?.status,
        sessionId,
      });
      return [];
    }
  }

  /**
   * Удалить сессию
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await makeAuthenticatedRequest('DELETE', `/chat/sessions/${sessionId}`);
      adkLogger.info('Session deleted successfully', { sessionId });
      return true;
    } catch (error: any) {
      adkLogger.error('Failed to delete session', {
        message: error?.message,
        status: error?.response?.status,
        sessionId,
      });
      return false;
    }
  }
}
