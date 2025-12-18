import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  PersonAdd,
  CheckCircle,
  Cancel,
  Email,
  Delete,
  Key,
  Refresh,
  CloudDownload,
  People,
  PersonOff,
  VerifiedUser,
} from '@mui/icons-material';
import { useDocumentTitle, useNotification } from '@/hooks';
import { ROLE_DISPLAY_NAMES, UserRole, UserManagement, UserFilters, UserStats } from '@/types';
import userManagementService from '@/services/user-management.service';

const UserManagementPage: React.FC = () => {
  useDocumentTitle('User Management - MyFamilyDoc Admin');
  const { showSuccess, showError } = useNotification();

  // State
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'ALL',
    status: 'ALL',
    emailVerified: 'ALL',
  });

  // Action menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        userManagementService.getUsers(filters),
        userManagementService.getUserStats(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      showError('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value });
    setPage(0);
  };

  const handleRoleFilter = (event: any) => {
    setFilters({ ...filters, role: event.target.value });
    setPage(0);
  };

  const handleStatusFilter = (event: any) => {
    setFilters({ ...filters, status: event.target.value });
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserManagement) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEnableUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    handleMenuClose();

    try {
      const response = await userManagementService.enableUser(selectedUser.id);
      if (response.success) {
        showSuccess('Utente abilitato con successo');
        fetchData();
      } else {
        showError(response.error?.message || 'Errore durante l\'abilitazione');
      }
    } catch (error) {
      showError('Errore durante l\'abilitazione dell\'utente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    handleMenuClose();

    try {
      const response = await userManagementService.disableUser(selectedUser.id);
      if (response.success) {
        showSuccess('Utente disabilitato con successo');
        fetchData();
      } else {
        showError(response.error?.message || 'Errore durante la disabilitazione');
      }
    } catch (error) {
      showError('Errore durante la disabilitazione dell\'utente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    handleMenuClose();

    try {
      const response = await userManagementService.verifyEmail(selectedUser.id);
      if (response.success) {
        showSuccess('Email verificata con successo');
        fetchData();
      } else {
        showError(response.error?.message || 'Errore durante la verifica');
      }
    } catch (error) {
      showError('Errore durante la verifica dell\'email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    handleMenuClose();

    try {
      const response = await userManagementService.resetPassword(selectedUser.id);
      if (response.success) {
        showSuccess('Email di reset password inviata');
        fetchData();
      } else {
        showError(response.error?.message || 'Errore durante l\'invio');
      }
    } catch (error) {
      showError('Errore durante il reset della password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setDeleteDialogOpen(false);

    try {
      const response = await userManagementService.deleteUser(selectedUser.id, 'Deleted by admin');
      if (response.success) {
        showSuccess('Utente eliminato con successo');
        fetchData();
      } else {
        showError(response.error?.message || 'Errore durante l\'eliminazione');
      }
    } catch (error) {
      showError('Errore durante l\'eliminazione dell\'utente');
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get role color
  const getRoleColor = (role: UserRole): 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'DEV':
        return 'info';
      case 'DOC':
        return 'success';
      case 'USER':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Gestione Utenti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestisci tutti gli utenti registrati sulla piattaforma
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAdd />} color="primary">
          Nuovo Utente
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Utenti Totali
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.total || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Utenti Attivi
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.active || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Utenti Inattivi
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.inactive || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <PersonOff />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Utenti Eliminati
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.deleted || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Delete />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Cerca per username, email o ID..."
              value={filters.search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Ruolo</InputLabel>
              <Select value={filters.role} onChange={handleRoleFilter} label="Ruolo">
                <MenuItem value="ALL">Tutti</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="DEV">Developer</MenuItem>
                <MenuItem value="DOC">Dottore</MenuItem>
                <MenuItem value="USER">Paziente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Stato</InputLabel>
              <Select value={filters.status} onChange={handleStatusFilter} label="Stato">
                <MenuItem value="ALL">Tutti</MenuItem>
                <MenuItem value="enabled">Abilitati</MenuItem>
                <MenuItem value="disabled">Disabilitati</MenuItem>
                <MenuItem value="deleted">Eliminati</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                disabled={loading}
              >
                Aggiorna
              </Button>
              <Button variant="outlined" startIcon={<CloudDownload />}>
                Esporta
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utente</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ruolo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Email Verificata</TableCell>
                <TableCell>Ultimo Accesso</TableCell>
                <TableCell>Registrato il</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(user.role) }}>
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_DISPLAY_NAMES[user.role as UserRole]}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.deletedAt ? (
                      <Chip label="Eliminato" color="error" size="small" icon={<Delete />} />
                    ) : user.enabled ? (
                      <Chip label="Attivo" color="success" size="small" icon={<CheckCircle />} />
                    ) : (
                      <Chip label="Disabilitato" color="warning" size="small" icon={<Cancel />} />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Chip label="Verificata" color="success" size="small" icon={<VerifiedUser />} />
                    ) : (
                      <Chip label="Non verificata" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(user.lastLoginAt)}</Typography>
                    {user.lastLoginIp && (
                      <Typography variant="caption" color="text.secondary">
                        IP: {user.lastLoginIp}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Azioni">
                      <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Righe per pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} di ${count}`}
        />
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedUser?.enabled ? (
          <MenuItem onClick={handleDisableUser}>
            <Cancel sx={{ mr: 1 }} /> Disabilita Utente
          </MenuItem>
        ) : (
          <MenuItem onClick={handleEnableUser}>
            <CheckCircle sx={{ mr: 1 }} /> Abilita Utente
          </MenuItem>
        )}
        {!selectedUser?.emailVerified && (
          <MenuItem onClick={handleVerifyEmail}>
            <Email sx={{ mr: 1 }} /> Verifica Email
          </MenuItem>
        )}
        <MenuItem onClick={handleResetPassword}>
          <Key sx={{ mr: 1 }} /> Reset Password
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Elimina Utente
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare l'utente <strong>{selectedUser?.username}</strong>?
            <br />
            Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {actionLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default UserManagementPage;