// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager';
  createdAt: string;
  lastLogin?: string;
}

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
  success: boolean;
  sessionId?: string;
  tokens?: AuthTokens;
  user?: User;
  message?: string;
  requiresOTP?: boolean;
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