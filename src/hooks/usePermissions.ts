import { useAppSelector } from './index';
import type { UserRole } from '@/types';
import { ROLE_PERMISSIONS } from '@/types';

/**
 * Hook to check user permissions and roles
 */
export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has one of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.every((role) => user.role === role);
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions (check with uppercase ADMIN)
    if (user.role === 'ADMIN') return true;

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Check if user has wildcard permission
    if (rolePermissions.includes('*')) return true;

    // Check if user has specific permission
    if (rolePermissions.includes(permission)) return true;

    // Check user's custom permissions
    if (user.permissions && user.permissions.includes(permission)) return true;

    return false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  /**
   * Get all user permissions (role + custom)
   */
  const getAllPermissions = (): string[] => {
    if (!user) return [];

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const customPermissions = user.permissions || [];

    return [...new Set([...rolePermissions, ...customPermissions])];
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN';
  };

  /**
   * Check if user is developer
   */
  const isDev = (): boolean => {
    return user?.role === 'DEV';
  };

  /**
   * Check if user is doctor
   */
  const isDoc = (): boolean => {
    return user?.role === 'DOC';
  };

  /**
   * Check if user is regular user/patient
   */
  const isUser = (): boolean => {
    return user?.role === 'USER';
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    isAdmin,
    isDev,
    isDoc,
    isUser,
  };
};

export default usePermissions;