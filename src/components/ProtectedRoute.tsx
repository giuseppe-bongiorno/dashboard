import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import type { UserRole } from '@/types';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // If specified, only these roles can access
  redirectTo?: string; // Custom redirect path
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login',
}) => {
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
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user.role);
    
    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user's role
      const roleDashboards: Record<UserRole, string> = {
        ADMIN: '/admin',
        DEV: '/dev',
        DOC: '/doc',
        USER: '/user',
      };
      
      return <Navigate to={roleDashboards[user.role] || '/login'} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;