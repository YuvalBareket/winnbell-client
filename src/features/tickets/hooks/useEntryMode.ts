import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api/client';
import type { EntryMode } from '../../partner/types/business.types';

const fetchEntryMode = (): Promise<{ entry_mode: EntryMode }> =>
  api.get('/business/mode').then(r => r.data);

export const useEntryMode = () => {
  return useQuery({
    queryKey: ['business', 'mode'],
    queryFn: fetchEntryMode,
    staleTime: 5 * 60_000,
  });
};
