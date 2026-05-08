import { useQuery } from '@tanstack/react-query';
import { getMyTickets } from '../api/myTickets.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useMyTickets = (draw_id: number) => {
  const query = useQuery({
    queryKey: queryKeys.tickets.mine(draw_id),
    queryFn: () => getMyTickets(draw_id),
    staleTime: 60_000,
    enabled: !!draw_id,
  });

  return {
    ...query,
    data: query.data?.tickets,
    effectiveCount: query.data?.effectiveCount ?? 0,
  };
};
