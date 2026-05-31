import { useQuery } from '@tanstack/react-query';
import { getMyTickets } from '../api/myTickets.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useMyTickets = (draw_id: number, location_id?: number, page = 1) => {
  const query = useQuery({
    queryKey: [...queryKeys.tickets.mine(draw_id, location_id), page],
    queryFn: () => getMyTickets(draw_id, location_id, page),
    staleTime: 60_000,
    enabled: !!draw_id,
  });

  return {
    ...query,
    data: query.data?.tickets,
    totalCount: query.data?.totalCount ?? 0,
    cap: query.data?.cap ?? null,
    perLocationCap: query.data?.perLocationCap ?? null,
    activeLocationCount: query.data?.activeLocationCount ?? 1,
    effectiveCount: query.data?.effectiveCount ?? 0,
  };
};
