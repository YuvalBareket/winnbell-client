import { useQuery } from '@tanstack/react-query';
import { getActiveDraws, getDrawHistory } from '../api/draw.api';

export const useGetDraws = () => {
  return useQuery({
    queryKey: ['draws'],
    queryFn: getActiveDraws,
  });
};

export const useGetDrawHistory = () => {
  return useQuery({
    queryKey: ['draws', 'history'],
    queryFn: getDrawHistory,
  });
};
