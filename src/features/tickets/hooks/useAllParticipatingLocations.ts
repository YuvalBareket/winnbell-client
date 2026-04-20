import { useQuery } from '@tanstack/react-query';
import { searchParticipatingLocations } from '../api/ticketsApi';
import type { ParticipatingLocation } from '../api/ticketsApi';

export type { ParticipatingLocation };

export const useSearchParticipatingLocations = (query: string) =>
  useQuery({
    queryKey: ['business', 'participating', 'locations', 'search', query],
    queryFn: () => searchParticipatingLocations(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: [],
  });
