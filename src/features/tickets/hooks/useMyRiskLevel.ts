import { useQuery } from '@tanstack/react-query';
import { getMyRiskLevel } from '../api/ticketsApi';

export const useMyRiskLevel = () => {
  const { data, refetch } = useQuery({
    queryKey: ['myRiskLevel'],
    queryFn: getMyRiskLevel,
    staleTime: 0,
  });

  const dailyCount = data?.dailyCount ?? 0;
  const dailyLimit = data?.dailyLimit ?? 5;

  return {
    requiresImage: data?.requiresImage ?? false,
    isThrottled: data?.isThrottled ?? false,
    drawEntryCount: data?.drawEntryCount ?? 0,
    isDrawCapped: (data?.drawEntryCount ?? 0) >= 30,
    dailyCount,
    dailyLimit,
    isDailyLimitReached: dailyCount >= dailyLimit,
    refetch,
  };
};
