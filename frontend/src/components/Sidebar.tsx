import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShowChart as ShowChartIcon,
  CloudUpload as CloudUploadIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const drawerWidth = 260;
const drawerCollapsedWidth = 64;

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose, collapsed, onToggleCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const menuItems = user?.role === 'ADMIN'
    ? [
        {
          text: 'P&L Доход и расход',
          icon: <ShowChartIcon />,
          path: '/pnl',
        },
        {
          text: 'Загрузки',
          icon: <CloudUploadIcon />,
          path: '/uploads',
        },
        {
          text: 'Управление',
          icon: <ShieldIcon />,
          path: '/admin',
        },
      ]
    : [
        {
          text: 'P&L Доход и расход',
          icon: <ShowChartIcon />,
          path: '/pnl',
        },
        {
          text: 'Загрузки',
          icon: <CloudUploadIcon />,
          path: '/uploads',
        },
      ];

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const userEmail = user?.email || 'Пользователь';
  const userName = user?.name || userEmail.split('@')[0];

  const currentWidth = collapsed ? drawerCollapsedWidth : drawerWidth;

  const drawer = (
    <Box className={styles.sidebar} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box className={collapsed ? styles.sidebarHeaderCollapsed : styles.sidebarHeader}>
        {!collapsed && (
          <span className={styles.sidebarTitle}>
            ☕ Coffe Dashboard
          </span>
        )}
        <Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'}>
          <IconButton size="small" onClick={onToggleCollapsed} className={styles.iconButton}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List className={styles.menuList}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding className={styles.menuItem}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              className={styles.menuItemButton}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&.Mui-selected': {
                  bgcolor: 'rgba(0, 113, 227, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 113, 227, 0.12)',
                  },
                },
              }}
            >
              <ListItemIcon className={`${styles.menuItemIcon} ${location.pathname === item.path ? '' : styles.menuItemIconDefault}`}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    className: location.pathname === item.path ? styles.menuItemTextSelected : styles.menuItemText,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      {/* User section */}
      <Box className={collapsed ? styles.userSectionCollapsed : styles.userSection}>
        <Avatar className={styles.userAvatar}>
          <PersonIcon />
        </Avatar>
        {!collapsed && (
          <Box className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userEmail}>{userEmail}</span>
            {user?.role && (
              <span className={`${styles.userRole} ${
                user.role === 'ADMIN' ? styles.userRoleAdmin :
                user.role === 'MODERATOR' ? styles.userRoleModerator : ''
              }`}>
                {user.role}
              </span>
            )}
          </Box>
        )}
      </Box>
      {/* Bottom actions */}
      <Box className={collapsed ? styles.actionsSectionCollapsed : styles.actionsSection}>
        <Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'}>
          <IconButton size="small" onClick={onToggleCollapsed} className={styles.iconButton}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Выйти">
          <IconButton size="small" onClick={handleLogout} className={styles.iconButton}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: currentWidth }, flexShrink: { md: 0 }, transition: (theme) => theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }}
      aria-label="navigation menu"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentWidth, transition: (theme) => theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) },
        }}
        open
      >
        {drawer}
      </Drawer>
      {/* Mobile menu button */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 1200,
        }}
      >
        <IconButton size="large" onClick={onClose} sx={{ color: 'text.primary', bgcolor: 'background.paper' }}>
          <MenuIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export { Sidebar, drawerWidth, drawerCollapsedWidth };
