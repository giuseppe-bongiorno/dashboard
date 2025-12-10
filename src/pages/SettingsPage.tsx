import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Button,
} from '@mui/material';
import { Notifications, Language, Palette, Lock } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useNotification, useDocumentTitle } from '@/hooks';
import { setTheme } from '@/store/slices/uiSlice';

const SettingsPage: React.FC = () => {
  useDocumentTitle('Settings - MyFamilyDoc');
  
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { showSuccess } = useNotification();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'public',
      activityTracking: true,
    },
    language: 'en',
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: any) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: typeof value === 'boolean' ? value : value,
      },
    }));
  };

  const handleSaveSettings = () => {
    // API call would go here
    console.log('Saving settings:', settings);
    showSuccess('Settings saved successfully');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Customize your application preferences
      </Typography>

      {/* Appearance Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Palette color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Appearance
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              value={theme}
              label="Theme"
              onChange={(e) => dispatch(setTheme(e.target.value as any))}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto (System Preference)</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Choose your preferred color theme. Auto mode will match your system settings.
          </Typography>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Language color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Language & Region
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={settings.language}
              label="Language"
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, language: e.target.value }))
              }
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="it">Italiano</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Notifications color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Choose how you want to receive notifications
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Email Notifications
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive notifications via email
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Push Notifications
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive push notifications in your browser
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    SMS Notifications
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive important alerts via SMS
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Lock color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Privacy
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Control your privacy and data sharing preferences
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="profile-visibility-label">Profile Visibility</InputLabel>
            <Select
              labelId="profile-visibility-label"
              value={settings.privacy.profileVisibility}
              label="Profile Visibility"
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="friends">Friends Only</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={settings.privacy.activityTracking}
                onChange={(e) =>
                  handlePrivacyChange('activityTracking', e.target.checked)
                }
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Activity Tracking
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allow us to track your activity to improve your experience
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" size="large">
          Reset to Defaults
        </Button>
        <Button variant="contained" size="large" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
