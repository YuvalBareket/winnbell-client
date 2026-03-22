import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import Gate
import { store, persistor } from './store/store'; // Import persistor
import { theme } from './shared/theme';
import AppRoutes from './routes/AppRoutes';

// Optional: A simple loading spinner while Redux rehydrates
const LoadingState = () => (
  <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingState />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;