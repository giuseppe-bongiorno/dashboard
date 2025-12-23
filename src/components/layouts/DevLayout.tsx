import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Code,
  BugReport,
  Storage,
  Settings,
  Logout,
  ChevronLeft,
  DeveloperMode,
  Terminal,
  Favorite,
  Description,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logout } from '@/store/slices/authSlice';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const DevLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Developer navigation items
  const devNavItems: NavItem[] = [
    { label: 'Dev Dashboard', path: '/dev', icon: <Dashboard /> },
    { label: 'API Explorer', path: '/dev/api', icon: <Code /> },
    { label: 'System Logs', path: '/dev/logs', icon: <Description /> },
    { label: 'Debug Console', path: '/dev/debug', icon: <BugReport /> },
    { label: 'Database Tools', path: '/dev/database', icon: <Storage /> },
    { label: 'System Health', path: '/dev/health', icon: <Favorite /> },
    { label: 'Config Manager', path: '/dev/config', icon: <Settings /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DeveloperMode sx={{ fontSize: 32, color: '#00e676' }} />
        <Box>
          <Typography variant="h6" fontWeight={600} color="#00e676">
            Dev Portal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            MyFamilyDoc
          </Typography>
        </Box>
      </Box>

      {/* Dev Info Card */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'grey.900', 
          color: '#00e676',
          fontFamily: 'monospace'
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          $ {user?.firstName || 'Developer'}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {user?.email || 'dev@myfamilydoc.it'}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
          <Chip
            label="ONLINE"
            size="small"
            sx={{ 
              height: 20,
              bgcolor: '#00e676',
              color: 'black',
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 700
            }}
          />
          <Chip
            label="v1.0.0"
            size="small"
            sx={{ 
              height: 20,
              bgcolor: 'grey.800',
              color: '#00e676',
              fontFamily: 'monospace',
              fontSize: 10
            }}
          />
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 2, bgcolor: 'grey.900' }}>
        {devNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  color: '#00e676',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(0, 230, 118, 0.2)',
                    color: '#00e676',
                    borderLeft: '3px solid #00e676',
                    '&:hover': {
                      bgcolor: 'rgba(0, 230, 118, 0.3)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#00e676',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 230, 118, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#00e676' : 'grey.500', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: 'monospace',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, bgcolor: 'grey.900', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="#00e676" fontFamily="monospace">
          DEV_MODE=true
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.900' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'grey.900',
          color: '#00e676',
          boxShadow: 1,
          borderBottom: '1px solid rgba(0, 230, 118, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            {mobileOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Terminal sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, fontFamily: 'monospace' }}>
            {devNavItems.find((item) => item.path === location.pathname)?.label || 'Dev Portal'}
          </Typography>

          <Chip 
            label="API: OK" 
            size="small" 
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(0, 230, 118, 0.2)',
              color: '#00e676',
              fontFamily: 'monospace',
              fontSize: 10
            }} 
          />

          <IconButton onClick={handleMenuOpen}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#00e676',
                color: 'black',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {user?.firstName?.[0]?.toUpperCase() || 'D'}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2" fontWeight={600}>
                {user?.firstName || 'Developer'}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                Role: Developer
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => navigate('/dev/profile')}>My Profile</MenuItem>
            <MenuItem onClick={() => navigate('/dev/config')}>Dev Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'grey.900',
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'grey.900',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          bgcolor: 'grey.900',
          minHeight: '100vh',
          color: '#00e676',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DevLayout;