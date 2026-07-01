import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchCampaigns, fetchCampaignHeader, fetchCampaignKpis, fetchCampaignEntries, type DateRange } from '../api/campaign.api';

// Query key factory for campaign data
const campaignQueryKeys = {
  all: ['campaign'] as const,
  list: () => ['campaign', 'list'] as const,
  header: (locationId?: number, campaignId?: number) => ['campaign', 'header', locationId ?? 'all', campaignId ?? 'current'] as const,
  kpis: (dateRange: DateRange, locationId?: number, campaignId?: number) =>
    ['campaign', 'kpis', dateRange, locationId ?? 'all', campaignId ?? 'current'] as const,
  entries: (locationId?: number, campaignId?: number) =>
    ['campaign', 'entries', locationId ?? 'all', campaignId ?? 'current'] as const,
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: campaignQueryKeys.list(),
    queryFn: fetchCampaigns,
    staleTime: 60_000,
  });
};

export const useCampaignHeader = (locationId?: number, campaignId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: campaignQueryKeys.header(locationId, campaignId),
    queryFn: () => fetchCampaignHeader(locationId, campaignId),
    staleTime: 30_000,
    enabled,
  });
};

export const useCampaignKpis = (dateRange: DateRange, locationId?: number, campaignId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: campaignQueryKeys.kpis(dateRange, locationId, campaignId),
    queryFn: () => fetchCampaignKpis(dateRange, locationId, campaignId),
    staleTime: 30_000,
    enabled,
  });
};

export const useCampaignEntries = (locationId?: number, campaignId?: number) => {
  return useInfiniteQuery({
    queryKey: campaignQueryKeys.entries(locationId, campaignId),
    queryFn: ({ pageParam }) =>
      fetchCampaignEntries({
        location_id: locationId,
        cursor: pageParam,
        limit: 20,
        campaign_id: campaignId,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 30_000,
  });
};
