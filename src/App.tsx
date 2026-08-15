import { type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import Gate
import { store, persistor } from './store/store'; // Import persistor
import { theme } from './shared/theme';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';
import ScrollToTop from './shared/components/ScrollToTop';

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
          {/* Every framer-motion animation app-wide honors the OS reduced-motion setting:
              transforms are skipped, opacity/color changes are kept. */}
          <MotionConfig reducedMotion='user'>
            <BrowserRouter>
              <ScrollToTop />
              <RootBoundary>
                <AppRoutes />
              </RootBoundary>
            </BrowserRouter>
          </MotionConfig>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;