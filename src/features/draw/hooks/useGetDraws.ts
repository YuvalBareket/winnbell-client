import { useQuery } from '@tanstack/react-query';
import { getActiveDraws } from '../api/draw.api';

export const useGetDraws = () => {
  return useQuery({
    queryKey: ['draws'],
    queryFn: getActiveDraws,
  });
};
