import React, { useEffect } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { removeNotification } from '@/store/slices/uiSlice';

const NotificationManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    // Auto-remove notifications after their duration
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            top: { xs: 8, sm: 24 + index * 70 },
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%', minWidth: 300 }}
            role="alert"
            aria-live="polite"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationManager;
