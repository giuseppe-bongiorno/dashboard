
import {
  ApiResponse,
  DashboardStats,
  HealthAlert,
  RecentActivity,
  ChartDataPoint,
} from '@/types';

// Mock data generator
const generateMockDashboardStats = (): DashboardStats => {
  return {
    users: {
      total: 12453,
      active: 8234,
      byRole: {
        patients: 11850,
        doctors: 580,
        admins: 23,
      },
      newThisMonth: 342,
      trend: 12.5,
    },
    documents: {
      total: 45678,
      byType: {
        glicemia: 12340,
        pressione: 8765,
        certificati: 4321,
        ricette: 9876,
        vaccini: 3456,
        visite: 4567,
        referti: 2353,
      },
      uploadedThisWeek: 1234,
      trend: 8.3,
    },
    messages: {
      total: 23456,
      activeConversations: 1567,
      lastWeek: 2345,
      trend: 15.2,
    },
    notifications: {
      sent: 34567,
      delivered: 32890,
      failed: 1677,
      openRate: 68.5,
      trend: 5.4,
    },
    system: {
      uptime: 99.8,
      activeDevices: 8234,
      storageUsed: 487.5,
      storageTotal: 1000,
      apiCalls24h: 145678,
    },
  };
};

const generateMockHealthAlerts = (): HealthAlert[] => {
  return [
    {
      id: '1',
      type: 'glicemia',
      severity: 'critical',
      userId: 'user_001',
      userName: 'Mario Rossi',
      message: 'Glicemia critica: 280 mg/dL',
      value: '280 mg/dL',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
      id: '2',
      type: 'pressione',
      severity: 'warning',
      userId: 'user_002',
      userName: 'Laura Bianchi',
      message: 'Pressione elevata: 160/95 mmHg',
      value: '160/95 mmHg',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: '3',
      type: 'scadenza_certificato',
      severity: 'warning',
      userId: 'user_003',
      userName: 'Giovanni Verdi',
      message: 'Certificato medico in scadenza tra 3 giorni',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: '4',
      type: 'glicemia',
      severity: 'warning',
      userId: 'user_004',
      userName: 'Anna Neri',
      message: 'Glicemia alta: 190 mg/dL',
      value: '190 mg/dL',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
    {
      id: '5',
      type: 'scadenza_vaccino',
      severity: 'info',
      userId: 'user_005',
      userName: 'Paolo Gialli',
      message: 'Vaccino antinfluenzale in scadenza',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    },
  ];
};

const generateMockRecentActivity = (): RecentActivity[] => {
  const activities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registration',
      description: 'Nuovo utente registrato: Luca Ferrari',
      user: 'Luca Ferrari',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      icon: 'person_add',
    },
    {
      id: '2',
      type: 'document_upload',
      description: 'Caricata nuova glicemia da Maria Costa',
      user: 'Maria Costa',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      icon: 'upload_file',
    },
    {
      id: '3',
      type: 'certificate_issued',
      description: 'Dr. Simone Blu ha emesso un certificato',
      user: 'Dr. Simone Blu',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      icon: 'description',
    },
    {
      id: '4',
      type: 'message',
      description: 'Nuovo messaggio da paziente a medico',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      icon: 'message',
    },
    {
      id: '5',
      type: 'alert',
      description: 'Alert sanitario: valore glicemia fuori range',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      icon: 'warning',
    },
    {
      id: '6',
      type: 'document_upload',
      description: 'Caricata pressione arteriosa da Roberto Verdi',
      user: 'Roberto Verdi',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      icon: 'upload_file',
    },
    {
      id: '7',
      type: 'user_registration',
      description: 'Nuovo medico registrato: Dr.ssa Elena Rossi',
      user: 'Dr.ssa Elena Rossi',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      icon: 'person_add',
    },
    {
      id: '8',
      type: 'document_upload',
      description: 'Caricato referto da Francesco Bianchi',
      user: 'Francesco Bianchi',
      timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
      icon: 'upload_file',
    },
  ];

  return activities;
};

const generateMockChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      documents: Math.floor(Math.random() * 200) + 100,
      users: Math.floor(Math.random() * 50) + 20,
      messages: Math.floor(Math.random() * 150) + 50,
    });
  }

  return data;
};

// Mock delay to simulate network request
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard Service
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(300);

    try {
      const stats = generateMockDashboardStats();
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch dashboard statistics',
          code: 'FETCH_STATS_ERROR',
        },
      };
    }
  },

  /**
   * Get health alerts
   */
  getHealthAlerts: async (): Promise<ApiResponse<HealthAlert[]>> => {
    await delay(200);

    try {
      const alerts = generateMockHealthAlerts();
      
      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch health alerts',
          code: 'FETCH_ALERTS_ERROR',
        },
      };
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (): Promise<ApiResponse<RecentActivity[]>> => {
    await delay(250);

    try {
      const activities = generateMockRecentActivity();
      
      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch recent activity',
          code: 'FETCH_ACTIVITY_ERROR',
        },
      };
    }
  },

  /**
   * Get chart data for overview
   */
  getChartData: async (days: number = 30): Promise<ApiResponse<ChartDataPoint[]>> => {
    await delay(400);

    try {
      const chartData = generateMockChartData();
      
      return {
        success: true,
        data: chartData,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch chart data',
          code: 'FETCH_CHART_ERROR',
        },
      };
    }
  },

  /**
   * Get document type distribution
   */
  getDocumentDistribution: async (): Promise<ApiResponse<{ type: string; count: number }[]>> => {
    await delay(200);

    try {
      const stats = generateMockDashboardStats();
      const distribution = Object.entries(stats.documents.byType).map(([type, count]) => ({
        type,
        count,
      }));
      
      return {
        success: true,
        data: distribution,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch document distribution',
          code: 'FETCH_DISTRIBUTION_ERROR',
        },
      };
    }
  },
};

export default dashboardService;