// client/src/features/partner/hooks/useBusinessData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchMyBusinessDetails } from '../api/business.api';

export const useBusinessData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['business', 'my-details'],
    queryFn: fetchMyBusinessDetails,
    // Refetch when the window is refocused to keep branch status (like manager invites) updated
    refetchOnWindowFocus: true,
    enabled
  });
};
