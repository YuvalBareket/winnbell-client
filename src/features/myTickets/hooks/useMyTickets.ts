import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyTickets } from '../api/myTickets.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

const PAGE_SIZE = 50;

export const useMyTickets = (draw_id: number, location_id?: number) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.tickets.mine(draw_id, location_id),
    queryFn: ({ pageParam }) => getMyTickets(draw_id, location_id, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.tickets).length;
      if (fetched >= (lastPage.totalCount ?? fetched)) return undefined;
      if (lastPage.tickets.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    staleTime: 60_000,
    enabled: !!draw_id,
  });

  const lastPage = query.data?.pages[query.data.pages.length - 1];

  return {
    ...query,
    tickets: query.data?.pages.flatMap((p) => p.tickets) ?? [],
    totalCount: lastPage?.totalCount ?? 0,
    cap: lastPage?.cap ?? null,
    perLocationCap: lastPage?.perLocationCap ?? null,
    activeLocationCount: lastPage?.activeLocationCount ?? 1,
    effectiveCount: lastPage?.totalCount ?? 0,
  };
};
