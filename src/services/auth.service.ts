import apiClient, { apiRequest, tokenManager } from './api';
import {
  LoginCredentials,
  OTPRequest,
  OTPVerification,
  AuthResponse,
  User,
  ApiResponse,
} from '@/types';

export const authService = {
  /**
   * Step 1: Login with email and password
   * Returns session ID for OTP verification
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>(async () => {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Store session ID if OTP is required
      if (response.data.requiresOTP && response.data.sessionId) {
        sessionStorage.setItem('otp_session', response.data.sessionId);
      }
      
      return response;
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
      const response = await apiClient.post('/auth/otp/verify', {
        email: data.email,
        otp: data.otp,
        sessionId: data.sessionId,
      });

      // Store tokens if verification successful
      if (response.data.tokens) {
        tokenManager.setAccessToken(response.data.tokens.accessToken);
        tokenManager.setRefreshToken(response.data.tokens.refreshToken);
        sessionStorage.removeItem('otp_session');
      }

      return response;
    });
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>(async () => {
      return await apiClient.get('/auth/me');
    });
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
   * Logout and clear tokens
   */
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    }

    tokenManager.clearTokens();
    sessionStorage.clear();

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
