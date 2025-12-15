import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
  Tab,
  Tabs,
  Avatar,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Email,
  Send,
  Reply,
  Delete,
  Refresh,
  Close,
  PriorityHigh,
  Inbox,
  Outbox,
} from '@mui/icons-material';
import { useAppSelector, useNotification } from '@/hooks';
import messaggiService, { Messaggio, CreaMessaggioRequest, UserListDTO } from '@/services/messaggi.service';
import { formatDistanceToNow, isValid } from 'date-fns';
import { it } from 'date-fns/locale';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
};

// Funzione helper per formattare la distanza temporale in modo sicuro
const safeFormatDistanceToNow = (dateString: string | undefined): string => {
  if (!dateString) {
    return 'Data non disponibile';
  }

  const date = new Date(dateString);

  if (!isValid(date)) {
    console.error('Data non valida:', dateString);
    return 'Data non valida';
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: it });
};

// Funzione helper per estrarre il messaggio di errore dall'ApiResponse
const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message;
  }
  return defaultMessage;
};

const AdminMessagingPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useNotification();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [messaggiRicevuti, setMessaggiRicevuti] = useState<Messaggio[]>([]);
  const [messaggiInviati, setMessaggiInviati] = useState<Messaggio[]>([]);
  const [messaggiFiltrati, setMessaggiFiltrati] = useState<Messaggio[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Messaggio | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [utenti, setUtenti] = useState<UserListDTO[]>([]);

  // Form
  const [destinatario, setDestinatario] = useState<UserListDTO | null>(null);
  const [oggetto, setOggetto] = useState('');
  const [contenuto, setContenuto] = useState('');
  const [priorita, setPriorita] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Filtra messaggi in base al tab
  useEffect(() => {
    if (tabValue === 0) {
      setMessaggiFiltrati(messaggiRicevuti);
    } else {
      setMessaggiFiltrati(messaggiInviati);
    }
  }, [tabValue, messaggiRicevuti, messaggiInviati]);

  // Caricamento iniziale
  useEffect(() => {
    if (user?.id) {
      loadData();
      loadUtenti();
    }
  }, [user?.id]);

  // Auto-refresh conteggio non letti
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => loadUnreadCount(), 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMessaggiRicevuti(),
        loadMessaggiInviati(),
        loadUnreadCount(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessaggiRicevuti = async () => {
    if (!user?.id) return;
    
    try {
      const response = await messaggiService.getMessaggi(parseInt(user.id));
      if (response.success && response.data) {
        setMessaggiRicevuti(response.data);
      }
    } catch (error) {
      console.error('Errore caricamento messaggi ricevuti:', error);
    }
  };

  const loadMessaggiInviati = async () => {
    if (!user?.id) return;
    
    try {
      const response = await messaggiService.getMessaggiInviati(parseInt(user.id));
      if (response.success && response.data) {
        setMessaggiInviati(response.data);
      }
    } catch (error) {
      console.error('Errore caricamento messaggi inviati:', error);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const response = await messaggiService.getUnreadCount(parseInt(user.id));
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Errore conteggio non letti:', error);
    }
  };

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

  const handleComposeOpen = () => {
    setDestinatario(null);
    setOggetto('');
    setContenuto('');
    setPriorita(false);
    setComposeOpen(true);
  };

  const handleComposeClose = () => {
    setComposeOpen(false);
  };

  const handleSendMessage = async () => {
    if (!user?.id || !destinatario || !oggetto || !contenuto) {
      showError('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const data: CreaMessaggioRequest = {
        mittenteId: parseInt(user.id),
        destinatarioId: destinatario.id,
        mittenteNome: `${user.firstName} ${user.lastName}`.trim() || user.email,
        oggetto,
        contenuto,
        priorita,
      };

      const response = await messaggiService.sendMessaggio(data);

      if (response.success) {
        showSuccess('Messaggio inviato con successo');
        handleComposeClose();
        await loadData();
      } else {
        showError(getErrorMessage(response.error, 'Errore durante l\'invio del messaggio'));
      }
    } catch (err) {
      console.error('Errore invio messaggio:', err);
      showError('Errore durante l\'invio del messaggio');
    }
  };

  const handleMessageClick = async (message: Messaggio) => {
    try {
      // Carica il thread completo del messaggio
      const threadResponse = await messaggiService.getMessaggioThread(message.id);
      
      if (threadResponse.success && threadResponse.data) {
        setSelectedMessage(threadResponse.data);
        
        // Se il messaggio non era letto e l'utente è il destinatario, marca come letto
        if (!message.letto && message.destinatarioId === parseInt(user?.id || '0')) {
          await messaggiService.markMessaggioAsRead(message.id);
          
          // Aggiorna localmente lo stato
          setMessaggiRicevuti(prev =>
            prev.map(m => m.id === message.id ? { ...m, letto: true } : m)
          );
          
          setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        }
      }
    } catch (error) {
      console.error('Errore caricamento messaggio:', error);
      showError('Errore durante il caricamento del messaggio');
    }
  };

  const handleReply = () => {
    setReplyContent('');
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!user?.id || !selectedMessage || !replyContent.trim()) {
      showError('Il contenuto della risposta è obbligatorio');
      return;
    }

    try {
      const response = await messaggiService.sendRisposta({
        messaggioPadreId: selectedMessage.id,
        mittenteId: parseInt(user.id),
        contenuto: replyContent,
      });

      if (response.success) {
        showSuccess('Risposta inviata con successo');
        setReplyOpen(false);
        setReplyContent('');

        // Ricarica il thread aggiornato
        const threadResponse = await messaggiService.getMessaggioThread(selectedMessage.id);
        if (threadResponse.success && threadResponse.data) {
          setSelectedMessage(threadResponse.data);
        }
        
        // Ricarica i messaggi
        await loadData();
      } else {
        showError(getErrorMessage(response.error, 'Errore durante l\'invio della risposta'));
      }
    } catch (err) {
      console.error('Errore invio risposta:', err);
      showError('Errore durante l\'invio della risposta');
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo messaggio?')) return;

    try {
      const response = await messaggiService.eliminaMessaggio(messageId);

      if (response.success) {
        showSuccess('Messaggio eliminato con successo');
        setSelectedMessage(null);
        await loadData();
      } else {
        showError(getErrorMessage(response.error, 'Errore durante l\'eliminazione'));
      }
    } catch (error) {
      console.error('Errore eliminazione messaggio:', error);
      showError('Errore durante l\'eliminazione del messaggio');
    }
  };

  const renderMessageList = (messages: Messaggio[]) => {
    if (messages.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nessun messaggio da visualizzare
        </Alert>
      );
    }

    return (
      <List sx={{ mt: 2 }}>
        {messages.map((msg) => (
          <React.Fragment key={msg.id}>
            <ListItemButton
              onClick={() => handleMessageClick(msg)}
              selected={selectedMessage?.id === msg.id}
              sx={{
                bgcolor: !msg.letto && msg.destinatarioId === parseInt(user?.id || '0') 
                  ? 'action.hover' 
                  : 'transparent',
              }}
            >
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {msg.mittenteNome?.[0]?.toUpperCase() || '?'}
              </Avatar>

              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={!msg.letto ? 700 : 400} noWrap sx={{ flex: 1 }}>
                      {msg.oggetto}
                    </Typography>
                    {msg.priorita && <PriorityHigh color="error" fontSize="small" />}
                    {!msg.letto && msg.destinatarioId === parseInt(user?.id || '0') && (
                      <Chip label="Nuovo" color="primary" size="small" />
                    )}
                  </Stack>
                }
                secondary={
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption" noWrap>
                      Da: {msg.mittenteNome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safeFormatDistanceToNow(msg.dataInvio)}
                    </Typography>
                  </Stack>
                }
              />
            </ListItemButton>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderMessageDetail = () => {
    if (!selectedMessage) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">
            Seleziona un messaggio per visualizzarlo
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header del messaggio */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedMessage.oggetto}
                {selectedMessage.priorita && <PriorityHigh color="error" sx={{ ml: 1 }} />}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Da: {selectedMessage.mittenteNome} •{' '}
                {safeFormatDistanceToNow(selectedMessage.dataInvio)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton 
                onClick={handleReply} 
                color="primary"
                title="Rispondi"
              >
                <Reply />
              </IconButton>
              <IconButton 
                onClick={() => handleDelete(selectedMessage.id)} 
                color="error"
                title="Elimina"
              >
                <Delete />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Contenuto del messaggio */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedMessage.contenuto}
          </Typography>

          {/* Risposte */}
          {selectedMessage.risposte && selectedMessage.risposte.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 2 }}>
                <Chip
                  label={`${selectedMessage.risposte.length} ${
                    selectedMessage.risposte.length === 1 ? 'Risposta' : 'Risposte'
                  }`}
                  size="small"
                />
              </Divider>

              {selectedMessage.risposte.map((risposta) => (
                <Card key={risposta.id} sx={{ mb: 2, bgcolor: 'action.hover' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {risposta.mittenteNome?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {risposta.mittenteNome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {safeFormatDistanceToNow(risposta.dataInvio)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                          {risposta.contenuto}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            📨 Messaggi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestisci la comunicazione con gli utenti
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={loadData} 
            disabled={loading}
          >
            Aggiorna
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />} 
            onClick={handleComposeOpen}
          >
            Nuovo Messaggio
          </Button>
        </Stack>
      </Stack>

      {/* Statistiche */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge badgeContent={unreadCount} color="error">
                <Inbox color="primary" sx={{ fontSize: 40 }} />
              </Badge>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {messaggiRicevuti.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ricevuti
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Outbox color="action" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {messaggiInviati.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inviati
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Area principale messaggi */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error">
                Ricevuti
              </Badge>
            }
          />
          <Tab label="Inviati" />
        </Tabs>

        <Stack direction="row" sx={{ height: 600 }}>
          {/* Lista messaggi */}
          <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TabPanel value={tabValue} index={0}>
                  {renderMessageList(messaggiFiltrati)}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  {renderMessageList(messaggiFiltrati)}
                </TabPanel>
              </>
            )}
          </Box>

          {/* Dettaglio messaggio */}
          <Box sx={{ flex: 1 }}>
            {renderMessageDetail()}
          </Box>
        </Stack>
      </Card>

      {/* Dialog Nuovo Messaggio */}
      <Dialog open={composeOpen} onClose={handleComposeClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Nuovo Messaggio</Typography>
            <IconButton onClick={handleComposeClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              options={utenti}
              getOptionLabel={(option) => option.displayName}
              value={destinatario}
              onChange={(_, newValue) => setDestinatario(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body1">{option.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Destinatario" required />
              )}
            />

            <TextField
              label="Oggetto"
              value={oggetto}
              onChange={(e) => setOggetto(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Messaggio"
              value={contenuto}
              onChange={(e) => setContenuto(e.target.value)}
              required
              fullWidth
              multiline
              rows={6}
            />

            <FormControlLabel
              control={
                <Switch 
                  checked={priorita} 
                  onChange={(e) => setPriorita(e.target.checked)} 
                />
              }
              label="Priorità Alta"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleComposeClose}>Annulla</Button>
          <Button 
            variant="contained" 
            onClick={handleSendMessage} 
            startIcon={<Send />} 
            disabled={!destinatario || !oggetto.trim() || !contenuto.trim()}
          >
            Invia
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Risposta */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rispondi al Messaggio</DialogTitle>

        <DialogContent>
          <TextField
            label="Risposta"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
            fullWidth
            multiline
            rows={6}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReplyOpen(false)}>Annulla</Button>
          <Button 
            variant="contained" 
            onClick={handleSendReply} 
            startIcon={<Reply />} 
            disabled={!replyContent.trim()}
          >
            Rispondi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMessagingPage;