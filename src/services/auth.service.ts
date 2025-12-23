import apiClient, { apiRequest, tokenManager } from './api';
import type {
  LoginCredentials,
  OTPRequest,
  OTPVerification,
  AuthResponse,
  User,
  ApiResponse,
} from '@/types';

// Import UserRole separately to ensure TypeScript recognizes it
import type { UserRole } from '@/types';

export const authService = {
  /**
   * Step 1: Login with email and password
   * Returns session ID for OTP verification
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>(async () => {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Backend structure: { success, message, data }
      const backendData = response.data;
      
      // Transform to our AuthResponse format
      return {
        data: {
          success: backendData.success,
          message: backendData.message,
          requiresOTP: backendData.success, // If login succeeds, OTP is required
          email: credentials.email, // Save email for OTP step
        }
      };
    });
  },

  /**
   * Step 2: Request OTP (if not automatically sent after login)
   */
  requestOTP: async (data: OTPRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>(async () => {
      const sessionId = data.sessionId || sessionStorage.getItem('otp_session');
      return await apiClient.post('/auth/otp/request', {
        email: data.email,
        sessionId,
      });
    });
  },

  /**
   * Step 3: Verify OTP and complete authentication
   */
  verifyOTP: async (data: OTPVerification): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>(async () => {
      const response = await apiClient.post('/auth/verify-otp', {
        email: data.email,
        otp: data.otp,
        captchaToken: '6LegWncrAAAAAESDg7lvmNOj4RRaAIZHiYmygC9K', // Required by backend
      });

      // Backend structure: { success, message, data: { token, email, userId, roles } }
      const backendData = response.data;
      
      console.log('🔍 Backend response:', backendData);
      console.log('🔍 Backend roles:', backendData.data?.roles);
      
      if (backendData.success && backendData.data?.token) {
        // Store the JWT token
        tokenManager.setAccessToken(backendData.data.token);
        // Use same token as refresh token for now
        tokenManager.setRefreshToken(backendData.data.token);
      }

      // Map role: ROLE_ADMIN → ADMIN
      const mappedRole = (backendData.data.roles?.[0]?.replace('ROLE_', '') || 'USER') as UserRole;
      console.log('🎯 Mapped role:', mappedRole);

      // Transform to our AuthResponse format
      return {
        data: {
          success: backendData.success,
          message: backendData.message,
          tokens: backendData.data?.token ? {
            accessToken: backendData.data.token,
            refreshToken: backendData.data.token,
            expiresIn: 86400, // 24 hours
          } : undefined,
          user: backendData.data ? {
            id: backendData.data.userId?.toString() || '',
            email: backendData.data.email,
            firstName: '', // Backend doesn't provide these
            lastName: '',
            // Map backend roles: ROLE_ADMIN → ADMIN, ROLE_DEV → DEV, ROLE_DOC → DOC, ROLE_USER → USER
            role: mappedRole,
            createdAt: new Date().toISOString(),
          } : undefined,
        }
      };
    });
  },

  /**
   * Get current user profile
   * If backend doesn't have a /me endpoint, we decode the JWT
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const token = tokenManager.getAccessToken();
    
    if (!token) {
      return {
        success: false,
        error: {
          message: 'No token available',
          code: 'NO_TOKEN',
        },
      };
    }

    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        success: true,
        data: {
          id: payload.userId?.toString() || payload.sub || '',
          email: payload.email || payload.sub || '',
          firstName: '', // Not in JWT
          lastName: '',
          // Map backend roles: ROLE_ADMIN → ADMIN, ROLE_DEV → DEV, ROLE_DOC → DOC, ROLE_USER → USER
          role: (payload.roles?.[0]?.replace('ROLE_', '') || 'USER') as UserRole,
          createdAt: new Date(payload.iat * 1000).toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to decode token',
          code: 'INVALID_TOKEN',
        },
      };
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        error: {
          message: 'No refresh token available',
          code: 'NO_REFRESH_TOKEN',
        },
      };
    }

    return apiRequest<AuthResponse>(async () => {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });

      if (response.data.tokens) {
        tokenManager.setAccessToken(response.data.tokens.accessToken);
        if (response.data.tokens.refreshToken) {
          tokenManager.setRefreshToken(response.data.tokens.refreshToken);
        }
      }

      return response;
    });
  },

  /**
   * Logout and clear tokens (client-side only)
   * No backend call needed - JWT tokens are stateless
   */
  logout: async (): Promise<ApiResponse<void>> => {
    // Clear all client-side authentication data
    tokenManager.clearTokens();
    sessionStorage.clear();
    localStorage.removeItem('otp_session');

    return {
      success: true,
    };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = tokenManager.getAccessToken();
    if (!token) return false;
    return !tokenManager.isTokenExpired(token);
  },

  /**
   * Password reset request
   */
  requestPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      return await apiClient.post('/auth/password-reset/request', { email });
    });
  },

  /**
   * Verify password reset token
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      return await apiClient.post('/auth/password-reset/confirm', {
        token,
        newPassword,
      });
    });
  },

  /**
   * Change password (authenticated user)
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      return await apiClient.post('/auth/password/change', {
        currentPassword,
        newPassword,
      });
    });
  },
};

export default authService;