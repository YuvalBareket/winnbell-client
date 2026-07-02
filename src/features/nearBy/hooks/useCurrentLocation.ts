import { useEffect, useCallback } from 'react';
import type { TCoords } from '../../auth/types/auth.types';
import { setUserLocation } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hook';

export function useCurrentLocation() {
  const dispatch = useAppDispatch();

  const refreshLocation = useCallback(async (): Promise<TCoords | null> => {
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

      dispatch(setUserLocation(coords));
      return coords;
    } catch (err: any) {
      if (err?.code !== 1) {
        console.error('Location error:', err.message);
      }
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return { refreshLocation };
}
