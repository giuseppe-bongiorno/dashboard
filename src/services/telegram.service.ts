
import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';
/* =========================
   Type definitions
========================= */

export interface TelegramMessage {
  id: string;
  botToken: string;
  chatId: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  telegramMessageId?: number;
  sentAt?: string;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramSendRequest {
  botToken: string;
  chatId: string;
  message: string;
}

export interface TelegramStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

/* =========================
   Telegram Service
========================= */

export const telegramService = {
  /**
   * Send telegram message
   */
  sendMessage: async (
    request: TelegramSendRequest
  ): Promise<ApiResponse<TelegramMessage>> =>
    apiRequest(() =>
      apiClient.post('/admin/telegram/send', request)
    ),

  /**
   * Get all telegram messages
   */
  getMessages: async (): Promise<ApiResponse<TelegramMessage[]>> =>
    apiRequest(() =>
      apiClient.get('/admin/telegram/messages')
    ),

  /**
   * Get telegram statistics
   */
  getStats: async (): Promise<ApiResponse<TelegramStats>> =>
    apiRequest(() =>
      apiClient.get('/admin/telegram/stats')
    ),

  /**
   * Retry failed message
   */
  retryMessage: async (id: string): Promise<ApiResponse<void>> =>
    apiRequest(() =>
      apiClient.post(`/admin/telegram/messages/${id}/retry`)
    ),

  /**
   * Delete message
   */
  deleteMessage: async (id: string): Promise<ApiResponse<void>> =>
    apiRequest(() =>
      apiClient.delete(`/admin/telegram/messages/${id}`)
    ),
};

export default telegramService;

/** MOCK: commentare sopra e udare codice sotto */
/**
import { ApiResponse } from '@/types';

interface TelegramMessage {
  id: string;
  botToken: string;
  chatId: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  telegramMessageId?: number;
  sentAt?: string;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TelegramSendRequest {
  botToken: string;
  chatId: string;
  message: string;
}

interface TelegramStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

// Mock data generator
const generateMockMessages = (): TelegramMessage[] => {
  return [
    {
      id: '1',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'cucù',
      status: 'SENT',
      telegramMessageId: 123456,
      sentAt: '2025-12-17T18:36:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-12-17T18:36:00Z',
      updatedAt: '2025-12-17T18:36:00Z',
    },
    {
      id: '2',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'ciao',
      status: 'SENT',
      telegramMessageId: 123455,
      sentAt: '2025-09-22T18:17:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-09-22T18:17:00Z',
      updatedAt: '2025-09-22T18:17:00Z',
    },
    {
      id: '3',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'Crew',
      status: 'SENT',
      telegramMessageId: 123454,
      sentAt: '2025-06-20T23:34:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T23:34:00Z',
      updatedAt: '2025-06-20T23:34:00Z',
    },
    {
      id: '4',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'Cucu',
      status: 'SENT',
      telegramMessageId: 123453,
      sentAt: '2025-06-20T17:41:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T17:41:00Z',
      updatedAt: '2025-06-20T17:41:00Z',
    },
    {
      id: '5',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'ciao tutto ok',
      status: 'SENT',
      telegramMessageId: 123452,
      sentAt: '2025-06-20T17:27:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T17:27:00Z',
      updatedAt: '2025-06-20T17:27:00Z',
    },
    {
      id: '6',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'ciao',
      status: 'SENT',
      telegramMessageId: 123451,
      sentAt: '2025-06-20T17:23:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T17:23:00Z',
      updatedAt: '2025-06-20T17:23:00Z',
    },
    {
      id: '7',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'wr',
      status: 'SENT',
      telegramMessageId: 123450,
      sentAt: '2025-06-20T16:05:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T16:05:00Z',
      updatedAt: '2025-06-20T16:05:00Z',
    },
    {
      id: '8',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'wet',
      status: 'SENT',
      telegramMessageId: 123449,
      sentAt: '2025-06-20T16:04:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T16:04:00Z',
      updatedAt: '2025-06-20T16:04:00Z',
    },
    {
      id: '9',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'dfsdf',
      status: 'SENT',
      telegramMessageId: 123448,
      sentAt: '2025-06-20T15:52:00Z',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-20T15:52:00Z',
      updatedAt: '2025-06-20T15:52:00Z',
    },
    {
      id: '10',
      botToken: '7890123456:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',
      chatId: '@familydocapp',
      message: 'Test messaggio fallito',
      status: 'FAILED',
      errorMessage: 'Bot token invalid',
      createdBy: 'admin_giuseppe',
      createdAt: '2025-06-19T14:30:00Z',
      updatedAt: '2025-06-19T14:30:00Z',
    },
  ];
};

const generateTelegramStats = (messages: TelegramMessage[]): TelegramStats => {
  return {
    total: messages.length,
    sent: messages.filter(m => m.status === 'SENT').length,
    failed: messages.filter(m => m.status === 'FAILED').length,
    pending: messages.filter(m => m.status === 'PENDING').length,
  };
};

// Mock delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Telegram Service
export const telegramService = {
 
  getMessages: async (): Promise<ApiResponse<TelegramMessage[]>> => {
    await delay(400);

    try {
      const messages = generateMockMessages();

      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch telegram messages',
          code: 'FETCH_MESSAGES_ERROR',
        },
      };
    }
  },

 
  getStats: async (): Promise<ApiResponse<TelegramStats>> => {
    await delay(200);

    try {
      const messages = generateMockMessages();
      const stats = generateTelegramStats(messages);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch statistics',
          code: 'FETCH_STATS_ERROR',
        },
      };
    }
  },

  
  sendMessage: async (request: TelegramSendRequest): Promise<ApiResponse<TelegramMessage>> => {
    await delay(800);

    try {
      // Mock success response
      const newMessage: TelegramMessage = {
        id: String(Date.now()),
        botToken: request.botToken,
        chatId: request.chatId,
        message: request.message,
        status: 'SENT',
        telegramMessageId: Math.floor(Math.random() * 1000000),
        sentAt: new Date().toISOString(),
        createdBy: 'admin_giuseppe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: newMessage,
        message: 'Messaggio inviato con successo!',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to send telegram message',
          code: 'SEND_MESSAGE_ERROR',
        },
      };
    }
  },

 
  retryMessage: async (id: string): Promise<ApiResponse<void>> => {
     void id;
    await delay(600);

    try {
      return {
        success: true,
        message: 'Messaggio reinviato con successo',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to retry message',
          code: 'RETRY_MESSAGE_ERROR',
        },
      };
    }
  },

  
  deleteMessage: async (id: string): Promise<ApiResponse<void>> => {
     void id;
    await delay(300);

    try {
      return {
        success: true,
        message: 'Messaggio eliminato con successo',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to delete message',
          code: 'DELETE_MESSAGE_ERROR',
        },
      };
    }
  },
};

export default telegramService;
*/