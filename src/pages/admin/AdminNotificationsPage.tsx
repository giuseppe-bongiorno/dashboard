import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  Grid,
  Alert,
  IconButton,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControlLabel,
  Switch,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Notifications,
  Send,
  NotificationsActive,
  Close,
  Check,
  Info,
  Refresh,
  ExpandMore,
  Badge,
  Devices,
  Group,
  Person,
} from '@mui/icons-material';
import { useAppSelector, useNotification } from '@/hooks';
import notificationService, { NotificationRequest } from '@/services/notification.service';
import messaggiService, { UserListDTO } from '@/services/messaggi.service';

const AdminNotificationsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useNotification();

  // State
  const [loading, setLoading] = useState(false);
  const [utenti, setUtenti] = useState<UserListDTO[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserListDTO | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [customData, setCustomData] = useState('');
  const [includeData, setIncludeData] = useState(false);
  
  // Test notification state
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testTitle, setTestTitle] = useState('Test Notifica');
  const [testBody, setTestBody] = useState('Questa è una notifica di test');
  
  // Badge counts
  const [userBadgeCount, setUserBadgeCount] = useState<number | null>(null);
  const [loadingBadge, setLoadingBadge] = useState(false);

  // Notification history (mock - you can implement real history)
  const [notificationHistory, setNotificationHistory] = useState<Array<{
    id: number;
    user: string;
    title: string;
    timestamp: Date;
    devices: number;
  }>>([]);

  // Load users on mount
  useEffect(() => {
    loadUtenti();
  }, []);

  const loadUtenti = async () => {
    try {
      const response = await messaggiService.getUtenti();
      if (response.success && response.data) {
        setUtenti(response.data);
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      showError('Impossibile caricare la lista utenti');
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !title.trim() || !body.trim()) {
      showError('Compila tutti i campi obbligatori (utente, titolo e messaggio)');
      return;
    }

    setLoading(true);
    try {
      let data: Record<string, any> | undefined;
      
      if (includeData && customData.trim()) {
        try {
          data = JSON.parse(customData);
        } catch (e) {
          showError('Dati custom non validi. Deve essere un JSON valido.');
          setLoading(false);
          return;
        }
      }

      const request: NotificationRequest = {
        userId: selectedUser.id,
        title: title.trim(),
        body: body.trim(),
        data: data,
      };

      const response = await notificationService.sendNotification(request);

      if (response.success && response.data) {
        showSuccess(
          `Notifica inviata con successo a ${response.data.devicesCount} ${
            response.data.devicesCount === 1 ? 'dispositivo' : 'dispositivi'
          }`
        );

        // Add to history
        setNotificationHistory(prev => [
          {
            id: Date.now(),
            user: selectedUser.displayName,
            title: title,
            timestamp: new Date(),
            devices: response.data?.devicesCount ?? 0,
          },
          ...prev.slice(0, 9), // Keep only last 10
        ]);

        // Reset form
        setTitle('');
        setBody('');
        setCustomData('');
        setIncludeData(false);
        setSelectedUser(null);
      } else {
    
        showError(getErrorMessage(response.error, 'Errore durante l\'invio della notifica'));
      }
    } catch (error) {
      console.error('Errore invio notifica:', error);
      showError('Errore durante l\'invio della notifica');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!testTitle.trim() || !testBody.trim()) {
      showError('Inserisci titolo e messaggio per la notifica di test');
      return;
    }

    setLoading(true);
    try {
      const response = await notificationService.sendTestNotification(
        testTitle.trim(),
        testBody.trim()
      );

      if (response.success && response.data) {
        showSuccess(
          `Notifica di test inviata a ${response.data.devicesCount} ${
            response.data.devicesCount === 1 ? 'tuo dispositivo' : 'tuoi dispositivi'
          }`
        );
        setTestDialogOpen(false);
      } else {

        showError(getErrorMessage(response.error, 'Errore durante l\'invio della notifica di test'));
      }
    } catch (error) {
      console.error('Errore notifica test:', error);
      showError('Errore durante l\'invio della notifica di test');
    } finally {
      setLoading(false);
    }
  };

  const loadBadgeCount = async () => {
    if (!selectedUser) {
      showError('Seleziona prima un utente');
      return;
    }

    setLoadingBadge(true);
    try {
      const response = await notificationService.getBadgeCountByUserId(selectedUser.id);

      if (response.success && response.data) {
        setUserBadgeCount(response.data.unreadCount);
      } else {
        showError('Errore durante il recupero del badge count');
      }
    } catch (error) {
      console.error('Errore badge count:', error);
      showError('Errore durante il recupero del badge count');
    } finally {
      setLoadingBadge(false);
    }
  };

  const getErrorMessage = (error: any, defaultMessage: string): string => {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message;
    }
    return defaultMessage;
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🔔 Notifiche Push
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invia notifiche push agli utenti dell'app mobile
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<NotificationsActive />}
            onClick={() => setTestDialogOpen(true)}
          >
            Notifica di Test
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadUtenti}>
            Aggiorna
          </Button>
        </Stack>
      </Stack>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Info:</strong> Le notifiche vengono inviate a tutti i dispositivi registrati
        dell'utente selezionato. Verifica che l'utente abbia l'app installata e le notifiche
        attivate.
      </Alert>

      <Grid container spacing={3}>
        {/* Form Invio Notifica */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📤 Invia Notifica
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                {/* Seleziona Utente */}
                <Autocomplete
                  options={utenti}
                  getOptionLabel={(option) => option.displayName}
                  value={selectedUser}
                  onChange={(_, newValue) => {
                    setSelectedUser(newValue);
                    setUserBadgeCount(null); // Reset badge count
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {option.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{option.username}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Destinatario"
                      placeholder="Seleziona un utente..."
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Person color="action" sx={{ ml: 1, mr: 0.5 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />

                {/* Badge Count (se utente selezionato) */}
                {selectedUser && (
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Badge color="primary" />
                        <Typography variant="body2">
                          Badge count per <strong>{selectedUser.username}</strong>
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {userBadgeCount !== null && (
                          <Chip
                            label={`${userBadgeCount} non lette`}
                            color={userBadgeCount > 0 ? 'error' : 'success'}
                            size="small"
                          />
                        )}
                        <Button
                          size="small"
                          onClick={loadBadgeCount}
                          disabled={loadingBadge}
                          startIcon={loadingBadge ? <CircularProgress size={16} /> : <Refresh />}
                        >
                          {userBadgeCount !== null ? 'Aggiorna' : 'Carica'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                )}

                {/* Titolo */}
                <TextField
                  label="Titolo Notifica"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                  placeholder="es. Nuovo documento disponibile"
                  helperText="Massimo 50 caratteri consigliati"
                  inputProps={{ maxLength: 100 }}
                />

                {/* Corpo */}
                <TextField
                  label="Messaggio"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="es. È disponibile un nuovo referto medico. Accedi all'app per visualizzarlo."
                  helperText="Massimo 200 caratteri consigliati"
                  inputProps={{ maxLength: 500 }}
                />

                {/* Dati Custom (Opzionale) */}
                <Accordion expanded={includeData} onChange={() => setIncludeData(!includeData)}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Info color="action" />
                      <Typography>Dati Custom (Avanzato)</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="Dati JSON"
                      value={customData}
                      onChange={(e) => setCustomData(e.target.value)}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder='{"type": "document", "documentId": 123, "action": "view"}'
                      helperText="Inserisci un oggetto JSON valido. Questi dati saranno disponibili nell'app."
                    />
                  </AccordionDetails>
                </Accordion>

                {/* Pulsante Invio */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  onClick={handleSendNotification}
                  disabled={loading || !selectedUser || !title.trim() || !body.trim()}
                  fullWidth
                >
                  {loading ? 'Invio in corso...' : 'Invia Notifica'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Cronologia */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  📜 Cronologia
                </Typography>
                <Chip label={notificationHistory.length} size="small" color="primary" />
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {notificationHistory.length === 0 ? (
                <Alert severity="info">
                  Nessuna notifica inviata in questa sessione
                </Alert>
              ) : (
                <List>
                  {notificationHistory.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <Check />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" component="span" display="block">
                                A: {item.user}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                <Chip
                                  icon={<Devices />}
                                  label={`${item.devices} ${
                                    item.devices === 1 ? 'dispositivo' : 'dispositivi'
                                  }`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {item.timestamp.toLocaleString('it-IT')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < notificationHistory.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📊 Statistiche
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Notifiche inviate (sessione)
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {notificationHistory.length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Utenti attivi
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {utenti.filter(u => u.enabled).length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Totale utenti
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {utenti.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Notifica di Test */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <NotificationsActive color="primary" />
              <Typography variant="h6">Notifica di Test</Typography>
            </Stack>
            <IconButton onClick={() => setTestDialogOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Questa notifica sarà inviata ai <strong>tuoi</strong> dispositivi registrati.
          </Alert>

          <Stack spacing={3}>
            <TextField
              label="Titolo"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Messaggio"
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              required
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            onClick={handleSendTestNotification}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            disabled={loading || !testTitle.trim() || !testBody.trim()}
          >
            Invia Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotificationsPage;