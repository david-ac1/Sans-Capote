export function computeDistanceKm(
  userLat: number,
  userLng: number,
  clinicLat: number,
  clinicLng: number
): number {
  const R = 6371; // km
  const dLat = ((clinicLat - userLat) * Math.PI) / 180;
  const dLng = ((clinicLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((clinicLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
