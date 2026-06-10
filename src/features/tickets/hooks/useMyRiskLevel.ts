import { useQuery } from '@tanstack/react-query';
import { getMyRiskLevel } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useMyRiskLevel = () => {
  const { data, refetch, error } = useQuery({
    queryKey: queryKeys.tickets.riskLevel,
    queryFn: getMyRiskLevel,
    staleTime: 30_000,
    gcTime: 60_000,
    retry: 3,
    retryDelay: 2000,
  });

  // 401 = token refresh in progress, keep showing spinner, not error page
  const is401 = (error as any)?.response?.status === 401;
  const isRealError = !!error && !data && !is401;

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
    isPhoneVerifiedLoaded: !!data,
    isError: isRealError,
    refetch,
  };
};
