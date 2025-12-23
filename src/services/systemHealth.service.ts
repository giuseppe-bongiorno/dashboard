import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';

/**
 * Container Health Information
 */
export interface ContainerHealth {
  name: string;
  image: string;
  status: string;
  cpuPercent: number;
  memoryUsage: number;
  memoryLimit: number;
  netIO: string;
  blockIO: string;
  restartCount: number;
}

/**
 * System Health Response
 */
export interface SystemHealthResponse {
  data: ContainerHealth[];
  success: boolean;
  count: number;
}

export const systemHealthService = {
  /**
   * Get system health status (Docker containers)
   * Maps to: GET /api/admin/system-health
   * ADMIN only endpoint
   */
  getSystemHealth: async (): Promise<ApiResponse<ContainerHealth[]>> => {
    return apiRequest<ContainerHealth[]>(async () => {
      const response = await apiClient.get<SystemHealthResponse>('/api/admin/system-health');
      
      // Return the data array from the response
      return {
        data: response.data.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: response.config
      };
    });
  },
};

export default systemHealthService;