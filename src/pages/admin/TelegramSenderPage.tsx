import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Popover,
  Grid,
} from '@mui/material';
import {
  Telegram,
  Send,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  Refresh,
  Delete,
  Visibility,
  VisibilityOff,
  Description,
  EmojiEmotions,
} from '@mui/icons-material';
import { useDocumentTitle, useNotification } from '@/hooks';
import { TelegramMessage, TelegramStats } from '@/types';
import telegramService from '@/services/telegram.service';

const TelegramSenderPage: React.FC = () => {
  useDocumentTitle('Telegram Sender - MyFamilyDoc Admin');
  const { showSuccess, showError } = useNotification();

  // Ref for textarea to maintain cursor position
  const messageInputRef = React.useRef<HTMLTextAreaElement>(null);

  // Form state
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('@familydocapp');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common emojis for quick access
  const commonEmojis = [
    // Faces
    '😊', '😃', '🎉', '👍', '❤️', '🔥', '⚡', '✨', '💪', '🚀',
    // Medical
    '🏥', '💊', '💉', '🩺', '❤️‍🩹', '🧬', '🔬', '📋', '📝', '📄',
    // Symbols
    '✅', '❌', '⚠️', 'ℹ️', '📢', '🔔', '📱', '💻', '📧', '📞',
    // Arrows & Misc
    '➡️', '⬅️', '⬆️', '⬇️', '🎯', '💡', '🔑', '🆕', '🆗', '🆘',
  ];

  // Data state
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [stats, setStats] = useState<TelegramStats | null>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [messagesRes, statsRes] = await Promise.all([
        telegramService.getMessages(),
        telegramService.getStats(),
      ]);

      if (messagesRes.success && messagesRes.data) {
        setMessages(messagesRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      showError('Errore nel caricamento dei messaggi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    const textarea = messageInputRef.current;
    if (!textarea) {
      setMessage(message + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    
    setMessage(newMessage);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!botToken.trim()) {
      showError('Inserisci il Bot Token');
      return;
    }

    if (!chatId.trim()) {
      showError('Inserisci il Chat ID');
      return;
    }

    if (!message.trim()) {
      showError('Inserisci il messaggio');
      return;
    }

    setSending(true);

    try {
      const response = await telegramService.sendMessage({
        botToken,
        chatId,
        message,
      });

      if (response.success) {
        showSuccess('Messaggio inviato con successo!');
        setMessage('');
        fetchData();
      } else {
        showError(response.error?.message || 'Errore durante l\'invio');
      }
    } catch (error) {
      showError('Errore durante l\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  // Handle retry
  const handleRetry = async (id: string) => {
    try {
      const response = await telegramService.retryMessage(id);
      if (response.success) {
        showSuccess('Messaggio reinviato');
        fetchData();
      } else {
        showError('Errore durante il reinvio');
      }
    } catch (error) {
      showError('Errore durante il reinvio');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo messaggio?')) return;

    try {
      const response = await telegramService.deleteMessage(id);
      if (response.success) {
        showSuccess('Messaggio eliminato');
        fetchData();
      } else {
        showError('Errore durante l\'eliminazione');
      }
    } catch (error) {
      showError('Errore durante l\'eliminazione');
    }
  };

  // Get status color
  const getStatusColor = (status: TelegramMessage['status']) => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Telegram sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Telegram Sender
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invia messaggi al canale Telegram MyFamilyDoc
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Totale Messaggi
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {stats?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Inviati
              </Typography>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {stats?.sent || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Falliti
              </Typography>
              <Typography variant="h4" fontWeight={600} color="error.main">
                {stats?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                In Attesa
              </Typography>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {stats?.pending || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Send Message Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Invia Messaggio Telegram
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compila tutti i campi per inviare un messaggio al canale Telegram
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="🔑 Bot Token"
              type={showToken ? 'text' : 'password'}
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Inserisci il bot token (es: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Telegram color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                      size="small"
                    >
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Ottieni il token da @BotFather su Telegram"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="👥 Chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="@nomechannel o ID numerico (es: -1001234567890)"
              required
              helperText="Usa @nomechannel per canali pubblici o l'ID numerico per chat private"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography component="label" htmlFor="message-field" sx={{ fontWeight: 500 }}>
                💬 Messaggio
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<EmojiEmotions />}
                  label="Emoji & Markdown supportati"
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>
            </Box>
            
            {/* Emoji Resource Links */}
            <Box 
              sx={{ 
                mb: 1.5, 
                p: 1.5, 
                bgcolor: 'action.hover', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                🔗 Risorse Emoji:
              </Typography>
              <Button
                size="small"
                variant="text"
                href="https://emojipedia.org/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  minWidth: 'auto', 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                }}
              >
                Emojipedia
              </Button>
              <Typography variant="caption" color="text.disabled">•</Typography>
              <Button
                size="small"
                variant="text"
                href="https://getemoji.com/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  minWidth: 'auto', 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                }}
              >
                Get Emoji
              </Button>
              <Typography variant="caption" color="text.disabled">•</Typography>
              <Button
                size="small"
                variant="text"
                href="https://www.emojicopy.com/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  minWidth: 'auto', 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                }}
              >
                Emoji Copy
              </Button>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                id="message-field"
                fullWidth
                multiline
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                inputRef={messageInputRef}
                placeholder="Scrivi qui il tuo messaggio...

Puoi usare emoji: 😊 🎉 ✅ ❤️ 🚀 💪 🔥 ⚡ 🎯

E formattazione Markdown:
*grassetto* _corsivo_ __sottolineato__
`codice` ```blocco codice```
[link](https://example.com)"
                required
                helperText={`${message.length} caratteri | Supporta HTML, Markdown e tutte le emoji Telegram`}
                inputProps={{
                  style: {
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  },
                }}
              />
              <Tooltip title="Seleziona emoji">
                <IconButton
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  sx={{
                    position: 'absolute',
                    bottom: 35,
                    right: 10,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  color={showEmojiPicker ? 'primary' : 'default'}
                >
                  <EmojiEmotions />
                </IconButton>
              </Tooltip>

              {/* Emoji Picker Popover */}
              <Popover
                open={showEmojiPicker}
                anchorEl={messageInputRef.current}
                onClose={() => setShowEmojiPicker(false)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <Paper sx={{ p: 2, maxWidth: 320 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Emoji Rapide
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(10, 1fr)',
                      gap: 0.5,
                      mt: 1,
                    }}
                  >
                    {commonEmojis.map((emoji, index) => (
                      <Tooltip key={index} title={emoji} arrow>
                        <IconButton
                          size="small"
                          onClick={() => {
                            insertEmoji(emoji);
                          }}
                          sx={{
                            fontSize: '1.5rem',
                            '&:hover': {
                              bgcolor: 'action.hover',
                              transform: 'scale(1.2)',
                            },
                            transition: 'transform 0.1s',
                          }}
                        >
                          {emoji}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                  <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      💡 Tip: Usa Win+. (Windows) o Cmd+Ctrl+Space (Mac) per più emoji
                    </Typography>
                  </Box>
                </Paper>
              </Popover>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
              onClick={handleSendMessage}
              disabled={sending}
              sx={{
                py: 1.5,
                bgcolor: '#0088cc',
                '&:hover': {
                  bgcolor: '#006699',
                },
                '&:disabled': {
                  bgcolor: '#999999',
                },
              }}
            >
              {sending ? 'Invio in corso...' : '📤 Invia Messaggio'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Message History */}
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description />
            <Typography variant="h6" fontWeight={600}>
              Storico Messaggi
            </Typography>
          </Box>
          <Tooltip title="Aggiorna">
            <IconButton onClick={fetchData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#0088cc' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Data/Ora</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Chat ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Messaggio</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Stato</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nessun messaggio inviato
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id} hover>
                    <TableCell>{formatDate(msg.sentAt || msg.createdAt)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {msg.chatId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={msg.status === 'SENT' ? 'Inviato' : msg.status === 'FAILED' ? 'Fallito' : 'In attesa'}
                        color={getStatusColor(msg.status)}
                        size="small"
                        icon={
                          msg.status === 'SENT' ? (
                            <CheckCircle fontSize="small" />
                          ) : msg.status === 'FAILED' ? (
                            <ErrorIcon fontSize="small" />
                          ) : (
                            <Schedule fontSize="small" />
                          )
                        }
                      />
                      {msg.errorMessage && (
                        <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                          {msg.errorMessage}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {msg.status === 'FAILED' && (
                          <Tooltip title="Riprova">
                            <IconButton size="small" onClick={() => handleRetry(msg.id)} color="primary">
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Elimina">
                          <IconButton size="small" onClick={() => handleDelete(msg.id)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TelegramSenderPage;