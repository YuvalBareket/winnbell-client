import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { api } from '../api/client';

interface Props {
  children: React.ReactNode;
}

const RegionGate = ({ children }: Props) => {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked'>('loading');

  useEffect(() => {
    api.get<{ blocked: boolean }>('/auth/region-check')
      .then(({ data }) => setStatus(data.blocked ? 'blocked' : 'allowed'))
      .catch(() => setStatus('allowed')); // fail open if endpoint unreachable
  }, []);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'blocked') {
    return <Navigate to='/region-blocked' replace />;
  }

  return <>{children}</>;
};

export default RegionGate;
