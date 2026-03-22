import { useQuery } from '@tanstack/react-query';
import { getMyTickets } from '../api/myTickets.api';

export const useMyTickets = (draw_id: number) => {
  return useQuery({
    queryKey: ['my-tickets', draw_id],
    queryFn: () => getMyTickets(draw_id),
    enabled: !!draw_id,
  });
};
