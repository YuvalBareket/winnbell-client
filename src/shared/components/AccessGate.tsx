import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const STORAGE_KEY = 'wb_access_granted';
const PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD as string;

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setGranted(true);
    }
  }, []);

  if (granted) return <>{children}</>;

  // Triple-click the "404" text to reveal password field
  const handleSecretClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      setShowInput(true);
      setClickCount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setGranted(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        fontFamily: 'monospace',
        userSelect: 'none',
      }}
    >
      {/* 404 display */}
      <Typography
        onClick={handleSecretClick}
        sx={{
          fontSize: { xs: '6rem', sm: '10rem' },
          fontWeight: 900,
          color: '#e0e0e0',
          lineHeight: 1,
          cursor: 'default',
          letterSpacing: '-4px',
        }}
      >
        404
      </Typography>

      <Typography variant="h6" fontWeight={600} color="text.primary" mt={1}>
        Page Not Found
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1} mb={4} textAlign="center" px={3}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>

      <Button
        variant="outlined"
        size="small"
        href="/"
        sx={{ textTransform: 'none', borderRadius: 2, color: 'text.secondary', borderColor: '#ccc' }}
      >
        Go back home
      </Button>

      {/* Hidden password field — revealed on triple-click of "404" */}
      {showInput && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            width: '100%',
            maxWidth: 280,
          }}
        >
          <TextField
            fullWidth
            type="password"
            size="small"
            placeholder="••••••••"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            error={error}
            helperText={error ? 'Incorrect' : ' '}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              background: '#195DE6',
              fontWeight: 600,
            }}
          >
            Unlock
          </Button>
        </Box>
      )}
    </Box>
  );
}
