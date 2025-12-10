import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Download,
  DeleteForever,
  Security,
  Info,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { gdprService } from '@/services/gdpr.service';
import { useAppSelector, useNotification, useDocumentTitle } from '@/hooks';

const GDPRPage: React.FC = () => {
  useDocumentTitle('GDPR & Privacy - MyFamilyDoc');
  
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError, showInfo } = useNotification();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const {
    control: deleteControl,
    handleSubmit: handleDeleteSubmit,
    watch: watchDelete,
  } = useForm({
    defaultValues: {
      reason: '',
      confirmEmail: '',
      understand: false,
    },
  });

  const handleDataExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      if (!user) return;

      const response = await gdprService.requestDataExport({
        email: user.email,
        dataTypes: ['profile', 'activity', 'consents'],
        format,
      });

      if (response.success) {
        showSuccess(`Data export initiated. You'll receive an email with the download link.`);
        setExportDialogOpen(false);
      } else {
        showError(response.error?.message || 'Failed to request data export');
      }
    } catch (error) {
      showError('An error occurred while requesting data export');
    }
  };

  const onDeleteSubmit = async (data: any) => {
    if (!user || data.confirmEmail !== user.email) {
      showError('Email confirmation does not match');
      return;
    }

    if (!data.understand) {
      showError('Please confirm you understand the consequences');
      return;
    }

    try {
      const response = await gdprService.requestAccountDeletion({
        userId: user.id,
        email: user.email,
        reason: data.reason,
      });

      if (response.success) {
        showSuccess(
          'Account deletion request submitted. You will receive a confirmation email shortly.'
        );
        setDeleteDialogOpen(false);
        setDeleteConfirmed(false);
      } else {
        showError(response.error?.message || 'Failed to request account deletion');
      }
    } catch (error) {
      showError('An error occurred while requesting account deletion');
    }
  };

  const consentPreferences = gdprService.getConsentPreferences();

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        GDPR & Privacy
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your data rights and privacy preferences
      </Typography>

      {/* Your Data Rights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Your Data Rights
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Under GDPR, you have the following rights regarding your personal data:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Access"
                secondary="Request a copy of your personal data"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Rectification"
                secondary="Update or correct your personal data"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Erasure"
                secondary="Request deletion of your personal data"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Right to Data Portability"
                secondary="Export your data in a machine-readable format"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Download color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Export Your Data
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Download a copy of all your personal data stored in our system. This includes
            your profile information, activity history, and consent records.
          </Typography>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
          >
            Request Data Export
          </Button>
        </CardContent>
      </Card>

      {/* Cookie Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Info color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Cookie & Consent Preferences
            </Typography>
          </Box>

          {consentPreferences ? (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Last updated: {new Date(consentPreferences.timestamp).toLocaleDateString()}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Functional Cookies"
                  color="success"
                  icon={<CheckCircle />}
                  size="small"
                />
                <Chip
                  label={`Analytics: ${consentPreferences.analytics ? 'Enabled' : 'Disabled'}`}
                  color={consentPreferences.analytics ? 'success' : 'default'}
                  size="small"
                />
                <Chip
                  label={`Marketing: ${consentPreferences.marketing ? 'Enabled' : 'Disabled'}`}
                  color={consentPreferences.marketing ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Button variant="outlined" sx={{ mt: 2 }} size="small">
                Update Preferences
              </Button>
            </>
          ) : (
            <Alert severity="info">
              No consent preferences found. Cookie consent will be requested on your next visit.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <DeleteForever color="error" />
            <Typography variant="h6" fontWeight={600}>
              Delete Your Account
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action is permanent and cannot be undone. All your
            data will be permanently deleted from our systems.
          </Alert>

          <Typography variant="body2" color="text.secondary" paragraph>
            If you wish to permanently delete your account and all associated data, you can
            request account deletion. You will receive a confirmation email with instructions
            to complete the process.
          </Typography>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Request Account Deletion
          </Button>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose your preferred format for the data export:
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleDataExport('json')}
            >
              JSON Format
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleDataExport('csv')}
            >
              CSV Format
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleDataExport('pdf')}
            >
              PDF Format
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteConfirmed(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            Delete Account
          </Box>
        </DialogTitle>
        <form onSubmit={handleDeleteSubmit(onDeleteSubmit)}>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 3 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </Alert>

            <Controller
              name="reason"
              control={deleteControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reason for deletion (optional)"
                  multiline
                  rows={3}
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <Controller
              name="confirmEmail"
              control={deleteControl}
              rules={{
                required: 'Please confirm your email',
                validate: (value) =>
                  value === user?.email || 'Email does not match',
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label={`Type "${user?.email}" to confirm`}
                  fullWidth
                  margin="normal"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name="understand"
              control={deleteControl}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="I understand this action is permanent and cannot be undone"
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmed(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={!watchDelete('understand')}
            >
              Delete My Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GDPRPage;
