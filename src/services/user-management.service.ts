import { ApiResponse, UserRole, UserManagement, UserStats, UserFilters } from '@/types';

// Mock data generator
const generateMockUsers = (): UserManagement[] => {
  const users: UserManagement[] = [
    {
      id: '1',
      username: 'admin_giuseppe',
      email: 'giuseppe@myfamilydoc.it',
      role: 'ADMIN',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-12-18T14:22:00Z',
      lastLoginAt: '2024-12-18T14:22:00Z',
      lastLoginIp: '192.168.1.100',
      emailVerifiedAt: '2024-01-15T11:00:00Z',
    },
    {
      id: '2',
      username: 'dev_marco',
      email: 'marco.rossi@myfamilydoc.it',
      role: 'DEV',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-02-10T09:15:00Z',
      updatedAt: '2024-12-17T16:45:00Z',
      lastLoginAt: '2024-12-17T16:45:00Z',
      lastLoginIp: '192.168.1.101',
      emailVerifiedAt: '2024-02-10T09:30:00Z',
    },
    {
      id: '3',
      username: 'dr_bianchi',
      email: 'laura.bianchi@ospedale.it',
      role: 'DOC',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-03-05T14:20:00Z',
      updatedAt: '2024-12-18T08:30:00Z',
      lastLoginAt: '2024-12-18T08:30:00Z',
      lastLoginIp: '10.0.0.50',
      emailVerifiedAt: '2024-03-05T15:00:00Z',
    },
    {
      id: '4',
      username: 'dr_verdi',
      email: 'giovanni.verdi@clinica.it',
      role: 'DOC',
      enabled: true,
      emailVerified: true,
      otpVerified: false,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-03-12T11:00:00Z',
      updatedAt: '2024-12-16T10:20:00Z',
      lastLoginAt: '2024-12-16T10:20:00Z',
      lastLoginIp: '10.0.0.51',
      emailVerifiedAt: '2024-03-12T12:00:00Z',
    },
    {
      id: '5',
      username: 'paziente_mario',
      email: 'mario.rossi@gmail.com',
      role: 'USER',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-04-20T16:30:00Z',
      updatedAt: '2024-12-18T12:00:00Z',
      lastLoginAt: '2024-12-18T12:00:00Z',
      lastLoginIp: '93.45.123.45',
      emailVerifiedAt: '2024-04-20T17:00:00Z',
    },
    {
      id: '6',
      username: 'paziente_anna',
      email: 'anna.neri@yahoo.it',
      role: 'USER',
      enabled: true,
      emailVerified: false,
      otpVerified: false,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-05-10T10:00:00Z',
      updatedAt: '2024-05-10T10:00:00Z',
      emailVerifiedAt: undefined,
    },
    {
      id: '7',
      username: 'paziente_luca',
      email: 'luca.ferrari@libero.it',
      role: 'USER',
      enabled: false,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: false,
      anonymized: false,
      createdAt: '2024-06-15T14:30:00Z',
      updatedAt: '2024-11-20T09:00:00Z',
      lastLoginAt: '2024-11-20T09:00:00Z',
      lastLoginIp: '87.12.34.56',
      emailVerifiedAt: '2024-06-15T15:00:00Z',
    },
    {
      id: '8',
      username: 'paziente_giulia',
      email: 'giulia.costa@outlook.com',
      role: 'USER',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-07-22T09:45:00Z',
      updatedAt: '2024-12-17T18:30:00Z',
      lastLoginAt: '2024-12-17T18:30:00Z',
      lastLoginIp: '151.67.89.12',
      emailVerifiedAt: '2024-07-22T10:15:00Z',
    },
    {
      id: '9',
      username: 'user_deleted',
      email: 'deleted@example.com',
      role: 'USER',
      enabled: false,
      emailVerified: true,
      otpVerified: false,
      pushEnabled: false,
      anonymized: true,
      createdAt: '2024-03-01T08:00:00Z',
      updatedAt: '2024-10-15T14:00:00Z',
      deletedAt: '2024-10-15T14:00:00Z',
      deletionReason: 'Richiesta dell\'utente - GDPR compliance',
    },
    {
      id: '10',
      username: 'paziente_paolo',
      email: 'paolo.gialli@gmail.com',
      role: 'USER',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-08-30T11:20:00Z',
      updatedAt: '2024-12-18T07:45:00Z',
      lastLoginAt: '2024-12-18T07:45:00Z',
      lastLoginIp: '78.23.45.67',
      emailVerifiedAt: '2024-08-30T12:00:00Z',
    },
    {
      id: '11',
      username: 'dr_russo',
      email: 'elena.russo@ospedale.it',
      role: 'DOC',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-09-12T13:00:00Z',
      updatedAt: '2024-12-18T09:15:00Z',
      lastLoginAt: '2024-12-18T09:15:00Z',
      lastLoginIp: '10.0.0.52',
      emailVerifiedAt: '2024-09-12T14:00:00Z',
    },
    {
      id: '12',
      username: 'paziente_sara',
      email: 'sara.blu@yahoo.it',
      role: 'USER',
      enabled: true,
      emailVerified: true,
      otpVerified: true,
      pushEnabled: true,
      anonymized: false,
      createdAt: '2024-10-05T15:30:00Z',
      updatedAt: '2024-12-16T20:00:00Z',
      lastLoginAt: '2024-12-16T20:00:00Z',
      lastLoginIp: '94.56.78.90',
      emailVerifiedAt: '2024-10-05T16:00:00Z',
    },
  ];

  return users;
};

