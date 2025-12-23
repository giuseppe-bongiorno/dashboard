import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  TextField,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { Person, Email, CalendarToday, Badge } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector, useNotification, useDocumentTitle } from '@/hooks';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const ProfilePage: React.FC = () => {
  useDocumentTitle('Profile - MyFamilyDoc');
  
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // API call would go here
      console.log('Profile update:', data);
      showSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your personal information and account settings
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Profile Overview Card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
              
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              
              <Chip
                label={user?.role || 'user'}
                color={getRoleColor(user?.role || 'user')}
                size="small"
                sx={{ mb: 2, textTransform: 'capitalize' }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>

              {user?.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Account Status
                </Typography>
                <Chip label="Active" color="success" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Profile Edit Form */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.666%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Personal Information
                </Typography>
                {!isEditing && (
                  <Button variant="outlined" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name="firstName"
                        control={control}
                        rules={{ required: 'First name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="First Name"
                            fullWidth
                            disabled={!isEditing}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                            InputProps={{
                              startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                          />
                        )}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name="lastName"
                        control={control}
                        rules={{ required: 'Last name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Last Name"
                            fullWidth
                            disabled={!isEditing}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                            InputProps={{
                              startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Stack>

                  <Controller
                    name="email"
                    control={control}
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
                          disabled={!isEditing}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      )}
                    />

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Phone Number (Optional)"
                        fullWidth
                        disabled={!isEditing}
                      />
                    )}
                  />

                  <TextField
                    label="User ID"
                    value={user?.id || 'N/A'}
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Stack>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isDirty}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Security
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage your password and security settings
              </Typography>

              <Button variant="outlined" fullWidth>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};

export default ProfilePage;