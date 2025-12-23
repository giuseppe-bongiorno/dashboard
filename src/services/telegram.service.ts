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
  sendMessage: (request: TelegramSendRequest): Promise<ApiResponse<TelegramMessage>> =>
    apiRequest(async () => {
      const res = await apiClient.post('/api/admin/telegram/send', request);
      return res.data;
    }),

  getMessages: (): Promise<ApiResponse<TelegramMessage[]>> =>
    apiRequest(async () => {
      const res = await apiClient.get('/api/admin/telegram/messages');

      // 🔥 NORMALIZZAZIONE QUI
      const messages =
        res.data?.data?.items ??
        res.data?.data?.messages ??
        res.data?.data ??
        [];

      return {
        success: true,
        data: messages,
      };
    }),

  getStats: (): Promise<ApiResponse<TelegramStats>> =>
    apiRequest(async () => {
      const res = await apiClient.get('/api/admin/telegram/stats');
      return res.data; // 👈 già perfetto
    }),

  retryMessage: (id: string): Promise<ApiResponse<void>> =>
    apiRequest(async () => {
      const res = await apiClient.post(`/api/admin/telegram/messages/${id}/retry`);
      return res.data;
    }),

  deleteMessage: (id: string): Promise<ApiResponse<void>> =>
    apiRequest(async () => {
      const res = await apiClient.delete(`/api/admin/telegram/messages/${id}`);
      return res.data;
    }),
};

export default telegramService;
