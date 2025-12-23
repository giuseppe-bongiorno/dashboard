import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Link,
  Divider,
} from '@mui/material';
import { gdprService } from '@/services/gdpr.service';

const CookieConsent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    functional: true, // Required cookies, always true
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = gdprService.getConsentPreferences();
    if (!existingConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    gdprService.saveConsentPreferences(allAccepted);
    setOpen(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      analytics: false,
      marketing: false,
      functional: true, // Functional cookies are required
    };
    setPreferences(rejected);
    gdprService.saveConsentPreferences(rejected);
    setOpen(false);
  };

  const handleSavePreferences = () => {
    gdprService.saveConsentPreferences(preferences);
    setOpen(false);
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    if (key === 'functional') return; // Cannot change functional cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: { xs: 0, sm: 16 },
          left: { xs: 0, sm: 16 },
          right: { xs: 0, sm: 'auto' },
          m: 0,
          maxWidth: { xs: '100%', sm: 500 },
        },
      }}
    >
      <DialogTitle id="cookie-consent-title">
        <Typography variant="h6" component="span">
          🍪 Cookie Settings
        </Typography>
      </DialogTitle>

      <DialogContent id="cookie-consent-description">
        <Typography variant="body2" color="text.secondary" gutterBottom>
          We use cookies and similar technologies to enhance your experience, analyze
          site traffic, and personalize content. By clicking "Accept All", you consent
          to our use of cookies.
        </Typography>

        {!showDetails ? (
          <Box mt={2}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setShowDetails(true)}
              sx={{ cursor: 'pointer' }}
            >
              Customize preferences
            </Link>
          </Box>
        ) : (
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preferences.functional}
                    disabled
                    inputProps={{
                      'aria-label': 'Functional cookies - required and cannot be disabled',
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Strictly Necessary Cookies
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Required for the website to function. Cannot be disabled.
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    inputProps={{
                      'aria-label': 'Analytics cookies',
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Analytics Cookies
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Help us understand how visitors interact with our website.
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    inputProps={{
                      'aria-label': 'Marketing cookies',
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Marketing Cookies
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Used to deliver personalized ads based on your interests.
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                For more information, please read our{' '}
                <Link href="/privacy-policy" target="_blank" rel="noopener">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/cookie-policy" target="_blank" rel="noopener">
                  Cookie Policy
                </Link>
                .
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!showDetails ? (
          <>
            <Button onClick={handleRejectAll} color="inherit">
              Reject All
            </Button>
            <Button onClick={handleAcceptAll} variant="contained">
              Accept All
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleRejectAll} color="inherit">
              Reject All
            </Button>
            <Button onClick={handleSavePreferences} variant="contained">
              Save Preferences
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CookieConsent;
