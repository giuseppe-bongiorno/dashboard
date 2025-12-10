import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Storage,
  Cloud,
  Speed,
  Timer,
  Memory,
} from '@mui/icons-material';
import { useDocumentTitle } from '@/hooks';
import { healthService, HealthStatus } from '@/services/health.service';

const SystemHealthPage: React.FC = () => {
  useDocumentTitle('System Health - MyFamilyDoc');

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await healthService.checkHealth();
      
      if (response.success && response.data) {
        setHealth(response.data);
        setLastCheck(new Date());
      } else {
        setError(response.error?.message || 'Failed to fetch health status');
      }
    } catch (err) {
      setError('Unable to connect to backend service');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'UP':
        return 'success';
      case 'DOWN':
        return 'error';
      case 'DEGRADED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'UP':
        return <CheckCircle color="success" />;
      case 'DOWN':
        return <Error color="error" />;
      case 'DEGRADED':
        return <Warning color="warning" />;
      default:
        return <Warning color="disabled" />;
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            System Health
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoraggio dello stato del backend e dei servizi
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            startIcon={<Timer />}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={checkHealth}
            disabled={loading}
          >
            Aggiorna
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {lastCheck && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ultimo controllo: {lastCheck.toLocaleString('it-IT')}
        </Alert>
      )}

      {/* Status Overview */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                {loading ? (
                  <CircularProgress />
                ) : (
                  getStatusIcon(health?.status)
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                Backend Status
              </Typography>
              <Chip
                label={health?.status || 'UNKNOWN'}
                color={getStatusColor(health?.status)}
                size="medium"
                sx={{ fontSize: '1rem', py: 1 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Response Time
              </Typography>
              <Typography variant="h4" color="primary">
                {health?.responseTime ? `${health.responseTime}ms` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Uptime
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatUptime(health?.uptime)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Services Status */}
      {health?.services && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Stato Servizi
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
              {health.services.database && (
                <ListItem>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Database"
                    secondary={`Response time: ${health.services.database.responseTime || 'N/A'}ms`}
                  />
                  <Chip
                    label={health.services.database.status}
                    color={getStatusColor(health.services.database.status)}
                    size="small"
                  />
                </ListItem>
              )}

              {health.services.redis && (
                <ListItem>
                  <ListItemIcon>
                    <Memory />
                  </ListItemIcon>
                  <ListItemText
                    primary="Redis Cache"
                    secondary={`Response time: ${health.services.redis.responseTime || 'N/A'}ms`}
                  />
                  <Chip
                    label={health.services.redis.status}
                    color={getStatusColor(health.services.redis.status)}
                    size="small"
                  />
                </ListItem>
              )}

              {health.services.email && (
                <ListItem>
                  <ListItemIcon>
                    <Cloud />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Service"
                    secondary={`Response time: ${health.services.email.responseTime || 'N/A'}ms`}
                  />
                  <Chip
                    label={health.services.email.status}
                    color={getStatusColor(health.services.email.status)}
                    size="small"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      {health && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {health.version && (
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Versione
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {health.version}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {health.memory && (
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Memoria
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Usata</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(health.memory.used / health.memory.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Libera: {formatBytes(health.memory.free)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Stack>
      )}

      {/* Info Box */}
      <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
        <CardContent>
          <Typography variant="body2" color="info.dark">
            <strong>Nota:</strong> Questa pagina esegue il controllo dello stato chiamando <code>GET /auth/health</code>.
            L'auto-refresh aggiorna i dati ogni 30 secondi quando attivato.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemHealthPage;