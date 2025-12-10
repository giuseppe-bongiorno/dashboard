import apiClient, { apiRequest } from './api';
import {
  ConsentPreferences,
  DataExportRequest,
  DeletionRequest,
  AuditLogEntry,
  ApiResponse,
} from '@/types';

const CONSENT_KEY = 'gdpr_consent';
const AUDIT_LOG_KEY = 'audit_log';

export const gdprService = {
  /**
   * Get user's consent preferences from local storage
   */
  getConsentPreferences: (): ConsentPreferences | null => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading consent preferences:', error);
      return null;
    }
  },

  /**
   * Save consent preferences
   */
  saveConsentPreferences: (preferences: Omit<ConsentPreferences, 'timestamp'>): void => {
    try {
      const consent: ConsentPreferences = {
        ...preferences,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (error) {
      console.error('Error saving consent preferences:', error);
    }
  },

  /**
   * Check if user has given consent for specific purpose
   */
  hasConsent: (purpose: keyof Omit<ConsentPreferences, 'timestamp'>): boolean => {
    const preferences = gdprService.getConsentPreferences();
    return preferences ? preferences[purpose] : false;
  },

  /**
   * Request data export (Right to Data Portability)
   */
  requestDataExport: async (
    request: DataExportRequest
  ): Promise<ApiResponse<{ exportId: string; estimatedTime: string }>> => {
    // Log this action
    gdprService.logAuditEvent({
      action: 'DATA_EXPORT_REQUESTED',
      resource: 'user_data',
      metadata: {
        dataTypes: request.dataTypes,
        format: request.format,
      },
    });

    return apiRequest(async () => {
      return await apiClient.post('/gdpr/data-export', request);
    });
  },

  /**
   * Check data export status
   */
  getDataExportStatus: async (
    exportId: string
  ): Promise<ApiResponse<{ status: string; downloadUrl?: string }>> => {
    return apiRequest(async () => {
      return await apiClient.get(`/gdpr/data-export/${exportId}`);
    });
  },

  /**
   * Request account deletion (Right to Erasure)
   */
  requestAccountDeletion: async (
    request: DeletionRequest
  ): Promise<ApiResponse<{ requestId: string; confirmationRequired: boolean }>> => {
    // Log this critical action
    gdprService.logAuditEvent({
      action: 'ACCOUNT_DELETION_REQUESTED',
      resource: 'user_account',
      metadata: {
        reason: request.reason,
      },
    });

    return apiRequest(async () => {
      return await apiClient.post('/gdpr/account-deletion', request);
    });
  },

  /**
   * Confirm account deletion with verification code
   */
  confirmAccountDeletion: async (
    requestId: string,
    confirmationCode: string
  ): Promise<ApiResponse<void>> => {
    return apiRequest(async () => {
      return await apiClient.post('/gdpr/account-deletion/confirm', {
        requestId,
        confirmationCode,
      });
    });
  },

  /**
   * Cancel pending deletion request
   */
  cancelDeletionRequest: async (requestId: string): Promise<ApiResponse<void>> => {
    gdprService.logAuditEvent({
      action: 'ACCOUNT_DELETION_CANCELLED',
      resource: 'user_account',
      metadata: { requestId },
    });

    return apiRequest(async () => {
      return await apiClient.delete(`/gdpr/account-deletion/${requestId}`);
    });
  },

  /**
   * Get user's personal data overview (Right to Access)
   */
  getPersonalDataOverview: async (): Promise<
    ApiResponse<{
      profile: any;
      activity: any;
      consents: any;
      dataRetention: any;
    }>
  > => {
    return apiRequest(async () => {
      return await apiClient.get('/gdpr/personal-data');
    });
  },

  /**
   * Update data processing preferences
   */
  updateDataProcessingPreferences: async (
    preferences: Record<string, boolean>
  ): Promise<ApiResponse<void>> => {
    gdprService.logAuditEvent({
      action: 'DATA_PROCESSING_PREFERENCES_UPDATED',
      resource: 'user_preferences',
      metadata: preferences,
    });

    return apiRequest(async () => {
      return await apiClient.put('/gdpr/processing-preferences', preferences);
    });
  },

  /**
   * Log audit event to local storage (for frontend tracking)
   * In production, these should be sent to backend for permanent storage
   */
  logAuditEvent: (event: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId'>): void => {
    try {
      const logs = gdprService.getAuditLogs();
      const newLog: AuditLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId: 'current-user', // Should be replaced with actual user ID
        userAgent: navigator.userAgent,
        ...event,
      };

      logs.push(newLog);

      // Keep only last 100 logs in local storage
      const recentLogs = logs.slice(-100);
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(recentLogs));

      // Send to backend for permanent storage
      apiClient
        .post('/audit/log', newLog)
        .catch((error) => console.error('Failed to send audit log to backend:', error));
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  },

  /**
   * Get audit logs from local storage
   */
  getAuditLogs: (): AuditLogEntry[] => {
    try {
      const stored = localStorage.getItem(AUDIT_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading audit logs:', error);
      return [];
    }
  },

  /**
   * Clear local audit logs (backend logs remain)
   */
  clearLocalAuditLogs: (): void => {
    try {
      localStorage.removeItem(AUDIT_LOG_KEY);
    } catch (error) {
      console.error('Error clearing audit logs:', error);
    }
  },
};

/**
 * Data Minimization Rules
 * 
 * DO NOT STORE:
 * - Sensitive health information without explicit consent
 * - Financial data (credit cards, bank accounts) in local storage
 * - Biometric data
 * - Precise geolocation without explicit consent
 * - Children's data without parental consent
 * - Government IDs or social security numbers
 * - Passwords (even hashed) in local storage
 * - Session tokens longer than necessary
 * 
 * MINIMIZE STORAGE:
 * - Store only essential user profile data
 * - Clear tokens on logout
 * - Use session storage for temporary data
 * - Implement automatic data expiration
 * - Anonymize logs and analytics data
 * 
 * RETENTION POLICY:
 * - User sessions: Until logout or token expiration
 * - Consent records: Minimum 3 years for legal compliance
 * - Audit logs: Configurable, typically 1-2 years
 * - Cached data: Maximum 24 hours
 * - Abandoned carts: Maximum 30 days
 */

export default gdprService;
