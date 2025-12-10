import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useNotification, useDocumentTitle } from '@/hooks';
import { loginWithPassword, verifyOTP, clearError } from '@/store/slices/authSlice';
import { LoginCredentials, OTPVerification } from '@/types';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage: React.FC = () => {
  useDocumentTitle('Login - MyFamilyDoc');
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { showError } = useNotification();
  
  const { isAuthenticated, isLoading, error, requiresOTP, sessionId, loginEmail } =
    useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
      captchaToken: '6LegWncrAAAAAESDg7lvmNOj4RRaAIZHiYmygC9K', // Default token for development
    },
  });

  const {
    control: otpControl,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
    reset: resetOTP,
  } = useForm<{ otp: string }>({
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as LocationState)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (requiresOTP) {
      setActiveStep(1);
    }
  }, [requiresOTP]);

  useEffect(() => {
    if (error) {
      showError(error.message);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const onLoginSubmit = async (data: LoginCredentials) => {
    await dispatch(loginWithPassword(data));
  };

  const onOTPSubmit = async (data: { otp: string }) => {
    if (!sessionId || !loginEmail) {
      showError('Session expired. Please login again.');
      setActiveStep(0);
      return;
    }

    const otpData: OTPVerification = {
      email: loginEmail,
      otp: data.otp,
      sessionId,
    };

    await dispatch(verifyOTP(otpData));
  };

  const handleBackToLogin = () => {
    setActiveStep(0);
    resetOTP();
    dispatch(clearError());
  };

  const steps = ['Login', 'Verify OTP'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          borderRadius: 3,
        }}
        role="main"
        aria-label="Login form"
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LockOutlined sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your dashboard
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>
              <Controller
                name="email"
                control={loginControl}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    fullWidth
                    margin="normal"
                    error={!!loginErrors.email}
                    helperText={loginErrors.email?.message}
                    autoComplete="email"
                    autoFocus
                    inputProps={{
                      'aria-label': 'Email address',
                      'aria-required': 'true',
                      'aria-invalid': !!loginErrors.email,
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={loginControl}
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    error={!!loginErrors.password}
                    helperText={loginErrors.password?.message}
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      'aria-label': 'Password',
                      'aria-required': 'true',
                      'aria-invalid': !!loginErrors.password,
                    }}
                  />
                )}
              />

              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Link
                  href="/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ mt: 2, mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit(onOTPSubmit)} noValidate>
              <Alert severity="info" sx={{ mb: 3 }}>
                We've sent a verification code to <strong>{loginEmail}</strong>
              </Alert>

              <Controller
                name="otp"
                control={otpControl}
                rules={{
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'OTP must be 6 digits',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Enter 6-digit OTP"
                    fullWidth
                    margin="normal"
                    error={!!otpErrors.otp}
                    helperText={otpErrors.otp?.message}
                    autoComplete="one-time-code"
                    autoFocus
                    inputProps={{
                      maxLength: 6,
                      pattern: '[0-9]*',
                      inputMode: 'numeric',
                      'aria-label': 'One-time password',
                      'aria-required': 'true',
                      'aria-invalid': !!otpErrors.otp,
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </form>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href="/register" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;