import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const drawerWidth = 260;

const Dashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {isMobile ? 'Меню' : 'Coffe Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
