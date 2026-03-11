import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';
import type { DashboardStats, HealthAlert, RecentActivity, ChartDataPoint } from '@/types';

/**
 * Service per la Dashboard Admin.
 * Mappa le API del DashboardController (webutility service).
 * 
 * Base URL: /api/admin/dashboard
 */
export const dashboardService = {
  /**
   * Recupera le statistiche KPI.
   * Maps to: GET /api/admin/dashboard/stats
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<DashboardStats>(async () => {
      const response = await apiClient.get('/api/admin/dashboard/stats');
      return { data: response.data.data };
    });
  },

  /**
   * Recupera gli alert sanitari (pressione/glicemia fuori norma).
   * Maps to: GET /api/admin/dashboard/health-alerts
   */
  getHealthAlerts: async (): Promise<ApiResponse<HealthAlert[]>> => {
    return apiRequest<HealthAlert[]>(async () => {
      const response = await apiClient.get('/api/admin/dashboard/health-alerts');
      return { data: response.data.data };
    });
  },

  /**
   * Recupera le attività recenti.
   * Maps to: GET /api/admin/dashboard/recent-activity
   */
  getRecentActivity: async (): Promise<ApiResponse<RecentActivity[]>> => {
    return apiRequest<RecentActivity[]>(async () => {
      const response = await apiClient.get('/api/admin/dashboard/recent-activity');
      return { data: response.data.data };
    });
  },

  /**
   * Recupera i dati per il grafico attività ultimi 30 giorni.
   * Maps to: GET /api/admin/dashboard/chart-data
   */
  getChartData: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
    return apiRequest<ChartDataPoint[]>(async () => {
      const response = await apiClient.get('/api/admin/dashboard/chart-data');
      return { data: response.data.data };
    });
  },

  /**
   * Recupera la distribuzione documenti per tipo (pie chart).
   * Maps to: GET /api/admin/dashboard/document-distribution
   */
  getDocumentDistribution: async (): Promise<ApiResponse<{ type: string; count: number }[]>> => {
    return apiRequest<{ type: string; count: number }[]>(async () => {
      const response = await apiClient.get('/api/admin/dashboard/document-distribution');
      return { data: response.data.data };
    });
  },
};

export default dashboardService;