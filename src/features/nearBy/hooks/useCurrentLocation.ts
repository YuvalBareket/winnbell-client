import { useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import type { TCoords } from '../../auth/types/auth.types';
import { setUserLocation } from '../../../store/slices/authSlice';

export function useCurrentLocation() {
  const dispatch = useDispatch();

  const refreshLocation = useCallback(async (): Promise<TCoords | null> => {
    // 1. Check if Geolocation is supported
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser.');
      return null;
    }

    try {
      const coords = await new Promise<TCoords>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          (err) => reject(err),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      });

      // 2. Dispatch to Redux so other hooks (like useNearbyBusinesses) can see it
      dispatch(setUserLocation(coords));
      return coords;
    } catch (err: any) {
      // code 1 = permission denied (don’t spam console)
      if (err?.code !== 1) {
        console.error('Location error:', err.message);
      }
      return null;
    }
  }, [dispatch]);

  // 3. Automatically trigger on mount
  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return { refreshLocation };
}
