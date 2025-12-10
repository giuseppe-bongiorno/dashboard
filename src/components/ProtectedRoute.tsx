import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have a valid token
      const hasValidToken = authService.isAuthenticated();

      if (hasValidToken && !user) {
        // Token exists but user not loaded, fetch user data
        await dispatch(fetchCurrentUser());
      }

      setChecking(false);
    };

    checkAuth();
  }, [dispatch, user]);

  // Show loading spinner while checking authentication
  if (checking || isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        role="status"
        aria-label="Loading authentication status"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
