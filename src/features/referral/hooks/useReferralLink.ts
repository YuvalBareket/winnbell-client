import { useQuery } from '@tanstack/react-query';
import { getReferralLink } from '../api/referral.service';
import { queryKeys } from '../../../shared/constants/queryKeys';

/**
 * Hook to fetch the logged-in user's referral link.
 * Requires authentication.
 */
export const useReferralLink = () => {
  return useQuery({
    queryKey: queryKeys.referral.link,
    queryFn: () => getReferralLink(),
    staleTime: 10 * 60_000, // Cache for 10 minutes
    retry: 1,
  });
};
