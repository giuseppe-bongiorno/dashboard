import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import {
  User,
  LoginCredentials,
  OTPVerification,
  ApiError,
} from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
  sessionId: string | null;
  requiresOTP: boolean;
  loginEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionId: null,
  requiresOTP: false,
  loginEmail: null,
};

// Async Thunks
export const loginWithPassword = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    const response = await authService.login(credentials);
    
    if (!response.success) {
      return rejectWithValue(response.error);
    }
    
    return {
      ...response.data,
      email: credentials.email,
    };
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: OTPVerification, { rejectWithValue }) => {
    const response = await authService.verifyOTP(data);
    
    if (!response.success) {
      return rejectWithValue(response.error);
    }
    
    return response.data;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const response = await authService.getCurrentUser();
    
    if (!response.success) {
      return rejectWithValue(response.error);
    }
    
    return response.data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const response = await authService.logout();
    
    if (!response.success) {
      return rejectWithValue(response.error);
    }
    
    return;
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    const response = await authService.refreshToken();
    
    if (!response.success) {
      return rejectWithValue(response.error);
    }
    
    return response.data;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionId = null;
      state.requiresOTP = false;
      state.loginEmail = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login with password
    builder
      .addCase(loginWithPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.requiresOTP) {
          state.requiresOTP = true;
          state.sessionId = action.payload.sessionId || null;
          state.loginEmail = action.payload.email || null;
        } else {
          // Direct login without OTP
          state.user = action.payload.user || null;
          state.isAuthenticated = true;
          state.requiresOTP = false;
        }
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as ApiError;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.requiresOTP = false;
        state.sessionId = null;
        state.loginEmail = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as ApiError;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as ApiError;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionId = null;
        state.requiresOTP = false;
        state.loginEmail = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Still clear auth state even on error
        state.user = null;
        state.isAuthenticated = false;
      });

    // Refresh session
    builder
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user || state.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
