import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Alert } from '@mui/material';
import { People, CalendarToday, Description, LocalHospital } from '@mui/icons-material';
import { useAppSelector, useDocumentTitle } from '@/hooks';

const DoctorDashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard Medico - MyFamilyDoc');
  const { user } = useAppSelector((state) => state.auth);

  const mockCards = [
    { title: 'Pazienti Assegnati', value: '—', icon: <People />, color: 'primary.main' },
    { title: 'Appuntamenti Oggi', value: '—', icon: <CalendarToday />, color: 'success.main' },
    { title: 'Referti da Validare', value: '—', icon: <Description />, color: 'warning.main' },
    { title: 'Prescrizioni Attive', value: '—', icon: <LocalHospital />, color: 'info.main' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Bentornato, Dr. {user?.lastName || user?.firstName || 'Medico'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pannello medico
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>In sviluppo</strong> — La dashboard medico è in fase di implementazione. Le funzionalità saranno disponibili a breve.
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
        <LocalHospital sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Funzionalità in arrivo
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Gestione pazienti, appuntamenti, prescrizioni e referti
        </Typography>
      </Paper>
    </Box>
  );
};

export default DoctorDashboardPage;