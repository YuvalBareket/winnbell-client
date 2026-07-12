import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchCampaigns, fetchCampaignHeader, fetchCampaignKpis, fetchCampaignEntries, type DateRange } from '../api/campaign.api';
import { getDrawResult } from '../../draw/api/draw.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useCampaigns = () => {
  return useQuery({
    queryKey: queryKeys.campaign.list(),
    queryFn: fetchCampaigns,
    staleTime: 60_000,
  });
};

export const useCampaignHeader = (locationId?: number, campaignId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.campaign.header(locationId, campaignId),
    queryFn: () => fetchCampaignHeader(locationId, campaignId),
    staleTime: 30_000,
    enabled,
  });
};

export const useCampaignKpis = (dateRange: DateRange, locationId?: number, campaignId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.campaign.kpis(dateRange, locationId, campaignId),
    queryFn: () => fetchCampaignKpis(dateRange, locationId, campaignId),
    staleTime: 30_000,
    enabled,
  });
};

export const useCampaignEntries = (locationId?: number, campaignId?: number) => {
  return useInfiniteQuery({
    queryKey: queryKeys.campaign.entries(locationId, campaignId),
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

export const useDrawResult = (drawId: number, enabled: boolean = true) => {
  return useQuery({
    // Registered key (queryKeys.draws.result) so admin winner pick/confirm mutations can
    // invalidate it - an ad-hoc key here previously left a stale winner card for minutes.
    queryKey: queryKeys.draws.result(drawId),
    queryFn: () => getDrawResult(drawId),
    staleTime: 60_000,
    enabled,
  });
};
