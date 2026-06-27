import { useQuery } from '@tanstack/react-query';
import { resolveReferralCode } from '../api/referral.service';

/**
 * Hook to resolve a referral code and fetch the referrer's name for social proof.
 * Returns null for referrerName if the code is invalid or doesn't resolve.
 */
export const useReferralCode = (code: string | null) => {
  return useQuery({
    queryKey: ['referralCode', code],
    queryFn: async () => {
      if (!code) return null;
      try {
        return await resolveReferralCode(code);
      } catch {
        return null; // Invalid or missing code
      }
    },
    enabled: !!code,
    staleTime: 5 * 60_000, // Cache for 5 minutes
    retry: false,
  });
};
