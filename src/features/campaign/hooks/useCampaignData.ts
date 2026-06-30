import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCampaignHeader, fetchCampaignKpis, fetchCampaignEntries, approveEntry, type DateRange } from '../api/campaign.api';

// Query key factory for campaign data
const campaignQueryKeys = {
  all: ['campaign'] as const,
  header: (locationId?: number) => ['campaign', 'header', locationId ?? 'all'] as const,
  kpis: (dateRange: DateRange, locationId?: number) =>
    ['campaign', 'kpis', dateRange, locationId ?? 'all'] as const,
  entries: (locationId?: number, needsReview?: boolean) =>
    ['campaign', 'entries', locationId ?? 'all', needsReview ?? false] as const,
};

export const useCampaignHeader = (locationId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: campaignQueryKeys.header(locationId),
    queryFn: () => fetchCampaignHeader(locationId),
    staleTime: 30_000,
    enabled,
  });
};

export const useCampaignKpis = (dateRange: DateRange, locationId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: campaignQueryKeys.kpis(dateRange, locationId),
    queryFn: () => fetchCampaignKpis(dateRange, locationId),
    staleTime: 30_000,
    enabled,
  });
};

export const useCampaignEntries = (locationId?: number, needsReview: boolean = false) => {
  return useInfiniteQuery({
    queryKey: campaignQueryKeys.entries(locationId, needsReview),
    queryFn: ({ pageParam }) =>
      fetchCampaignEntries({
        location_id: locationId,
        needs_review: needsReview,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 30_000,
  });
};

export const useApproveEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: number) => approveEntry(ticketId),
    onSuccess: () => {
      // Invalidate all campaign entries queries to refetch with updated status
      queryClient.invalidateQueries({ queryKey: ['campaign', 'entries'] });
      // Also invalidate header to update needs_review_count
      queryClient.invalidateQueries({ queryKey: ['campaign', 'header'] });
    },
  });
};
