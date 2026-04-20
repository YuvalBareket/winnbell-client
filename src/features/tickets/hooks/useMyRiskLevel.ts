import { useQuery } from '@tanstack/react-query';
import { getMyRiskLevel } from '../api/ticketsApi';

export const useMyRiskLevel = () => {
  const { data, refetch } = useQuery({
    queryKey: ['myRiskLevel'],
    queryFn: getMyRiskLevel,
    staleTime: 0,
  });

  return {
    requiresImage: data?.requiresImage ?? false,
    isThrottled: data?.isThrottled ?? false,
    refetch,
  };
};
