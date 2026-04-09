import { useQuery } from '@tanstack/react-query';
import { fetchMyBusinessDetails } from '../api/business.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useBusinessData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.business.myDetails,
    queryFn: fetchMyBusinessDetails,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true, // keep manager invite status up-to-date
    enabled,
  });
};
