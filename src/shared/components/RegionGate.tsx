import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client';
import LoadingScreen from './LoadingScreen';

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
    return <LoadingScreen />;
  }

  if (status === 'blocked') {
    return <Navigate to='/region-blocked' replace />;
  }

  return <>{children}</>;
};

export default RegionGate;
