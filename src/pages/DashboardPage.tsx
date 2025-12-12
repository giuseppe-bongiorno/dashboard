import React from 'react';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  ShoppingCart,
  Assessment,
} from '@mui/icons-material';
import { useAppSelector, useDocumentTitle } from '@/hooks';
import { KPIData } from '@/types';

// Dummy KPI data
const kpiData: KPIData[] = [
  {
    id: '1',
    title: 'Total Users',
    value: '12,453',
    change: 12.5,
    trend: 'up',
    icon: 'people',
  },
  {
    id: '2',
    title: 'Revenue',
    value: '$54,239',
    change: 8.2,
    trend: 'up',
    icon: 'money',
  },
  {
    id: '3',
    title: 'Orders',
    value: '3,842',
    change: -3.4,
    trend: 'down',
    icon: 'cart',
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: '3.24%',
    change: 2.1,
    trend: 'up',
    icon: 'assessment',
  },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'people':
      return <People />;
    case 'money':
      return <AttachMoney />;
    case 'cart':
      return <ShoppingCart />;
    case 'assessment':
      return <Assessment />;
    default:
      return <Assessment />;
  }
};

const KPICard: React.FC<{ data: KPIData }> = ({ data }) => {
  const isPositive = data.change >= 0;
  const trendColor = data.trend === 'up' ? 'success.main' : 'error.main';

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {data.title}
            </Typography>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {data.value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {data.trend === 'up' ? (
                <TrendingUp sx={{ fontSize: 18, color: trendColor }} />
              ) : (
                <TrendingDown sx={{ fontSize: 18, color: trendColor }} />
              )}
              <Typography
                variant="body2"
                sx={{ color: trendColor, fontWeight: 500 }}
              >
                {Math.abs(data.change)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
            }}
          >
            {getIcon(data.icon || '')}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard - MyFamilyDoc');
  
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={3} 
        sx={{ mb: 4, flexWrap: 'wrap' }}
      >
        {kpiData.map((kpi) => (
          <Box key={kpi.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)' } }}>
            <KPICard data={kpi} />
          </Box>
        ))}
      </Stack>

      {/* Charts Section */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', lg: '2' } }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Revenue Overview
            </Typography>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography>Chart placeholder - Integrate with charting library</Typography>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', lg: '1' } }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none',
                      mb: 0,
                      pb: 0,
                    },
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {item}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Activity {item}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item} hours ago
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Stack>


      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Stats
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mt: 1, flexWrap: 'wrap' }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={600} color="primary">
              98.5%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uptime
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={600} color="primary">
              1,234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Sessions
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={600} color="primary">
              4.8
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. Rating
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight={600} color="primary">
              24/7
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Support
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default DashboardPage;