import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { NearbyLocation } from '../types/nearBy.types';
import type { RootState } from '../../../store/store';
import { getNearbyBusinesses } from '../api/nearBy.api';

export const useNearbyBusinesses = () => {
  const { userLocation } = useSelector((state: RootState) => state.auth);
  return useQuery<NearbyLocation[]>({
    queryKey: ['businesses', 'nearby', userLocation],
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
  });
};
