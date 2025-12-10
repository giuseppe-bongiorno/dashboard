import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/MainLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import GDPRPage from '@/pages/GDPRPage';
import { NotFoundPage, ServerErrorPage } from '@/pages/ErrorPages';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SettingsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/gdpr',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <GDPRPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
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
    element: <Navigate to="/404" replace />,
  },
]);

export default router;
