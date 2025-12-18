import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Description,
  Message,
  Notifications,
  Storage,
  Refresh,
  Warning,
  CheckCircle,
  Info,
  PersonAdd,
  UploadFile,
  LocalHospital,
  Block,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector, useDocumentTitle, useNotification } from '@/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import dashboardService from '@/services/dashboard.service';
import type {
  DashboardStats,
  HealthAlert,
  RecentActivity,
  ChartDataPoint,
} from '@/types';

// Colors for charts
const CHART_COLORS = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#ffeb3b'];

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  suffix?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color = 'primary.main', suffix }) => {
  const hasChange = change !== undefined;
  const isPositive = (change || 0) >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {value}
              {suffix && (
                <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                  {suffix}
                </Typography>
              )}
            </Typography>
            {hasChange && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? (
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 500 }}
                >
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs mese scorso
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

interface HealthAlertCardProps {
  alert: HealthAlert;
}

const HealthAlertCard: React.FC<HealthAlertCardProps> = ({ alert }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Warning />;
      case 'warning':
        return <Info />;
      case 'info':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ore fa`;
    return `${Math.floor(diffInMinutes / 1440)} giorni fa`;
  };

  return (
    <Alert
      severity={getSeverityColor(alert.severity) as any}
      icon={getSeverityIcon(alert.severity)}
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {alert.userName}
        </Typography>
        <Typography variant="body2">{alert.message}</Typography>
        <Typography variant="caption" color="text.secondary">
          {getTimeAgo(alert.timestamp)}
        </Typography>
      </Box>
    </Alert>
  );
};

interface ActivityItemProps {
  activity: RecentActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'user_registration':
        return <PersonAdd />;
      case 'document_upload':
        return <UploadFile />;
      case 'certificate_issued':
        return <Description />;
      case 'message':
        return <Message />;
      case 'alert':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ore fa`;
    return `${Math.floor(diffInMinutes / 1440)} giorni fa`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none',
          mb: 0,
          pb: 0,
        },
      }}
    >
      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
        {getIcon()}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={500}>
          {activity.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getTimeAgo(activity.timestamp)}
        </Typography>
      </Box>
    </Box>
  );
};

const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard - MyFamilyDoc Admin');

  const { user } = useAppSelector((state) => state.auth);
  const { showError } = useNotification();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [documentDistribution, setDocumentDistribution] = useState<{ type: string; count: number }[]>([]);

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, alertsRes, activityRes, chartRes, distributionRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getHealthAlerts(),
        dashboardService.getRecentActivity(),
        dashboardService.getChartData(),
        dashboardService.getDocumentDistribution(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (alertsRes.success && alertsRes.data) {
        setHealthAlerts(alertsRes.data);
      }

      if (activityRes.success && activityRes.data) {
        setRecentActivity(activityRes.data);
      }

      if (chartRes.success && chartRes.data) {
        setChartData(chartRes.data);
      }

      if (distributionRes.success && distributionRes.data) {
        setDocumentDistribution(distributionRes.data);
      }
    } catch (error) {
      showError('Errore nel caricamento dei dati della dashboard');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Bentornato, {user?.firstName || 'Admin'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panoramica dell'attività sanitaria di oggi
          </Typography>
        </Box>
        <Tooltip title="Aggiorna dati">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Utenti Totali"
            value={stats?.users.total.toLocaleString() || '0'}
            change={stats?.users.trend}
            icon={<People />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Documenti Caricati"
            value={stats?.documents.total.toLocaleString() || '0'}
            change={stats?.documents.trend}
            icon={<Description />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Messaggi Scambiati"
            value={stats?.messages.total.toLocaleString() || '0'}
            change={stats?.messages.trend}
            icon={<Message />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Notifiche Inviate"
            value={stats?.notifications.sent.toLocaleString() || '0'}
            change={stats?.notifications.trend}
            icon={<Notifications />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Activity Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Attività Ultimi 30 Giorni
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="documents"
                  stroke="#2196f3"
                  fillOpacity={1}
                  fill="url(#colorDocuments)"
                  name="Documenti"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#4caf50"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Nuovi Utenti"
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#ff9800"
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  name="Messaggi"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Document Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Distribuzione Documenti
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={documentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                  label
                >
                  {documentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                 // formatter={(value: number | undefined, name: string) => [value || 0, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Health Alerts & Recent Activity */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Health Alerts */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 500, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Alert Sanitari
              </Typography>
              <Chip
                label={healthAlerts.length}
                color="error"
                size="small"
                icon={<Warning />}
              />
            </Box>
            <Box>
              {healthAlerts.length > 0 ? (
                healthAlerts.map((alert) => <HealthAlertCard key={alert.id} alert={alert} />)
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Nessun alert sanitario
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 500, overflow: 'auto' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Attività Recente
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Nessuna attività recente
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* System Stats */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Statistiche Sistema
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {stats?.system.uptime.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uptime
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats?.system.uptime || 0}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {stats?.system.activeDevices.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dispositivi Attivi
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {stats?.system.storageUsed.toFixed(1)} GB
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Storage Utilizzato / {stats?.system.storageTotal} GB
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((stats?.system.storageUsed || 0) / (stats?.system.storageTotal || 1)) * 100}
                sx={{ mt: 1 }}
                color="warning"
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {stats?.system.apiCalls24h.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API Calls (24h)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default DashboardPage;