import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Grid,
} from '@mui/material';
import {
  Refresh,
  Storage,
  TrendingUp,
  Memory,
  NetworkCheck,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNotification } from '@/hooks';
import systemHealthService, { ContainerHealth } from '@/services/systemHealth.service';

const SystemHealthPage: React.FC = () => {
  const [containers, setContainers] = useState<ContainerHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { showSuccess, showError } = useNotification();

  const fetchSystemHealth = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await systemHealthService.getSystemHealth();

      if (response.success && response.data) {
        setContainers(response.data);
        setLastUpdate(new Date());
        if (isRefresh) showSuccess('Stato sistema aggiornato');
      } else {
        showError('Errore nel caricamento dello stato sistema');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      showError('Errore nel caricamento dello stato sistema');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();

    const interval = setInterval(() => {
      fetchSystemHealth(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): 'success' | 'info' | 'error' | 'warning' => {
    if (status.includes('Up') && status.includes('healthy')) return 'success';
    if (status.includes('Up')) return 'info';
    if (status.includes('Exited') || status.includes('Down')) return 'error';
    return 'warning';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Up') && status.includes('healthy')) return <CheckCircle sx={{ fontSize: 18 }} />;
    if (status.includes('Up')) return <TrendingUp sx={{ fontSize: 18 }} />;
    return <ErrorIcon sx={{ fontSize: 18 }} />;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('frontend')) return '🖥️';
    if (name.includes('postgres')) return '🐘';
    if (name.includes('redis')) return '🔴';
    if (name.includes('auth')) return '🔐';
    if (name.includes('medical')) return '🏥';
    if (name.includes('utility') || name.includes('web')) return '🛠️';
    return '📦';
  };

  const healthyContainers = containers.filter(c => c.status.includes('healthy')).length;
  const runningContainers = containers.filter(c => c.status.includes('Up')).length;
  const totalContainers = containers.length;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Caricamento stato sistema...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            System Health Monitor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoraggio in tempo reale dei servizi Docker
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />}
          onClick={() => fetchSystemHealth(true)}
          disabled={refreshing}
        >
          Aggiorna
        </Button>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[ 
          { title: 'Container Totali', value: totalContainers, caption: 'Servizi attivi nel sistema', color: undefined },
          { title: 'In Esecuzione', value: runningContainers, caption: 'Container attivi', color: 'info.main' },
          { title: 'Healthy', value: healthyContainers, caption: 'Servizi in salute', color: 'success.main' },
          { title: 'Ultimo Aggiornamento', value: lastUpdate ? lastUpdate.toLocaleTimeString('it-IT') : '-', caption: 'Auto-refresh 30s', color: undefined }
        ].map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h3" fontWeight={700} color={stat.color as any}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.caption}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Container List */}
      <Grid container spacing={3}>
        {containers.map((container, index) => (
          <Grid size={{ xs: 12, lg: 6 }} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h3">{getServiceIcon(container.name)}</Typography>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{container.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{container.image}</Typography>
                  </Box>
                </Box>
                <Chip
                  label={
                    container.status.includes('healthy') ? 'Healthy' :
                    container.status.includes('Up') ? 'Running' :
                    'Down'
                  }
                  color={getStatusColor(container.status)}
                  icon={getStatusIcon(container.status)}
                  size="small"
                />
              </Box>

              {/* Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getStatusColor(container.status) + '.main' }} />
                <Typography variant="body2" color="text.secondary">{container.status}</Typography>
              </Box>

              {/* Metrics */}
              <Grid container spacing={2} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                {[
                  { icon: <TrendingUp sx={{ fontSize: 20, color: 'text.secondary' }} />, label: 'CPU', value: container.cpuPercent > 0 ? `${container.cpuPercent.toFixed(2)}%` : 'N/A' },
                  { icon: <Memory sx={{ fontSize: 20, color: 'text.secondary' }} />, label: 'Memory', value: container.memoryUsage > 0 ? formatBytes(container.memoryUsage) : 'N/A' },
                  { icon: <NetworkCheck sx={{ fontSize: 20, color: 'text.secondary' }} />, label: 'Network I/O', value: container.netIO },
                  { icon: <Storage sx={{ fontSize: 20, color: 'text.secondary' }} />, label: 'Disk I/O', value: container.blockIO },
                ].map((metric, idx) => (
                  <Grid size={{ xs: 6 }} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {metric.icon}
                      <Box>
                        <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                        <Typography variant="body2" fontWeight={600}>{metric.value}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {container.restartCount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Warning sx={{ fontSize: 20, color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Riavviato {container.restartCount} {container.restartCount === 1 ? 'volta' : 'volte'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {containers.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Storage sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">Nessun container trovato</Typography>
        </Paper>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default SystemHealthPage;