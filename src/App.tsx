import { ThemeProvider, CssBaseline, Box, LinearProgress } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import Gate
import { store, persistor } from './store/store'; // Import persistor
import { theme } from './shared/theme';
import AppRoutes from './routes/AppRoutes';
import { ClerkProvider } from '@clerk/clerk-react';
import AccessGate from './shared/components/AccessGate';

// Branded splash screen while Redux rehydrates
const LoadingState = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
    }}
  >
    <Box
      component="img"
      src="/winnbell_logo.png"
      alt="Winnbell"
      sx={{
        width: 80,
        height: 'auto',
        animation: 'winnbell-pulse 1.5s ease-in-out infinite',
        '@keyframes winnbell-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      }}
    />
    <LinearProgress
      sx={{
        width: 120,
        borderRadius: 4,
        mt: 2,
      }}
    />
  </Box>
);
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <AccessGate>
      <Provider store={store}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} allowedRedirectOrigins={['http://localhost:8081', 'https://winnbell-client.vercel.app', 'https://winnbell.com', 'https://www.winnbell.com']}>
        <PersistGate loading={<LoadingState />} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ThemeProvider>
        </PersistGate>
        </ClerkProvider>
      </Provider>
    </AccessGate>
  );
}

export default App;