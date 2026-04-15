import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  responsiveFontSizes,
} from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import PnLReport from './pages/PnLReport';
import Uploads from './pages/Uploads';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Uber-inspired MUI theme
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Uber Black
    },
    secondary: {
      main: '#ffffff', // Pure White
    },
    background: {
      default: '#ffffff', // Pure White page
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Uber Black
      secondary: '#4b4b4b', // Body Gray
      disabled: '#afafaf', // Muted Gray
    },
    error: {
      main: '#000000', // Keep monochrome
    },
    warning: {
      main: '#4b4b4b',
    },
    success: {
      main: '#000000',
    },
    info: {
      main: '#4b4b4b',
    },
    divider: '#efefef', // Chip Gray
  },
  typography: {
    fontFamily: '"UberMoveText", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontFamily: '"UberMove", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '3.25rem', // 52px
      fontWeight: 700,
      lineHeight: 1.23,
    },
    h2: {
      fontFamily: '"UberMove", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '2.25rem', // 36px
      fontWeight: 700,
      lineHeight: 1.22,
    },
    h3: {
      fontFamily: '"UberMove", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: '"UberMove", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '1.5rem', // 24px
      fontWeight: 700,
      lineHeight: 1.33,
    },
    h5: {
      fontFamily: '"UberMove", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '1.25rem', // 20px
      fontWeight: 700,
      lineHeight: 1.40,
    },
    h6: {
      fontFamily: '"UberMoveText", "Inter", "system-ui", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.25,
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.50,
      color: '#4b4b4b',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
      color: '#4b4b4b',
    },
    subtitle1: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.25,
    },
    subtitle2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.14,
    },
    button: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.25,
      textTransform: 'none' as const,
    },
    caption: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
    },
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.67,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 8, // Standard radius for cards/inputs
  },
  spacing: 8, // 8px base unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999, // Full pill
          padding: '10px 12px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#4b4b4b',
          },
          '&:active': {
            boxShadow: 'rgba(0, 0, 0, 0.08) inset 0px 0px 0px 999px',
          },
        },
        outlined: {
          backgroundColor: '#ffffff',
          color: '#000000',
          borderWidth: '1px',
          borderColor: '#000000',
          '&:hover': {
            backgroundColor: '#e2e2e2',
            borderColor: '#000000',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: 'none',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 4px 16px 0px',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation3: {
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 4px 16px 0px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          borderBottom: '1px solid #efefef',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          '@media (min-width: 600px)': {
            minHeight: '48px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999, // Full pill
          fontWeight: 500,
          fontSize: '0.875rem',
          height: 32,
        },
        filled: {
          backgroundColor: '#efefef', // Chip Gray
          color: '#000000',
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#000000',
            color: '#ffffff',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#000000',
            color: '#ffffff',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#efefef',
            color: '#000000',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: '#efefef',
            color: '#000000',
          },
          '&.MuiChip-colorDefault': {
            backgroundColor: '#efefef',
            color: '#000000',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
            borderWidth: '1px',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '1rem',
          fontWeight: 400,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #efefef',
          borderRadius: 0,
        },
        head: {
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#000000',
          borderRadius: 0,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#000000',
          textDecoration: 'underline',
          '&:hover': {
            color: '#4b4b4b',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          '&:hover': {
            backgroundColor: '#f3f3f3',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          borderRadius: 8,
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: '#ffffff',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 4px 16px 0px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: 'none',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 4px 16px 0px',
        },
      },
      variants: [
        {
          props: { severity: 'success' },
          style: {
            backgroundColor: '#ffffff',
            color: '#000000',
          },
        },
        {
          props: { severity: 'error' },
          style: {
            backgroundColor: '#000000',
            color: '#ffffff',
          },
        },
      ],
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 4px 16px 0px',
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: 8,
        },
        icon: {
          borderRadius: 0,
        },
      },
    },
    MuiNativeSelect: {
      styleOverrides: {
        select: {
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: '#efefef',
            '&:hover': {
              backgroundColor: '#e2e2e2',
            },
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: {
          color: '#000000',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
        },
      },
    },
  },
});

// Enable responsive font sizing
theme = responsiveFontSizes(theme);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="/pnl" replace />} />
          <Route path="pnl" element={<PnLReport />} />
          <Route path="uploads" element={<Uploads />} />
          <Route path="admin" element={<UserManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <style>{`
      html, body, #root { height: auto; min-height: 100%; overflow-y: auto; }
    `}</style>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
