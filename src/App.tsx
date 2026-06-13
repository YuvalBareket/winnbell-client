import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import Gate
import { store, persistor } from './store/store'; // Import persistor
import { theme } from './shared/theme';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';
import LoadingScreen from './shared/components/LoadingScreen';
// import AccessGate from './shared/components/AccessGate';

function App() {
  return (
    // <AccessGate>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </BrowserRouter>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    // </AccessGate>
  );
}

export default App;