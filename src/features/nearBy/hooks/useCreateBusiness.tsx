import { useQuery } from '@tanstack/react-query';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { useAppSelector } from '../../../store/hook';

export const useNearbyBusinesses = () => {
  const { userLocation } = useAppSelector((state) => state.auth);
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
