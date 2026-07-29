import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchAnalyticsSection,
  type AnalyticsCategory,
  type FetchAnalyticsParams,
  type AnalyticsResponseMap,
} from '../api/analytics.api';

// Fetches ONE analytics section. The page passes the active category and gates with `enabled`
// so only the tab being viewed hits the network. Each (category, filters) pair caches independently.
export const useAnalyticsSection = <C extends AnalyticsCategory>(
  category: C,
  params: FetchAnalyticsParams,
  enabled: boolean = true,
  adminBusinessId?: number,
) => {
  return useQuery<AnalyticsResponseMap[C]>({
    queryKey: adminBusinessId
      ? [
          'admin',
          'business-analytics',
          adminBusinessId,
          category,
          params.locationId ?? 'all',
          params.from,
          params.to,
          params.bucket,
        ]
      : [
          'business',
          'analytics',
          category,
          params.locationId ?? 'all',
          params.from,
          params.to,
          params.bucket,
        ],
    queryFn: () => fetchAnalyticsSection(category, params, adminBusinessId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // smooth transitions when switching filters
    enabled,
  });
};
