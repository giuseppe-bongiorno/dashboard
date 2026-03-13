import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Alert } from '@mui/material';
import { Api, Storage, BugReport, Speed } from '@mui/icons-material';
import { useAppSelector, useDocumentTitle } from '@/hooks';

const DeveloperDashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard Developer - MyFamilyDoc');
  const { user } = useAppSelector((state) => state.auth);

  const mockCards = [
    { title: 'API Calls (24h)', value: '—', icon: <Api />, color: 'primary.main' },
    { title: 'Errori Recenti', value: '—', icon: <BugReport />, color: 'error.main' },
    { title: 'Storage DB', value: '—', icon: <Storage />, color: 'warning.main' },
    { title: 'Uptime', value: '—', icon: <Speed />, color: 'success.main' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Ciao, {user?.firstName || 'Developer'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pannello sviluppatore
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>In sviluppo</strong> — La dashboard developer è in fase di implementazione. Le funzionalità saranno disponibili a breve.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.color, width: 48, height: 48 }}>{card.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Api sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Funzionalità in arrivo
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          API monitoring, logs, debug tools, database management
        </Typography>
      </Paper>
    </Box>
  );
};

export default DeveloperDashboardPage;