const generateUserStats = (users: UserManagement[]): UserStats => {
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const devCount = users.filter(u => u.role === 'DEV').length;
  const docCount = users.filter(u => u.role === 'DOC').length;
  const userCount = users.filter(u => u.role === 'USER').length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newThisMonth = users.filter(u => new Date(u.createdAt) >= thisMonth).length;

  return {
    total: users.length,
    active: users.filter(u => u.enabled && !u.deletedAt).length,
    byRole: {
      patients: userCount,
      doctors: docCount,
      admins: adminCount,
    },
    // Additional fields for user management
    inactive: users.filter(u => !u.enabled && !u.deletedAt).length,
    deleted: users.filter(u => u.deletedAt).length,
    byRoleDetailed: {
      admin: adminCount,
      dev: devCount,
      doc: docCount,
      user: userCount,
    },
    newThisMonth: newThisMonth,
    trend: newThisMonth > 0 ? 100 : 0,
  };
};

// Filter users based on criteria
const filterUsers = (users: UserManagement[], filters: UserFilters): UserManagement[] => {
  let filtered = [...users];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      u =>
        u.username.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.id.toLowerCase().includes(searchLower)
    );
  }

  // Role filter
  if (filters.role && filters.role !== 'ALL') {
    filtered = filtered.filter(u => u.role === filters.role);
  }

  // Status filter
  if (filters.status && filters.status !== 'ALL') {
    switch (filters.status) {
      case 'enabled':
        filtered = filtered.filter(u => u.enabled && !u.deletedAt);
        break;
      case 'disabled':
        filtered = filtered.filter(u => !u.enabled && !u.deletedAt);
        break;
      case 'deleted':
        filtered = filtered.filter(u => u.deletedAt);
        break;
    }
  }

  // Email verified filter
  if (typeof filters.emailVerified === 'boolean') {
    filtered = filtered.filter(u => u.emailVerified === filters.emailVerified);
  }

  return filtered;
};

// Mock delay
const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

// User Management Service
export const userManagementService = {
  /**
   * Get all users with optional filters
   */
  getUsers: async (filters?: UserFilters): Promise<ApiResponse<UserManagement[]>> => {
    await delay(500);

    try {
      const allUsers = generateMockUsers();
      const filteredUsers = filters ? filterUsers(allUsers, filters) : allUsers;

      return {
        success: true,
        data: filteredUsers,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch users',
          code: 'FETCH_USERS_ERROR',
        },
      };
    }
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    await delay(300);

    try {
      const users = generateMockUsers();
      const stats = generateUserStats(users);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch user statistics',
          code: 'FETCH_STATS_ERROR',
        },
      };
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<ApiResponse<UserManagement>> => {
    await delay(200);

    try {
      const users = generateMockUsers();
      const user = users.find(u => u.id === id);

      if (!user) {
        return {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch user',
          code: 'FETCH_USER_ERROR',
        },
      };
    }
  },

  /**
   * Enable user
   */
  enableUser: async (id: string): Promise<ApiResponse<void>> => {
    await delay(300);

    try {
      // Mock success
      return {
        success: true,
        message: 'User enabled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to enable user',
          code: 'ENABLE_USER_ERROR',
        },
      };
    }
  },

  /**
   * Disable user
   */
  disableUser: async (id: string): Promise<ApiResponse<void>> => {
    await delay(300);

    try {
      // Mock success
      return {
        success: true,
        message: 'User disabled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to disable user',
          code: 'DISABLE_USER_ERROR',
        },
      };
    }
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (id: string, reason?: string): Promise<ApiResponse<void>> => {
    await delay(400);

    try {
      // Mock success
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to delete user',
          code: 'DELETE_USER_ERROR',
        },
      };
    }
  },

  /**
   * Verify user email
   */
  verifyEmail: async (id: string): Promise<ApiResponse<void>> => {
    await delay(300);

    try {
      // Mock success
      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to verify email',
          code: 'VERIFY_EMAIL_ERROR',
        },
      };
    }
  },

  /**
   * Reset user password
   */
  resetPassword: async (id: string): Promise<ApiResponse<void>> => {
    await delay(300);

    try {
      // Mock success
      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to send reset email',
          code: 'RESET_PASSWORD_ERROR',
        },
      };
    }
  },
};

export default userManagementService;