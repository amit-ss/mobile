import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type LiveLocationStatus =
  | 'requesting'
  | 'live'
  | 'denied'
  | 'services_off'
  | 'unavailable';

export interface LiveCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

/**
 * Streams the device position while `enabled` is true.
 * Pass `enabled = isFocused` so GPS is only on while the screen is visible.
 */
export const useLiveLocation = (enabled: boolean = true) => {
  const [coords, setCoords] = useState<LiveCoords | null>(null);
  const [status, setStatus] = useState<LiveLocationStatus>('requesting');
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const active = useRef(false);

  const apply = (loc: Location.LocationObject) => {
    setCoords({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? null,
    });
    setUpdatedAt(Date.now());
  };

  const stop = useCallback(() => {
    active.current = false;
    subscription.current?.remove();
    subscription.current = null;
  }, []);

  const start = useCallback(async () => {
    stop();
    active.current = true;
    setStatus('requesting');
    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        setStatus('services_off');
        return;
      }
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setStatus('denied');
        return;
      }

      // Show something immediately while the GPS warms up
      const last = await Location.getLastKnownPositionAsync();
      if (last && active.current) apply(last);

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 3 },
        (loc) => active.current && apply(loc)
      );
      if (!active.current) {
        sub.remove(); // screen was left while we were waiting for permission
        return;
      }
      subscription.current = sub;
      setStatus('live');
    } catch (e) {
      setStatus('unavailable');
    }
  }, [stop]);

  useEffect(() => {
    if (enabled) start();
    else stop();
    return stop;
  }, [enabled, start, stop]);

  return { coords, status, updatedAt, retry: start };
};
