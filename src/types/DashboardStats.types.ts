// ── Dashboard Types ──────────────────────────────────────────────
// Da aggiungere al file @/types/index.ts

export interface DashboardStats {
  users: {
    total: number;
    trend: number;
  };
  documents: {
    total: number;
    trend: number;
  };
  messages: {
    total: number;
    trend: number;
  };
  notifications: {
    sent: number;
    trend: number;
  };
  system: {
    uptime: number;
    activeDevices: number;
    storageUsed: number;
    storageTotal: number;
    apiCalls24h: number;
  };
}

export interface HealthAlert {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  userName: string;
  message: string;
  timestamp: string;
}

export interface RecentActivity {
  id: number;
  type: 'user_registration' | 'document_upload' | 'certificate_issued' | 'message' | 'alert';
  description: string;
  timestamp: string;
}

export interface ChartDataPoint {
  date: string;
  documents: number;
  users: number;
  messages: number;
}