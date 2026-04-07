import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import Gate
import { store, persistor } from './store/store'; // Import persistor
import { theme } from './shared/theme';
import AppRoutes from './routes/AppRoutes';
import { ClerkProvider } from '@clerk/clerk-react';

// Optional: A simple loading spinner while Redux rehydrates
const LoadingState = () => (
  <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress />
  </Box>
);
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} allowedRedirectOrigins={['http://localhost:8081', 'https://winnbell-client.vercel.app']}>
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
  );
}

export default App;