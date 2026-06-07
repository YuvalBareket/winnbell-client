import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { NearbyLocation } from '../types/nearBy.types';
import type { RootState } from '../../../store/store';
import { getNearbyBusinesses } from '../api/nearBy.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useNearbyBusinesses = () => {
  const { userLocation } = useSelector((state: RootState) => state.auth);
  return useQuery<NearbyLocation[]>({
    queryKey: [...queryKeys.nearby.all, userLocation?.latitude, userLocation?.longitude],
    queryFn: () => {
      const lat = userLocation!.latitude;
      const lng = userLocation!.longitude;
      const radiusKm = 10;
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));
      return getNearbyBusinesses({
        minLat: lat - latDelta, maxLat: lat + latDelta,
        minLng: lng - lngDelta, maxLng: lng + lngDelta,
      });
    },
    enabled: !!userLocation?.latitude && !!userLocation?.longitude,
    staleTime: 60_000,
  });
};
