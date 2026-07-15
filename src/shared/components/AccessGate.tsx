import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { PRIMARY_MAIN } from '../colors';

const STORAGE_KEY = 'wb_access_granted';
const PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD as string;
// The gate engages only on the production build (VITE_APP_ENV=production is set only in
// the Vercel production env). Staging/dev builds render straight through. The password
// guard prevents an unopenable gate if the env var combo is ever misconfigured.
const GATE_ACTIVE = import.meta.env.VITE_APP_ENV === 'production' && !!PASSWORD;

// Pages that stay publicly reachable even while the pre-launch gate is armed: the marketing
// landing plus the legal pages. Google's OAuth brand-verification reviewer must be able to open
// the homepage, privacy policy, and terms, and these are safe to expose. The app itself (login,
// register, every authed screen) stays gated, and the server ACCESS_LOCKED flag still blocks any
// signup/login. This lives inside the router, so it re-evaluates on every client-side navigation.
const PUBLIC_PATHS = new Set(['/', '/privacy', '/terms']);

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const isPublicPath = PUBLIC_PATHS.has(normalizedPath);

  const [granted, setGranted] = useState(
    () => !GATE_ACTIVE || localStorage.getItem(STORAGE_KEY) === 'true',
  );
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  if (granted || isPublicPath) return <>{children}</>;

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
        minHeight: 'var(--dvh100, 100dvh)',
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

    
      {/* Hidden password field - revealed on triple-click of "404" */}
      {showInput && (
        <Box
          component={motion.form}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
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
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            sx={{
              textTransform: 'none',
              background: PRIMARY_MAIN,
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
