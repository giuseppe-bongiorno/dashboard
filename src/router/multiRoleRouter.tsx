import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage';
// Layouts
import AdminLayout from '@/components/layouts/AdminLayout';
import DevLayout from '@/components/layouts/DevLayout';
import DocLayout from '@/components/layouts/DocLayout';
import UserLayout from '@/components/layouts/UserLayout';

// Public Pages
import LoginPage from '@/pages/LoginPage';
//import RoleTestPage from '@/pages/RoleTestPage';
import { NotFoundPage, ServerErrorPage } from '@/pages/ErrorPages';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';

// Common Pages (for other roles)
import DashboardPage from '@/pages/DashboardPage';
import SystemHealthPage from '@/pages/SystemHealthPage';
import AdminMessagingPage from '@/pages/admin/AdminMessagingPage';

export const multiRoleRouter = createBrowserRouter([
  // ====================================
  // PUBLIC ROUTES
  // ====================================
  {
    path: '/login',
    element: <LoginPage />,
  },
 /** {
    path: '/role-test',
    element: <RoleTestPage />,
  },*/

  // ====================================
  // ADMIN ROUTES (Role: ROLE_ADMIN)
  // ====================================
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />, // ✅ NUOVA DASHBOARD ADMIN
      },
      {
        path: 'users',
        element: <DashboardPage />,
      },
      {
        path: 'analytics',
        element: <DashboardPage />,
      },
      {
        path: 'security',
        element: <DashboardPage />,
      },
      {
        path: 'health',
        element: <SystemHealthPage />,
      },
      {
        path: 'settings',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <DashboardPage />,
      },
      {
        path: 'messages',
        element: <AdminMessagingPage />,
      },
      {
        path: 'notifications',
        element: <AdminNotificationsPage />,
      },
    ],
  },

  // ====================================
  // DEVELOPER ROUTES (Role: ROLE_DEV)
  // ====================================
  {
    path: '/dev',
    element: (
      <ProtectedRoute allowedRoles={['DEV']}>
        <DevLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'api',
        element: <DashboardPage />,
      },
      {
        path: 'logs',
        element: <DashboardPage />,
      },
      {
        path: 'debug',
        element: <DashboardPage />,
      },
      {
        path: 'database',
        element: <DashboardPage />,
      },
      {
        path: 'health',
        element: <SystemHealthPage />,
      },
      {
        path: 'config',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <DashboardPage />,
      },
    ],
  },

  // ====================================
  // DOCTOR ROUTES (Role: ROLE_DOC)
  // ====================================
  {
    path: '/doc',
    element: (
      <ProtectedRoute allowedRoles={['DOC']}>
        <DocLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'patients',
        element: <DashboardPage />,
      },
      {
        path: 'appointments',
        element: <DashboardPage />,
      },
      {
        path: 'prescriptions',
        element: <DashboardPage />,
      },
      {
        path: 'records',
        element: <DashboardPage />,
      },
      {
        path: 'reports',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <DashboardPage />,
      },
      {
        path: 'schedule',
        element: <DashboardPage />,
      },
    ],
  },

  // ====================================
  // USER ROUTES (Role: ROLE_USER)
  // ====================================
  {
    path: '/user',
    element: (
      <ProtectedRoute allowedRoles={['USER']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'documents',
        element: <DashboardPage />,
      },
      {
        path: 'appointments',
        element: <DashboardPage />,
      },
      {
        path: 'health',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <DashboardPage />,
      },
      {
        path: 'settings',
        element: <DashboardPage />,
      },
    ],
  },

  // ====================================
  // ROOT REDIRECT
  // ====================================
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // ====================================
  // ERROR PAGES
  // ====================================
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '/500',
    element: <ServerErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default multiRoleRouter;