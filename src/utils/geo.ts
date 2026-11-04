export interface LatLng {
  latitude: number;
  longitude: number;
}

// LPU main campus, Phagwara
export const CAMPUS_CENTER: LatLng = { latitude: 31.2530, longitude: 75.7036 };
export const CAMPUS_RADIUS_M = 2000;

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in metres. */
export const distanceMeters = (a: LatLng, b: LatLng): number => {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** Initial bearing from a to b, 0-360 degrees clockwise from north. */
export const bearingDegrees = (a: LatLng, b: LatLng): number => {
  const dLon = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(toRad(b.latitude));
  const x =
    Math.cos(toRad(a.latitude)) * Math.sin(toRad(b.latitude)) -
    Math.sin(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export const compassPoint = (deg: number): string => POINTS[Math.round(deg / 45) % 8];

export const formatDistance = (m: number): string =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

/** Walking time at ~4.8 km/h. */
export const walkMinutes = (m: number): number => Math.max(1, Math.round(m / 80));

export const formatCoord = (value: number, pos: string, neg: string): string =>
  `${Math.abs(value).toFixed(5)}° ${value >= 0 ? pos : neg}`;

export const isOnCampus = (p: LatLng): boolean => distanceMeters(p, CAMPUS_CENTER) <= CAMPUS_RADIUS_M;

/** Opens turn-by-turn walking directions from the user's current position. */
export const directionsUrl = (to: LatLng): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${to.latitude},${to.longitude}&travelmode=walking`;
