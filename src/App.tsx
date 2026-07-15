import { type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import Gate
import { store, persistor } from './store/store'; // Import persistor
import { theme } from './shared/theme';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';
import AccessGate from './shared/components/AccessGate';

// Top-level error boundary that resets on navigation, so a transient render error
// recovers when the user moves to another route instead of forcing a page refresh.
function RootBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary resetKeys={[location.pathname]}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            {/* Inside the router so it re-checks the path on every navigation: the pre-launch
                gate (production only) shows a 404 for the app but lets the public landing + legal
                pages through. Renders straight through on non-production builds. */}
            <AccessGate>
              <RootBoundary>
                <AppRoutes />
              </RootBoundary>
            </AccessGate>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;