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

// Dashboard Statistics Types
export interface DashboardStats {
  users: UserStats;
  documents: DocumentStats;
  messages: MessageStats;
  notifications: NotificationStats;
  system: SystemStats;
}

export interface UserStats {
  total: number;
  active: number;
  byRole: {
    patients: number;
    doctors: number;
    admins: number;
  };
  newThisMonth: number;
  trend: number; // percentage
}

export interface DocumentStats {
  total: number;
  byType: {
    glicemia: number;
    pressione: number;
    certificati: number;
    ricette: number;
    vaccini: number;
    visite: number;
    referti: number;
  };
  uploadedThisWeek: number;
  trend: number;
}

export interface MessageStats {
  total: number;
  activeConversations: number;
  lastWeek: number;
  trend: number;
}

export interface NotificationStats {
  sent: number;
  delivered: number;
  failed: number;
  openRate: number;
  trend: number;
}

export interface SystemStats {
  uptime: number; // percentage
  activeDevices: number;
  storageUsed: number; // GB
  storageTotal: number; // GB
  apiCalls24h: number;
}

export interface HealthAlert {
  id: string;
  type: 'glicemia' | 'pressione' | 'scadenza_certificato' | 'scadenza_vaccino';
  severity: 'critical' | 'warning' | 'info';
  userId: string;
  userName: string;
  message: string;
  value?: string;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  type: 'document_upload' | 'user_registration' | 'message' | 'certificate_issued' | 'alert';
  description: string;
  user?: string;
  timestamp: string;
  icon?: string;
}

export interface ChartDataPoint {
  date: string;
  documents: number;
  users: number;
  messages: number;
}

// User Management Types
export interface UserManagement {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  emailVerified: boolean;
  otpVerified: boolean;
  pushEnabled: boolean;
  anonymized: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  emailVerifiedAt?: string;
  deletedAt?: string;
  deletionReason?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | 'ALL';
  status?: 'enabled' | 'disabled' | 'deleted' | 'ALL';
  emailVerified?: boolean | 'ALL';
}

export interface UserStats {
  total: number;
  active: number;
  byRole: {
    patients: number;
    doctors: number;
    admins: number;
  };
  // User Management additional fields
  inactive?: number;
  deleted?: number;
  byRoleDetailed?: {
    admin: number;
    dev: number;
    doc: number;
    user: number;
  };
}

export interface UserAction {
  type: 'enable' | 'disable' | 'delete' | 'verify_email' | 'reset_password' | 'change_role' | 'view_details';
  userId: string;
  newRole?: UserRole; // For change_role action
}

// Telegram Types
export interface TelegramMessage {
  id: string;
  botToken: string;
  chatId: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  telegramMessageId?: number;
  sentAt?: string;
  errorMessage?: string;
  createdBy?: string;
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