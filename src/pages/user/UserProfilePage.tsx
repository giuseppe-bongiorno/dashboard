import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
  Divider,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Key,
  CalendarToday,
  VerifiedUser,
  Shield,
  Login,
  Devices,
  ContentCopy,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAppSelector, useDocumentTitle, useNotification } from '@/hooks';
import apiClient from '@/services/api';

const UserProfilePage: React.FC = () => {
  useDocumentTitle('Profilo - MyFamilyDoc');
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useNotification();

  // State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const userEmail = user?.email || '';
  const userName = user?.firstName || '';
  const userFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || userName;
  //const userRoles = user?.role || [];
const userRoles: string[] = (() => {
    const r = user?.role;
    if (!r) return [];
    if (Array.isArray(r)) return r;
    return [String(r)];
  })();
  const userId = user?.id || '';

  // ── Password Reset ─────────────────────────────────────────────

  const handleResetPassword = async () => {
    if (!userEmail) {
      showError('Email non disponibile');
      return;
    }

    setResetLoading(true);
    try {
      // Chiama l'endpoint esistente di forgot-password
      const response = await apiClient.post('/auth/forgot-password', {
        email: userEmail,
      });

      if (response.data?.success) {
        setResetSent(true);
        showSuccess('Email di reset password inviata. Controlla la tua casella di posta.');
      } else {
        showError(response.data?.message || 'Errore durante la richiesta');
      }
    } catch (error: any) {
      // L'endpoint restituisce sempre successo per sicurezza
      setResetSent(true);
      showSuccess('Se l\'email è registrata, riceverai un link per il reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // ── Copy to clipboard ──────────────────────────────────────────

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // ── Role display ───────────────────────────────────────────────

  const getRoleLabel = (role: string): string => {
    const clean = role.replace('ROLE_', '');
    switch (clean) {
      case 'ADMIN': return 'Amministratore';
      case 'DEV': return 'Developer';
      case 'DOC': return 'Medico';
      case 'USER': return 'Paziente';
      default: return clean;
    }
  };

  const getRoleColor = (role: string): 'error' | 'info' | 'success' | 'warning' => {
    const clean = role.replace('ROLE_', '');
    switch (clean) {
      case 'ADMIN': return 'error';
      case 'DEV': return 'info';
      case 'DOC': return 'success';
      case 'USER': return 'warning';
      default: return 'info';
    }
  };

  // ── Info Row Component ─────────────────────────────────────────

  const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    copyable?: boolean;
    chip?: React.ReactNode;
  }> = ({ icon, label, value, copyable, chip }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 1,
        '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
      }}
    >
      <Box sx={{ color: 'text.secondary', mr: 2, display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body1" fontWeight={500} noWrap>
            {value || '—'}
          </Typography>
          {chip}
        </Stack>
      </Box>
      {copyable && value && (
        <Tooltip title={copiedField === label ? 'Copiato!' : 'Copia'}>
          <IconButton size="small" onClick={() => handleCopy(value, label)}>
            {copiedField === label ? (
              <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
            ) : (
              <ContentCopy sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Il mio Profilo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualizza i tuoi dati personali e gestisci la sicurezza del tuo account
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'primary.main',
                  fontSize: 36,
                  fontWeight: 700,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {(userFullName?.[0] || userEmail?.[0] || 'U').toUpperCase()}
              </Avatar>

              <Typography variant="h5" fontWeight={600} gutterBottom>
                {userFullName}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userEmail}
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                {userRoles.map((role: string) => (
                  <Chip
                    key={role}
                    label={getRoleLabel(role)}
                    color={getRoleColor(role)}
                    size="small"
                  />
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="caption" color="text.secondary">
                ID Utente: {userId}
              </Typography>
            </CardContent>
          </Card>

          {/* Security Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Sicurezza
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Key />}
                  fullWidth
                  onClick={() => setResetDialogOpen(true)}
                  disabled={resetSent}
                >
                  {resetSent ? 'Email di reset inviata' : 'Cambia Password'}
                </Button>
              </Stack>

              {resetSent && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Controlla la tua casella email per il link di reset.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Account Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Dati Account
            </Typography>
            <Divider sx={{ mb: 1 }} />

            <InfoRow
              icon={<Person />}
              label="Username"
              value={user?.firstName || '—'}
              copyable
            />

            <InfoRow
              icon={<Email />}
              label="Email"
              value={userEmail}
              copyable
              chip={
                <Chip
                  label="Verificata"
                  color="success"
                  size="small"
                  icon={<VerifiedUser />}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              }
            />

            <InfoRow
              icon={<Person />}
              label="Nome"
              value={user?.firstName || '—'}
            />

            <InfoRow
              icon={<Person />}
              label="Cognome"
              value={user?.lastName || '—'}
            />

            <InfoRow
              icon={<Shield />}
              label="Ruolo"
              value={userRoles.map((r: string) => getRoleLabel(r)).join(', ') || '—'}
            />

            <InfoRow
              icon={<CalendarToday />}
              label="ID Utente"
              value={String(userId)}
              copyable
            />
          </Paper>

          {/* Account Info */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Informazioni Account
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              Per modificare username o email, contatta l'amministratore del sistema.
            </Alert>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Autenticazione a due fattori (OTP)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Il codice OTP viene inviato via email ad ogni accesso
                  </Typography>
                </Box>
                <Chip label="Attivo" color="success" size="small" icon={<CheckCircle />} />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Notifiche Push
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ricevi notifiche sull'app mobile
                  </Typography>
                </Box>
                <Chip label="Configurabile dall'app" size="small" variant="outlined" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambio Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Verrà inviata un'email a <strong>{userEmail}</strong> con un link per impostare una nuova password.
            Il link sarà valido per 24 ore.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Dopo il reset dovrai effettuare nuovamente il login su tutti i dispositivi.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            onClick={() => {
              setResetDialogOpen(false);
              handleResetPassword();
            }}
            startIcon={resetLoading ? <CircularProgress size={20} /> : <Key />}
            disabled={resetLoading}
          >
            Invia Email di Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfilePage;