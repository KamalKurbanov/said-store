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
import { Sidebar, drawerWidth, drawerCollapsedWidth } from '../components/Sidebar';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToggleCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const currentDrawerWidth = sidebarCollapsed ? drawerCollapsedWidth : drawerWidth;

  return (
    <Box className={styles.dashboard}>
      <AppBar
        position="fixed"
        className={styles.appBar}
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
        }}
      >
        <Toolbar className={styles.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="body1" className={styles.toolbarTitle} sx={{ flexGrow: 1 }}>
            {isMobile ? 'Меню' : 'Coffe Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={handleToggleCollapsed}
      />

      <Box
        component="main"
        className={styles.mainContent}
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
