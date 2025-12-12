// User roles (matching backend: ROLE_ADMIN, ROLE_DEV, ROLE_DOC, ROLE_USER)
export type UserRole = 'ADMIN' | 'DEV' | 'DOC' | 'USER';

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: string[]; // Optional granular permissions
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  department?: string; // For doctors/admins
}

// Role-based permissions helper
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'], // All permissions - Administrator
  DEV: ['*', 'system_debug', 'view_logs', 'manage_config'], // All permissions + developer tools
  DOC: ['view_patients', 'create_prescriptions', 'view_documents', 'create_appointments', 'manage_schedule', 'view_medical_records'],
  USER: ['view_own_data', 'upload_documents', 'book_appointments', 'view_prescriptions'],
};

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  DEV: 'Developer',
  DOC: 'Doctor',
  USER: 'Patient',
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  captchaToken?: string; // Optional for development
}

export interface OTPRequest {
  email: string;
  sessionId?: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
  sessionId: string;
}

export interface AuthResponse {
  success?: boolean;
  sessionId?: string;
  tokens?: AuthTokens;
  user?: User;
  message?: string;
  requiresOTP?: boolean;
  requiresOtp?: boolean; // Backend might use camelCase
  token?: string; // Some backends return single token
  accessToken?: string;
  refreshToken?: string;
}

// API Response Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  field?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// Dashboard Types
export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon?: string;
}

// GDPR Types
export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
}

export interface DataExportRequest {
  email: string;
  dataTypes: string[];
  format: 'json' | 'csv' | 'pdf';
}

export interface DeletionRequest {
  userId: string;
  email: string;
  reason?: string;
  confirmationCode?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activityTracking: boolean;
  };
}

// Form Types
export interface FormFieldError {
  type: string;
  message: string;
}

export type FormErrors<T> = {
  [K in keyof T]?: FormFieldError;
};