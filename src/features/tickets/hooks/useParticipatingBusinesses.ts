import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { getParticipatingBusinesses } from '../api/ticketsApi';

export const useParticipatingBusinesses = () => {
  return useQuery({
    queryKey: queryKeys.participating.all,
    queryFn: getParticipatingBusinesses,
    staleTime: 60_000,
  });
};
