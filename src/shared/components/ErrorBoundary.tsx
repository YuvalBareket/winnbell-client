import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info);
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
            minHeight: '100dvh',
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
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
