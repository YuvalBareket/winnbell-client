import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys } from '../constants/queryKeys';
import LoadingScreen from './LoadingScreen';

interface Props {
  children: React.ReactNode;
}

const RegionGate = ({ children }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.region.check,
    queryFn: () => api.get<{ blocked: boolean }>('/auth/region-check').then(r => r.data),
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (isLoading) return <LoadingScreen />;
  if (data?.blocked) return <Navigate to='/region-blocked' replace />;

  return <>{children}</>;
};

export default RegionGate;
