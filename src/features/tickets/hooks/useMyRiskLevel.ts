import { useQuery } from '@tanstack/react-query';
import { getMyRiskLevel } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useMyRiskLevel = () => {
  const { data, refetch, isPending, isError } = useQuery({
    queryKey: queryKeys.tickets.riskLevel,
    queryFn: getMyRiskLevel,
    staleTime: 30_000,
    gcTime: 60_000,
    // Don't retry 401s — the axios interceptor handles token refresh silently.
    // Only retry server errors (5xx) or network failures.
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
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
    isPhoneVerified: data?.isPhoneVerified ?? false,
    isPhoneVerifiedLoaded: !isPending && !isError,
    isError,
    refetch,
  };
};
