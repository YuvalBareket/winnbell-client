import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { IBusiness } from '../types/nearBy.types';
import type { RootState } from '../../../store/store';
import { getNearbyBusinesses } from '../api/nearBy.api';

export const useNearbyBusinesses = () => {
  const { userLocation } = useSelector((state: RootState) => state.auth);
  return useQuery<IBusiness[]>({
    queryKey: ['businesses', 'nearby', userLocation],
    queryFn: () =>
      getNearbyBusinesses({
        latitude: userLocation!.latitude,
        longitude: userLocation!.longitude,
        radius: 10,
      }),
    enabled: !!userLocation?.latitude && !!userLocation?.longitude,
  });
};
