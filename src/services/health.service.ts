import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  responseTime?: number; // Added for frontend tracking
  services?: {
    database?: { status: string; responseTime?: number };
    redis?: { status: string; responseTime?: number };
    email?: { status: string; responseTime?: number };
  };
  version?: string;
  uptime?: number;
  memory?: {
    total: number;
    used: number;
    free: number;
  };
}

export const healthService = {
  /**
   * Check backend health status
   */
  checkHealth: async (): Promise<ApiResponse<HealthStatus>> => {
    return apiRequest<HealthStatus>(async () => {
      const startTime = Date.now();
      const response = await apiClient.get('/auth/health');
      const responseTime = Date.now() - startTime;
      
      return {
        data: {
          ...response.data,
          responseTime,
        }
      };
    });
  },

  /**
   * Check if service is reachable
   */
  ping: async (): Promise<{ reachable: boolean; responseTime: number }> => {
    const startTime = Date.now();
    try {
      await apiClient.get('/auth/health', { timeout: 5000 });
      return {
        reachable: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        reachable: false,
        responseTime: Date.now() - startTime,
      };
    }
  },
};

export default healthService;