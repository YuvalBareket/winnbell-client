import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { purgeSwAndCaches } from '../staleDeployRecovery';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // When any value in this array changes, a current error is cleared. Pass the route
  // pathname so a transient error (e.g. a forced logout mid-render) recovers on navigation.
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  refreshing: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, refreshing: false };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info);
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.state.hasError) return;
    const prev = prevProps.resetKeys;
    const next = this.props.resetKeys;
    if (next && (!prev || prev.length !== next.length || next.some((k, i) => k !== prev[i]))) {
      this.setState({ hasError: false });
    }
  }

  resetError() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'var(--dvh100, 100dvh)',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Box
            component="img"
            src="/winnbell_logo.png"
            alt="Winnbell"
            sx={{ width: 80, height: 'auto', mb: 3 }}
          />
          <Typography variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please try refreshing the page.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={this.state.refreshing}
            // A plain reload can re-serve the same stale PWA copy that crashed (old
            // service worker precache after a deploy). Purge it first so Refresh
            // always pulls a fresh version (the purge no-ops while offline).
            onClick={async () => {
              this.setState({ refreshing: true });
              await purgeSwAndCaches();
              window.location.reload();
            }}
          >
            {this.state.refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
