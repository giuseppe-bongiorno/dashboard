import React, { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { router } from '@/router';
import { createAppTheme } from '@/theme';
import { useAppSelector } from '@/hooks';
import CookieConsent from '@/components/CookieConsent';
import NotificationManager from '@/components/NotificationManager';

// Theme wrapper component to access Redux state
const ThemedApp: React.FC = () => {
  const themeMode = useAppSelector((state) => state.ui.theme);

  // Determine actual theme mode
  const actualMode = useMemo(() => {
    if (themeMode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return themeMode;
  }, [themeMode]);

  const theme = useMemo(() => createAppTheme(actualMode), [actualMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Force re-render by updating a dummy state or use a theme change
        window.dispatchEvent(new Event('themechange'));
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <CookieConsent />
      <NotificationManager />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
};

export default App;
