import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';

// Types
export interface NotificationRequest {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface SendNotificationResponse {
  message: string;
  devicesCount: number;
  userId: number;
}

export interface BadgeCountResponse {
  unreadCount: number;
  userId?: number;
}

export interface TestNotificationResponse {
  message: string;
  devicesCount: number;
}

export const notificationService = {
  /**
   * Send push notification to specific user
   * Maps to: POST /api/v1/notifications/send
   * Requires: ADMIN or DEV role
   */
  sendNotification: async (data: NotificationRequest): Promise<ApiResponse<SendNotificationResponse>> => {
    return apiRequest<SendNotificationResponse>(async () => {
      const response = await apiClient.post('/api/v1/notifications/send', data);
      return response;
    });
  },

  /**
   * Send test notification to current user
   * Maps to: POST /api/v1/notifications/send-to-me
   * @param title - Notification title (default: "Test Notifica")
   * @param body - Notification body (default: "Questa è una notifica di test")
   */
  sendTestNotification: async (
    title: string = 'Test Notifica',
    body: string = 'Questa è una notifica di test'
  ): Promise<ApiResponse<TestNotificationResponse>> => {
    return apiRequest<TestNotificationResponse>(async () => {
      const params = new URLSearchParams();
      params.append('title', title);
      params.append('body', body);
      
      const response = await apiClient.post(
        `/api/v1/notifications/send-to-me?${params.toString()}`
      );
      return response;
    });
  },

  /**
   * Get unread notifications count for current user
   * Maps to: GET /api/v1/notifications/badge
   */
  getBadgeCount: async (): Promise<ApiResponse<BadgeCountResponse>> => {
    return apiRequest<BadgeCountResponse>(async () => {
      const response = await apiClient.get('/api/v1/notifications/badge');
      return response;
    });
  },

  /**
   * Get unread notifications count for specific user
   * Maps to: GET /api/v1/notifications/user/{userId}/badge
   * Requires: ADMIN, DEV, or own userId
   */
  getBadgeCountByUserId: async (userId: number): Promise<ApiResponse<BadgeCountResponse>> => {
    return apiRequest<BadgeCountResponse>(async () => {
      const response = await apiClient.get(`/api/v1/notifications/user/${userId}/badge`);
      return response;
    });
  },
};

export default notificationService;