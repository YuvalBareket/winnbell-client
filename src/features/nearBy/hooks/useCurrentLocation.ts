import { useEffect, useCallback } from 'react';
import type { TCoords } from '../../auth/types/auth.types';
import { setUserLocation } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hook';
import { api } from '../../../shared/api/client';

const getPosition = (options: PositionOptions): Promise<TCoords> =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      reject,
      options,
    );
  });

const isPermissionDenied = (err: unknown): boolean =>
  typeof GeolocationPositionError !== 'undefined' &&
  err instanceof GeolocationPositionError &&
  err.code === GeolocationPositionError.PERMISSION_DENIED;

// City-level fallback from the server's IP geo lookup (same source as the region check).
// Used when the browser can't or won't give a position, so the map still opens near the
// user instead of the hardcoded Fort Lauderdale default.
const getApproxLocationFromIp = async (): Promise<TCoords | null> => {
  try {
    const { data } = await api.get<{ approx_location: TCoords | null }>('/auth/region-check');
    const loc = data.approx_location;
    if (loc && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)) return loc;
    return null;
  } catch {
    return null;
  }
};

export function useCurrentLocation() {
  const dispatch = useAppDispatch();

  const refreshLocation = useCallback(async (): Promise<TCoords | null> => {
    if ('geolocation' in navigator) {
      // Attempt 1: precise fix, but accept a recent cached one so desktops without
      // GPS don't sit on a cold lookup.
      try {
        const coords = await getPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 });
        dispatch(setUserLocation(coords));
        return coords;
      } catch (err) {
        // Denied permission: retrying is pointless, go straight to the IP fallback.
        if (!isPermissionDenied(err)) {
          // Attempt 2: relaxed - low accuracy, longer timeout, allow a 5-minute-old fix.
          try {
            const coords = await getPosition({ enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 });
            dispatch(setUserLocation(coords));
            return coords;
          } catch {
            // fall through to IP fallback
          }
        }
      }
    }

    const approx = await getApproxLocationFromIp();
    if (approx) {
      dispatch(setUserLocation(approx));
      return approx;
    }
    return null;
  }, [dispatch]);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return { refreshLocation };
}
