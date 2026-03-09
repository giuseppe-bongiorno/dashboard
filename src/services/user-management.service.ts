import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';
import { UserManagement, UserStats, UserFilters, UserRole } from '@/types';

/**
 * Service per la gestione utenti (Admin).
 * Mappa le API del UserManagementController (webutility service).
 * 
 * Base URL: /api/admin/users (proxied al servizio webutility)
 */
export const userManagementService = {
  /**
   * Recupera la lista utenti con filtri.
   * Maps to: GET /api/admin/users?search=&role=&status=&emailVerified=
   */
  getUsers: async (filters: UserFilters): Promise<ApiResponse<UserManagement[]>> => {
    return apiRequest<UserManagement[]>(async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.emailVerified && filters.emailVerified !== 'ALL') params.append('emailVerified', String(filters.emailVerified));

      const response = await apiClient.get(`/api/admin/users?${params.toString()}`);
      // Il controller wrappa in { success, data: [...], count }
      // apiRequest wrappa ancora in { success, data }
      // Estraiamo l'array dal wrapper del controller
      return { data: response.data.data };
    });
  },

  /**
   * Recupera le statistiche utenti.
   * Maps to: GET /api/admin/users/stats
   */
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    return apiRequest<UserStats>(async () => {
      const response = await apiClient.get('/api/admin/users/stats');
      return { data: response.data.data };
    });
  },

  /**
   * Abilita un utente.
   * Maps to: PUT /api/admin/users/{userId}/enable
   */
  enableUser: async (userId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.put(`/api/admin/users/${userId}/enable`);
      return response;
    });
  },

  /**
   * Disabilita un utente.
   * Maps to: PUT /api/admin/users/{userId}/disable
   */
  disableUser: async (userId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.put(`/api/admin/users/${userId}/disable`);
      return response;
    });
  },

  /**
   * Verifica email (admin override).
   * Maps to: PUT /api/admin/users/{userId}/verify-email
   */
  verifyEmail: async (userId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.put(`/api/admin/users/${userId}/verify-email`);
      return response;
    });
  },

  /**
   * Avvia il reset password per un utente.
   * Maps to: POST /api/admin/users/{userId}/reset-password
   */
  resetPassword: async (userId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.post(`/api/admin/users/${userId}/reset-password`);
      return response;
    });
  },

  /**
   * Cambia il ruolo di un utente.
   * Maps to: PUT /api/admin/users/{userId}/role
   */
  changeRole: async (userId: number, role: UserRole): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.put(`/api/admin/users/${userId}/role`, { role });
      return response;
    });
  },

  /**
   * Soft-delete di un utente.
   * Maps to: DELETE /api/admin/users/{userId}
   */
  deleteUser: async (userId: number, reason: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.delete(`/api/admin/users/${userId}`, {
        data: { reason },
      });
      return response;
    });
  },
};

export default userManagementService;