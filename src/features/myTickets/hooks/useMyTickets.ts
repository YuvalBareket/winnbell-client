import { useQuery } from '@tanstack/react-query';
import { getMyTickets } from '../api/myTickets.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useMyTickets = (draw_id: number) => {
  return useQuery({
    queryKey: queryKeys.tickets.mine(draw_id),
    queryFn: () => getMyTickets(draw_id),
    staleTime: 60_000,
    enabled: !!draw_id,
  });
};
